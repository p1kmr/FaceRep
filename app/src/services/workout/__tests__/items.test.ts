import { AVAILABLE_GUIDES, guideImages } from '@/constants/exerciseImages';
import { CATALOG_VERSION, EXERCISE_IDS, EXERCISES, GOALS, goalsFor, PROGRAMS, programsFor, WORKOUT } from '@/constants/exercises';
import { GUIDE_IDS } from '@/constants/guides';

import { defaultItem, workoutSeconds } from '../items';

describe('exercise catalog', () => {
  it('every program has exercises and every guide in the app has the three pictures of each', () => {
    for (const p of PROGRAMS) expect(EXERCISE_IDS.some((id) => EXERCISES[id].program === p)).toBe(true);
    expect(AVAILABLE_GUIDES).toContain('man');
    for (const guide of AVAILABLE_GUIDES) {
      for (const id of EXERCISE_IDS) {
        const img = guideImages(guide).exercises[id];
        expect([img.relaxed, img.exercise, img.thumb].every(Boolean)).toBe(true);
      }
    }
    // A guide without its full set falls back to the man's pictures.
    for (const guide of GUIDE_IDS.filter((g) => !AVAILABLE_GUIDES.includes(g))) expect(guideImages(guide)).toBe(guideImages('man'));
  });
});

describe('programs per guide', () => {
  it('every guide sees every program and goal; only the order changes', () => {
    expect(CATALOG_VERSION).toBe(2);
    for (const guide of ['man', 'woman'] as const) {
      expect([...programsFor(guide)].sort()).toEqual([...PROGRAMS].sort());
      expect([...goalsFor(guide)].sort()).toEqual([...GOALS].sort());
      expect(goalsFor(guide).at(-1)).toBe('full');
    }
    expect(programsFor('man')[0]).toBe('jawline');
    expect(programsFor('woman')[0]).toBe('lips');
  });

  it('exercises done with the fingers are flagged for the clean-hands caution, never the jaw caution', () => {
    const hands = EXERCISE_IDS.filter((id) => EXERCISES[id].handsOn);
    expect(hands).toEqual(['21-smile-line-press', '22-forehead-press', '23-v-eyes', '24-jaw-release', '25-jawline-sweep', '26-frown-release', '27-temple-circles']);
    expect(hands.some((id) => EXERCISES[id].jawCaution)).toBe(false);
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
