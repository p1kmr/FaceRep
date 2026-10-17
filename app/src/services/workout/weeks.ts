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
 * A date's workout: Today's workout with at least half of it done (countsAsDay), or a workout saved through the Coach
 * (done without the app). A single exercise from the library isn't, nor Today's workout ended sooner.
 */
export const isDayWorkout = (s: SessionSummary) => (s.kind === 'routine' && !s.short) || !!s.logged;

/** Whether Today's workout, as far as it got, is the day's workout: WEEKS.minShare of its exercises done. */
export const countsAsDay = ({ finished, planned }: { finished: number; planned: number }) =>
  planned > 0 && finished >= planned * WEEKS.minShare;

/** The dates with a workout before today, oldest first: the first is day 1, the eighth week 2's day 1. */
export function workoutDates(sessions: readonly SessionSummary[], today: ISODate): ISODate[] {
  return [...new Set(sessions.filter((s) => isDayWorkout(s) && s.day < today).map((s) => s.day))].sort();
}

/**
 * Days with a workout before today, from the saved sessions (no counter to get out of sync). One per date, however
 * many workouts it has, so a week can't be done in one afternoon; a missed date just waits.
 */
export function daysDone(sessions: readonly SessionSummary[], today: ISODate): number {
  return workoutDates(sessions, today).length;
}

/** The day after `done` finished days. */
export function weekDay(done: number): WeekDay {
  const n = Math.max(0, Math.floor(done));
  const day = (n % WEEKS.daysPerWeek) + 1;
  return { week: Math.floor(n / WEEKS.daysPerWeek) + 1, day, easy: day === WEEKS.daysPerWeek };
}

/** Without Premium only days 1 to WEEKS.freeDays are open: true when the day after `done` finished days is one. */
export const isFreeDay = (done: number) => Math.max(0, Math.floor(done)) < WEEKS.freeDays;

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

/** A day of this week that is done, as it was: the exercises done that date (each once, in the order done) and its minutes. */
export interface DoneDay {
  date: ISODate;
  ids: ExerciseId[];
  seconds: number;
}

/**
 * This week's days done so far, day 1 first, from the saved workouts (not the plan: a day may have been a workout saved
 * through the Coach, or another focus area then). Today is the last one once it has a workout.
 */
export function weekDone(sessions: readonly SessionSummary[], today: ISODate): DoneDay[] {
  const dates = workoutDates(sessions, today);
  const thisWeek = dates.slice((weekDay(dates.length).week - 1) * WEEKS.daysPerWeek);
  if (sessions.some((s) => s.day === today && isDayWorkout(s))) thisWeek.push(today);
  return thisWeek.map((date) => {
    const done = sessions.filter((s) => s.day === date && isDayWorkout(s)).sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
    return {
      date,
      ids: [...new Set(done.flatMap((s) => s.exerciseIds))],
      seconds: done.reduce((sum, s) => sum + s.durationSec, 0),
    };
  });
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
