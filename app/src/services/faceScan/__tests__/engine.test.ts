import { SCAN, SCAN_MOVE_IDS, SCAN_MOVES, SCAN_STEPS, type ScanMoveId } from '@/constants/faceScan';
import type { BlendShape } from '@/constants/moves';

import {
  createScanRun,
  issueOf,
  scanReadings,
  scanRunReducer,
  scanRunView,
  scanSample,
  shapesOfMove,
  type ScanRunState,
  type ScanSample,
} from '../engine';

const DT = 1 / SCAN.sampleHz;
const RELAXED = 0.05;

const face = (t: number, shapes: Partial<Record<BlendShape, number>>, extra: Partial<ScanSample> = {}): ScanSample => ({
  tracked: true,
  t,
  shapes,
  turn: 5,
  distance: 0.35,
  ...extra,
});

/** A user who does each move when it's shown: its left side at `level`, the right a bit less, the rest relaxed. */
function doing(state: ScanRunState, level = 0.6, rightShare = 0.8): Partial<Record<BlendShape, number>> {
  const shapes: Partial<Record<BlendShape, number>> = {};
  for (const id of SCAN_MOVE_IDS) for (const sh of shapesOfMove(id)) shapes[sh] = RELAXED;
  const moving = (state.stage === 'prepare' || state.stage === 'hold') && state.step > 0 ? (SCAN_STEPS[state.step] as ScanMoveId) : null;
  if (moving) {
    const m = SCAN_MOVES[moving];
    for (const sh of m.left ?? []) shapes[sh] = level;
    for (const sh of m.right ?? []) shapes[sh] = level * rightShare;
    for (const sh of m.center ?? []) shapes[sh] = level;
  }
  return shapes;
}

/** Feeds samples 15 times a second from `t` until `stop` or `maxSec`; returns the state and the time reached. */
function feed(
  state: ScanRunState,
  t: number,
  sample: (t: number, s: ScanRunState) => ScanSample,
  stop: (s: ScanRunState) => boolean = (s) => s.stage === 'done',
  maxSec = 120,
) {
  let s = state;
  let now = t;
  const end = t + maxSec;
  while (!stop(s) && now < end) {
    now += DT;
    s = scanRunReducer(s, sample(now, s));
  }
  return { s, t: now };
}

describe('face scan engine', () => {
  it('runs every step in about 35 seconds and reads each move against the relaxed face', () => {
    const { s, t } = feed(createScanRun(), 0, (now, st) => face(now, doing(st)));
    expect(s.stage).toBe('done');
    expect(t).toBeGreaterThan(30);
    expect(t).toBeLessThan(40);
    expect(s.missed).toEqual([]);
    const readings = scanReadings(s);
    expect(Object.keys(readings ?? {})).toEqual([...SCAN_MOVE_IDS]);
    // The move's level minus the relaxed face; the right side moved 80% as much.
    expect(readings?.smile?.l).toBeCloseTo(0.55, 2);
    expect(readings?.smile?.r).toBeCloseTo(0.43, 2);
    expect(readings?.browRaise?.c).toBeCloseTo(0.55, 2);
    expect(readings?.lipPucker).toEqual({ c: expect.closeTo(0.55, 2) });
  });

  it('waits for the face before the countdown, and goes back to waiting when it leaves during the countdown', () => {
    let s = createScanRun();
    s = feed(s, 0, (now) => face(now, {}, { tracked: false }), () => false, 2).s;
    expect(s.stage).toBe('find');
    expect(scanRunView(s).issue).toBe('noFace');
    let r = feed(s, 2, (now) => face(now, {}), (x) => x.stage === 'countdown');
    expect(r.s.stage).toBe('countdown');
    expect(scanRunView(r.s).countdown).toBe(3);
    r = feed(r.s, r.t, (now) => face(now, {}, { tracked: false }), (x) => x.stage !== 'countdown');
    expect(r.s.stage).toBe('find');
  });

  it("doesn't count time without a good face in a hold, and goes on where it stopped", () => {
    let r = feed(createScanRun(), 0, (now, st) => face(now, doing(st)), (x) => x.stage === 'hold' && x.step === 1 && x.good > 1);
    const before = scanRunView(r.s).progress;
    r = feed(r.s, r.t, (now, st) => face(now, doing(st), { turn: 35 }), () => false, 3);
    expect(r.s.stage).toBe('hold');
    expect(r.s.issue).toBe('turned');
    expect(scanRunView(r.s).progress).toBeCloseTo(before, 5);
    r = feed(r.s, r.t, (now, st) => face(now, doing(st)));
    expect(r.s.stage).toBe('done');
    expect(r.s.missed).toEqual([]);
  });

  it('skips a step it cannot read in time, and saves nothing with too few moves', () => {
    // Too far from the camera during every move from the fourth on.
    const sample = (now: number, st: ScanRunState) => face(now, doing(st), st.step >= 4 ? { distance: 1.2 } : {});
    const { s, t } = feed(createScanRun(), 0, sample);
    expect(s.stage).toBe('done');
    expect(s.missed).toEqual([4, 5, 6]);
    expect(t).toBeGreaterThan(3 * SCAN.stepTimeoutSec);
    expect(scanReadings(s)).toBeNull();

    // One skipped move still makes a scan.
    const one = feed(createScanRun(), 0, (now, st) => face(now, doing(st), st.step === 6 ? { tracked: false } : {})).s;
    expect(one.missed).toEqual([6]);
    expect(Object.keys(scanReadings(one) ?? {})).toEqual(['browRaise', 'eyeSquint', 'smile', 'lipPucker', 'mouthOpen']);
  });

  it('reads the camera sample safely', () => {
    expect(scanSample({ tracked: false, t: 3 })).toEqual({ tracked: false, t: 3, shapes: {}, turn: null, distance: null });
    expect(scanSample({ tracked: true, t: 'x', shapes: { mouthSmile_L: 0.4, nope: 1, jawOpen: 2 }, turn: 'far', distance: 0.3 })).toEqual({
      tracked: true,
      t: 0,
      shapes: { mouthSmileLeft: 0.4, jawOpen: 1 },
      turn: null,
      distance: 0.3,
    });
    expect(issueOf(face(0, {}, { distance: 0.1 }))).toBe('tooClose');
    expect(issueOf(face(0, {}, { distance: 0.9 }))).toBe('tooFar');
    expect(issueOf(face(0, {}, { turn: 25 }))).toBe('turned');
    expect(issueOf(face(0, {}, { turn: null, distance: null }))).toBeNull();
  });

  it('ignores repeated and out-of-order samples', () => {
    const s = scanRunReducer(createScanRun(), face(5, {}));
    expect(scanRunReducer(s, face(5, {}))).toBe(s);
    expect(scanRunReducer(s, face(4, {}))).toBe(s);
  });
});
