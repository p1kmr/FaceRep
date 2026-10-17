import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeSyntheticEvent } from 'react-native';

import type { Move } from '@/constants/moves';
import type { NativeFaceEvent } from '@/services/faceTracking';
import {
  createMoveCheck,
  faceSample,
  moveCheckReducer,
  moveCheckView,
  type MoveCheckState,
  type MoveCheckView,
  type MovePhase,
} from '@/services/workout/moveCheck';

interface MoveCheckInput {
  /** The exercise's move; null when the move check doesn't follow it (or is off). */
  move: Move | null;
  /** Which exercise of the workout: a new one starts fresh (relaxed face, count). */
  exercise: number;
  phase: MovePhase;
  rep: number;
  holdSec: number;
}

const sameView = (a: MoveCheckView, b: MoveCheckView) =>
  a.status === b.status && a.inPose === b.inPose && a.seen === b.seen && a.hint === b.hint && Math.abs(a.level - b.level) < 0.04;

/**
 * Feeds the camera's face samples and the workout's phases to the move check (services/workout/moveCheck.ts) and
 * gives the mirror what to show. The state lives in a ref: samples arrive 15 times a second, and the mirror only
 * re-renders when something it shows changes.
 */
export function useMoveCheck({ move, exercise, phase, rep, holdSec }: MoveCheckInput) {
  const state = useRef<MoveCheckState | null>(null);
  const [view, setView] = useState<MoveCheckView | null>(null);

  useEffect(() => {
    state.current = move ? createMoveCheck(move) : null;
    setView(state.current ? moveCheckView(state.current) : null);
  }, [move, exercise]);

  useEffect(() => {
    if (!state.current) return;
    state.current = moveCheckReducer(state.current, { type: 'phase', phase, rep, holdSec });
    const next = moveCheckView(state.current);
    setView((prev) => (prev && sameView(prev, next) ? prev : next));
  }, [move, exercise, phase, rep, holdSec]);

  const onFace = useCallback((event: NativeSyntheticEvent<NativeFaceEvent>) => {
    if (!state.current) return;
    state.current = moveCheckReducer(state.current, { type: 'sample', sample: faceSample(event.nativeEvent) });
    const next = moveCheckView(state.current);
    setView((prev) => (prev && sameView(prev, next) ? prev : next));
  }, []);

  return { view, onFace };
}
