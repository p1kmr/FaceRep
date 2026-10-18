/**
 * Google's Gemini API, through its OpenAI-compatible endpoint, shaped like Workers AI's env.AI so model.js runs both the
 * same way: run(model, input) takes the Workers AI input and gives back an OpenAI-shaped answer. The key is the
 * GEMINI_API_KEY secret and never leaves the server. Only the messages go to Google, never the app ID or the IP. The
 * Google project must have billing on (paid tier): Google then doesn't use prompts or answers to improve its products,
 * and the paid tier is required for users in the EEA, Switzerland and the UK (ai.google.dev/gemini-api/terms).
 * Gemini 3 models can't turn thinking off. "low" is Google's level for chat and instruction following: with "minimal"
 * it sometimes skipped a reminder tool call in a longer chat and still said it had prepared it. The temperature stays
 * at Google's default (1.0), which Google strongly recommends for Gemini 3. Workers AI's options aren't sent.
 */
export const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

export const isGeminiModel = (model) => typeof model === 'string' && model.startsWith('gemini-');

/** Gemini's thinking can count against max_tokens: room for it on top of the answer's own limit (prompt: ~120 words). */
export const THINKING_TOKENS = 1024;

/** Google's error message for the logs (it names the problem, never the messages sent). */
const errorOf = (body) => (Array.isArray(body) ? body[0] : body)?.error?.message ?? '';

export function createGemini({ apiKey, fetchImpl = fetch }) {
  return {
    async run(model, { messages, max_completion_tokens, tools }) {
      if (!apiKey) throw new Error('no GEMINI_API_KEY');
      const res = await fetchImpl(GEMINI_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: max_completion_tokens + THINKING_TOKENS,
          reasoning_effort: 'low',
          ...(tools?.length ? { tools, tool_choice: 'auto' } : {}),
        }),
      });
      if (!res.ok) {
        const detail = await res.json().then(errorOf, () => '');
        throw new Error(`gemini ${res.status}: ${String(detail).slice(0, 150)}`);
      }
      return res.json();
    },
  };
}

/** One env.AI-like runner for both: "gemini-…" models go to Google, the "@cf/…" ones to Workers AI. */
export const createModels = ({ ai, gemini }) => ({
  run: (model, input) => (isGeminiModel(model) ? gemini.run(model, input) : ai.run(model, input)),
});

/** Without the key a Gemini main model can't answer, so the fallback answers alone (and isn't tried twice). */
export const chooseModels = ({ model, fallbackModel, geminiKey }) =>
  isGeminiModel(model) && !geminiKey ? { model: fallbackModel, fallbackModel } : { model, fallbackModel };
