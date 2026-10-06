import { EXERCISE_IDS, EXERCISES, WORKOUT } from '@/constants/exercises';

import { buildDailyRoutine, routineSeconds } from '../routine';

describe('buildDailyRoutine', () => {
  it('jawline goal: the five jaw exercises', () => {
    const ids = buildDailyRoutine('jawline', '2026-10-06');
    expect(ids).toEqual(['01-jaw-clench', '02-chin-lift', '03-jaw-jut', '04-mewing', '05-neck-stretch']);
  });

  it('eyes goal: both eye exercises plus others that rotate by day', () => {
    const a = buildDailyRoutine('eyes', '2026-10-06');
    const b = buildDailyRoutine('eyes', '2026-10-07');
    for (const ids of [a, b]) {
      expect(ids).toHaveLength(WORKOUT.routineSize);
      expect(ids).toEqual(expect.arrayContaining(['09-brow-lift', '10-eye-squeeze']));
      expect(new Set(ids).size).toBe(ids.length);
    }
    expect(a).not.toEqual(b);
  });

  it('full face alternates two halves of the catalog', () => {
    const a = buildDailyRoutine('full', '2026-10-06');
    const b = buildDailyRoutine('full', '2026-10-07');
    expect([...a, ...b].sort()).toEqual([...EXERCISE_IDS].sort());
    expect(buildDailyRoutine('full', '2026-10-08')).toEqual(a);
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
