import { MOVE_CHECK, MOVES, type BlendShape, type Move } from '@/constants/moves';

import {
  createMoveCheck,
  faceSample,
  headTurn,
  moveCheckReducer,
  moveCheckView,
  movePhaseOf,
  normalizeShapes,
  seenAfterSec,
  type MoveCheckState,
  type MovePhase,
} from '../moveCheck';

/** 3×3 rotation, column by column, like the camera sends it. */
type Matrix = number[];
const IDENTITY: Matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const rot = (axis: 'x' | 'y' | 'z', deg: number): Matrix => {
  const a = (deg * Math.PI) / 180;
  const [c, s] = [Math.cos(a), Math.sin(a)];
  if (axis === 'x') return [1, 0, 0, 0, c, s, 0, -s, c];
  if (axis === 'y') return [c, 0, -s, 0, 1, 0, s, 0, c];
  return [c, s, 0, -s, c, 0, 0, 0, 1];
};
const mul = (a: Matrix, b: Matrix): Matrix => {
  const out = Array<number>(9).fill(0);
  for (let col = 0; col < 3; col++) for (let row = 0; row < 3; row++) for (let k = 0; k < 3; k++) out[col * 3 + row] += a[k * 3 + row] * b[col * 3 + k];
  return out;
};

type Shapes = Partial<Record<BlendShape, number>>;
const brows = (v: number): Shapes => ({ browInnerUp: v, browOuterUpLeft: v, browOuterUpRight: v });

const move = (id: keyof typeof MOVES): Move => {
  const m = MOVES[id];
  if (!m) throw new Error(`${id} has no move`);
  return m;
};

/** Feeds `seconds` of samples at the camera's rate. */
function feed(s: MoveCheckState, seconds: number, shapes: Shapes, opts: { rotation?: Matrix | null; tracked?: boolean } = {}) {
  let out = s;
  let t = s.lastT ?? 0;
  for (let i = 0; i < Math.round(seconds * MOVE_CHECK.sampleHz); i++) {
    t += 1 / MOVE_CHECK.sampleHz;
    const tracked = opts.tracked ?? true;
    out = moveCheckReducer(out, { type: 'sample', sample: { tracked, t, shapes, rotation: tracked ? (opts.rotation ?? IDENTITY) : null } });
  }
  return out;
}
const phase = (s: MoveCheckState, p: MovePhase, rep: number, holdSec = 3) => moveCheckReducer(s, { type: 'phase', phase: p, rep, holdSec });

/** Brow Lift after a 3 s Get ready with the brows at `relaxed`. */
const browLift = (relaxed = 0.2) => feed(phase(createMoveCheck(move('09-brow-lift')), 'relaxed', 1), 3, brows(relaxed));

describe('normalizeShapes', () => {
  it("turns ARKit's _L/_R names into the Swift names and drops the rest", () => {
    expect(normalizeShapes({ eyeBlink_L: 0.5, mouthSmile_R: 0.25, jawOpen: 0.1, browInnerUp: 0.3, nope: 1, cheekPuff: 'x' })).toEqual({
      eyeBlinkLeft: 0.5,
      mouthSmileRight: 0.25,
      jawOpen: 0.1,
      browInnerUp: 0.3,
    });
  });

  it('keeps values between 0 and 1 and accepts nothing', () => {
    expect(normalizeShapes({ jawOpen: 1.4, cheekPuff: -0.2, tongueOut: Number.NaN })).toEqual({ jawOpen: 1, cheekPuff: 0 });
    expect(normalizeShapes(undefined)).toEqual({});
  });
});

describe('faceSample', () => {
  it('reads what the camera sends', () => {
    expect(faceSample({ tracked: true, t: 12.5, shapes: { jawOpen: 0.3, eyeBlink_R: 0.9 }, rotation: IDENTITY })).toEqual({
      tracked: true,
      t: 12.5,
      shapes: { jawOpen: 0.3, eyeBlinkRight: 0.9 },
      rotation: IDENTITY,
    });
  });

  it('reads anything broken as no face', () => {
    const none = { tracked: false, t: 3, shapes: {}, rotation: null };
    expect(faceSample({ tracked: false, t: 3 })).toEqual(none);
    expect(faceSample({ tracked: true, t: 3, shapes: { jawOpen: 0.3 }, rotation: [1, 0, 0] })).toEqual(none);
    expect(faceSample({ tracked: true, t: 3, shapes: { jawOpen: 0.3 }, rotation: [...IDENTITY.slice(1), 'x'] })).toEqual(none);
    expect(faceSample({ tracked: true, t: 'x', shapes: 5, rotation: IDENTITY })).toEqual({ tracked: true, t: 0, shapes: {}, rotation: IDENTITY });
  });
});

