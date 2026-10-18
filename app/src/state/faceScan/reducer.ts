import { FACE_SCANS_HYDRATE, FACE_SCANS_RESET, SCAN_ADDED, SCAN_DELETED, SCAN_PHOTO_REMOVED, type FaceScanAction } from './actions';
import type { FaceScanState } from './types';

export const initialFaceScanState: FaceScanState = { hydrated: false, scans: [], used: 0 };

const newestFirst = (a: { takenAt: string }, b: { takenAt: string }) => (a.takenAt < b.takenAt ? 1 : -1);
const count = (v: unknown) => (Number.isInteger(v) && (v as number) > 0 ? (v as number) : 0);

export function faceScanReducer(state: FaceScanState, action: FaceScanAction): FaceScanState {
  switch (action.type) {
    case FACE_SCANS_HYDRATE: {
      const scans = [...action.payload.scans].sort(newestFirst);
      // Never fewer used than saved (an older save, or the count failed to save).
      return { hydrated: true, scans, used: Math.max(count(action.payload.used), scans.length) };
    }
    case SCAN_ADDED:
      if (state.scans.some((s) => s.id === action.payload.id)) return state;
      return { ...state, scans: [action.payload, ...state.scans].sort(newestFirst), used: state.used + 1 };
    case SCAN_DELETED:
      return { ...state, scans: state.scans.filter((s) => s.id !== action.payload) };
    case SCAN_PHOTO_REMOVED:
      return {
        ...state,
        scans: state.scans.map((s) => (s.photo && (action.payload === null || s.id === action.payload) ? { ...s, photo: null } : s)),
      };
    case FACE_SCANS_RESET:
      return { hydrated: state.hydrated, scans: [], used: 0 };
    default:
      return state;
  }
}
