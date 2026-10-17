import { EXERCISE_IDS, EXERCISES, type MuscleId } from '@/constants/exercises';
import { areasOf, areasOfAll, exercisesFor, FACE_AREAS, MUSCLE_AREA, musclesIn, type FaceMapLayout } from '@/constants/faceMap';

import { areaAt } from '../hit';

const square = (x: number, y: number, w: number, h: number): [number, number][] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

/** A 100 × 200 picture: the neck a big square low down, the chin a small one inside it, the rest far away. */
const layout = {
  width: 100,
  height: 200,
  areas: Object.fromEntries(
    FACE_AREAS.map((a) => {
      if (a === 'neck') return [a, { box: [0.2, 0.5, 0.6, 0.4], shapes: [square(0.2, 0.5, 0.6, 0.4)] }];
      if (a === 'chin') return [a, { box: [0.4, 0.6, 0.2, 0.1], shapes: [square(0.4, 0.6, 0.2, 0.1)] }];
      return [a, { box: [0, 0, 0.05, 0.05], shapes: [square(0, 0, 0.05, 0.05)] }];
    }),
  ),
} as FaceMapLayout;

describe('face map taps', () => {
  it('picks the area under the finger; the smaller one where they overlap', () => {
    expect(areaAt(layout, 0.3, 0.8)).toBe('neck');
    expect(areaAt(layout, 0.5, 0.65)).toBe('chin');
  });

  it('a near miss still picks the closest area; a far one picks nothing', () => {
    expect(areaAt(layout, 0.5, 0.45)).toBe('neck'); // 10 px above it
    expect(areaAt(layout, 0.9, 0.3)).toBeNull();
  });
});

describe('face areas', () => {
  it('every muscle is in an area, and every area has exercises and muscles', () => {
    const muscles = new Set(EXERCISE_IDS.flatMap((id) => EXERCISES[id].muscles));
    for (const m of muscles) expect(FACE_AREAS).toContain(MUSCLE_AREA[m as MuscleId]);
    for (const area of FACE_AREAS) {
      expect(exercisesFor(area).length).toBeGreaterThan(0);
      expect(musclesIn(area).length).toBeGreaterThan(0);
    }
  });

  it('an exercise works the areas of its muscles, in map order', () => {
    expect(areasOf('01-jaw-clench')).toEqual(['jaw']);
    expect(areasOf('19-pout')).toEqual(['lips', 'chin']);
    expect(areasOf('15-lion-face')).toEqual(['cheeks', 'neck']);
    expect(areasOfAll(['11-chin-tuck', '09-brow-lift', '01-jaw-clench'])).toEqual(['forehead', 'jaw', 'neck']);
    expect(exercisesFor('temples')).toEqual(['27-temple-circles']);
  });
});
