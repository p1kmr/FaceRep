import type { ExerciseId, Goal } from '@/constants/exercises';
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

/**
 * A workout the user says they did without the app (or forgot to save), to save on a day 0–6 days back. exercises: the
 * ones they named (may be empty). minutes: only when they said. Saved only on Confirm.
 */
export interface LogAction {
  type: 'log';
  daysAgo: number;
  exercises: ExerciseId[];
  minutes: number | null;
}

/** A short routine to start now; it starts only when the user taps Start. */
export interface RoutineAction {
  type: 'routine';
  title: string;
  exercises: ExerciseId[];
}

/** Anything the Coach can propose. Nothing happens until the user confirms it on its card. */
export type CoachAction = ReminderAction | LogAction | RoutineAction;

/** What the Coach gets to know about the user's reminders, so it can change them when asked. */
export type ReminderContext = Pick<Reminder, 'id' | 'title' | 'kind' | 'enabled' | 'times' | 'days'>;

export interface ChatReply {
  /** Can be empty when the Coach only proposed actions. */
  answer: string;
  actions: CoachAction[];
}
