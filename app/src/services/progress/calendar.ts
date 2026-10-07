import { addDays, monthOf, weekdayOf, type ISODate } from '@/utils/dates';

import type { SessionSummary } from './stats';

/**
 * Pure calendar maths for the Progress tab's Week / Month / Year views. Weeks start on
 * `firstWeekday` (0 = Sunday … 6 = Saturday), which comes from the iPhone's region settings.
 */

export type CalendarView = 'week' | 'month' | 'year';

export interface DayTotal {
  workouts: number;
  seconds: number;
}

export interface Period {
  from: ISODate;
  to: ISODate;
}

const pad = (n: number) => String(n).padStart(2, '0');
const firstOfMonth = (iso: ISODate) => `${monthOf(iso)}-01`;

/** Workouts and seconds per calendar day. */
export function dayTotals(sessions: readonly SessionSummary[]): Map<ISODate, DayTotal> {
  const map = new Map<ISODate, DayTotal>();
  for (const s of sessions) {
    const t = map.get(s.day) ?? { workouts: 0, seconds: 0 };
    map.set(s.day, { workouts: t.workouts + 1, seconds: t.seconds + s.durationSec });
  }
  return map;
}

/** First day of the week that contains `iso`. */
export function startOfWeek(iso: ISODate, firstWeekday: number): ISODate {
  return addDays(iso, -((weekdayOf(iso) - firstWeekday + 7) % 7));
}

export const weekDays = (anchor: ISODate, firstWeekday: number): ISODate[] =>
  Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor, firstWeekday), i));

/** Moves one week, month or year back (-1) or forward (+1). Month and year snap to their first day. */
export function shiftAnchor(anchor: ISODate, view: CalendarView, by: number): ISODate {
  if (view === 'week') return addDays(anchor, 7 * by);
  const [y, m] = anchor.split('-').map(Number);
  if (view === 'year') return `${y + by}-01-01`;
  const months = y * 12 + (m - 1) + by;
  return `${Math.floor(months / 12)}-${pad((months % 12) + 1)}-01`;
}

/** First and last day of the week, month or year around `anchor`. */
export function periodOf(anchor: ISODate, view: CalendarView, firstWeekday: number): Period {
  if (view === 'week') {
    const from = startOfWeek(anchor, firstWeekday);
    return { from, to: addDays(from, 6) };
  }
  if (view === 'year') return { from: `${anchor.slice(0, 4)}-01-01`, to: `${anchor.slice(0, 4)}-12-31` };
  const from = firstOfMonth(anchor);
  return { from, to: addDays(shiftAnchor(from, 'month', 1), -1) };
}

/** The month as rows of 7 days (weeks start on `firstWeekday`); days of other months are null. */
export function monthWeeks(anchor: ISODate, firstWeekday: number): (ISODate | null)[][] {
  const { from, to } = periodOf(anchor, 'month', firstWeekday);
  const rows: (ISODate | null)[][] = [];
  for (let start = startOfWeek(from, firstWeekday); start <= to; start = addDays(start, 7)) {
    rows.push(Array.from({ length: 7 }, (_, i) => {
      const day = addDays(start, i);
      return day >= from && day <= to ? day : null;
    }));
  }
  return rows;
}

/** Days with a workout, workouts and seconds in a period. */
export function summarize(totals: ReadonlyMap<ISODate, DayTotal>, { from, to }: Period) {
  let days = 0;
  let workouts = 0;
  let seconds = 0;
  for (const [day, t] of totals) {
    if (day < from || day > to) continue;
    days++;
    workouts += t.workouts;
    seconds += t.seconds;
  }
  return { days, workouts, seconds };
}

/** The 12 months of the anchor's year for the Year view: each month's grid and its totals. */
export function yearMonths(anchor: ISODate, firstWeekday: number, totals: ReadonlyMap<ISODate, DayTotal>) {
  const year = anchor.slice(0, 4);
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${pad(i + 1)}-01`;
    return { month, weeks: monthWeeks(month, firstWeekday), ...summarize(totals, periodOf(month, 'month', firstWeekday)) };
  });
}

/** No paging into periods that haven't started yet. */
export const canGoForward = (anchor: ISODate, view: CalendarView, firstWeekday: number, today: ISODate) =>
  periodOf(shiftAnchor(anchor, view, 1), view, firstWeekday).from <= today;

/** No paging back past the period of the first workout (or today, before any workout). */
export const canGoBack = (anchor: ISODate, view: CalendarView, firstWeekday: number, firstDay: ISODate) =>
  periodOf(anchor, view, firstWeekday).from > firstDay;
