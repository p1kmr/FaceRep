/** A calendar day as 'YYYY-MM-DD'. Stored everywhere instead of Date objects (no timezone bugs). */
export type ISODate = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses 'YYYY-MM-DD' as a local calendar day (not UTC midnight). */
export function fromISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isISODate(value: unknown): value is ISODate {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toISODate(fromISODate(value)) === value;
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now);
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Whole days from `from` to `to` (positive when `to` is later). DST-safe: counts calendar days. */
export function diffInDays(to: ISODate, from: ISODate): number {
  const a = fromISODate(to);
  const b = fromISODate(from);
  return Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86_400_000);
}

/** 'YYYY-MM' for a date. */
export const monthOf = (date: ISODate) => date.slice(0, 7);

/** 0 = Sunday … 6 = Saturday. */
export const weekdayOf = (iso: ISODate) => fromISODate(iso).getDay();
