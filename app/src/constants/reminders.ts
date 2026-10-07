/** The user's reminders (Settings → Reminders, or proposed by the Coach). */
export const REMINDER = {
  defaultTime: '19:00',
  /** The workout reminder every install starts with (off until the user allows notifications). */
  workoutId: 'workout',
  /** At most this many reminders… */
  max: 10,
  /** …each with at most this many times a day (e.g. a mewing check every 2 hours). */
  maxTimes: 6,
  /** iOS keeps at most 64 scheduled notifications per app; leave a little room. */
  maxScheduled: 60,
  titleMax: 40,
  /** "Every 2 hours" helper in the editor. */
  everyTwoHours: ['10:00', '12:00', '14:00', '16:00', '18:00'],
} as const;

/** What a reminder is for: picks its icon and default text. */
export const REMINDER_KINDS = ['workout', 'mewing', 'posture', 'custom'] as const;
export type ReminderKind = (typeof REMINDER_KINDS)[number];

/** Weekdays, 0 = Sunday … 6 = Saturday. */
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
