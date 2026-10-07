import { PLAN_FAILED, PLAN_HYDRATE, PLAN_LOADED, PLAN_REQUESTED, PLAN_RESET, type PlanAction } from './actions';
import type { PlanState } from './types';

export const initialPlanState: PlanState = { hydrated: false, cache: null, status: 'idle', requestKey: null, error: null };

export function planReducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case PLAN_HYDRATE:
      // A load that finished first wins over the older saved copy.
      return { ...state, hydrated: true, cache: state.cache ?? action.payload };
    case PLAN_REQUESTED:
      return { ...state, status: 'loading', requestKey: action.payload.key, error: null };
    case PLAN_LOADED:
      return { ...state, cache: action.payload, status: 'idle', requestKey: null, error: null };
    case PLAN_FAILED:
      return { ...state, status: 'error', requestKey: action.payload.key, error: action.payload.error };
    case PLAN_RESET:
      return { ...initialPlanState, hydrated: true };
    default:
      return state;
  }
}
