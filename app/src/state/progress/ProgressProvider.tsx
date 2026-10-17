import { createContext, useCallback, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';

import type { PlanRef } from '@/constants/plan';
import type { LoggedWorkout } from '@/services/progress/log';
import { insertSession, listSessions } from '@/services/progress/sessionsRepo';
import type { SessionSummary } from '@/services/progress/stats';
import type { WorkoutResult } from '@/services/workout/timer';
import { fromISODate, todayISO } from '@/utils/dates';
import { createId } from '@/utils/ids';

import { hydrateProgress, sessionAdded, type ProgressAction } from './actions';
import { initialProgressState, progressReducer } from './reducer';
import type { ProgressState } from './types';

export const ProgressStateContext = createContext<ProgressState | null>(null);
export const ProgressDispatchContext = createContext<Dispatch<ProgressAction> | null>(null);
type SaveWorkout = (result: WorkoutResult, kind: SessionSummary['kind'], plan?: PlanRef | null) => Promise<SessionSummary | null>;

/** Saves a finished workout (SQLite first, then state) and returns it, or null when nothing was done. */
export const SaveWorkoutContext = createContext<SaveWorkout | null>(null);

type LogWorkout = (workout: LoggedWorkout) => Promise<SessionSummary>;
/** Saves a workout done without the app, from a Coach proposal the user confirmed (services/progress/log.ts). */
export const LogWorkoutContext = createContext<LogWorkout | null>(null);

/** Workout history: read once from SQLite, then every finished workout is inserted and dispatched. */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, initialProgressState);

  useEffect(() => {
    listSessions()
      .then((sessions) => dispatch(hydrateProgress(sessions)))
      .catch(() => dispatch(hydrateProgress([]))); // storage unavailable: start empty, never block the app
  }, []);

  const saveWorkout = useCallback<SaveWorkout>(async (result, kind, plan) => {
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
      ...(plan ? { plan } : {}),
    };
    // The streak still counts this session for today if the write fails (it just won't survive a restart).
    await insertSession(session, result.exercises).catch(() => {});
    dispatch(sessionAdded(session));
    return session;
  }, []);

  const logWorkout = useCallback<LogWorkout>(async (w) => {
    const now = new Date();
    // Today: now. An earlier day: its noon (the time only orders the history).
    const noon = fromISODate(w.day);
    noon.setHours(12);
    const session: SessionSummary = {
      id: createId(),
      day: w.day,
      finishedAt: w.day === todayISO(now) ? now.toISOString() : noon.toISOString(),
      durationSec: w.durationSec,
      totalReps: w.items.reduce((sum, i) => sum + i.reps, 0),
      exerciseIds: w.items.map((i) => i.id),
      kind: w.plan || w.items.length > 1 ? 'routine' : 'single',
      logged: true,
      ...(w.plan ? { plan: w.plan } : {}),
    };
    await insertSession(session, w.items).catch(() => {});
    dispatch(sessionAdded(session));
    return session;
  }, []);

  return (
    <ProgressStateContext.Provider value={state}>
      <ProgressDispatchContext.Provider value={dispatch}>
        <SaveWorkoutContext.Provider value={saveWorkout}>
          <LogWorkoutContext.Provider value={logWorkout}>{children}</LogWorkoutContext.Provider>
        </SaveWorkoutContext.Provider>
      </ProgressDispatchContext.Provider>
    </ProgressStateContext.Provider>
  );
}
