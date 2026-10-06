import { PROGRESS_HYDRATE, PROGRESS_RESET, SESSION_ADDED, type ProgressAction } from './actions';
import type { ProgressState } from './types';

export const initialProgressState: ProgressState = { hydrated: false, sessions: [] };

const newestFirst = (a: { finishedAt: string }, b: { finishedAt: string }) => (a.finishedAt < b.finishedAt ? 1 : -1);

export function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case PROGRESS_HYDRATE:
      return { hydrated: true, sessions: [...action.payload].sort(newestFirst) };
    case SESSION_ADDED:
      if (state.sessions.some((s) => s.id === action.payload.id)) return state;
      return { ...state, sessions: [action.payload, ...state.sessions].sort(newestFirst) };
    case PROGRESS_RESET:
      return { hydrated: state.hydrated, sessions: [] };
    default:
      return state;
  }
}
