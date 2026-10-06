import { CONFIG } from '@/constants/config';

import { getDeviceCheckToken } from './deviceCheck';
import { AiRequestError, type ChatReply, type ChatTurn, type CoachContext } from './types';

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Accepts only the expected shape, trimmed to a sane length (never render unchecked server text). */
export function parseChatReply(value: unknown): ChatReply | null {
  const answer = clip((value as Partial<ChatReply> | null)?.answer, 1500);
  return answer ? { answer } : null;
}

/**
 * POST to our own proxy (the Cloudflare Worker in worker/). The model and its keys live only
 * there. Status codes: 429 too many today, 402 free answers used up, 403 not a verified iPhone.
 */
export async function requestChat(
  input: { appUserId: string; locale: string; question: string; history: ChatTurn[]; context: CoachContext },
  fetchImpl: typeof fetch = fetch,
): Promise<ChatReply> {
  if (!CONFIG.aiUrl) throw new AiRequestError('notConfigured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.aiTimeoutMs);
  let response: Response;
  try {
    // Proves to the server this is FaceRep on a real iPhone (free answers are counted per iPhone).
    const deviceToken = await getDeviceCheckToken();
    response = await fetchImpl(CONFIG.aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceToken ? { ...input, deviceToken } : input),
      signal: controller.signal,
    });
  } catch {
    throw new AiRequestError('offline');
  } finally {
    clearTimeout(timer);
  }
  if (response.status === 429) throw new AiRequestError('rateLimited');
  if (response.status === 402) throw new AiRequestError('freeUsed');
  if (response.status === 403) throw new AiRequestError('device');
  if (!response.ok) throw new AiRequestError('server');
  const reply = parseChatReply(await response.json().catch(() => null));
  if (!reply) throw new AiRequestError('server');
  return reply;
}
