import { useMemo } from 'react';

import { isFreeExercise } from '@/constants/exercises';
import { workoutSeconds } from '@/services/workout/items';
import { todaysWorkout } from '@/services/workout/today';

import { usePremium } from './usePremium';
import { useProgressState } from './useProgress';
import { useSettings } from './useSettings';
import { useToday } from './useToday';

/**
 * Today's workout for the user's focus area (services/workout/today.ts): with Premium from every exercise, without it
 * from the free ones. Done once a routine was finished today; it can always be done again.
 */
export function useTodayWorkout() {
  const { goal } = useSettings();
  const { isPremium } = usePremium();
  const today = useToday();
  const { sessions } = useProgressState();
  const items = useMemo(() => todaysWorkout(goal, today, isPremium ? () => true : isFreeExercise), [goal, today, isPremium]);
  return {
    items,
    seconds: workoutSeconds(items),
    done: sessions.some((s) => s.day === today && s.kind === 'routine'),
  };
}
