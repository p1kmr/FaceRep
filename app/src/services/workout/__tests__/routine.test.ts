import { EXERCISE_IMAGES } from '@/constants/exerciseImages';
import { EXERCISE_IDS, EXERCISES, WORKOUT } from '@/constants/exercises';

import { buildDailyRoutine, routineSeconds } from '../routine';

describe('buildDailyRoutine', () => {
  const program = (p: string) => EXERCISE_IDS.filter((id) => EXERCISES[id].program === p);
  const days = (n: number) => Array.from({ length: n }, (_, i) => `2026-10-${String(6 + i).padStart(2, '0')}`);

  it('jawline goal: only jaw exercises, and every one comes up within a few days', () => {
    const jaw = program('jawline');
    expect(jaw.length).toBeGreaterThan(WORKOUT.routineSize);
    const seen = new Set<string>();
    for (const day of days(jaw.length)) {
      const ids = buildDailyRoutine('jawline', day);
      expect(ids).toHaveLength(WORKOUT.routineSize);
      expect(ids.every((id) => EXERCISES[id].program === 'jawline')).toBe(true);
      ids.forEach((id) => seen.add(id));
    }
    expect([...seen].sort()).toEqual([...jaw].sort());
  });

  it('eyes goal: all eye exercises plus others that rotate by day', () => {
    const eyes = program('eyes');
    expect(eyes.length).toBeLessThan(WORKOUT.routineSize);
    const a = buildDailyRoutine('eyes', '2026-10-06');
    const b = buildDailyRoutine('eyes', '2026-10-07');
    for (const ids of [a, b]) {
      expect(ids).toHaveLength(WORKOUT.routineSize);
      expect(ids).toEqual(expect.arrayContaining(eyes));
      expect(new Set(ids).size).toBe(ids.length);
    }
    expect(a).not.toEqual(b);
  });

  it('full face: a new window each day that covers the whole catalog', () => {
    const n = Math.ceil(EXERCISE_IDS.length / WORKOUT.routineSize);
    const seen = new Set<string>();
    for (const day of days(n)) {
      const ids = buildDailyRoutine('full', day);
      expect(ids).toHaveLength(WORKOUT.routineSize);
      ids.forEach((id) => seen.add(id));
    }
    expect([...seen].sort()).toEqual([...EXERCISE_IDS].sort());
    expect(buildDailyRoutine('full', '2026-10-06')).not.toEqual(buildDailyRoutine('full', '2026-10-07'));
  });

  it('every program has exercises and every exercise has its three images', () => {
    for (const p of ['jawline', 'cheekbones', 'eyes']) expect(program(p).length).toBeGreaterThan(0);
    for (const id of EXERCISE_IDS) {
      const img = EXERCISE_IMAGES[id];
      expect([img.relaxed, img.exercise, img.thumb].every(Boolean)).toBe(true);
    }
  });

  it('keeps catalog order (jaw first, eyes last)', () => {
    const ids = buildDailyRoutine('cheekbones', '2026-10-09');
    const order = ids.map((id) => EXERCISE_IDS.indexOf(id));
    expect(order).toEqual([...order].sort((x, y) => x - y));
  });
});

describe('routineSeconds', () => {
  it('counts get-ready, holds, relaxes (not after the last rep) and breaks', () => {
    const e = EXERCISES['09-brow-lift'];
    expect(routineSeconds(['09-brow-lift'])).toBe(WORKOUT.getReadySec + e.reps * (e.holdSec + e.relaxSec) - e.relaxSec);
    expect(routineSeconds(['09-brow-lift', '09-brow-lift'])).toBe(
      WORKOUT.getReadySec + 2 * (e.reps * (e.holdSec + e.relaxSec) - e.relaxSec) + WORKOUT.restSec,
    );
    expect(routineSeconds([])).toBe(0);
  });
});
