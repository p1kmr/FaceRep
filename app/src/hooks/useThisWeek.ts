import { useMemo } from 'react';

import { isFreeExercise } from '@/constants/exercises';
import { workoutSeconds } from '@/services/workout/items';
import { weekWorkouts } from '@/services/workout/today';
import { stepOf, weekDone } from '@/services/workout/weeks';

import { usePremium } from './usePremium';
import { useProgressState } from './useProgress';
import { useSettings } from './useSettings';
import { useToday } from './useToday';
import { useTodayWorkout } from './useTodayWorkout';

/**
 * This week, day 1 to 7, for the page the Today card's "Week · Day" opens: a day not done yet is its workout
 * (services/workout/today.ts weekWorkouts; today's is the same as the Today card's), a done day is what was done that
 * date (services/workout/weeks.ts weekDone), with which one is today. `next` is what the next week changes, when it
 * changes something.
 */
export function useThisWeek() {
  const today = useTodayWorkout();
  const { goal } = useSettings();
  const { isPremium } = usePremium();
  const date = useToday();
  const { sessions } = useProgressState();
  const { daysDone, week, day } = today;
  const done = useMemo(() => weekDone(sessions, date), [sessions, date]);
  const days = useMemo(
    () =>
      weekWorkouts(goal, daysDone, isPremium ? () => true : isFreeExercise).map((d, i) => ({
        ...d,
        seconds: done[i]?.seconds ?? workoutSeconds(d.items),
        isToday: d.day === day,
        /** What was done that date, once the day is done; the workout above is then not shown. */
        done: done[i] ?? null,
      })),
    [goal, daysDone, isPremium, day, done],
  );
  const coming = stepOf(week + 1);
  return { week, note: today.note, days, next: coming.note === today.note ? null : coming.note };
}

export type WeekDayWorkout = ReturnType<typeof useThisWeek>['days'][number];
