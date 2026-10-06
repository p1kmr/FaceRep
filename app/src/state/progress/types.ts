import type { SessionSummary } from '@/services/progress/stats';

export interface ProgressState {
  hydrated: boolean;
  /** Finished workouts, most recent first. */
  sessions: SessionSummary[];
}
