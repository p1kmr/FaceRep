import { EXERCISES, GOALS, isExerciseId, type Goal } from '@/constants/exercises';
import { PLAN, type PlanDay, type PlanDayKind, type PlanRef } from '@/constants/plan';
import freeWeekJson from '@/constants/planFreeWeek.json';
import type { SessionSummary } from '@/services/progress/stats';
import type { WorkoutItem } from '@/services/workout/items';
import type { ISODate } from '@/utils/dates';

/** Pure plan logic: which day you're on, what it contains, what's free. Unit-tested. */

const KINDS: readonly PlanDayKind[] = ['workout', 'light', 'final'];
const isInt = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;

/**
 * Checks plan days from the server (or the bundled free week): exactly days `from`..`to` in order,
 * sane numbers. Exercise IDs this app version doesn't know are dropped. Null when anything is off.
 */
export function parsePlanDays(value: unknown, from: number, to: number): PlanDay[] | null {
  if (!Array.isArray(value) || value.length !== to - from + 1) return null;
  const days: PlanDay[] = [];
  for (const [i, raw] of value.entries()) {
    const d = raw as Partial<Record<keyof PlanDay, unknown>> | null;
    if (!d || d.day !== from + i || !KINDS.includes(d.kind as PlanDayKind)) return null;
    if (!isInt(d.repPct, 30, 200) || !isInt(d.holdPlusSec, 0, 10) || !Array.isArray(d.ids)) return null;
    const ids = d.ids.filter(isExerciseId);
    if (!ids.length) return null;
    days.push({ day: d.day, kind: d.kind as PlanDayKind, ids, repPct: d.repPct, holdPlusSec: d.holdPlusSec });
  }
  return days;
}

const FREE_WEEK = Object.fromEntries(
  GOALS.map((g) => [g, parsePlanDays((freeWeekJson as Record<string, unknown>)[g], 1, PLAN.freeDays) ?? []]),
) as Record<Goal, PlanDay[]>;

/** Level 1, days 1–7 for a goal (bundled, works offline). */
export const freeWeek = (goal: Goal): PlanDay[] => FREE_WEEK[goal];

export const isFreeDay = ({ level, day }: PlanRef) => level === 1 && day <= PLAN.freeDays;

/** Week 1–4 of a day. */
export const weekOf = (day: number) => Math.ceil(day / PLAN.daysPerWeek);

/** Rounds after the last level repeat it (Level 4 trains like Level 3). */
export const contentLevel = (level: number) => Math.min(level, PLAN.contentLevels);

/** A plan day as workout items: repPct of each exercise's reps (at least 3), holdPlusSec on top of its hold. */
export function planItems(day: PlanDay): WorkoutItem[] {
  return day.ids.map((id) => {
    const e = EXERCISES[id];
    return {
      id,
      reps: Math.max(3, Math.round((e.reps * day.repPct) / 100)),
      holdSec: e.holdSec + day.holdPlusSec,
      relaxSec: e.relaxSec,
    };
  });
}

export interface PlanProgress {
  level: number;
  /** The day to show: today's next day, or the one already done today. */
  day: number;
  /** Days finished in this level. */
  completed: number;
  /** A plan day was finished today, so the next one opens tomorrow. */
  doneToday: boolean;
  /** All 28 days of this level are done. */
  finished: boolean;
}

/**
 * Where the user is, derived from saved workouts (no separate counter to get out of sync).
 * A day moves on only when its workout is finished, never by the calendar, so a missed day just
 * waits. At most one plan day counts per calendar day.
 */
export function planProgress(sessions: readonly SessionSummary[], today: ISODate): PlanProgress {
  const planned = sessions.filter((s): s is SessionSummary & { plan: PlanRef } => !!s.plan);
  const level = planned.reduce((max, s) => Math.max(max, s.plan.level), 1);
  const inLevel = planned.filter((s) => s.plan.level === level);
  const completed = inLevel.reduce((max, s) => Math.max(max, s.plan.day), 0);
  const doneToday = inLevel.some((s) => s.day === today);
  const finished = completed >= PLAN.days;
  return { level, day: doneToday || finished ? Math.max(completed, 1) : completed + 1, completed, doneToday, finished };
}

/** Which plan day the next workout counts for, or null when today's day is already done. */
export function nextPlanRef(p: PlanProgress): PlanRef | null {
  if (p.doneToday) return null;
  return p.finished ? { level: p.level + 1, day: 1 } : { level: p.level, day: p.day };
}

export type PlanCellStatus = 'done' | 'today' | 'upcoming' | 'locked';

/** The 28 days of the current level for the 4×7 grid. */
export function planGrid(p: PlanProgress, isPremium: boolean): { day: number; status: PlanCellStatus }[] {
  return Array.from({ length: PLAN.days }, (_, i) => {
    const day = i + 1;
    let status: PlanCellStatus = 'upcoming';
    if (day <= p.completed) status = 'done';
    else if (day === p.day && !p.doneToday) status = 'today';
    if (status !== 'done' && !isPremium && !isFreeDay({ level: p.level, day })) status = 'locked';
    return { day, status };
  });
}
