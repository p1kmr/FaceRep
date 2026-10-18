import type { FaceScan } from '@/services/faceScan/scansRepo';

export interface FaceScanState {
  hydrated: boolean;
  /** Saved scans, newest first. */
  scans: FaceScan[];
  /** Scans finished on this iPhone (for the free ones): deleting a scan doesn't give one back. */
  used: number;
}
