import { CONFIG } from '@/constants/config';

import { REMINDER, REMINDER_KINDS, type ReminderKind } from '@/constants/reminders';
import { cleanDays, cleanTimes } from '@/services/reminders/reminders';

import { getDeviceCheckToken } from './deviceCheck';
import { AiRequestError, type ChatReply, type ChatTurn, type CoachContext, type ReminderAction, type ReminderContext } from './types';

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const MAX_ACTIONS = 3;

/** One proposed reminder change, checked like everything else from the server; null when malformed. */
function parseAction(value: unknown): ReminderAction | null {
  const a = value as Record<string, unknown> | null;
  if (!a || typeof a !== 'object') return null;
  if (a.type === 'create') {
    const times = cleanTimes(a.times);
    const days = cleanDays(a.days);
    if (!times || !days) return null;
    const kind = REMINDER_KINDS.includes(a.kind as ReminderKind) ? (a.kind as ReminderKind) : 'custom';
    return { type: 'create', kind, title: clip(a.title, REMINDER.titleMax), times, days };
  }
  if (typeof a.id !== 'string' || !a.id) return null;
  if (a.type === 'delete') return { type: 'delete', id: a.id };
  if (a.type !== 'update') return null;
  const change: Extract<ReminderAction, { type: 'update' }> = { type: 'update', id: a.id };
  if (typeof a.title === 'string') change.title = clip(a.title, REMINDER.titleMax);
  if (a.times !== undefined) change.times = cleanTimes(a.times) ?? undefined;
  if (a.days !== undefined) change.days = cleanDays(a.days) ?? undefined;
  if (typeof a.enabled === 'boolean') change.enabled = a.enabled;
  if ((a.times !== undefined && !change.times) || (a.days !== undefined && !change.days)) return null;
  return Object.keys(change).length > 2 ? change : null;
}

/** Accepts only the expected shape, trimmed to a sane length (never render unchecked server text). */
export function parseChatReply(value: unknown): ChatReply | null {
  const v = value as { answer?: unknown; actions?: unknown } | null;
  const answer = clip(v?.answer, 1500);
  const actions = Array.isArray(v?.actions) ? v.actions.map(parseAction).filter((x): x is ReminderAction => !!x).slice(0, MAX_ACTIONS) : [];
  return answer || actions.length ? { answer, actions } : null;
}

/**
 * POST to our own proxy (the Cloudflare Worker in worker/). The model and its keys live only
 * there. Status codes: 429 too many today, 402 free answers used up, 403 not a verified iPhone.
 */
export async function requestChat(
  input: { appUserId: string; locale: string; question: string; history: ChatTurn[]; context: CoachContext; reminders: ReminderContext[] },
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
