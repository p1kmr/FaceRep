import { EXERCISES, type ExerciseId } from '@/constants/exercises';
import { WEEKS } from '@/constants/weeks';
import type { SessionSummary } from '@/services/progress/stats';
import type { ISODate } from '@/utils/dates';

import type { WorkoutItem } from './items';

export type WeekStep = (typeof WEEKS.steps)[number];
export type WeekNote = WeekStep['note'];

/** Where the user is: week 1, 2, 3, … (no end) and day 1–7 of it. Day 7 is the easy day. */
export interface WeekDay {
  week: number;
  day: number;
  easy: boolean;
}

/**
 * A date's workout: a finished routine, or a workout saved through the Coach (done without the app). A single exercise
 * from the library isn't.
 */
export const isDayWorkout = (s: SessionSummary) => s.kind === 'routine' || !!s.logged;

/**
 * Days with a workout before today, from the saved sessions (no counter to get out of sync). One per date, however
 * many workouts it has, so a week can't be done in one afternoon; a missed date just waits.
 */
export function daysDone(sessions: readonly SessionSummary[], today: ISODate): number {
  return new Set(sessions.filter((s) => isDayWorkout(s) && s.day < today).map((s) => s.day)).size;
}

/** The day after `done` finished days. */
export function weekDay(done: number): WeekDay {
  const n = Math.max(0, Math.floor(done));
  const day = (n % WEEKS.daysPerWeek) + 1;
  return { week: Math.floor(n / WEEKS.daysPerWeek) + 1, day, easy: day === WEEKS.daysPerWeek };
}

/** Workout days (easy days left out) among the first `done` days: moves the daily mix along. */
export const workoutsBefore = (done: number) => {
  const n = Math.max(0, Math.floor(done));
  return n - Math.floor(n / WEEKS.daysPerWeek);
};

/** The step a week trains at; after the last step's start it stays there. */
export function stepOf(week: number): WeekStep {
  let step: WeekStep = WEEKS.steps[0];
  for (const s of WEEKS.steps) if (week >= s.from) step = s;
  return step;
}

export const isMilestone = (week: number) => (WEEKS.milestones as readonly number[]).includes(week);

/**
 * An exercise at a step: a share of its usual reps (at least WEEKS.minReps) and a longer hold. A jaw-caution exercise
 * never gets more than its usual reps or hold.
 */
export function dosedItem(id: ExerciseId, repPct: number, holdPlusSec: number): WorkoutItem {
  const e = EXERCISES[id];
  const pct = e.jawCaution ? Math.min(repPct, 100) : repPct;
  return {
    id,
    reps: Math.max(Math.min(WEEKS.minReps, e.reps), Math.round((e.reps * pct) / 100)),
    holdSec: e.holdSec + (e.jawCaution ? 0 : holdPlusSec),
    relaxSec: e.relaxSec,
  };
}
