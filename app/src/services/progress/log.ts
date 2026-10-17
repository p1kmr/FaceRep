import type { LogAction } from '@/services/ai/types';
import { defaultItem, workoutSeconds, type WorkoutItem } from '@/services/workout/items';
import { addDays, type ISODate } from '@/utils/dates';

/** What saving a workout the Coach proposed saves. */
export interface LoggedWorkout {
  day: ISODate;
  items: WorkoutItem[];
  durationSec: number;
}

/**
 * Turns a proposed log into the workout to save, from the app's own data (never the model's numbers, except the minutes
 * the user said): the exercises the user named, with their usual reps. Minutes the user said win over the estimate.
 * Null when there is nothing to save.
 */
export function loggedWorkout(action: LogAction, today: ISODate): LoggedWorkout | null {
  const items = action.exercises.map(defaultItem);
  if (!items.length && !action.minutes) return null;
  return {
    day: addDays(today, -action.daysAgo),
    items,
    durationSec: action.minutes ? action.minutes * 60 : workoutSeconds(items),
  };
}
