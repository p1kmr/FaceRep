import { buildMessages } from './prompt.js';
import { describeCalls, generateAnswer } from './model.js';
import { REMINDER_LIMITS, REMINDER_TOOLS, sanitizeActions } from './reminders.js';
import { validateChatRequest } from './validate.js';
import { sanitizeWorkoutCalls, workoutTools } from './workouts.js';

// Includes room for the DeviceCheck token (a few KB).
const MAX_BODY_BYTES = 30_000;

/**
 * An answer that sends the user to a card's Confirm button ("confirm", "confirma", "confirme", "bestätige",
 * "conferma" in the app's languages). Without a proposal there is no card: the model wrote it without calling the
 * tool (Gemini did, 1 time in 4, in a longer chat on 2026-10-18), so that answer isn't shown and the fallback answers.
 */
const POINTS_TO_CARD = /confirm|conferm|bestätig/i;

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
  const access = checkAccess ? await checkAccess(input) : { ok: true, premium: false, commit: async () => {} };
  if (!access.ok) return { status: access.status, body: access.body };
  // Without Premium the Coach only knows the free exercises (catalog.js idsFor).
  const premium = access.premium === true;
  const actionsFrom = (toolCalls) =>
    [...sanitizeActions(toolCalls, input.reminders), ...sanitizeWorkoutCalls(toolCalls, premium)].slice(0, REMINDER_LIMITS.actionsPerAnswer);

  const result = await generateAnswer({
    ai,
    model,
    fallbackModel,
    maxOutputTokens,
    // Both models can propose reminder changes and workouts (function calling).
    messages: buildMessages({ ...input, appName, canPropose: true, premium }),
    tools: [...REMINDER_TOOLS, ...workoutTools(premium)],
    fallbackTools: true,
    // Proposals that would all be dropped and no text, or text pointing at a card that isn't there: the fallback answers.
    usable: ({ answer, toolCalls }) => actionsFrom(toolCalls).length > 0 || (Boolean(answer) && !POINTS_TO_CARD.test(answer)),
  }).catch(() => null);
  const actions = result ? actionsFrom(result.toolCalls) : [];
  if (result && result.toolCalls.length > actions.length) console.error(`chat: proposals dropped: ${describeCalls(result.toolCalls)}`);
  if (!result || (!result.answer && !actions.length)) {
    console.error('chat: model call failed');
    return { status: 502, body: { error: 'model' } };
  }
  await access.commit(); // a failed model call is never counted
  // `actions` are proposals: the app shows them and changes nothing until the user confirms.
  return { status: 200, body: actions.length ? { answer: result.answer, actions } : { answer: result.answer } };
}
