import { SCAN, SCAN_MOVE_IDS, SCAN_MOVES, SCAN_STEPS, type ScanMoveId, type ScanStepId } from '@/constants/faceScan';
import type { BlendShape } from '@/constants/moves';
import { normalizeShapes } from '@/services/workout/moveCheck';

import { percentile, type RawScan } from './score';

/**
 * The face scan as a pure state machine (docs/face-scan.md). Camera samples (~15 a second) go in; the stage, the
 * step and its progress come out, and at the end the readings: how far each move rose above the relaxed face.
 * Time is the camera's own (the samples' `t`), so a stalled camera stops the scan instead of rushing it. Only good
 * samples are measured: a face in view, pointing at the screen, at a normal distance.
 */

export interface ScanSample {
  tracked: boolean;
  /** Seconds, increasing (the camera frame's time). */
  t: number;
  shapes: Partial<Record<BlendShape, number>>;
  /** Degrees between where the face points and the camera; null when not known. */
  turn: number | null;
  /** Metres from the camera; null when not known. */
  distance: number | null;
}

/** What the scan waits for when a sample can't be measured. */
export type ScanIssue = 'noFace' | 'turned' | 'tooFar' | 'tooClose';

/** find: waiting for a face. prepare: the move is shown. hold: it's measured. release: relax before the next one. */
export type ScanStage = 'find' | 'countdown' | 'prepare' | 'hold' | 'release' | 'done';

export interface ScanRunState {
  stage: ScanStage;
  /** Index in SCAN_STEPS (0 = the relaxed face). */
  step: number;
  /** Time of the sample that began this stage (null until one arrives). */
  since: number | null;
  lastT: number | null;
  /** Seconds of good samples: in a row while finding the face, in all during a hold. */
  good: number;
  issue: ScanIssue | null;
  /** Each step's good samples during its hold, for the blend shapes that step reads. */
  readings: Partial<Record<BlendShape, number[]>>[];
  /** Steps whose hold ran out of time (SCAN.stepTimeoutSec). */
  missed: number[];
}

export interface ScanRunView {
  stage: ScanStage;
  step: number;
  stepId: ScanStepId;
  /** 0–1: how much of this step's hold is measured. */
  progress: number;
  /** 3, 2, 1 during the countdown. */
  countdown: number | null;
  issue: ScanIssue | null;
}

const finite = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** What the camera sends (modules/face-tracking), checked: a broken sample reads as "no face". */
export function scanSample(raw: { tracked?: unknown; t?: unknown; shapes?: unknown; turn?: unknown; distance?: unknown }): ScanSample {
  const t = finite(raw.t) ?? 0;
  if (raw.tracked !== true) return { tracked: false, t, shapes: {}, turn: null, distance: null };
  const shapes = raw.shapes && typeof raw.shapes === 'object' ? (raw.shapes as Record<string, unknown>) : {};
  return { tracked: true, t, shapes: normalizeShapes(shapes), turn: finite(raw.turn), distance: finite(raw.distance) };
}

export function issueOf(s: ScanSample): ScanIssue | null {
  if (!s.tracked) return 'noFace';
  if (s.distance !== null && s.distance > SCAN.maxDistance) return 'tooFar';
  if (s.distance !== null && s.distance < SCAN.minDistance) return 'tooClose';
  if (s.turn !== null && s.turn > SCAN.maxTurnDeg) return 'turned';
  return null;
}

/** The blend shapes a move reads (both sides and the middle). */
export function shapesOfMove(id: ScanMoveId): BlendShape[] {
  const m = SCAN_MOVES[id];
  return [...(m.left ?? []), ...(m.right ?? []), ...(m.center ?? [])];
}

const REST_SHAPES = [...new Set(SCAN_MOVE_IDS.flatMap(shapesOfMove))];

/** The relaxed face reads every shape the moves use (their baseline); a move reads its own. */
export const shapesOfStep = (step: number): BlendShape[] => (step === 0 ? REST_SHAPES : shapesOfMove(SCAN_STEPS[step] as ScanMoveId));

export function createScanRun(): ScanRunState {
  return { stage: 'find', step: 0, since: null, lastT: null, good: 0, issue: null, readings: SCAN_STEPS.map(() => ({})), missed: [] };
}

const enter = (s: ScanRunState, stage: ScanStage, step: number, t: number): ScanRunState => ({ ...s, stage, step, since: t, good: 0 });

