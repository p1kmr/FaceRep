/**
 * The face map: the areas of the face, which muscle lies in which, and so which exercises work each area. The pictures
 * (one grey face per guide and a red layer per area) come from the drawings, made by videos/tools/facemap.py; names
 * and short notes are in i18n/locales/<lang>/exercises.json under `areas.<id>`.
 */
import { EXERCISE_IDS, EXERCISES, type ExerciseId, type MuscleId } from './exercises';

/** Top to bottom, the order of the chips. */
export const FACE_AREAS = ['forehead', 'temples', 'eyes', 'cheeks', 'lips', 'jaw', 'chin', 'neck'] as const;
export type FaceArea = (typeof FACE_AREAS)[number];

export const MUSCLE_AREA: Record<MuscleId, FaceArea> = {
  frontalis: 'forehead',
  corrugator: 'forehead',
  temporalis: 'temples',
  orbicularisOculi: 'eyes',
  eyelids: 'eyes',
  zygomaticus: 'cheeks',
  buccinator: 'cheeks',
  lips: 'lips',
  masseter: 'jaw',
  mentalis: 'chin',
  underChin: 'chin',
  tongue: 'chin',
  platysma: 'neck',
  deepNeck: 'neck',
  neck: 'neck',
};

/** The areas an exercise works, in map order. */
export const areasOf = (id: ExerciseId): FaceArea[] => {
  const areas = new Set(EXERCISES[id].muscles.map((m) => MUSCLE_AREA[m]));
  return FACE_AREAS.filter((a) => areas.has(a));
};

/** The areas a set of exercises works (a plan day), in map order. */
export const areasOfAll = (ids: readonly ExerciseId[]): FaceArea[] => {
  const areas = new Set(ids.flatMap(areasOf));
  return FACE_AREAS.filter((a) => areas.has(a));
};

/** The exercises that work an area, in catalog order. */
export const exercisesFor = (area: FaceArea): ExerciseId[] => EXERCISE_IDS.filter((id) => areasOf(id).includes(area));

/** The muscles of an area that the catalog trains. */
export const musclesIn = (area: FaceArea): MuscleId[] =>
  (Object.keys(MUSCLE_AREA) as MuscleId[]).filter((m) => MUSCLE_AREA[m] === area);

/** Where an area is in the map picture and its outline for tapping, as shares (0–1) of the picture's width and height. */
export interface FaceMapLayout {
  width: number;
  height: number;
  areas: Record<FaceArea, { box: [number, number, number, number]; shapes: [number, number][][] }>;
}
