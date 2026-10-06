import type { ExerciseId } from '@/constants/exercises';
import { addDays, diffInDays, type ISODate } from '@/utils/dates';

export interface SessionSummary {
  id: string;
  day: ISODate;
  /** ISO timestamp when it finished. */
  finishedAt: string;
  durationSec: number;
  totalReps: number;
  exerciseIds: ExerciseId[];
  kind: 'routine' | 'single';
}

export const workoutDays = (sessions: readonly SessionSummary[]) => new Set(sessions.map((s) => s.day));

/**
 * Days in a row with a workout. A streak stays alive until the end of today: if today has no
 * workout yet, it counts back from yesterday.
 */
export function currentStreak(days: ReadonlySet<ISODate>, today: ISODate): number {
  let day = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (days.has(day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

export function bestStreak(days: ReadonlySet<ISODate>): number {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  sorted.forEach((day, i) => {
    run = i > 0 && diffInDays(day, sorted[i - 1]) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

export interface DayBar {
  day: ISODate;
  seconds: number;
}

/** The last `n` days ending today, oldest first, with workout seconds per day. */
export function lastDays(sessions: readonly SessionSummary[], today: ISODate, n = 7): DayBar[] {
  const byDay = new Map<ISODate, number>();
  for (const s of sessions) byDay.set(s.day, (byDay.get(s.day) ?? 0) + s.durationSec);
  return Array.from({ length: n }, (_, i) => {
    const day = addDays(today, i - (n - 1));
    return { day, seconds: byDay.get(day) ?? 0 };
  });
}

export function totals(sessions: readonly SessionSummary[]) {
  return sessions.reduce(
    (t, s) => ({ workouts: t.workouts + 1, seconds: t.seconds + s.durationSec, reps: t.reps + s.totalReps }),
    { workouts: 0, seconds: 0, reps: 0 },
  );
}
