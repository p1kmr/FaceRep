import { EXERCISES, WORKOUT, type ExerciseId } from '@/constants/exercises';

/** One exercise in a workout, with the reps and timing for this session. */
export interface WorkoutItem {
  id: ExerciseId;
  reps: number;
  holdSec: number;
  relaxSec: number;
}

/** An exercise with its usual reps and timing (single exercises from the library). */
export function defaultItem(id: ExerciseId): WorkoutItem {
  const { reps, holdSec, relaxSec } = EXERCISES[id];
  return { id, reps, holdSec, relaxSec };
}

/** Seconds a workout takes, including the get-ready countdown and the breaks between exercises. */
export function workoutSeconds(items: readonly WorkoutItem[]): number {
  if (!items.length) return 0;
  const work = items.reduce((sum, e) => sum + e.reps * (e.holdSec + e.relaxSec) - e.relaxSec, 0);
  return WORKOUT.getReadySec + work + WORKOUT.restSec * (items.length - 1);
}
