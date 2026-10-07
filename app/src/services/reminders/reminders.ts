import { ALL_DAYS, REMINDER, REMINDER_KINDS, type ReminderKind } from '@/constants/reminders';

/**
 * The user's reminders, as plain data (pure, unit-tested). They repeat every week on their days, so
 * they keep working even if the app isn't opened for months (iOS repeats them by itself).
 */
export interface Reminder {
  id: string;
  kind: ReminderKind;
  /** The user's own name for it; empty = the kind's default name (translated when shown). */
  title: string;
  enabled: boolean;
  /** 'HH:mm', 1–6 a day, sorted. */
  times: string[];
  /** Weekdays, 0 = Sunday … 6 = Saturday, sorted. All seven = every day. */
  days: number[];
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const ID = /^[a-z0-9-]{1,40}$/;

export const isTime = (v: unknown): v is string => typeof v === 'string' && TIME.test(v);

/** Valid, unique, sorted times (at most REMINDER.maxTimes), or null when there are none. */
export function cleanTimes(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const times = [...new Set(value.filter(isTime))].sort().slice(0, REMINDER.maxTimes);
  return times.length ? times : null;
}

/** Valid, unique, sorted weekdays, or null when there are none. */
export function cleanDays(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const days = [...new Set(value.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6))].sort();
  return days.length ? days : null;
}

/** A well-formed reminder, or null (saved data can be old or edited; Coach proposals are checked too). */
export function cleanReminder(value: unknown): Reminder | null {
  const r = value as Partial<Record<keyof Reminder, unknown>> | null;
  if (!r || typeof r.id !== 'string' || !ID.test(r.id)) return null;
  const times = cleanTimes(r.times);
  const days = cleanDays(r.days);
  if (!times || !days) return null;
  return {
    id: r.id,
    kind: REMINDER_KINDS.includes(r.kind as ReminderKind) ? (r.kind as ReminderKind) : 'custom',
    title: typeof r.title === 'string' ? r.title.trim().slice(0, REMINDER.titleMax) : '',
    enabled: r.enabled !== false,
    times,
    days,
  };
}

export const workoutReminder = (enabled = false, time: string = REMINDER.defaultTime): Reminder => ({
  id: REMINDER.workoutId,
  kind: 'workout',
  title: '',
  enabled,
  times: [time],
  days: [...ALL_DAYS],
});

/** Notifications a reminder keeps scheduled: one per time, per day (one per time when it's every day). */
export const scheduledCount = (r: Reminder) => (r.enabled ? r.times.length * (r.days.length === 7 ? 1 : r.days.length) : 0);

export const totalScheduled = (list: readonly Reminder[]) => list.reduce((n, r) => n + scheduledCount(r), 0);

/** Why a reminder can't be saved into the list (null = fine). Replacing one with the same id is an edit. */
export function saveProblem(list: readonly Reminder[], r: Reminder): 'tooMany' | 'tooManyTimes' | null {
  const others = list.filter((x) => x.id !== r.id);
  if (others.length >= REMINDER.max) return 'tooMany';
  if (totalScheduled(others) + scheduledCount(r) > REMINDER.maxScheduled) return 'tooManyTimes';
  return null;
}

/** One repeating notification: daily (no weekday) or weekly on `weekday` (1 = Sunday … 7 = Saturday, as iOS counts). */
export interface PlannedNotification {
  id: string;
  reminderId: string;
  hour: number;
  minute: number;
  weekday?: number;
}

/** Every repeating notification for the enabled reminders, at most REMINDER.maxScheduled. */
export function planNotifications(list: readonly Reminder[]): PlannedNotification[] {
  const out: PlannedNotification[] = [];
  for (const r of list) {
    if (!r.enabled) continue;
    for (const time of r.times) {
      const [hour, minute] = time.split(':').map(Number);
      if (r.days.length === 7) out.push({ id: `reminder-${r.id}-${time}`, reminderId: r.id, hour, minute });
      else for (const d of r.days) out.push({ id: `reminder-${r.id}-${time}-${d}`, reminderId: r.id, hour, minute, weekday: d + 1 });
    }
  }
  return out.slice(0, REMINDER.maxScheduled);
}

/** How the days read: every day, weekdays, weekends, or a list. */
export function daysPattern(days: readonly number[]): 'everyDay' | 'weekdays' | 'weekends' | 'some' {
  const key = days.join(',');
  if (key === '0,1,2,3,4,5,6') return 'everyDay';
  if (key === '1,2,3,4,5') return 'weekdays';
  if (key === '0,6') return 'weekends';
  return 'some';
}
