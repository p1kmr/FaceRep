import { useMemo } from 'react';

import { WEEKS } from '@/constants/weeks';
import { workoutSeconds } from '@/services/workout/items';
import { dayAllowed, previewOf, weekWorkouts } from '@/services/workout/today';
import { isFreeDay, stepOf, weekDone } from '@/services/workout/weeks';

import { usePremium } from './usePremium';
import { useProgressState } from './useProgress';
import { useSettings } from './useSettings';
import { useToday } from './useToday';
import { useTodayWorkout } from './useTodayWorkout';

/**
 * This week, day 1 to 7, for the page the Today card's "Week · Day" opens: a day not done yet is its workout
 * (services/workout/today.ts weekWorkouts; today's is the same as the Today card's), a done day is what was done that
 * date (services/workout/weeks.ts weekDone), with which one is today. Without Premium a day after the free ones is
 * locked: it names one free exercise (`preview`) and hides the rest. `next` is what the next week changes, when it
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
  const days = useMemo(() => {
    const first = (week - 1) * WEEKS.daysPerWeek;
    return weekWorkouts(goal, daysDone, (d) => dayAllowed(isPremium, d)).map((d, i) => {
      const locked = !isPremium && !isFreeDay(first + i) && !done[i];
      return {
        ...d,
        seconds: done[i]?.seconds ?? workoutSeconds(d.items),
        isToday: d.day === day,
        /** What was done that date, once the day is done; the workout above is then not shown. */
        done: done[i] ?? null,
        locked,
        /** The one exercise a locked day names; the others stay hidden. */
        preview: locked ? previewOf(d.items) : null,
      };
    });
  }, [goal, daysDone, isPremium, week, day, done]);
  const coming = stepOf(week + 1);
  return { week, note: today.note, days, next: coming.note === today.note ? null : coming.note };
}

export type WeekDayWorkout = ReturnType<typeof useThisWeek>['days'][number];
