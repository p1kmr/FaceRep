import type { AiError, CoachAction } from '@/services/ai/types';
import type { StoredMessage } from '@/services/chat/chatRepo';

export type ChatMessage = StoredMessage;

/** Something the Coach proposed (a reminder change, a workout to save or to start), and what the user did with it. */
export interface ProposedAction {
  action: CoachAction;
  status: 'pending' | 'done' | 'declined';
}

export interface ChatState {
  hydrated: boolean;
  messages: ChatMessage[];
  /** The question waiting for an answer (shown with typing dots, saved only once answered). */
  pending: ChatMessage | null;
  error: AiError | null;
  /**
   * Proposed actions per answer id. Kept in memory only: after a restart the answer stays
   * in the history but its cards don't (nothing was changed unless the user confirmed).
   */
  actions: Record<string, ProposedAction[]>;
}
