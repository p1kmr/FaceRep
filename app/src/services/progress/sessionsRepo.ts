import { isExerciseId, type ExerciseId } from '@/constants/exercises';
import { getDatabase } from '@/services/db/database';

import type { SessionSummary } from './stats';

interface SessionRow {
  id: string;
  day: string;
  finished_at: string;
  duration_sec: number;
  total_reps: number;
  kind: string;
  exercise_ids: string | null;
}

const LIST = `SELECT s.id, s.day, s.finished_at, s.duration_sec, s.total_reps, s.kind,
    (SELECT group_concat(exercise_id, ',') FROM (SELECT exercise_id FROM session_exercises WHERE session_id = s.id ORDER BY position)) AS exercise_ids
  FROM sessions s ORDER BY s.finished_at DESC LIMIT ?`;

function toSummary(row: SessionRow): SessionSummary {
  return {
    id: row.id,
    day: row.day,
    finishedAt: row.finished_at,
    durationSec: row.duration_sec,
    totalReps: row.total_reps,
    exerciseIds: (row.exercise_ids ?? '').split(',').filter(isExerciseId),
    kind: row.kind === 'single' ? 'single' : 'routine',
  };
}

/** Most recent first. A year of daily workouts is ~365 small rows: fine to keep in memory. */
export async function listSessions(limit = 1000): Promise<SessionSummary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SessionRow>(LIST, limit);
  return rows.map(toSummary);
}

export async function insertSession(s: SessionSummary, reps: { id: ExerciseId; reps: number }[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO sessions (id, day, finished_at, duration_sec, total_reps, kind) VALUES (?, ?, ?, ?, ?, ?)',
      s.id,
      s.day,
      s.finishedAt,
      s.durationSec,
      s.totalReps,
      s.kind,
    );
    for (const [position, e] of reps.entries()) {
      await db.runAsync(
        'INSERT INTO session_exercises (session_id, position, exercise_id, reps) VALUES (?, ?, ?, ?)',
        s.id,
        position,
        e.id,
        e.reps,
      );
    }
  });
}
