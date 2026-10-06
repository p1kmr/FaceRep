import type { StorePlans } from '@/services/purchases/plans';

import type { AiUsage } from './types';

export const PREMIUM_HYDRATE = 'premium/hydrate';
export const PREMIUM_READY = 'premium/ready';
export const PREMIUM_SET = 'premium/set';
export const PLANS_SET = 'premium/plansSet';
export const AI_ANSWER_USED = 'premium/aiAnswerUsed';
export const AI_FREE_USED_UP = 'premium/aiFreeUsedUp';

export type PremiumAction =
  | { type: typeof PREMIUM_HYDRATE; payload: { aiUsage: AiUsage; appUserId: string } }
  | { type: typeof PREMIUM_READY }
  | { type: typeof PREMIUM_SET; payload: boolean }
  | { type: typeof PLANS_SET; payload: StorePlans }
  | { type: typeof AI_ANSWER_USED; payload: { month: string } }
  | { type: typeof AI_FREE_USED_UP; payload: { month: string } };

export const hydratePremium = (aiUsage: AiUsage, appUserId: string): PremiumAction => ({
  type: PREMIUM_HYDRATE,
  payload: { aiUsage, appUserId },
});
export const premiumReady = (): PremiumAction => ({ type: PREMIUM_READY });
export const setPremium = (isPremium: boolean): PremiumAction => ({ type: PREMIUM_SET, payload: isPremium });
export const setPlans = (plans: StorePlans): PremiumAction => ({ type: PLANS_SET, payload: plans });
/** One AI answer (Coach reply) received; `month` = today's 'YYYY-MM'. */
export const aiAnswerUsed = (month: string): PremiumAction => ({ type: AI_ANSWER_USED, payload: { month } });
/** The server says this month's free answers are gone (e.g. used before a reinstall): sync the count. */
export const aiFreeUsedUp = (month: string): PremiumAction => ({ type: AI_FREE_USED_UP, payload: { month } });
