import { createAccessCheck, createFreeUsage, createPremiumCheck, pruneFreeUsage } from './lib/access.js';
import { createDeviceCheck } from './lib/devicecheck.js';
import { handleChat } from './lib/handler.js';
import { handlePlan, PLAN_LIMITS } from './lib/planHandler.js';
import { createD1RateLimiter, pruneRateLimits } from './lib/ratelimit.js';
import { renderPage } from './pages.js';

/**
 * FaceRep API (Cloudflare Worker).
 * POST /chat → a Coach question (+ recent turns and an anonymous training context) in, an answer out.
 *   The model runs on Workers AI (env.AI). With REVENUECAT_SECRET_KEY set, only Premium users and
 *   free users with answers left this month get through; the DEVICECHECK_* secrets add the iPhone check.
 * POST /plan → the Premium days of the 28-day plan (Weeks 2–4, Levels 2–3), only when RevenueCat
 *   confirms Premium. Needs REVENUECAT_SECRET_KEY; without it nobody gets them.
 * GET /privacy, /terms, /support → the public pages the App Store asks for.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/chat' && url.pathname !== '/plan') {
      const page = request.method === 'GET' ? renderPage(url.pathname, env) : null;
      return page ?? Response.json({ error: 'notFound' }, { status: 404 });
    }

    const input = {
      method: request.method,
      rawBody: request.method === 'POST' ? await request.text() : '',
      ip: request.headers.get('CF-Connecting-IP') ?? '',
    };
    const isPremium = createPremiumCheck({ secretKey: env.REVENUECAT_SECRET_KEY });
    const result =
      url.pathname === '/plan'
        ? await handlePlan(input, {
            isPremium,
            checkRateLimit: createD1RateLimiter(env.DB, { ipSecret: env.IP_HASH_SECRET, prefix: 'plan:', limits: PLAN_LIMITS }),
          })
        : await handleChat(input, {
            ai: env.AI,
            model: env.AI_MODEL,
            fallbackModel: env.AI_FALLBACK_MODEL,
            maxOutputTokens: Number(env.AI_MAX_OUTPUT_TOKENS) || undefined,
            appName: env.APP_NAME,
            checkRateLimit: createD1RateLimiter(env.DB, { ipSecret: env.IP_HASH_SECRET }),
            checkAccess: createAccessCheck({
              isPremium,
              freeUsage: createFreeUsage(env.DB),
              deviceCheck: createDeviceCheck({ keyP8: env.DEVICECHECK_KEY, keyId: env.DEVICECHECK_KEY_ID, teamId: env.APPLE_TEAM_ID }),
            }),
          });
    return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
  },

  // Daily cleanup of old counters (see "triggers" in wrangler.jsonc).
  async scheduled(_event, env) {
    await pruneRateLimits(env.DB);
    await pruneFreeUsage(env.DB);
  },
};
