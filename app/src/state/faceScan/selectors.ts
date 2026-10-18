import { SCAN } from '@/constants/faceScan';
import { FREE_LIMITS } from '@/constants/limits';
import { scoreScan, type ScanScore } from '@/services/faceScan/score';
import type { FaceScan } from '@/services/faceScan/scansRepo';
import { diffInDays, type ISODate } from '@/utils/dates';

import type { FaceScanState } from './types';

export type ScoredScan = FaceScan & { score: ScanScore };

/** Every saved scan with its numbers, newest first (memoize in the hook). */
export const selectScoredScans = (s: FaceScanState): ScoredScan[] => s.scans.map((scan) => ({ ...scan, score: scoreScan(scan.moves) }));

/** Free scans left; Infinity with Premium. */
export function selectFreeScansLeft(s: FaceScanState, isPremium: boolean): number {
  return isPremium ? Infinity : Math.max(0, FREE_LIMITS.scans - s.used);
}

/** Time for a scan: none yet, or the last one was SCAN.dueDays or more ago. */
export function selectScanDue(s: FaceScanState, today: ISODate): boolean {
  return !s.scans.length || diffInDays(today, s.scans[0].day) >= SCAN.dueDays;
}

/** Scans with a progress photo, newest first. */
export const selectPhotoScans = (s: FaceScanState): FaceScan[] => s.scans.filter((scan) => scan.photo);
