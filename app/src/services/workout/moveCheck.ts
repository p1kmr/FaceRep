import { BLEND_SHAPES, MOVE_CHECK, type BlendShape, type Move, type MoveSignal } from '@/constants/moves';

import type { Phase } from './timer';

/**
 * The mirror's move check as a pure state machine (docs/face-tracking.md). Face samples from the camera (~15 a
 * second) and the workout's phases go in; a 0–1 level, "in the pose" and the holds it saw come out. It learns the
 * user's relaxed face during Get ready / Relax / Next up and measures every hold against it, so nobody has to
 * reach a fixed face. Nothing here is stored or sent.
 */

export interface FaceSample {
  /** A face is in view and tracked. */
  tracked: boolean;
  /** Seconds, increasing (the camera frame's time). */
  t: number;
  /** Blend shapes, 0–1. */
  shapes: Partial<Record<BlendShape, number>>;
  /** The head's rotation as a 3×3 matrix, column by column (the face's x, y and z axes); null without a face. */
  rotation: readonly number[] | null;
}

/** relaxed: learn the relaxed face (Get ready, Relax, Next up). hold: look for the move. off: paused or done. */
export type MovePhase = 'relaxed' | 'hold' | 'off';

export const movePhaseOf = (phase: Phase, paused: boolean): MovePhase =>
  paused || phase === 'done' ? 'off' : phase === 'hold' ? 'hold' : 'relaxed';

/** What the camera sends (modules/face-tracking), checked: a broken sample reads as "no face". */
export function faceSample(raw: { tracked?: unknown; t?: unknown; shapes?: unknown; rotation?: unknown }): FaceSample {
  const t = typeof raw.t === 'number' && Number.isFinite(raw.t) ? raw.t : 0;
  const rotation = Array.isArray(raw.rotation) && isRotation(raw.rotation) ? raw.rotation : null;
  if (raw.tracked !== true || !rotation) return { tracked: false, t, shapes: {}, rotation: null };
  const shapes = raw.shapes && typeof raw.shapes === 'object' ? (raw.shapes as Record<string, unknown>) : {};
  return { tracked: true, t, shapes: normalizeShapes(shapes), rotation };
}

export type MoveAction =
  | { type: 'sample'; sample: FaceSample }
  /** `rep` tells holds apart, so pausing and resuming a hold doesn't count it twice. */
  | { type: 'phase'; phase: MovePhase; rep: number; holdSec: number };

export interface MoveCheckState {
  move: Move;
  phase: MovePhase;
  /** Time of the first sample in this phase (null until one arrives). */
  phaseStart: number | null;
  rep: number;
  holdSec: number;
  /** The relaxed face: blend shapes and head rotation (missing until learned). */
  base: Partial<Record<BlendShape, number>>;
  baseRotation: number[] | null;
  /** Smoothed 0–1: how much of the move the camera sees. */
  level: number;
  inPose: boolean;
  /** Smoothed share of the still signal's limit (1 = at the limit). */
  stillLevel: number;
  stillMoved: boolean;
  /** null before the first sample. */
  tracked: boolean | null;
  lastT: number | null;
  /** Seconds in the pose during this hold, and whether this hold already counted. */
  holdInPose: number;
  counted: boolean;
  /** Holds seen in this exercise. */
  seen: number;
}

export function createMoveCheck(move: Move): MoveCheckState {
  return {
    move,
    phase: 'off',
    phaseStart: null,
    rep: 0,
    holdSec: 0,
    base: {},
    baseRotation: null,
    level: 0,
    inPose: false,
    stillLevel: 0,
    stillMoved: false,
    tracked: null,
    lastT: null,
    holdInPose: 0,
    counted: false,
    seen: 0,
  };
}

const KNOWN = new Set<string>(BLEND_SHAPES);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** ARKit names the sides "eyeBlink_L"; the Swift names (and this app) say "eyeBlinkLeft". Unknown names are dropped. */
export function normalizeShapes(raw: Record<string, unknown> | null | undefined): Partial<Record<BlendShape, number>> {
  const out: Partial<Record<BlendShape, number>> = {};
  for (const [key, value] of Object.entries(raw ?? {})) {
    const name = key.replace(/_L$/, 'Left').replace(/_R$/, 'Right');
    if (KNOWN.has(name) && typeof value === 'number' && Number.isFinite(value)) out[name as BlendShape] = clamp(value, 0, 1);
  }
  return out;
}

/**
 * How far the head turned from `base` to `now`, in degrees around the face's own axes: nod (x: chin up or down),
 * turn (y) and tilt (z: ear toward a shoulder). Measured in the relaxed face's frame, so it doesn't matter how the
 * iPhone is held. Signs depend on the direction; the move check uses the size.
 */
export function headTurn(base: readonly number[], now: readonly number[]): { nod: number; turn: number; tilt: number } {
  // r(i, j) = base column i · now column j: the rotation from the relaxed head to this one, seen from the relaxed head.
  const r = (i: number, j: number) => base[i * 3] * now[j * 3] + base[i * 3 + 1] * now[j * 3 + 1] + base[i * 3 + 2] * now[j * 3 + 2];
  const angle = Math.acos(clamp((r(0, 0) + r(1, 1) + r(2, 2) - 1) / 2, -1, 1));
  if (angle < 1e-6) return { nod: 0, turn: 0, tilt: 0 };
  const k = (angle / (2 * Math.sin(angle))) * (180 / Math.PI);
  return { nod: (r(2, 1) - r(1, 2)) * k, turn: (r(0, 2) - r(2, 0)) * k, tilt: (r(1, 0) - r(0, 1)) * k };
}

