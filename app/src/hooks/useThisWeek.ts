import { useMemo } from 'react';

import { isFreeExercise } from '@/constants/exercises';
import { workoutSeconds } from '@/services/workout/items';
import { weekWorkouts } from '@/services/workout/today';
import { stepOf } from '@/services/workout/weeks';

import { usePremium } from './usePremium';
import { useSettings } from './useSettings';
import { useTodayWorkout } from './useTodayWorkout';

/**
 * This week, day 1 to 7, for the page the Today card's "Week · Day" opens (services/workout/today.ts weekWorkouts):
 * each day's workout, whether it is done and which one is today. Today's day is the same workout as the Today card's.
 * `next` is what the next week changes, when it changes something.
 */
export function useThisWeek() {
  const today = useTodayWorkout();
  const { goal } = useSettings();
  const { isPremium } = usePremium();
  const { daysDone, week, day, done } = today;
  const days = useMemo(
    () =>
      weekWorkouts(goal, daysDone, isPremium ? () => true : isFreeExercise).map((d) => ({
        ...d,
        seconds: workoutSeconds(d.items),
        isToday: d.day === day,
        done: d.day < day || (d.day === day && done),
      })),
    [goal, daysDone, isPremium, day, done],
  );
  const coming = stepOf(week + 1);
  return { week, note: today.note, days, next: coming.note === today.note ? null : coming.note };
}

export type WeekDayWorkout = ReturnType<typeof useThisWeek>['days'][number];
