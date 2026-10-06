import type { AiError } from '@/services/ai/types';
import type { StoredMessage } from '@/services/chat/chatRepo';

export type ChatMessage = StoredMessage;

export interface ChatState {
  hydrated: boolean;
  messages: ChatMessage[];
  /** The question waiting for an answer (shown with typing dots, saved only once answered). */
  pending: ChatMessage | null;
  error: AiError | null;
}
