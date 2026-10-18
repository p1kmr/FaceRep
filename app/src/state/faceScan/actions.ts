import type { FaceScan } from '@/services/faceScan/scansRepo';

export const FACE_SCANS_HYDRATE = 'faceScan/hydrate';
export const SCAN_ADDED = 'faceScan/added';
export const SCAN_DELETED = 'faceScan/deleted';
export const SCAN_PHOTO_REMOVED = 'faceScan/photoRemoved';
export const FACE_SCANS_RESET = 'faceScan/reset';

export type FaceScanAction =
  | { type: typeof FACE_SCANS_HYDRATE; payload: { scans: FaceScan[]; used: number } }
  | { type: typeof SCAN_ADDED; payload: FaceScan }
  | { type: typeof SCAN_DELETED; payload: string }
  | { type: typeof SCAN_PHOTO_REMOVED; payload: string | null }
  | { type: typeof FACE_SCANS_RESET };

export const hydrateFaceScans = (scans: FaceScan[], used: number): FaceScanAction => ({ type: FACE_SCANS_HYDRATE, payload: { scans, used } });
/** A finished scan: saved and counted as used. */
export const scanAdded = (scan: FaceScan): FaceScanAction => ({ type: SCAN_ADDED, payload: scan });
export const scanDeleted = (id: string): FaceScanAction => ({ type: SCAN_DELETED, payload: id });
/** A scan's photo was deleted (null: every scan's photo). */
export const scanPhotoRemoved = (id: string | null): FaceScanAction => ({ type: SCAN_PHOTO_REMOVED, payload: id });
/** "Delete all data": no scans, and the free scans start again like a new install. */
export const resetFaceScans = (): FaceScanAction => ({ type: FACE_SCANS_RESET });