describe('movePhaseOf', () => {
  it('learns in Get ready, Relax and Next up, looks during the squeeze, and rests when paused or done', () => {
    expect(['ready', 'relax', 'rest'].map((p) => movePhaseOf(p as 'ready', false))).toEqual(['relaxed', 'relaxed', 'relaxed']);
    expect(movePhaseOf('hold', false)).toBe('hold');
    expect(movePhaseOf('hold', true)).toBe('off');
    expect(movePhaseOf('done', false)).toBe('off');
  });
});

describe('headTurn', () => {
  it('reads a tilt, a nod and no turn', () => {
    expect(headTurn(IDENTITY, IDENTITY)).toEqual({ nod: 0, turn: 0, tilt: 0 });
    const tilt = headTurn(IDENTITY, rot('z', 30));
    expect(tilt.tilt).toBeCloseTo(30);
    expect(tilt.nod).toBeCloseTo(0);
    expect(headTurn(IDENTITY, rot('x', -25)).nod).toBeCloseTo(-25);
    expect(headTurn(IDENTITY, rot('y', 15)).turn).toBeCloseTo(15);
  });

  it("measures from the relaxed head, however the iPhone is held", () => {
    const held = mul(rot('y', 40), rot('x', -15));
    const nod = headTurn(held, mul(held, rot('x', 20)));
    expect(nod.nod).toBeCloseTo(20);
    expect(nod.tilt).toBeCloseTo(0);
    expect(headTurn(held, mul(held, rot('z', -18))).tilt).toBeCloseTo(-18);
  });
});

