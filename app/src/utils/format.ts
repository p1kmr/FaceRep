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

/** "Oct", in the app language. */
export function monthShort(iso: ISODate, locale: string): string {
  return fromISODate(iso).toLocaleDateString(locale, { month: 'short' });
}

/** "Mon 6 Oct" style date, in the app language. */
export function formatDay(iso: ISODate, locale: string): string {
  return fromISODate(iso).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** "7:00 PM" or "19:00" (follows the language and the iPhone's 12/24-hour setting) for 'HH:mm'. */
export function formatTime(time: string, locale: string): string {
  const [h, m] = time.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

/** "Mon" for weekday 1 (0 = Sunday … 6 = Saturday), in the app language. */
export function weekdayShortOf(day: number, locale: string): string {
  // 2026-01-04 was a Sunday.
  return new Date(2026, 0, 4 + day).toLocaleDateString(locale, { weekday: 'short' });
}

