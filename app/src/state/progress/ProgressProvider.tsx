import { createContext, useCallback, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';

import { insertSession, listSessions } from '@/services/progress/sessionsRepo';
import type { SessionSummary } from '@/services/progress/stats';
import type { WorkoutResult } from '@/services/workout/timer';
import { todayISO } from '@/utils/dates';
import { createId } from '@/utils/ids';

import { hydrateProgress, sessionAdded, type ProgressAction } from './actions';
import { initialProgressState, progressReducer } from './reducer';
import type { ProgressState } from './types';

export const ProgressStateContext = createContext<ProgressState | null>(null);
export const ProgressDispatchContext = createContext<Dispatch<ProgressAction> | null>(null);
/** Saves a finished workout (SQLite first, then state) and returns it, or null when nothing was done. */
export const SaveWorkoutContext = createContext<((result: WorkoutResult, kind: SessionSummary['kind']) => Promise<SessionSummary | null>) | null>(null);

/** Workout history: read once from SQLite, then every finished workout is inserted and dispatched. */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, initialProgressState);

  useEffect(() => {
    listSessions()
      .then((sessions) => dispatch(hydrateProgress(sessions)))
      .catch(() => dispatch(hydrateProgress([]))); // storage unavailable: start empty, never block the app
  }, []);

  const saveWorkout = useCallback(async (result: WorkoutResult, kind: SessionSummary['kind']) => {
    if (!result.exercises.length) return null;
    const now = new Date();
    const session: SessionSummary = {
      id: createId(),
      day: todayISO(now),
      finishedAt: now.toISOString(),
      durationSec: result.durationSec,
      totalReps: result.totalReps,
      exerciseIds: result.exercises.map((e) => e.id),
      kind,
    };
    // The streak still counts this session for today if the write fails (it just won't survive a restart).
    await insertSession(session, result.exercises).catch(() => {});
    dispatch(sessionAdded(session));
    return session;
  }, []);

  return (
    <ProgressStateContext.Provider value={state}>
      <ProgressDispatchContext.Provider value={dispatch}>
        <SaveWorkoutContext.Provider value={saveWorkout}>{children}</SaveWorkoutContext.Provider>
      </ProgressDispatchContext.Provider>
    </ProgressStateContext.Provider>
  );
}
