import type { AiError, CoachAction } from '@/services/ai/types';
import type { ChatSummary, StoredMessage } from '@/services/chat/chatRepo';

export type ChatMessage = StoredMessage;
export type { ChatSummary };

/** Something the Coach proposed (a reminder change, a workout to save or to start), and what the user did with it. */
export interface ProposedAction {
  action: CoachAction;
  status: 'pending' | 'done' | 'declined';
}

export interface ChatState {
  hydrated: boolean;
  /** The open chat. A new one has an id but is saved only with its first answer. */
  chatId: string;
  /** Saved chats (History), the most recent first. */
  chats: ChatSummary[];
  /** The open chat's messages. */
  messages: ChatMessage[];
  /** The question waiting for an answer (shown with typing dots, saved only once answered). */
  pending: ChatMessage | null;
  error: AiError | null;
  /**
   * Proposed actions per answer id (ids are unique across chats, so a card waits while another chat is open). Kept in
   * memory only: after a restart the answer stays in its chat but its cards don't (nothing was changed unless the user
   * confirmed).
   */
  actions: Record<string, ProposedAction[]>;
}
