import { EXERCISE_IDS, EXERCISES, WORKOUT, type ExerciseId, type Goal } from '@/constants/exercises';
import { diffInDays, type ISODate } from '@/utils/dates';

/** Any fixed day: the routine rotates by the number of days since then. */
const EPOCH: ISODate = '2026-01-01';

const rotate = <T>(list: readonly T[], by: number): T[] => {
  if (!list.length) return [];
  const n = ((by % list.length) + list.length) % list.length;
  return [...list.slice(n), ...list.slice(0, n)];
};

/**
 * Today's routine for a goal (pure: same goal + day → same list).
 * - A program goal: that program's exercises first. When it has more than `size`, a different window
 *   is used each day so every exercise comes up; when it has fewer, others fill the gap, rotating daily.
 * - Full face: a window of `size` that moves through the whole catalog, one window per day.
 * Always in catalog order, so the session flows from jaw to eyes.
 */
export function buildDailyRoutine(goal: Goal, today: ISODate, size: number = WORKOUT.routineSize): ExerciseId[] {
  const day = diffInDays(today, EPOCH);
  let picked: ExerciseId[];
  if (goal === 'full') {
    picked = rotate(EXERCISE_IDS, day * size).slice(0, size);
  } else {
    const primary = EXERCISE_IDS.filter((id) => EXERCISES[id].program === goal);
    const others = EXERCISE_IDS.filter((id) => EXERCISES[id].program !== goal);
    picked =
      primary.length > size
        ? rotate(primary, day * size).slice(0, size)
        : [...primary, ...rotate(others, day).slice(0, size - primary.length)];
  }
  const order = (id: ExerciseId) => EXERCISE_IDS.indexOf(id);
  return [...new Set(picked)].sort((a, b) => order(a) - order(b));
}

/** Seconds a list of exercises takes, including the breaks between them. */
export function routineSeconds(ids: readonly ExerciseId[]): number {
  if (!ids.length) return 0;
  const work = ids.reduce((sum, id) => {
    const e = EXERCISES[id];
    return sum + e.reps * (e.holdSec + e.relaxSec) - e.relaxSec;
  }, 0);
  return WORKOUT.getReadySec + work + WORKOUT.restSec * (ids.length - 1);
}
