import { useMemo } from 'react';

import { isFreeExercise } from '@/constants/exercises';
import { workoutSeconds } from '@/services/workout/items';
import { todaysWorkout } from '@/services/workout/today';
import { daysDone, isDayWorkout } from '@/services/workout/weeks';

import { usePremium } from './usePremium';
import { useProgressState } from './useProgress';
import { useSettings } from './useSettings';
import { useToday } from './useToday';

/**
 * Today's workout for the user's focus area and where it is in the weeks (services/workout/today.ts): with Premium
 * from every exercise, without it from the free ones. The days done come from the saved workouts. Done once today has
 * a workout (services/workout/weeks.ts isDayWorkout); it can always be done again, and the next day comes tomorrow.
 */
export function useTodayWorkout() {
  const { goal } = useSettings();
  const { isPremium } = usePremium();
  const today = useToday();
  const { sessions } = useProgressState();
  const before = useMemo(() => daysDone(sessions, today), [sessions, today]);
  const workout = useMemo(() => todaysWorkout(goal, before, isPremium ? () => true : isFreeExercise), [goal, before, isPremium]);
  return {
    ...workout,
    seconds: workoutSeconds(workout.items),
    done: sessions.some((s) => s.day === today && isDayWorkout(s)),
  };
}
