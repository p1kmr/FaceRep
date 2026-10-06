import { createAccessCheck, createFreeUsage, createPremiumCheck, pruneFreeUsage } from './lib/access.js';
import { createDeviceCheck } from './lib/devicecheck.js';
import { handleChat } from './lib/handler.js';
import { createD1RateLimiter, pruneRateLimits } from './lib/ratelimit.js';
import { renderPage } from './pages.js';

/**
 * FaceRep API (Cloudflare Worker).
 * POST /chat → a Coach question (+ recent turns and an anonymous training context) in, an answer out.
 *   The model runs on Workers AI (env.AI). With REVENUECAT_SECRET_KEY set, only Premium users and
 *   free users with answers left this month get through; the DEVICECHECK_* secrets add the iPhone check.
 * GET /privacy, /terms, /support → the public pages the App Store asks for.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/chat') {
      const page = request.method === 'GET' ? renderPage(url.pathname, env) : null;
      return page ?? Response.json({ error: 'notFound' }, { status: 404 });
    }

    const result = await handleChat(
      {
        method: request.method,
        rawBody: request.method === 'POST' ? await request.text() : '',
        ip: request.headers.get('CF-Connecting-IP') ?? '',
      },
      {
        ai: env.AI,
        model: env.AI_MODEL,
        fallbackModel: env.AI_FALLBACK_MODEL,
        maxOutputTokens: Number(env.AI_MAX_OUTPUT_TOKENS) || undefined,
        appName: env.APP_NAME,
        checkRateLimit: createD1RateLimiter(env.DB, { ipSecret: env.IP_HASH_SECRET }),
        checkAccess: createAccessCheck({
          isPremium: createPremiumCheck({ secretKey: env.REVENUECAT_SECRET_KEY }),
          freeUsage: createFreeUsage(env.DB),
          deviceCheck: createDeviceCheck({ keyP8: env.DEVICECHECK_KEY, keyId: env.DEVICECHECK_KEY_ID, teamId: env.APPLE_TEAM_ID }),
        }),
      },
    );
    return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
  },

  // Daily cleanup of old counters (see "triggers" in wrangler.jsonc).
  async scheduled(_event, env) {
    await pruneRateLimits(env.DB);
    await pruneFreeUsage(env.DB);
  },
};
