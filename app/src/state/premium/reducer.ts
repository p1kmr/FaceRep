import { FREE_LIMITS } from '@/constants/limits';
import { EMPTY_PLANS } from '@/services/purchases/plans';

import { AI_ANSWER_USED, AI_FREE_USED_UP, PLANS_SET, PREMIUM_HYDRATE, PREMIUM_READY, PREMIUM_SET, type PremiumAction } from './actions';
import type { PremiumState } from './types';

export const initialPremiumState: PremiumState = {
  ready: false,
  isPremium: false,
  plans: EMPTY_PLANS,
  appUserId: null,
  aiUsage: { month: null, count: 0 },
};

export function premiumReducer(state: PremiumState, action: PremiumAction): PremiumState {
  switch (action.type) {
    case PREMIUM_HYDRATE:
      return { ...state, ...action.payload };
    case PREMIUM_READY:
      return { ...state, ready: true };
    case PREMIUM_SET:
      return { ...state, isPremium: action.payload };
    case PLANS_SET:
      return { ...state, plans: action.payload };
    case AI_ANSWER_USED: {
      const { month } = action.payload;
      const count = state.aiUsage.month === month ? state.aiUsage.count + 1 : 1;
      return { ...state, aiUsage: { month, count } };
    }
    case AI_FREE_USED_UP:
      return { ...state, aiUsage: { month: action.payload.month, count: FREE_LIMITS.aiPerMonth } };
    default:
      return state;
  }
}
