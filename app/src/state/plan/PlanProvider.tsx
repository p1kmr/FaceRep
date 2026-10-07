import { createContext, useCallback, useEffect, useReducer, useRef, type Dispatch, type ReactNode } from 'react';

import { GOALS, type Goal } from '@/constants/exercises';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { parsePlanDays } from '@/services/plan/plan';
import { PlanRequestError, premiumRange, requestPlanDays } from '@/services/plan/planApi';
import { load, save } from '@/services/storage/kv';

import { hydratePlan, planFailed, planLoaded, planRequested, type PlanAction } from './actions';
import { initialPlanState, planReducer } from './reducer';
import { planKey } from './selectors';
import type { PlanCache, PlanState } from './types';

const VERSION = 1;

type LoadPlan = (input: { appUserId: string; goal: Goal; level: number }) => Promise<void>;

export const PlanStateContext = createContext<PlanState | null>(null);
export const PlanDispatchContext = createContext<Dispatch<PlanAction> | null>(null);
/** Loads the Premium days of a goal and content level from the Worker (one request at a time per key). */
export const LoadPlanContext = createContext<LoadPlan | null>(null);

/** The saved copy is checked like a server answer: anything odd and it's dropped (it reloads). */
function validCache(v: PlanCache | null): PlanCache | null {
  if (!v || !GOALS.includes(v.goal) || !Number.isInteger(v.level) || v.level < 1) return null;
  const { from, to } = premiumRange(v.level);
  const days = parsePlanDays(v.days, from, to);
  return days ? { goal: v.goal, level: v.level, days } : null;
}

/** The Premium part of the 28-day plan: cached on the device, loaded from the Worker when needed. */
export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(planReducer, initialPlanState);
  const inFlight = useRef(new Set<string>());

  useEffect(() => {
    load<PlanCache>(STORAGE_KEYS.planCache, VERSION)
      .then((cache) => dispatch(hydratePlan(validCache(cache))))
      .catch(() => dispatch(hydratePlan(null)));
  }, []);

  const loadPlan = useCallback<LoadPlan>(async ({ appUserId, goal, level }) => {
    const key = planKey(goal, level);
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    dispatch(planRequested(key));
    try {
      const cache: PlanCache = { goal, level, days: await requestPlanDays({ appUserId, goal, level }) };
      dispatch(planLoaded(cache));
      await save(STORAGE_KEYS.planCache, VERSION, cache).catch(() => {}); // still works until restart
    } catch (err) {
      dispatch(planFailed(key, err instanceof PlanRequestError ? err.kind : 'server'));
    } finally {
      inFlight.current.delete(key);
    }
  }, []);

  return (
    <PlanStateContext.Provider value={state}>
      <PlanDispatchContext.Provider value={dispatch}>
        <LoadPlanContext.Provider value={loadPlan}>{children}</LoadPlanContext.Provider>
      </PlanDispatchContext.Provider>
    </PlanStateContext.Provider>
  );
}
