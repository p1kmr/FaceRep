import { isExerciseId, type ExerciseId } from '@/constants/exercises';

import type { SessionSummary } from './stats';

/** A saved workout as sessionsRepo reads it: `exercises` is "id:reps,id:reps" in the order done. */
export interface SessionRow {
  id: string;
  day: string;
  finished_at: string;
  duration_sec: number;
  total_reps: number;
  kind: string;
  exercises: string | null;
}

/** A row as the app uses it. An exercise no longer in the catalog is left out, with its reps. */
export function toSummary(row: SessionRow): SessionSummary {
  const done = (row.exercises ?? '')
    .split(',')
    .map((pair) => pair.split(':'))
    .filter((pair): pair is [ExerciseId, string] => isExerciseId(pair[0]));
  return {
    id: row.id,
    day: row.day,
    finishedAt: row.finished_at,
    durationSec: row.duration_sec,
    totalReps: row.total_reps,
    exerciseIds: done.map(([id]) => id),
    exerciseReps: done.map(([, reps]) => Number(reps) || 0),
    kind: row.kind === 'single' ? 'single' : 'routine',
    // A workout an earlier build's Coach saved is stored with kind 'logged', Today's workout ended short with 'short'
    // (no migration: kind is free text).
    ...(row.kind === 'logged' ? { logged: true } : {}),
    ...(row.kind === 'short' ? { short: true } : {}),
  };
}
