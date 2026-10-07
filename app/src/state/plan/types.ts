import type { Goal } from '@/constants/exercises';
import type { PlanDay } from '@/constants/plan';
import type { PlanError } from '@/services/plan/planApi';

/** The Premium days last loaded from the server for one goal and content level. */
export interface PlanCache {
  goal: Goal;
  level: number;
  /** CATALOG_VERSION when loaded: after an update that adds exercises, the plan is loaded again. */
  catalog: number;
  days: PlanDay[];
}

export interface PlanState {
  /** True once the saved cache was read (or found missing). */
  hydrated: boolean;
  /** Also saved on the device, so the Premium days work offline after the first load. */
  cache: PlanCache | null;
  status: 'idle' | 'loading' | 'error';
  /** goal:level of the request that is loading or failed. */
  requestKey: string | null;
  error: PlanError | null;
}