function addReading(readings: ScanRunState['readings'], step: number, sample: ScanSample): ScanRunState['readings'] {
  const current = readings[step];
  const next: Partial<Record<BlendShape, number[]>> = {};
  for (const shape of shapesOfStep(step)) next[shape] = [...(current[shape] ?? []), sample.shapes[shape] ?? 0];
  return readings.map((r, i) => (i === step ? next : r));
}

/** After the relaxed face the first move follows straight away; after a move, a short release; after the last, done. */
function finishStep(s: ScanRunState, t: number): ScanRunState {
  if (s.step >= SCAN_STEPS.length - 1) return enter(s, 'done', s.step, t);
  return s.step === 0 ? enter(s, 'prepare', 1, t) : enter(s, 'release', s.step, t);
}

export function scanRunReducer(state: ScanRunState, sample: ScanSample): ScanRunState {
  if (state.stage === 'done') return state;
  const t = sample.t;
  if (state.lastT !== null && t <= state.lastT) return state; // repeated or out-of-order sample
  const dt = state.lastT === null ? 0 : Math.min(t - state.lastT, SCAN.maxGapSec);
  const issue = issueOf(sample);
  const s: ScanRunState = { ...state, lastT: t, issue, since: state.since ?? t };
  const elapsed = t - (s.since as number);
  switch (s.stage) {
    case 'find': {
      const good = issue ? 0 : s.good + dt;
      return good >= SCAN.findSec ? enter(s, 'countdown', 0, t) : { ...s, good };
    }
    case 'countdown':
      if (issue === 'noFace') return enter(s, 'find', 0, t);
      return elapsed >= SCAN.countdownSec ? enter(s, 'prepare', 0, t) : s;
    case 'prepare':
      return elapsed >= SCAN.prepareSec ? enter(s, 'hold', s.step, t) : s;
    case 'hold': {
      const next = issue ? s : { ...s, good: s.good + dt, readings: addReading(s.readings, s.step, sample) };
      if (next.good >= SCAN.holdSec) return finishStep(next, t);
      if (elapsed >= SCAN.stepTimeoutSec) return finishStep({ ...next, missed: [...next.missed, s.step] }, t);
      return next;
    }
    case 'release':
      return elapsed >= SCAN.releaseSec ? enter(s, 'prepare', s.step + 1, t) : s;
    default:
      return s;
  }
}

export function scanRunView(s: ScanRunState): ScanRunView {
  const countdown =
    s.stage === 'countdown' && s.since !== null && s.lastT !== null ? Math.max(1, Math.ceil(SCAN.countdownSec - (s.lastT - s.since))) : null;
  return {
    stage: s.stage,
    step: s.step,
    stepId: SCAN_STEPS[s.step],
    progress: s.stage === 'hold' ? Math.min(1, s.good / SCAN.holdSec) : s.stage === 'release' || s.stage === 'done' ? 1 : 0,
    countdown,
    issue: s.issue,
  };
}

const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
const round3 = (v: number) => Math.round(v * 1000) / 1000;

/**
 * The scan's readings once it's done: for each move read, how far each side (and the middle) rose above the relaxed
 * face, 0–1. Null when fewer than SCAN.minMoves moves could be read (the scan isn't saved).
 */
export function scanReadings(s: ScanRunState): RawScan | null {
  if (s.stage !== 'done') return null;
  const rest = s.readings[0];
  const base = (shape: BlendShape) => (rest[shape]?.length ? percentile(rest[shape], 0.5) : 0);
  const out: RawScan = {};
  SCAN_MOVE_IDS.forEach((id, i) => {
    const step = i + 1;
    const values = s.readings[step];
    const count = values[shapesOfMove(id)[0]]?.length ?? 0;
    if (s.missed.includes(step) || count < SCAN.minSamples) return;
    // Per sample, the side's shapes averaged; the hold's value is a high percentile of those, minus the relaxed face.
    const rise = (shapes?: readonly BlendShape[]) => {
      if (!shapes?.length) return undefined;
      const perSample = Array.from({ length: count }, (_, k) => mean(shapes.map((sh) => values[sh]?.[k] ?? 0)));
      return round3(Math.max(0, percentile(perSample, SCAN.peak) - mean(shapes.map(base))));
    };
    const m = SCAN_MOVES[id];
    const reading = { l: rise(m.left), r: rise(m.right), c: rise(m.center) };
    out[id] = Object.fromEntries(Object.entries(reading).filter(([, v]) => v !== undefined));
  });
  return Object.keys(out).length >= SCAN.minMoves ? out : null;
}
