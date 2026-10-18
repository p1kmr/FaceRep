import { createAccessCheck, createFreeUsage, createPremiumCheck, pruneFreeUsage } from './lib/access.js';
import { CONTENT_LIMITS, createContentTokens, handleContentFile, handleContentRequest, tokenOf } from './lib/content.js';
import { createDeviceCheck } from './lib/devicecheck.js';
import { chooseModels, createGemini, createModels } from './lib/gemini.js';
import { handleChat } from './lib/handler.js';
import { createD1RateLimiter, pruneRateLimits } from './lib/ratelimit.js';
import { renderPage } from './pages.js';

/**
 * FaceRep API (Cloudflare Worker).
 * POST /chat → a Coach question (+ recent turns and an anonymous training context) in, an answer out.
 *   Google's Gemini API answers (GEMINI_API_KEY), Workers AI (env.AI) when it fails. With REVENUECAT_SECRET_KEY set, only Premium users and
 *   free users with answers left this month get through; the DEVICECHECK_* secrets add the iPhone check.
 * POST /content, GET /content/files/… → the Premium exercises, only after RevenueCat confirms Premium (lib/content.js).
 * GET /privacy, /terms, /support → the public pages the App Store asks for.
 * Every request runs this code first (wrangler.jsonc assets.run_worker_first), so the Premium files are never public.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/content' || url.pathname.startsWith('/content/files/')) return content(request, url, env);
    if (url.pathname !== '/chat') {
      const page = request.method === 'GET' ? renderPage(url.pathname, env) : null;
      return page ?? Response.json({ error: 'notFound' }, { status: 404 });
    }

    const input = {
      method: request.method,
      rawBody: request.method === 'POST' ? await request.text() : '',
      ip: request.headers.get('CF-Connecting-IP') ?? '',
    };
    const isPremium = createPremiumCheck({ secretKey: env.REVENUECAT_SECRET_KEY });
    const result = await handleChat(input, {
      ai: createModels({ ai: env.AI, gemini: createGemini({ apiKey: env.GEMINI_API_KEY }) }),
      ...chooseModels({ model: env.AI_MODEL, fallbackModel: env.AI_FALLBACK_MODEL, geminiKey: env.GEMINI_API_KEY }),
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

const asset = (env, path) => env.CONTENT.fetch(`https://assets.local/${path}`);

async function readPack(env) {
  const res = await asset(env, 'pack.json');
  return res.ok ? res.text() : null;
}

/** The file path after /content/files/, or '' when it isn't valid URL encoding. */
function filePath(url) {
  try {
    return decodeURIComponent(url.pathname.slice('/content/files/'.length));
  } catch {
    return '';
  }
}

async function content(request, url, env) {
  const noStore = { 'Cache-Control': 'no-store' };
  const tokens = createContentTokens(env.REVENUECAT_SECRET_KEY);
  if (url.pathname === '/content') {
    const result = await handleContentRequest(
      { method: request.method, rawBody: request.method === 'POST' ? await request.text() : '', ip: request.headers.get('CF-Connecting-IP') ?? '' },
      {
        checkRateLimit: createD1RateLimiter(env.DB, {
          ipSecret: env.IP_HASH_SECRET,
          prefix: 'content:',
          limits: { perUser: CONTENT_LIMITS.perUser, perIp: CONTENT_LIMITS.perIp },
        }),
        isPremium: createPremiumCheck({ secretKey: env.REVENUECAT_SECRET_KEY }),
        tokens,
        readPack: env.CONTENT ? () => readPack(env) : null,
      },
    );
    return typeof result.body === 'string'
      ? new Response(result.body, { status: result.status, headers: { 'Content-Type': 'application/json', ...noStore } })
      : Response.json(result.body, { status: result.status, headers: noStore });
  }
  const result = await handleContentFile(
    { method: request.method, path: filePath(url), token: tokenOf(request, url) },
    { tokens, fetchAsset: env.CONTENT ? (path) => asset(env, path) : null },
  );
  if (!result.asset) return Response.json(result.body, { status: result.status, headers: noStore });
  const file = new Response(result.asset.body, result.asset);
  file.headers.set('Cache-Control', 'private, no-store');
  return file;
}
