import { CONFIG } from '@/constants/config';

import { isExerciseId, type ExerciseId } from '@/constants/exercises';
import { REMINDER, REMINDER_KINDS, type ReminderKind } from '@/constants/reminders';
import { cleanDays, cleanTimes } from '@/services/reminders/reminders';

import { getDeviceCheckToken } from './deviceCheck';
import {
  AiRequestError,
  type ChatReply,
  type ChatTurn,
  type CoachAction,
  type CoachContext,
  type LogAction,
  type ReminderContext,
  type RoutineAction,
} from './types';

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const MAX_ACTIONS = 3;
/** Same limits as the Worker (worker/src/lib/workouts.js). */
export const WORKOUT_ACTION_LIMITS = { daysBack: 6, maxMinutes: 120, logMax: 12, routineMin: 2, routineMax: 8, titleChars: 40 };

const exerciseIds = (v: unknown, max: number): ExerciseId[] =>
  Array.isArray(v) ? [...new Set(v.filter(isExerciseId))].slice(0, max) : [];

/** A proposed workout to save or start; null when anything is off (an older catalog drops unknown exercises). */
function parseWorkoutAction(a: Record<string, unknown>): LogAction | RoutineAction | null {
  const L = WORKOUT_ACTION_LIMITS;
  if (a.type === 'routine') {
    const exercises = exerciseIds(a.exercises, L.routineMax);
    return exercises.length >= L.routineMin ? { type: 'routine', title: clip(a.title, L.titleChars), exercises } : null;
  }
  const daysAgo = a.daysAgo;
  if (typeof daysAgo !== 'number' || !Number.isInteger(daysAgo) || daysAgo < 0 || daysAgo > L.daysBack) return null;
  const plan = a.plan === true && daysAgo === 0;
  const exercises = exerciseIds(a.exercises, L.logMax);
  const m = a.minutes;
  const minutes = typeof m === 'number' && Number.isInteger(m) && m >= 1 && m <= L.maxMinutes ? m : null;
  return plan || exercises.length || minutes ? { type: 'log', daysAgo, plan, exercises, minutes } : null;
}

/** One proposed action, checked like everything else from the server; null when malformed. */
function parseAction(value: unknown): CoachAction | null {
  const a = value as Record<string, unknown> | null;
  if (!a || typeof a !== 'object') return null;
  if (a.type === 'log' || a.type === 'routine') return parseWorkoutAction(a);
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
  const change: Extract<CoachAction, { type: 'update' }> = { type: 'update', id: a.id };
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
  const actions = Array.isArray(v?.actions) ? v.actions.map(parseAction).filter((x): x is CoachAction => !!x).slice(0, MAX_ACTIONS) : [];
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
