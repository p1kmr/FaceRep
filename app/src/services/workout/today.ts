import { EXERCISE_IDS, EXERCISES, WORKOUT, type ExerciseId, type Goal } from '@/constants/exercises';
import { diffInDays, type ISODate } from '@/utils/dates';

import { defaultItem, type WorkoutItem } from './items';

/** Days count from here, so a date gives the same workout on every iPhone. */
const START: ISODate = '2026-01-01';

const rotate = <T>(list: readonly T[], by: number): T[] => {
  if (!list.length) return [];
  const n = ((by % list.length) + list.length) % list.length;
  return [...list.slice(n), ...list.slice(0, n)];
};

/**
 * Today's workout for a focus area: WORKOUT.todayCount exercises of the area, a different set each day so every one
 * comes up (an area with fewer is topped up from the others, also changing daily); full face goes through them all.
 * Only exercises `allowed` (without Premium, the free ones). In catalog order, so massage stays last as a cool-down.
 * Pure: the same day and area always give the same workout, with each exercise's usual reps.
 */
export function todaysWorkout(goal: Goal, today: ISODate, allowed: (id: ExerciseId) => boolean): WorkoutItem[] {
  const n = diffInDays(today, START);
  const count = WORKOUT.todayCount;
  const pool = EXERCISE_IDS.filter(allowed);
  const primary = goal === 'full' ? pool : pool.filter((id) => EXERCISES[id].program === goal);
  const others = goal === 'full' ? [] : pool.filter((id) => EXERCISES[id].program !== goal);
  const picked =
    primary.length >= count ? rotate(primary, n * count).slice(0, count) : [...primary, ...rotate(others, n).slice(0, count - primary.length)];
  return EXERCISE_IDS.filter((id) => picked.includes(id)).map(defaultItem);
}
