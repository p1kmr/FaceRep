import { useEffect, useReducer, useRef } from 'react';

import type { ExerciseId } from '@/constants/exercises';
import { haptics } from '@/services/haptics';
import { createWorkout, workoutReducer, type Phase } from '@/services/workout/timer';

import { useAppActive } from './useAppActive';

/**
 * Runs the workout state machine: one tick per second while the screen is open and the app is in
 * the foreground (leaving the app pauses it). Haptics mark every squeeze and release.
 */
export function useWorkout(ids: ExerciseId[]) {
  const [state, dispatch] = useReducer(workoutReducer, ids, createWorkout);
  const active = useAppActive();
  const lastPhase = useRef<Phase>(state.phase);

  useEffect(() => {
    if (!active && state.phase !== 'done') dispatch({ type: 'pause' });
  }, [active, state.phase]);

  useEffect(() => {
    if (state.paused || state.phase === 'done') return;
    const timer = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(timer);
  }, [state.paused, state.phase]);

  useEffect(() => {
    if (lastPhase.current === state.phase) return;
    lastPhase.current = state.phase;
    if (state.phase === 'hold') haptics.squeeze();
    else if (state.phase === 'relax' || state.phase === 'rest') haptics.release();
    else if (state.phase === 'done') haptics.success();
  }, [state.phase]);

  return {
    state,
    pause: () => dispatch({ type: 'pause' }),
    resume: () => dispatch({ type: 'resume' }),
    skip: () => dispatch({ type: 'skip' }),
  };
}
