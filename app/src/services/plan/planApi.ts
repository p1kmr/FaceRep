import { CONFIG } from '@/constants/config';
import { CATALOG_VERSION, type Goal } from '@/constants/exercises';
import { PLAN, type PlanDay } from '@/constants/plan';

import { contentLevel, parsePlanDays } from './plan';

/** premium: the server says this app ID has no active subscription. */
export type PlanError = 'notConfigured' | 'offline' | 'premium' | 'rateLimited' | 'server';

export class PlanRequestError extends Error {
  constructor(readonly kind: PlanError) {
    super(kind);
  }
}

/** The Premium days of a level: Level 1 without its free week, every day of later levels. */
export const premiumRange = (level: number) => ({ from: level === 1 ? PLAN.freeDays + 1 : 1, to: PLAN.days });

/**
 * Asks our Worker for the Premium days. The Worker checks the subscription with RevenueCat itself,
 * so a patched app still gets nothing. Only the random app ID, goal, level and the app's catalog
 * version (which exercises it has) are sent.
 */
export async function requestPlanDays(
  input: { appUserId: string; goal: Goal; level: number },
  fetchImpl: typeof fetch = fetch,
): Promise<PlanDay[]> {
  if (!CONFIG.planUrl) throw new PlanRequestError('notConfigured');
  const level = contentLevel(input.level);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.planTimeoutMs);
  let response: Response;
  try {
    response = await fetchImpl(CONFIG.planUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appUserId: input.appUserId, goal: input.goal, level, catalog: CATALOG_VERSION }),
      signal: controller.signal,
    });
  } catch {
    throw new PlanRequestError('offline');
  } finally {
    clearTimeout(timer);
  }
  if (response.status === 402) throw new PlanRequestError('premium');
  if (response.status === 429) throw new PlanRequestError('rateLimited');
  if (!response.ok) throw new PlanRequestError('server');
  const body = (await response.json().catch(() => null)) as { days?: unknown } | null;
  const { from, to } = premiumRange(level);
  const days = parsePlanDays(body?.days, from, to);
  if (!days) throw new PlanRequestError('server');
  return days;
}
