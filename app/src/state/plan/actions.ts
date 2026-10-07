import type { PlanError } from '@/services/plan/planApi';

import type { PlanCache } from './types';

export const PLAN_HYDRATE = 'plan/hydrate';
export const PLAN_REQUESTED = 'plan/requested';
export const PLAN_LOADED = 'plan/loaded';
export const PLAN_FAILED = 'plan/failed';
export const PLAN_RESET = 'plan/reset';

export type PlanAction =
  | { type: typeof PLAN_HYDRATE; payload: PlanCache | null }
  | { type: typeof PLAN_REQUESTED; payload: { key: string } }
  | { type: typeof PLAN_LOADED; payload: PlanCache }
  | { type: typeof PLAN_FAILED; payload: { key: string; error: PlanError } }
  | { type: typeof PLAN_RESET };

export const hydratePlan = (cache: PlanCache | null): PlanAction => ({ type: PLAN_HYDRATE, payload: cache });
export const planRequested = (key: string): PlanAction => ({ type: PLAN_REQUESTED, payload: { key } });
export const planLoaded = (cache: PlanCache): PlanAction => ({ type: PLAN_LOADED, payload: cache });
export const planFailed = (key: string, error: PlanError): PlanAction => ({ type: PLAN_FAILED, payload: { key, error } });
/** "Delete all data": forget the cached Premium days. */
export const resetPlan = (): PlanAction => ({ type: PLAN_RESET });
