import { premiumDays } from './plan.js';
import { validatePlanRequest } from './validate.js';

const MAX_BODY_BYTES = 1_000;

/** Plan requests per day. The app asks about once per level and keeps the answer, so these are generous. */
export const PLAN_LIMITS = { perUser: 30, perIp: 300 };

/**
 * POST /plan: the Premium days of the 28-day plan, only after RevenueCat confirms Premium on the
 * server (the app's own check can be patched out; this one can't).
 * Input: { method, rawBody, ip }. Output: { status, body }.
 * Fails closed: without a RevenueCat key, or when RevenueCat can't be reached, nobody gets the plan.
 */
export async function handlePlan({ method, rawBody, ip }, { checkRateLimit, isPremium }) {
  if (method !== 'POST') return { status: 405, body: { error: 'method' } };
  if (!isPremium) return { status: 503, body: { error: 'unconfigured' } };
  if (!rawBody || rawBody.length > MAX_BODY_BYTES) return { status: rawBody ? 413 : 400, body: { error: 'size' } };

  let parsed;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { error: 'invalid' } };
  }
  const input = validatePlanRequest(parsed);
  if (!input) return { status: 400, body: { error: 'invalid' } };

  const limit = await checkRateLimit({ appUserId: input.appUserId, ip: ip || 'unknown' });
  if (limit === 'limited') return { status: 429, body: { error: 'rateLimited' } };
  if (limit !== 'ok') return { status: 503, body: { error: 'unavailable' } };

  const premium = await isPremium(input.appUserId);
  if (premium === 'unavailable') return { status: 503, body: { error: 'unavailable' } };
  if (!premium) return { status: 402, body: { error: 'premium' } };

  return { status: 200, body: { goal: input.goal, level: input.level, days: premiumDays(input.goal, input.level) } };
}
