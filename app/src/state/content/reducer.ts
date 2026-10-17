import {
  CONTENT_DOWNLOADING,
  CONTENT_FAILED,
  CONTENT_FILE,
  CONTENT_LOADED,
  CONTENT_READY,
  CONTENT_RETRY,
  type ContentAction,
} from './actions';
import type { ContentState } from './types';

export const initialContentState: ContentState = { pack: null, sources: {}, status: 'idle', progress: 0, error: null, attempt: 0 };

const clampShare = (n: number) => Math.min(Math.max(Number.isFinite(n) ? n : 0, 0), 1);

export function contentReducer(state: ContentState, action: ContentAction): ContentState {
  switch (action.type) {
    case CONTENT_LOADED: {
      // Only the new pack's files count: a file it no longer lists (an updated clip) is gone.
      const paths = new Set(action.payload.pack.files.map((f) => f.path));
      const kept = Object.fromEntries(Object.entries(state.sources).filter(([path]) => paths.has(path)));
      return { ...state, pack: action.payload.pack, sources: { ...kept, ...action.payload.sources } };
    }
    case CONTENT_DOWNLOADING:
      return { ...state, status: 'downloading', progress: clampShare(action.payload.progress), error: null };
    case CONTENT_FILE:
      return { ...state, sources: { ...state.sources, [action.payload.path]: action.payload.source }, progress: clampShare(action.payload.progress) };
    case CONTENT_READY:
      return { ...state, status: 'ready', progress: 1, error: null };
    case CONTENT_FAILED:
      return { ...state, status: 'failed', error: action.payload.error };
    case CONTENT_RETRY:
      return { ...state, status: 'idle', error: null, attempt: state.attempt + 1 };
    default:
      return state;
  }
}
