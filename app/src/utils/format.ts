import { fromISODate, type ISODate } from './dates';

/** "4:05" for 245 seconds. */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Whole minutes, at least 1 when there was any time at all. */
export function toMinutes(totalSec: number): number {
  return totalSec <= 0 ? 0 : Math.max(1, Math.round(totalSec / 60));
}

/** One-letter weekday for charts ("M"), in the app language. */
export function weekdayNarrow(iso: ISODate, locale: string): string {
  return fromISODate(iso).toLocaleDateString(locale, { weekday: 'narrow' });
}

/** Short weekday under a calendar cell ("Thu"), in the app language. */
export function weekdayShort(iso: ISODate, locale: string): string {
  return fromISODate(iso).toLocaleDateString(locale, { weekday: 'short' });
}

/** "October 2026", in the app language. */
export function formatMonthYear(iso: ISODate, locale: string): string {
  return fromISODate(iso).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

/** "Oct 6", in the app language. */
export function formatDayMonth(iso: ISODate, locale: string): string {
  return fromISODate(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

/** One-letter month for the year chart ("J"), in the app language. */
export function monthNarrow(iso: ISODate, locale: string): string {
  return fromISODate(iso).toLocaleDateString(locale, { month: 'narrow' });
}

/** "Mon 6 Oct" style date, in the app language. */
export function formatDay(iso: ISODate, locale: string): string {
  return fromISODate(iso).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
}
