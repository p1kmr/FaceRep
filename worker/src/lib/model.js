/**
 * Workers AI (env.AI.run). Newer models answer in the OpenAI shape ({ choices: [{ message }] }),
 * older ones as { response }. If the main model fails, times out or returns nothing, the lighter
 * fallback model is tried once. Both timeouts together stay under the app's 30 s limit.
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

async function withTimeout(promise, ms) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => (timer = setTimeout(() => reject(new Error('timeout')), ms)))]);
  } finally {
    clearTimeout(timer);
  }
}

export async function generateAnswer({
  ai,
  messages,
  model,
  fallbackModel,
  maxOutputTokens = 700,
  temperature = 0.6,
  timeoutMs = 15_000,
  fallbackTimeoutMs = 11_000,
}) {
  const once = async (m, ms) => {
    try {
      const result = await withTimeout(ai.run(m, { messages, max_completion_tokens: maxOutputTokens, temperature }), ms);
      return cleanAnswer(extractText(result));
    } catch {
      return '';
    }
  };
  let answer = await once(model, timeoutMs);
  if (!answer && fallbackModel && fallbackModel !== model) {
    console.error('ai: main model failed, trying the fallback');
    answer = await once(fallbackModel, fallbackTimeoutMs);
  }
  return answer || null;
}
