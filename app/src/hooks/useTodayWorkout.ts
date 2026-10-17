import { useMemo } from 'react';

import { workoutSeconds } from '@/services/workout/items';
import { dayAllowed, previewOf, todaysWorkout } from '@/services/workout/today';
import { daysDone, isDayWorkout, isFreeDay } from '@/services/workout/weeks';

import { usePremium } from './usePremium';
import { useProgressState } from './useProgress';
import { useSettings } from './useSettings';
import { useToday } from './useToday';

/**
 * Today's workout for the user's focus area and where it is in the weeks (services/workout/today.ts): with Premium
 * from every exercise. Without it, days 1 to WEEKS.freeDays come from the free exercises and a later day is locked: it
 * shows as Premium makes it, naming one free exercise, and starts only after purchase. The days done come from the
 * saved workouts. Done once today has a workout (services/workout/weeks.ts isDayWorkout); it can always be done again,
 * and the next day comes tomorrow.
 */
export function useTodayWorkout() {
  const { goal } = useSettings();
  const { isPremium } = usePremium();
  const today = useToday();
  const { sessions } = useProgressState();
  const before = useMemo(() => daysDone(sessions, today), [sessions, today]);
  const workout = useMemo(() => todaysWorkout(goal, before, dayAllowed(isPremium, before)), [goal, before, isPremium]);
  const locked = !isPremium && !isFreeDay(before);
  return {
    ...workout,
    /** Days with a workout before today (services/workout/weeks.ts daysDone). */
    daysDone: before,
    seconds: workoutSeconds(workout.items),
    done: sessions.some((s) => s.day === today && isDayWorkout(s)),
    /** Without Premium, a day after the free ones: locked. */
    locked,
    /** The exercise a locked day names (its first free one); the others stay hidden. */
    preview: locked ? previewOf(workout.items) : null,
    /** Without Premium, the next day is locked (today was the last free day). */
    nextLocked: !isPremium && !isFreeDay(before + 1),
  };
}