function isRotation(m: readonly unknown[] | null): m is readonly number[] {
  return !!m && m.length === 9 && m.every((v) => typeof v === 'number' && Number.isFinite(v));
}

const mean = (names: readonly BlendShape[], values: Partial<Record<BlendShape, number>>) =>
  names.reduce((sum, n) => sum + (values[n] ?? 0), 0) / names.length;

/** How far one signal is past the relaxed face, in its own units (never below 0; 0 until the relaxed face is learned). */
function rise(signal: MoveSignal, s: MoveCheckState, sample: FaceSample): number {
  if (typeof signal.of === 'string') {
    if (!s.baseRotation || !isRotation(sample.rotation)) return 0;
    const turn = headTurn(s.baseRotation, sample.rotation);
    return Math.abs(signal.of === 'headNod' ? turn.nod : turn.tilt);
  }
  if (signal.of.some((name) => s.base[name] === undefined)) return 0;
  // A relaxed level near the top would make the move unreachable: keep room for the rise.
  const relaxed = Math.min(mean(signal.of, s.base), Math.max(0, 1 - signal.rise - MOVE_CHECK.headroom));
  return Math.max(0, mean(signal.of, sample.shapes) - relaxed);
}

/** The blend shapes this move reads (its signals and its still signal). */
const shapesOf = (move: Move): BlendShape[] =>
  [...move.signals, ...(move.still ? [move.still] : [])].flatMap((sig) => (typeof sig.of === 'string' ? [] : [...sig.of]));

const usesHead = (move: Move) => move.signals.some((sig) => typeof sig.of === 'string');

/** Learns the relaxed face from one sample: quickly down, slowly up (a blink or a word barely moves it). */
function learn(s: MoveCheckState, sample: FaceSample): Pick<MoveCheckState, 'base' | 'baseRotation'> {
  const base = { ...s.base };
  for (const name of shapesOf(s.move)) {
    const v = sample.shapes[name] ?? 0;
    const old = base[name];
    base[name] = old === undefined ? v : old + (v < old ? MOVE_CHECK.learnDown : MOVE_CHECK.learnUp) * (v - old);
  }
  let baseRotation = s.baseRotation;
  if (usesHead(s.move) && isRotation(sample.rotation)) {
    const now = sample.rotation;
    baseRotation = baseRotation ? baseRotation.map((v, i) => v + MOVE_CHECK.learnTurn * (now[i] - v)) : [...now];
  }
  return { base, baseRotation };
}

/** Seconds in the pose that make a hold count. */
export const seenAfterSec = (holdSec: number) => clamp(holdSec * MOVE_CHECK.seenShare, MOVE_CHECK.minSeenSec, MOVE_CHECK.maxSeenSec);

function onSample(s: MoveCheckState, sample: FaceSample): MoveCheckState {
  const dt = s.lastT === null ? 0 : clamp(sample.t - s.lastT, 0, MOVE_CHECK.maxGapSec);
  const phaseStart = s.phaseStart ?? sample.t;
  const settled = s.phase === 'relaxed' && sample.t - phaseStart >= MOVE_CHECK.settleSec;
  const next: MoveCheckState = { ...s, phaseStart, lastT: sample.t, tracked: sample.tracked };
  if (sample.tracked && settled) Object.assign(next, learn(s, sample));

  const progress = sample.tracked ? Math.min(...s.move.signals.map((sig) => clamp(rise(sig, next, sample) / sig.rise, 0, 1))) : 0;
  next.level = s.level + MOVE_CHECK.smoothing * (progress - s.level);
  next.inPose = sample.tracked && (s.inPose ? next.level >= MOVE_CHECK.exit : next.level >= MOVE_CHECK.enter);

  if (s.phase === 'hold' && next.inPose) {
    next.holdInPose = s.holdInPose + dt;
    if (!s.counted && next.holdInPose >= seenAfterSec(s.holdSec)) {
      next.counted = true;
      next.seen = s.seen + 1;
    }
  }

  const still = s.move.still;
  if (still) {
    const share = sample.tracked ? clamp(rise(still, next, sample) / still.rise, 0, 2) : 0;
    next.stillLevel = s.stillLevel + MOVE_CHECK.smoothing * (share - s.stillLevel);
    next.stillMoved = s.phase === 'hold' && (s.stillMoved ? next.stillLevel >= 0.6 : next.stillLevel >= 1);
  }
  return next;
}

export function moveCheckReducer(s: MoveCheckState, action: MoveAction): MoveCheckState {
  switch (action.type) {
    case 'sample':
      return onSample(s, action.sample);
    case 'phase': {
      const newHold = action.phase === 'hold' && action.rep !== s.rep;
      if (action.phase === s.phase && !newHold) return s;
      return {
        ...s,
        phase: action.phase,
        phaseStart: null,
        rep: action.phase === 'hold' ? action.rep : s.rep,
        holdSec: action.phase === 'hold' ? action.holdSec : s.holdSec,
        holdInPose: newHold ? 0 : s.holdInPose,
        counted: newHold ? false : s.counted,
        stillMoved: action.phase === 'hold' && s.stillMoved,
      };
    }
    default:
      return s;
  }
}

export interface MoveCheckView {
  /** starting: no sample yet. */
  status: 'starting' | 'noFace' | 'tracking';
  level: number;
  inPose: boolean;
  seen: number;
  hint: NonNullable<Move['still']>['hint'] | null;
}

/** What the mirror shows. */
export function moveCheckView(s: MoveCheckState): MoveCheckView {
  return {
    status: s.tracked === null ? 'starting' : s.tracked ? 'tracking' : 'noFace',
    level: s.tracked ? s.level : 0,
    inPose: s.inPose,
    seen: s.seen,
    hint: s.stillMoved && s.move.still ? s.move.still.hint : null,
  };
}
