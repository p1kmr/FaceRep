/**
 * The exercise catalog. Names, cues and steps are translated in i18n/locales/<lang>/exercises.json
 * under `items.<key>`. Images are referenced only from constants/exerciseImages.ts (static require).
 */
import type { GuideId } from './guides';

export type ProgramId = 'jawline' | 'cheekbones' | 'lips' | 'eyes' | 'massage';

/** What the user picked in onboarding: one program, or the full face. */
export type Goal = ProgramId | 'full';

export type MuscleId =
  | 'masseter'
  | 'platysma'
  | 'deepNeck'
  | 'underChin'
  | 'mentalis'
  | 'tongue'
  | 'neck'
  | 'zygomaticus'
  | 'buccinator'
  | 'lips'
  | 'frontalis'
  | 'orbicularisOculi'
  | 'eyelids'
  | 'corrugator'
  | 'temporalis';

/**
 * Catalog order: grouped by program (jaw → cheeks → lips → eyes → massage), which is also the order a
 * workout runs in (massage last, as a cool-down).
 * The number in an ID is only its image file prefix and never changes (IDs are stored in SQLite).
 */
export const EXERCISE_IDS = [
  '01-jaw-clench',
  '02-chin-lift',
  '03-jaw-jut',
  '04-mewing',
  '12-tongue-press',
  '11-chin-tuck',
  '05-neck-stretch',
  '06-cheek-lift',
  '07-fish-face',
  '13-smiling-fish',
  '08-cheek-puff',
  '14-o-stretch',
  '15-lion-face',
  '18-lip-press',
  '19-pout',
  '20-lip-corner-lift',
  '21-smile-line-press',
  '09-brow-lift',
  '22-forehead-press',
  '16-wide-eyes',
  '17-lower-lid-lift',
  '23-v-eyes',
  '10-eye-squeeze',
  '24-jaw-release',
  '25-jawline-sweep',
  '26-frown-release',
  '27-temple-circles',
] as const;

export type ExerciseId = (typeof EXERCISE_IDS)[number];

/**
 * Version of this catalog. Bump it when exercises are added (and in worker/src/lib/plan.js, whose
 * test checks both). POST /plan sends it, so the Worker never plans an exercise this app doesn't have.
 */
export const CATALOG_VERSION = 2;

export interface Exercise {
  id: ExerciseId;
  program: ProgramId;
  /** i18n key: exercises:items.<key>.name / .cue / .steps */
  key: string;
  muscles: MuscleId[];
  reps: number;
  /** Seconds to hold the pose (exercise frame). */
  holdSec: number;
  /** Seconds to relax between reps (relaxed frame). */
  relaxSec: number;
  /** Loads the jaw joint: show the jaw-pain caution. */
  jawCaution?: boolean;
  /** Done with the fingers (massage or light resistance): show the clean-hands / recent-treatment caution. */
  handsOn?: boolean;
}