describe('move check', () => {
  it('waits for the first sample', () => {
    expect(moveCheckView(createMoveCheck(move('09-brow-lift')))).toEqual({ status: 'starting', level: 0, inPose: false, seen: 0, hint: null });
  });

  it('learns the relaxed face and measures the hold against it', () => {
    let s = browLift(0.2);
    expect(s.base.browInnerUp).toBeCloseTo(0.2);
    expect(moveCheckView(s)).toMatchObject({ status: 'tracking', inPose: false });
    s = feed(phase(s, 'hold', 1), 0.5, brows(0.55));
    expect(moveCheckView(s).inPose).toBe(true);
    expect(moveCheckView(s).level).toBeGreaterThan(MOVE_CHECK.enter);
  });

  it('needs the whole rise above the relaxed face, not a fixed value', () => {
    // Relaxed at 0.2: 0.4 is only two thirds of the 0.3 rise.
    const s = feed(phase(browLift(0.2), 'hold', 1), 2, brows(0.4));
    expect(s.inPose).toBe(false);
    expect(s.level).toBeCloseTo(0.2 / 0.3, 2);
  });

  it("doesn't learn while the face is still letting go of the last hold", () => {
    let s = phase(createMoveCheck(move('09-brow-lift')), 'relaxed', 1);
    s = feed(s, 0.5, brows(0.6));
    expect(s.base).toEqual({});
    s = feed(s, 1, brows(0.2));
    expect(s.base.browInnerUp).toBe(0.2);
  });

  it('learns quickly down and slowly up', () => {
    let s = browLift(0.2);
    s = feed(s, 0.2, brows(0.8));
    expect(s.base.browInnerUp).toBeLessThan(0.3);
    s = feed(browLift(0.5), 0.5, brows(0.1));
    expect(s.base.browInnerUp).toBeLessThan(0.15);
  });

  it('measures nothing before the relaxed face is learned (mirror turned on during a hold)', () => {
    const s = feed(phase(createMoveCheck(move('09-brow-lift')), 'hold', 1), 2, brows(0.9));
    expect(moveCheckView(s)).toMatchObject({ status: 'tracking', level: 0, inPose: false, seen: 0 });
  });

  it('keeps room above a high relaxed face', () => {
    const s = feed(phase(browLift(0.9), 'hold', 1), 1, brows(0.95));
    expect(s.inPose).toBe(true);
  });

  it('counts a hold once it was in the pose long enough, and only once', () => {
    let s = phase(browLift(), 'hold', 1, 3);
    s = feed(s, 0.6, brows(0.6));
    s = feed(s, 0.6, brows(0.2));
    expect(s.seen).toBe(0);
    s = feed(s, seenAfterSec(3) + 0.5, brows(0.6));
    expect(s.seen).toBe(1);
    s = feed(s, 2, brows(0.6));
    expect(s.seen).toBe(1);
    s = feed(phase(phase(s, 'relaxed', 1), 'hold', 2, 3), 2, brows(0.6));
    expect(moveCheckView(s).seen).toBe(2);
  });

  it("doesn't count a paused hold twice", () => {
    let s = feed(phase(browLift(), 'hold', 1), 2, brows(0.6));
    expect(s.seen).toBe(1);
    s = feed(phase(phase(s, 'off', 1), 'hold', 1), 2, brows(0.6));
    expect(s.seen).toBe(1);
  });

  it("doesn't learn or count while paused", () => {
    let s = feed(phase(browLift(0.2), 'off', 1), 3, brows(0.7));
    expect(s.base.browInnerUp).toBeCloseTo(0.2);
    expect(s.inPose).toBe(true);
    expect(s.seen).toBe(0);
    s = phase(s, 'off', 1);
    expect(phase(s, 'off', 1)).toBe(s);
  });

  it('stays in the pose near the edge and leaves it clearly below', () => {
    let s = feed(phase(browLift(0.2), 'hold', 1), 1, brows(0.6));
    s = feed(s, 1, brows(0.2 + 0.3 * 0.6));
    expect(s.inPose).toBe(true);
    s = feed(s, 1, brows(0.2 + 0.3 * 0.3));
    expect(s.inPose).toBe(false);
    s = feed(s, 1, brows(0.2 + 0.3 * 0.7));
    expect(s.inPose).toBe(false);
  });

  it('says when the face is out of view and stops counting', () => {
    let s = feed(phase(browLift(), 'hold', 1, 5), 0.6, brows(0.6));
    const before = s.holdInPose;
    s = feed(s, 2, {}, { tracked: false });
    expect(moveCheckView(s)).toMatchObject({ status: 'noFace', level: 0, inPose: false, seen: 0 });
    expect(s.holdInPose).toBe(before);
  });

  it('counts a stalled camera as a short gap only', () => {
    let s = feed(phase(browLift(), 'hold', 1, 5), 0.5, brows(0.6));
    const before = s.holdInPose;
    s = moveCheckReducer(s, { type: 'sample', sample: { tracked: true, t: (s.lastT ?? 0) + 3, shapes: brows(0.6), rotation: IDENTITY } });
    expect(s.holdInPose - before).toBeCloseTo(MOVE_CHECK.maxGapSec);
  });

  it('follows head tilts to both sides (Neck Side Stretch), measured from the relaxed head', () => {
    const held = mul(rot('y', 10), rot('x', -8));
    let s = feed(phase(createMoveCheck(move('05-neck-stretch')), 'relaxed', 1), 3, {}, { rotation: held });
    s = feed(phase(s, 'hold', 1, 8), 3, {}, { rotation: mul(held, rot('z', 22)) });
    expect(s.seen).toBe(1);
    s = feed(phase(s, 'relaxed', 1), 3, {}, { rotation: held });
    expect(s.inPose).toBe(false);
    s = feed(phase(s, 'hold', 2, 8), 3, {}, { rotation: mul(held, rot('z', -22)) });
    expect(s.seen).toBe(2);
  });

  it("doesn't take a nod for a tilt", () => {
    let s = feed(phase(createMoveCheck(move('05-neck-stretch')), 'relaxed', 1), 3, {});
    s = feed(phase(s, 'hold', 1, 8), 3, {}, { rotation: rot('x', 30) });
    expect(s.inPose).toBe(false);
    s = feed(phase(createMoveCheck(move('02-chin-lift')), 'relaxed', 1), 3, {});
    s = feed(phase(s, 'hold', 1, 5), 3, {}, { rotation: rot('x', 30) });
    expect(s.seen).toBe(1);
  });

  it('asks to keep the eyebrows still in Wide Eyes, during the hold only', () => {
    const relaxed = { eyeWideLeft: 0.1, eyeWideRight: 0.1, ...brows(0.1) };
    let s = feed(phase(createMoveCheck(move('16-wide-eyes')), 'relaxed', 1), 3, relaxed);
    s = feed(phase(s, 'hold', 1, 6), 1, { ...relaxed, eyeWideLeft: 0.45, eyeWideRight: 0.45 });
    expect(moveCheckView(s)).toMatchObject({ inPose: true, hint: null });
    s = feed(s, 1, { eyeWideLeft: 0.45, eyeWideRight: 0.45, ...brows(0.5) });
    expect(moveCheckView(s)).toMatchObject({ inPose: true, hint: 'browsStill' });
    expect(moveCheckView(phase(s, 'relaxed', 1)).hint).toBeNull();
  });
});
