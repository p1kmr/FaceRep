import type { SessionSummary } from '@/services/progress/stats';

export const PROGRESS_HYDRATE = 'progress/hydrate';
export const SESSION_ADDED = 'progress/sessionAdded';
export const PROGRESS_RESET = 'progress/reset';

export type ProgressAction =
  | { type: typeof PROGRESS_HYDRATE; payload: SessionSummary[] }
  | { type: typeof SESSION_ADDED; payload: SessionSummary }
  | { type: typeof PROGRESS_RESET };

export const hydrateProgress = (sessions: SessionSummary[]): ProgressAction => ({ type: PROGRESS_HYDRATE, payload: sessions });
export const sessionAdded = (session: SessionSummary): ProgressAction => ({ type: SESSION_ADDED, payload: session });
export const resetProgress = (): ProgressAction => ({ type: PROGRESS_RESET });
