import { buildMessages } from './prompt.js';
import { generateAnswer } from './model.js';
import { validateChatRequest } from './validate.js';

// Includes room for the DeviceCheck token (a few KB).
const MAX_BODY_BYTES = 30_000;

/**
 * POST /chat, framework-neutral so it can be tested without Cloudflare.
 * Input: { method, rawBody, ip }. Output: { status, body }.
 * Never logs request bodies: only outcomes.
 */
export async function handleChat({ method, rawBody, ip }, { ai, model, fallbackModel, maxOutputTokens, appName, checkRateLimit, checkAccess }) {
  if (method !== 'POST') return { status: 405, body: { error: 'method' } };
  if (!ai || !model) return { status: 503, body: { error: 'unconfigured' } };
  if (!rawBody || rawBody.length > MAX_BODY_BYTES) return { status: rawBody ? 413 : 400, body: { error: 'size' } };

  let parsed;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { error: 'invalid' } };
  }
  const input = validateChatRequest(parsed);
  if (!input) return { status: 400, body: { error: 'invalid' } };

  // Fail closed: without a working rate limiter, refuse (protects the bill).
  const limit = await checkRateLimit({ appUserId: input.appUserId, ip: ip || 'unknown' });
  if (limit === 'limited') return { status: 429, body: { error: 'rateLimited' } };
  if (limit !== 'ok') return { status: 503, body: { error: 'unavailable' } };

  // Premium or free answers left (402 = free answers used up, 403 = not a real iPhone app).
  const access = checkAccess ? await checkAccess(input) : { ok: true, commit: async () => {} };
  if (!access.ok) return { status: access.status, body: access.body };

  const answer = await generateAnswer({
    ai,
    model,
    fallbackModel,
    maxOutputTokens,
    messages: buildMessages({ ...input, appName }),
  }).catch(() => null);
  if (!answer) {
    console.error('chat: model call failed');
    return { status: 502, body: { error: 'model' } };
  }
  await access.commit(); // a failed model call is never counted
  return { status: 200, body: { answer } };
}
