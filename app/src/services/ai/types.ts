import type { Goal } from '@/constants/exercises';

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

export interface ChatReply {
  answer: string;
}
