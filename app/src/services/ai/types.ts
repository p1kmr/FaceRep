import type { Goal } from '@/constants/exercises';
import type { ReminderKind } from '@/constants/reminders';
import type { Reminder } from '@/services/reminders/reminders';

/** freeUsed: the server says this month's free answers are gone; device: it couldn't verify this iPhone. */
export type AiError = 'notConfigured' | 'offline' | 'rateLimited' | 'freeUsed' | 'device' | 'server';

export class AiRequestError extends Error {
  constructor(readonly kind: AiError) {
    super(kind);
  }
}

/** One chat message as sent to the server. */
export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

/** Anonymous training context so the Coach can personalise (no names, no photos, no history). */
export interface CoachContext {
  goal: Goal;
  streak: number;
  workoutsLast7Days: number;
}

/**
 * A reminder change the Coach proposes. Nothing happens until the user taps Confirm on its card.
 * update: only the fields that change; enabled false = pause, true = turn back on.
 */
export type ReminderAction =
  | { type: 'create'; kind: ReminderKind; title: string; times: string[]; days: number[] }
  | { type: 'update'; id: string; title?: string; times?: string[]; days?: number[]; enabled?: boolean }
  | { type: 'delete'; id: string };

/** What the Coach gets to know about the user's reminders, so it can change them when asked. */
export type ReminderContext = Pick<Reminder, 'id' | 'title' | 'kind' | 'enabled' | 'times' | 'days'>;

export interface ChatReply {
  /** Can be empty when the Coach only proposed reminder changes. */
  answer: string;
  actions: ReminderAction[];
}
