import type { AiError, CoachAction } from '@/services/ai/types';

import type { ChatMessage, ChatSummary, ProposedAction } from './types';

export const CHAT_HYDRATE = 'chat/hydrate';
export const CHAT_STARTED = 'chat/started';
export const CHAT_OPENED = 'chat/opened';
export const CHAT_DELETED = 'chat/deleted';
export const ALL_CHATS_DELETED = 'chat/allDeleted';
export const QUESTION_SENT = 'chat/questionSent';
export const ANSWER_RECEIVED = 'chat/answerReceived';
export const REQUEST_FAILED = 'chat/requestFailed';
export const ACTION_RESOLVED = 'chat/actionResolved';

export type ChatAction =
  | { type: typeof CHAT_HYDRATE; payload: { chats: ChatSummary[]; messages: ChatMessage[] } }
  | { type: typeof CHAT_STARTED; payload: { id: string } }
  | { type: typeof CHAT_OPENED; payload: { id: string; messages: ChatMessage[] } }
  | { type: typeof CHAT_DELETED; payload: { id: string; nextId: string } }
  | { type: typeof ALL_CHATS_DELETED; payload: { nextId: string } }
  | { type: typeof QUESTION_SENT; payload: ChatMessage }
  | { type: typeof ANSWER_RECEIVED; payload: { question: ChatMessage; answer: ChatMessage; actions: CoachAction[] } }
  | { type: typeof REQUEST_FAILED; payload: { questionId: string; error: AiError } }
  | { type: typeof ACTION_RESOLVED; payload: { messageId: string; index: number; status: Exclude<ProposedAction['status'], 'pending'> } };

/** History and the most recent chat's messages (`messages` belong to `chats[0]`). */
export const hydrateChat = (chats: ChatSummary[], messages: ChatMessage[]): ChatAction => ({ type: CHAT_HYDRATE, payload: { chats, messages } });
/** A new, empty chat opens (`id` from the provider: reducers never make ids). */
export const chatStarted = (id: string): ChatAction => ({ type: CHAT_STARTED, payload: { id } });
export const chatOpened = (id: string, messages: ChatMessage[]): ChatAction => ({ type: CHAT_OPENED, payload: { id, messages } });
/** Deleting the open chat opens a new one, `nextId`. */
export const chatDeleted = (id: string, nextId: string): ChatAction => ({ type: CHAT_DELETED, payload: { id, nextId } });
export const allChatsDeleted = (nextId: string): ChatAction => ({ type: ALL_CHATS_DELETED, payload: { nextId } });
export const questionSent = (question: ChatMessage): ChatAction => ({ type: QUESTION_SENT, payload: question });
export const answerReceived = (question: ChatMessage, answer: ChatMessage, actions: CoachAction[] = []): ChatAction => ({
  type: ANSWER_RECEIVED,
  payload: { question, answer, actions },
});
export const requestFailed = (questionId: string, error: AiError): ChatAction => ({ type: REQUEST_FAILED, payload: { questionId, error } });
/** The user confirmed (done) or declined a proposed action. */
export const actionResolved = (messageId: string, index: number, status: 'done' | 'declined'): ChatAction => ({
  type: ACTION_RESOLVED,
  payload: { messageId, index, status },
});
