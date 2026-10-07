import type { ExerciseId } from './exercises';

/**
 * The 28-day plan: 4 weeks of 7 days, each week harder (more exercises, reps and hold time).
 * Week 1 of Level 1 is free and ships in the app (planFreeWeek.json, exported from the Worker's
 * lib/plan.js). Weeks 2–4 and Levels 2+ come from the Worker, only for Premium (see docs/premium.md).
 */
export const PLAN = {
  days: 28,
  daysPerWeek: 7,
  freeDays: 7,
  /** Levels with their own content on the server; later rounds repeat the last one. */
  contentLevels: 3,
  /** Names of weeks 1–4 (i18n: home:plan.weeks.<name>). */
  weeks: ['learn', 'build', 'strengthen', 'peak'],
} as const;

/** light = short recovery session (days 7, 14, 21); final = day 28. */
export type PlanDayKind = 'workout' | 'light' | 'final';

/** One day of the plan, as data: the app turns it into reps and holds from its exercise catalog. */
export interface PlanDay {
  day: number;
  kind: PlanDayKind;
  ids: ExerciseId[];
  /** Percent of each exercise's usual reps. */
  repPct: number;
  /** Seconds added to each exercise's hold. */
  holdPlusSec: number;
}

/** Which plan day a finished workout counted for (saved with the session). */
export interface PlanRef {
  level: number;
  day: number;
}
