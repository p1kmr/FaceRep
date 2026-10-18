import { extractToolCalls } from './reminders.js';

/**
 * `ai.run(model, input)`: Google's Gemini API for "gemini-…" models and Workers AI for "@cf/…" ones (gemini.js
 * createModels). Answers come in the OpenAI shape ({ choices: [{ message }] }), older Workers AI models as
 * { response }. If the main model fails, times out or returns nothing, the fallback model is tried once. Both timeouts
 * together stay under the app's 30 s limit. The main model gets `tools` (function calling); the fallback gets them
 * too with `fallbackTools`, otherwise it answers in text only, with its own messages (`fallbackMessages`) that don't
 * promise tools it doesn't have.
 * Models think before answering unless told not to: on Workers AI that took 8 to 15 s and used up the whole token
 * budget, so many answers came back empty or timed out. A Coach answer is short, so thinking is off (low on Gemini).
 */

/** Pulls the answer text out of either response shape. */
export function extractText(result) {
  if (!result || typeof result !== 'object') return '';
  const fromChoices = result.choices?.[0]?.message?.content;
  if (typeof fromChoices === 'string') return fromChoices;
  if (typeof result.response === 'string') return result.response;
  return '';
}

/** Plain text only (the app shows it as-is): no hidden reasoning, no markdown, sane length. */
export function cleanAnswer(text) {
  return String(text ?? '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 1500)
    .trim();
}

/** A tool call's shape for the logs: its name and the numbers it chose, never a title (the user may have written it). */
export const describeCalls = (toolCalls) =>
  toolCalls
    .map(({ name, args }) => {
      const { title, id, ...rest } = args;
      return `${name}(${Object.keys(args).join(' ')}; ${JSON.stringify(rest).slice(0, 200)})`;
    })
    .join(', ');

async function withTimeout(promise, ms) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => (timer = setTimeout(() => reject(new Error('timeout')), ms)))]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * { answer, toolCalls } (answer may be empty when the model only called tools), or null when nothing came back.
 * `usable` says whether an answer can be shown: a call the handler would drop, with no text, isn't, so the fallback answers.
 */
export async function generateAnswer({
  ai,
  messages,
  fallbackMessages = messages,
  tools,
  model,
  fallbackModel,
  maxOutputTokens = 700,
  temperature = 0.6,
  timeoutMs = 10_000,
  fallbackTimeoutMs = 15_000,
  fallbackTools = false,
  usable = () => true,
}) {
  // A failure is logged with the model, the time and the reason (never the messages or the answer).
  const once = async (m, msgs, withTools, ms) => {
    const started = Date.now();
    try {
      const input = {
        messages: msgs,
        max_completion_tokens: maxOutputTokens,
        temperature,
        chat_template_kwargs: { enable_thinking: false },
        ...(withTools && tools?.length ? { tools } : {}),
      };
      const result = await withTimeout(ai.run(m, input), ms);
      const answer = cleanAnswer(extractText(result));
      const toolCalls = withTools ? extractToolCalls(result) : [];
      if ((answer || toolCalls.length) && usable({ answer, toolCalls })) return { answer, toolCalls };
      if (toolCalls.length) {
        console.error(`ai: ${m} only called tools that were dropped: ${describeCalls(toolCalls)}`);
        return null;
      }
      if (answer) {
        console.error(`ai: ${m} gave an answer that can't be shown (${answer.length} chars)`);
        return null;
      }
      const finish = result?.choices?.[0]?.finish_reason ?? 'none';
      console.error(`ai: ${m} answered nothing after ${Date.now() - started} ms (finish: ${finish}, usage: ${JSON.stringify(result?.usage ?? null)})`);
      return null;
    } catch (e) {
      console.error(`ai: ${m} failed after ${Date.now() - started} ms: ${String(e?.message ?? e).slice(0, 200)}`);
      return null;
    }
  };
  let out = await once(model, messages, true, timeoutMs);
  if (!out && fallbackModel && fallbackModel !== model) {
    console.error('ai: main model failed, trying the fallback');
    out = await once(fallbackModel, fallbackMessages, fallbackTools, fallbackTimeoutMs);
  }
  return out;
}
