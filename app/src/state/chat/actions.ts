import type { AiError, ReminderAction } from '@/services/ai/types';

import type { ChatMessage, ProposedAction } from './types';

export const CHAT_HYDRATE = 'chat/hydrate';
export const QUESTION_SENT = 'chat/questionSent';
export const ANSWER_RECEIVED = 'chat/answerReceived';
export const REQUEST_FAILED = 'chat/requestFailed';
export const CHAT_CLEARED = 'chat/cleared';
export const ACTION_RESOLVED = 'chat/actionResolved';

export type ChatAction =
  | { type: typeof CHAT_HYDRATE; payload: ChatMessage[] }
  | { type: typeof QUESTION_SENT; payload: ChatMessage }
  | { type: typeof ANSWER_RECEIVED; payload: { answer: ChatMessage; actions: ReminderAction[] } }
  | { type: typeof REQUEST_FAILED; payload: AiError }
  | { type: typeof CHAT_CLEARED }
  | { type: typeof ACTION_RESOLVED; payload: { messageId: string; index: number; status: Exclude<ProposedAction['status'], 'pending'> } };

export const hydrateChat = (messages: ChatMessage[]): ChatAction => ({ type: CHAT_HYDRATE, payload: messages });
export const questionSent = (question: ChatMessage): ChatAction => ({ type: QUESTION_SENT, payload: question });
export const answerReceived = (answer: ChatMessage, actions: ReminderAction[] = []): ChatAction => ({
  type: ANSWER_RECEIVED,
  payload: { answer, actions },
});
export const requestFailed = (error: AiError): ChatAction => ({ type: REQUEST_FAILED, payload: error });
export const chatCleared = (): ChatAction => ({ type: CHAT_CLEARED });
/** The user confirmed (done) or declined a proposed reminder change. */
export const actionResolved = (messageId: string, index: number, status: 'done' | 'declined'): ChatAction => ({
  type: ACTION_RESOLVED,
  payload: { messageId, index, status },
});
