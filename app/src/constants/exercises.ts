/**
 * The exercise catalog. Names, cues and steps are translated in i18n/locales/<lang>/exercises.json
 * under `items.<key>`. Images are referenced only from constants/exerciseImages.ts (static require).
 */
export type ProgramId = 'jawline' | 'cheekbones' | 'eyes';

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
  | 'eyelids';

/**
 * Catalog order: grouped by program (jaw → cheeks → eyes), which is also the order a workout runs in.
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
  '09-brow-lift',
  '16-wide-eyes',
  '17-lower-lid-lift',
  '10-eye-squeeze',
] as const;

export type ExerciseId = (typeof EXERCISE_IDS)[number];

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
  '09-brow-lift': { id: '09-brow-lift', program: 'eyes', key: 'browLift', muscles: ['frontalis'], reps: 10, holdSec: 3, relaxSec: 2 },
  '10-eye-squeeze': { id: '10-eye-squeeze', program: 'eyes', key: 'eyeSqueeze', muscles: ['orbicularisOculi'], reps: 10, holdSec: 3, relaxSec: 2 },
  '16-wide-eyes': { id: '16-wide-eyes', program: 'eyes', key: 'wideEyes', muscles: ['eyelids'], reps: 6, holdSec: 6, relaxSec: 3 },
  '17-lower-lid-lift': { id: '17-lower-lid-lift', program: 'eyes', key: 'lowerLidLift', muscles: ['orbicularisOculi'], reps: 8, holdSec: 4, relaxSec: 3 },
};

export const PROGRAMS: ProgramId[] = ['jawline', 'cheekbones', 'eyes'];
export const GOALS: Goal[] = ['jawline', 'cheekbones', 'eyes', 'full'];

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
