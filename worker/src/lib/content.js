/**
 * The Premium exercises (names, steps and cues in every language, drawings and clips) live only here, never in the
 * app, so a patched app that claims Premium still gets nothing: this Worker asks RevenueCat itself.
 * - POST /content { appUserId } → daily rate limit → RevenueCat → { token, expires, pack }. The pack (pack.json,
 *   made by scripts/content.js) has the texts and the file list with sizes and hashes.
 * - GET /content/files/<guide>/<id>/<file> with "Authorization: Bearer <token>" (or ?t=<token> for the web build) →
 *   the file. The token is an HMAC that ends after an hour, so a download of many files needs one RevenueCat check.
 * The files are the Worker's static assets (wrangler.jsonc "assets", binding CONTENT, run_worker_first): nobody can
 * fetch them without going through here. Framework-neutral like handleChat, so it can be tested without Cloudflare.
 */

export const CONTENT_LIMITS = { tokenMs: 60 * 60 * 1000, bodyBytes: 200, perUser: 30, perIp: 200 };

/** man|woman / <id> / one of the four files an exercise has. Anything else is not a Premium file. */
const FILE_PATH = /^(man|woman)\/\d{2}-[a-z]+(?:-[a-z]+)*\/(?:relaxed\.webp|exercise\.webp|thumb\.webp|clip\.mp4)$/;
export const isContentPath = (path) => typeof path === 'string' && FILE_PATH.test(path);

const encoder = new TextEncoder();
const toBase64Url = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
const fromBase64Url = (text) => {
  const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

/**
 * Short-lived download tokens, `<expires ms>.<HMAC>`. The HMAC key is derived from the RevenueCat secret (HMAC of a
 * fixed label), so there is no extra secret to set and a token never reveals the key. Web Crypto: Workers and Node.
 */
export function createContentTokens(secret) {
  if (!secret) return null;
  const keyPromise = (async () => {
    const root = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const derived = await crypto.subtle.sign('HMAC', root, encoder.encode('facerep content tokens v1'));
    return crypto.subtle.importKey('raw', derived, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  })();
  return {
    async sign(now = Date.now()) {
      const expires = now + CONTENT_LIMITS.tokenMs;
      const signature = await crypto.subtle.sign('HMAC', await keyPromise, encoder.encode(`content:${expires}`));
      return { token: `${expires}.${toBase64Url(signature)}`, expires };
    },
    async verify(token, now = Date.now()) {
      if (typeof token !== 'string' || token.length > 200) return false;
      const match = token.match(/^(\d{13})\.([A-Za-z0-9_-]{43})$/);
      if (!match || Number(match[1]) <= now) return false;
      try {
        return await crypto.subtle.verify('HMAC', await keyPromise, fromBase64Url(match[2]), encoder.encode(`content:${match[1]}`));
      } catch {
        return false;
      }
    },
  };
}

const isUserId = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/.test(v);
const fail = (status, error) => ({ status, body: { error } });

/**
 * POST /content. Input: { method, rawBody, ip }. Output: { status, body } where a 200 body is the JSON text itself
 * (the pack is passed through, never parsed: cheap on the Worker's CPU budget).
 * Fails closed: without the RevenueCat key, the token key or the pack, nobody gets anything (503).
 */
export async function handleContentRequest({ method, rawBody, ip }, { checkRateLimit, isPremium, tokens, readPack, now = Date.now() }) {
  if (method !== 'POST') return fail(405, 'method');
  if (!isPremium || !tokens || !readPack) return fail(503, 'unconfigured');
  if (!rawBody || rawBody.length > CONTENT_LIMITS.bodyBytes) return fail(rawBody ? 413 : 400, 'size');
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return fail(400, 'invalid');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1 || !isUserId(body.appUserId)) {
    return fail(400, 'invalid');
  }

  const limit = await checkRateLimit({ appUserId: body.appUserId, ip: ip || 'unknown' });
  if (limit === 'limited') return fail(429, 'rateLimited');
  if (limit !== 'ok') return fail(503, 'unavailable');

  const premium = await isPremium(body.appUserId, new Date(now));
  if (premium === 'unavailable') return fail(503, 'unavailable');
  if (!premium) return fail(402, 'premium');

  const pack = await readPack().catch(() => null);
  if (!pack) {
    console.error('content: pack.json missing (run npm run content before deploy)');
    return fail(503, 'unconfigured');
  }
  const { token, expires } = await tokens.sign(now);
  return { status: 200, body: `{"token":${JSON.stringify(token)},"expires":${expires},"pack":${pack}}` };
}

/**
 * GET /content/files/<path>. Output: { status, body } for a refusal, or { asset } with the file's Response.
 * 401 without a valid token, 404 for anything that isn't a Premium file.
 */
export async function handleContentFile({ method, path, token }, { tokens, fetchAsset, now = Date.now() }) {
  if (method !== 'GET') return fail(405, 'method');
  if (!tokens || !fetchAsset) return fail(503, 'unconfigured');
  if (!(await tokens.verify(token, now))) return fail(401, 'token');
  if (!isContentPath(path)) return fail(404, 'notFound');
  const asset = await fetchAsset(path).catch(() => null);
  if (!asset || !asset.ok) return fail(404, 'notFound');
  return { asset };
}

/** The token from "Authorization: Bearer …" or, for the web build's pictures, ?t=. */
export function tokenOf(request, url) {
  const header = request.headers.get('Authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : (url.searchParams.get('t') ?? '');
}
