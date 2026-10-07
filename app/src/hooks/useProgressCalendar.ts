import { useMemo } from 'react';

import { canGoForward, dayTotals, monthWeeks, periodOf, summarize, weekDays, yearMonths, type CalendarView } from '@/services/progress/calendar';
import type { ISODate } from '@/utils/dates';

import { useFirstWeekday } from './useFirstWeekday';
import { useProgressState } from './useProgress';
import { useToday } from './useToday';

/** Data for the Progress tab's Week / Month / Year views around `anchor` (any day in the period). */
export function useProgressCalendar(view: CalendarView, anchor: ISODate) {
  const { sessions } = useProgressState();
  const today = useToday();
  const firstWeekday = useFirstWeekday();
  const totals = useMemo(() => dayTotals(sessions), [sessions]);

  return useMemo(() => {
    const period = periodOf(anchor, view, firstWeekday);
    return {
      today,
      period,
      summary: summarize(totals, period),
      canGoForward: canGoForward(anchor, view, firstWeekday, today),
      /** Week: minutes per day, Monday (or the user's first weekday) first. */
      week: view === 'week' ? weekDays(anchor, firstWeekday).map((day) => ({ day, seconds: totals.get(day)?.seconds ?? 0 })) : [],
      /** Month: rows of 7, null outside the month. */
      month: view === 'month' ? monthWeeks(anchor, firstWeekday) : [],
      /** Any week, for the weekday names above the month grid. */
      weekdays: weekDays(today, firstWeekday),
      year: view === 'year' ? yearMonths(anchor, totals) : [],
      workoutsOn: (day: ISODate) => totals.get(day)?.workouts ?? 0,
    };
  }, [view, anchor, firstWeekday, totals, today]);
}
