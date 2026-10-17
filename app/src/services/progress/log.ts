import type { PlanRef } from '@/constants/plan';
import type { LogAction } from '@/services/ai/types';
import { defaultItem, workoutSeconds, type WorkoutItem } from '@/services/workout/items';
import { addDays, type ISODate } from '@/utils/dates';

/** Today's plan day, when a workout today would count for it (the next day, ready on this iPhone). */
export interface PlanToday {
  ref: PlanRef;
  items: WorkoutItem[];
}

/** What saving a workout the Coach proposed saves. */
export interface LoggedWorkout {
  day: ISODate;
  items: WorkoutItem[];
  durationSec: number;
  /** The plan day it counts for: only today's, only when that day is open (see PlanToday). */
  plan: PlanRef | null;
}

/**
 * Turns a proposed log into the workout to save, from the app's own data (never the model's numbers, except the minutes
 * the user said). "Today's plan day" saves that day's exercises and counts for the plan, but only today and only when
 * the day is still open; otherwise the exercises the user named, with their usual reps. Minutes the user said win over
 * the estimate. Null when there is nothing to save.
 */
export function loggedWorkout(action: LogAction, today: ISODate, planToday: PlanToday | null): LoggedWorkout | null {
  const counts = action.plan && action.daysAgo === 0 && planToday ? planToday : null;
  const items = counts ? counts.items : action.exercises.map(defaultItem);
  if (!items.length && !action.minutes) return null;
  return {
    day: addDays(today, -action.daysAgo),
    items,
    durationSec: action.minutes ? action.minutes * 60 : workoutSeconds(items),
    plan: counts ? counts.ref : null,
  };
}
