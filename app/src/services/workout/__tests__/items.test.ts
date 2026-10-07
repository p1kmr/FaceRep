import { EXERCISE_IMAGES } from '@/constants/exerciseImages';
import { EXERCISE_IDS, EXERCISES, WORKOUT } from '@/constants/exercises';

import { defaultItem, workoutSeconds } from '../items';

describe('exercise catalog', () => {
  it('every program has exercises and every exercise has its three images', () => {
    for (const p of ['jawline', 'cheekbones', 'eyes']) expect(EXERCISE_IDS.some((id) => EXERCISES[id].program === p)).toBe(true);
    for (const id of EXERCISE_IDS) {
      const img = EXERCISE_IMAGES[id];
      expect([img.relaxed, img.exercise, img.thumb].every(Boolean)).toBe(true);
    }
  });
});

describe('workoutSeconds', () => {
  it('counts get-ready, holds, relaxes (not after the last rep) and breaks', () => {
    const e = EXERCISES['09-brow-lift'];
    const one = defaultItem('09-brow-lift');
    expect(one).toEqual({ id: '09-brow-lift', reps: e.reps, holdSec: e.holdSec, relaxSec: e.relaxSec });
    expect(workoutSeconds([one])).toBe(WORKOUT.getReadySec + e.reps * (e.holdSec + e.relaxSec) - e.relaxSec);
    expect(workoutSeconds([one, one])).toBe(WORKOUT.getReadySec + 2 * (e.reps * (e.holdSec + e.relaxSec) - e.relaxSec) + WORKOUT.restSec);
    expect(workoutSeconds([])).toBe(0);
  });
});
