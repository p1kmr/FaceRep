import { useContext, useMemo } from 'react';

import { ProgressDispatchContext, ProgressStateContext, SaveWorkoutContext } from '@/state/progress/ProgressProvider';
import { selectProgressSummary } from '@/state/progress/selectors';

import { useToday } from './useToday';

export function useProgressState() {
  const state = useContext(ProgressStateContext);
  if (!state) throw new Error('useProgressState must be used inside <ProgressProvider>');
  return state;
}

/** Streak, this week, totals: derived from the saved sessions, recomputed only when they change. */
export function useProgressSummary() {
  const state = useProgressState();
  const today = useToday();
  return useMemo(() => selectProgressSummary(state, today), [state, today]);
}

export function useSaveWorkout() {
  const save = useContext(SaveWorkoutContext);
  if (!save) throw new Error('useSaveWorkout must be used inside <ProgressProvider>');
  return save;
}

export function useProgressDispatch() {
  const dispatch = useContext(ProgressDispatchContext);
  if (!dispatch) throw new Error('useProgressDispatch must be used inside <ProgressProvider>');
  return dispatch;
}
