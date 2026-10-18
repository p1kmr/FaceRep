import { useContext, useMemo } from 'react';

import { faceScanMode } from '@/services/faceTracking';
import { FaceScanActionsContext, FaceScanStateContext } from '@/state/faceScan/FaceScanProvider';
import { selectFreeScansLeft, selectPhotoScans, selectScanDue, selectScoredScans } from '@/state/faceScan/selectors';

import { usePremium } from './usePremium';
import { useToday } from './useToday';

export function useFaceScanState() {
  const state = useContext(FaceScanStateContext);
  if (!state) throw new Error('useFaceScanState must be used inside <FaceScanProvider>');
  return state;
}

export function useFaceScanActions() {
  const actions = useContext(FaceScanActionsContext);
  if (!actions) throw new Error('useFaceScanActions must be used inside <FaceScanProvider>');
  return actions;
}

/**
 * The face scans with their numbers, and whether a new one can start: `available` (this iPhone can scan: face
 * tracking, or the Simulator's pretend face), `freeLeft` (Infinity with Premium), `canScan`, `due` (none in a week).
 */
export function useFaceScans() {
  const state = useFaceScanState();
  const { isPremium } = usePremium();
  const today = useToday();
  const scans = useMemo(() => selectScoredScans(state), [state]);
  const photos = useMemo(() => selectPhotoScans(state), [state]);
  const freeLeft = selectFreeScansLeft(state, isPremium);
  return {
    hydrated: state.hydrated,
    scans,
    photos,
    latest: scans[0] ?? null,
    previous: scans[1] ?? null,
    used: state.used,
    freeLeft,
    isPremium,
    available: faceScanMode !== null,
    canScan: faceScanMode !== null && freeLeft > 0,
    due: selectScanDue(state, today),
  };
}
