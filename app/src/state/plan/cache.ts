import { CATALOG_VERSION, GOALS } from '@/constants/exercises';
import { parsePlanDays } from '@/services/plan/plan';
import { premiumRange } from '@/services/plan/planApi';

import type { PlanCache } from './types';

/**
 * The saved copy is checked like a server answer: anything odd and it's dropped (it reloads). So is
 * a copy from an older catalog, so an update with new exercises gets a plan that uses them.
 */
export function validCache(v: PlanCache | null): PlanCache | null {
  if (!v || !GOALS.includes(v.goal) || !Number.isInteger(v.level) || v.level < 1 || v.catalog !== CATALOG_VERSION) return null;
  const { from, to } = premiumRange(v.level);
  const days = parsePlanDays(v.days, from, to);
  return days ? { goal: v.goal, level: v.level, catalog: v.catalog, days } : null;
}