export const EXERCISES: Record<ExerciseId, Exercise> = {
  '01-jaw-clench': { id: '01-jaw-clench', program: 'jawline', key: 'jawClench', muscles: ['masseter'], reps: 10, holdSec: 5, relaxSec: 3, jawCaution: true },
  '02-chin-lift': { id: '02-chin-lift', program: 'jawline', key: 'chinLift', muscles: ['platysma'], reps: 10, holdSec: 5, relaxSec: 3 },
  '03-jaw-jut': { id: '03-jaw-jut', program: 'jawline', key: 'jawJut', muscles: ['platysma', 'mentalis'], reps: 10, holdSec: 5, relaxSec: 3, jawCaution: true },
  '04-mewing': { id: '04-mewing', program: 'jawline', key: 'mewing', muscles: ['tongue'], reps: 5, holdSec: 10, relaxSec: 4 },
  '05-neck-stretch': { id: '05-neck-stretch', program: 'jawline', key: 'neckStretch', muscles: ['neck'], reps: 6, holdSec: 8, relaxSec: 3 },
  '11-chin-tuck': { id: '11-chin-tuck', program: 'jawline', key: 'chinTuck', muscles: ['deepNeck'], reps: 10, holdSec: 5, relaxSec: 3 },
  '12-tongue-press': { id: '12-tongue-press', program: 'jawline', key: 'tonguePress', muscles: ['underChin', 'tongue'], reps: 8, holdSec: 8, relaxSec: 3 },
  '06-cheek-lift': { id: '06-cheek-lift', program: 'cheekbones', key: 'cheekLift', muscles: ['zygomaticus'], reps: 12, holdSec: 5, relaxSec: 3 },
  '07-fish-face': { id: '07-fish-face', program: 'cheekbones', key: 'fishFace', muscles: ['buccinator'], reps: 8, holdSec: 5, relaxSec: 3 },
  '08-cheek-puff': { id: '08-cheek-puff', program: 'cheekbones', key: 'cheekPuff', muscles: ['buccinator', 'lips'], reps: 8, holdSec: 5, relaxSec: 3 },
  '13-smiling-fish': { id: '13-smiling-fish', program: 'cheekbones', key: 'smilingFish', muscles: ['buccinator', 'zygomaticus'], reps: 8, holdSec: 5, relaxSec: 3 },
  '14-o-stretch': { id: '14-o-stretch', program: 'cheekbones', key: 'oStretch', muscles: ['lips'], reps: 8, holdSec: 5, relaxSec: 3 },
  '15-lion-face': { id: '15-lion-face', program: 'cheekbones', key: 'lionFace', muscles: ['zygomaticus', 'platysma'], reps: 6, holdSec: 5, relaxSec: 4, jawCaution: true },
  '18-lip-press': { id: '18-lip-press', program: 'lips', key: 'lipPress', muscles: ['lips'], reps: 10, holdSec: 5, relaxSec: 3 },
  '19-pout': { id: '19-pout', program: 'lips', key: 'pout', muscles: ['lips', 'mentalis'], reps: 10, holdSec: 5, relaxSec: 3 },
  '20-lip-corner-lift': { id: '20-lip-corner-lift', program: 'lips', key: 'lipCornerLift', muscles: ['zygomaticus', 'lips'], reps: 12, holdSec: 4, relaxSec: 3 },
  '21-smile-line-press': { id: '21-smile-line-press', program: 'lips', key: 'smileLinePress', muscles: ['zygomaticus'], reps: 8, holdSec: 5, relaxSec: 3, handsOn: true },
  '09-brow-lift': { id: '09-brow-lift', program: 'eyes', key: 'browLift', muscles: ['frontalis'], reps: 10, holdSec: 3, relaxSec: 2 },
  '10-eye-squeeze': { id: '10-eye-squeeze', program: 'eyes', key: 'eyeSqueeze', muscles: ['orbicularisOculi'], reps: 10, holdSec: 3, relaxSec: 2 },
  '22-forehead-press': { id: '22-forehead-press', program: 'eyes', key: 'foreheadPress', muscles: ['frontalis'], reps: 8, holdSec: 5, relaxSec: 3, handsOn: true },
  '23-v-eyes': { id: '23-v-eyes', program: 'eyes', key: 'vEyes', muscles: ['orbicularisOculi'], reps: 8, holdSec: 5, relaxSec: 3, handsOn: true },
  '24-jaw-release': { id: '24-jaw-release', program: 'massage', key: 'jawRelease', muscles: ['masseter'], reps: 6, holdSec: 8, relaxSec: 2, handsOn: true },
  '25-jawline-sweep': { id: '25-jawline-sweep', program: 'massage', key: 'jawlineSweep', muscles: ['platysma'], reps: 8, holdSec: 4, relaxSec: 2, handsOn: true },
  '26-frown-release': { id: '26-frown-release', program: 'massage', key: 'frownRelease', muscles: ['corrugator'], reps: 8, holdSec: 4, relaxSec: 2, handsOn: true },
  '27-temple-circles': { id: '27-temple-circles', program: 'massage', key: 'templeCircles', muscles: ['temporalis'], reps: 6, holdSec: 8, relaxSec: 2, handsOn: true },
  '16-wide-eyes': { id: '16-wide-eyes', program: 'eyes', key: 'wideEyes', muscles: ['eyelids'], reps: 6, holdSec: 6, relaxSec: 3 },
  '17-lower-lid-lift': { id: '17-lower-lid-lift', program: 'eyes', key: 'lowerLidLift', muscles: ['orbicularisOculi'], reps: 8, holdSec: 4, relaxSec: 3 },
};

export const PROGRAMS: ProgramId[] = ['jawline', 'cheekbones', 'lips', 'eyes', 'massage'];
export const GOALS: Goal[] = [...PROGRAMS, 'full'];

/**
 * Display order of the programs (onboarding, Settings, Exercises tab). Every program is there for
 * everyone; with the woman's pictures the areas women's face-yoga apps lead with come first. Only
 * the order changes on the device; the plan never depends on the guide.
 */
export const programsFor = (guide: GuideId): ProgramId[] =>
  guide === 'woman' ? ['lips', 'cheekbones', 'eyes', 'massage', 'jawline'] : PROGRAMS;
export const goalsFor = (guide: GuideId): Goal[] => [...programsFor(guide), 'full'];

export const exercisesOf = (program: ProgramId): Exercise[] =>
  EXERCISE_IDS.map((id) => EXERCISES[id]).filter((e) => e.program === program);

export const isExerciseId = (v: unknown): v is ExerciseId => typeof v === 'string' && (EXERCISE_IDS as readonly string[]).includes(v);

/** Seconds one exercise takes with all its reps (the last relax is skipped). */
export const exerciseSeconds = (e: Exercise) => e.reps * (e.holdSec + e.relaxSec) - e.relaxSec;

/** Workout pacing between exercises. */
export const WORKOUT = {
  /** "Get ready" countdown before the first rep of each exercise. */
  getReadySec: 3,
  /** Short break that previews the next exercise. */
  restSec: 5,
} as const;
