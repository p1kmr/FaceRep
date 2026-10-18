import { createContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { clearScanPhoto, deleteScanRow, insertScan, listScans, type FaceScan } from '@/services/faceScan/scansRepo';
import type { RawScan } from '@/services/faceScan/score';
import { deleteAllScanPhotos, deleteScanPhoto } from '@/services/faceTracking';
import { load, save } from '@/services/storage/kv';
import { todayISO } from '@/utils/dates';

import { hydrateFaceScans, resetFaceScans, scanAdded, scanDeleted, scanPhotoRemoved, type FaceScanAction } from './actions';
import { faceScanReducer, initialFaceScanState } from './reducer';
import type { FaceScanState } from './types';

const VERSION = 1;

export interface FaceScanActions {
  /** Saves a finished scan (SQLite first, then state) and returns it. */
  save: (scan: { id: string; moves: RawScan; photo: string | null }) => Promise<FaceScan>;
  /** Deletes a scan and its photo. */
  remove: (scan: FaceScan) => Promise<void>;
  removePhoto: (scan: FaceScan) => Promise<void>;
  removeAllPhotos: () => Promise<void>;
  /** "Delete all data" (after the database is wiped): every photo file, and the state of a new install. */
  reset: () => Promise<void>;
}

export const FaceScanStateContext = createContext<FaceScanState | null>(null);
export const FaceScanDispatchContext = createContext<Dispatch<FaceScanAction> | null>(null);
export const FaceScanActionsContext = createContext<FaceScanActions | null>(null);

/** Face scans (docs/face-scan.md): read once from SQLite, then every change is written and dispatched. */
export function FaceScanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(faceScanReducer, initialFaceScanState);

  useEffect(() => {
    // Storage unavailable: start empty, never block the app.
    Promise.all([listScans().catch(() => []), load<{ used: number }>(STORAGE_KEYS.faceScans, VERSION)]).then(([scans, saved]) =>
      dispatch(hydrateFaceScans(scans, saved?.used ?? 0)),
    );
  }, []);

  useEffect(() => {
    if (state.hydrated) save(STORAGE_KEYS.faceScans, VERSION, { used: state.used }).catch(() => {});
  }, [state.hydrated, state.used]);

  const actions = useMemo<FaceScanActions>(
    () => ({
      save: async ({ id, moves, photo }) => {
        const now = new Date();
        const scan: FaceScan = { id, takenAt: now.toISOString(), day: todayISO(now), moves, photo };
        // Like a workout: shown for now even if the write fails (it just won't survive a restart).
        await insertScan(scan).catch(() => {});
        dispatch(scanAdded(scan));
        return scan;
      },
      remove: async (scan) => {
        if (scan.photo) await deleteScanPhoto(scan.photo).catch(() => {});
        await deleteScanRow(scan.id).catch(() => {});
        dispatch(scanDeleted(scan.id));
      },
      removePhoto: async (scan) => {
        if (scan.photo) await deleteScanPhoto(scan.photo).catch(() => {});
        await clearScanPhoto(scan.id).catch(() => {});
        dispatch(scanPhotoRemoved(scan.id));
      },
      removeAllPhotos: async () => {
        await deleteAllScanPhotos().catch(() => {});
        await clearScanPhoto(null).catch(() => {});
        dispatch(scanPhotoRemoved(null));
      },
      reset: async () => {
        await deleteAllScanPhotos().catch(() => {});
        dispatch(resetFaceScans());
      },
    }),
    [],
  );

  return (
    <FaceScanStateContext.Provider value={state}>
      <FaceScanDispatchContext.Provider value={dispatch}>
        <FaceScanActionsContext.Provider value={actions}>{children}</FaceScanActionsContext.Provider>
      </FaceScanDispatchContext.Provider>
    </FaceScanStateContext.Provider>
  );
}
