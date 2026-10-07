import type { Goal } from '@/constants/exercises';
import type { PlanDay } from '@/constants/plan';

import type { PlanState } from './types';

/** Identifies one goal + content level (cache and requests). */
export const planKey = (goal: Goal, level: number) => `${goal}:${level}`;

/** The cached Premium days for this goal and content level, or null. */
export function selectPremiumDays(s: PlanState, goal: Goal, level: number): PlanDay[] | null {
  return s.cache && s.cache.goal === goal && s.cache.level === level ? s.cache.days : null;
}

/** Loading or failed for exactly this goal and level. */
export const selectRequest = (s: PlanState, goal: Goal, level: number) =>
  s.requestKey === planKey(goal, level) ? s.status : 'idle';
