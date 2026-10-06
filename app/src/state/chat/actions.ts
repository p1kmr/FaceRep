import type { AiError } from '@/services/ai/types';

import type { ChatMessage } from './types';

export const CHAT_HYDRATE = 'chat/hydrate';
export const QUESTION_SENT = 'chat/questionSent';
export const ANSWER_RECEIVED = 'chat/answerReceived';
export const REQUEST_FAILED = 'chat/requestFailed';
export const CHAT_CLEARED = 'chat/cleared';

export type ChatAction =
  | { type: typeof CHAT_HYDRATE; payload: ChatMessage[] }
  | { type: typeof QUESTION_SENT; payload: ChatMessage }
  | { type: typeof ANSWER_RECEIVED; payload: ChatMessage }
  | { type: typeof REQUEST_FAILED; payload: AiError }
  | { type: typeof CHAT_CLEARED };

export const hydrateChat = (messages: ChatMessage[]): ChatAction => ({ type: CHAT_HYDRATE, payload: messages });
export const questionSent = (question: ChatMessage): ChatAction => ({ type: QUESTION_SENT, payload: question });
export const answerReceived = (answer: ChatMessage): ChatAction => ({ type: ANSWER_RECEIVED, payload: answer });
export const requestFailed = (error: AiError): ChatAction => ({ type: REQUEST_FAILED, payload: error });
export const chatCleared = (): ChatAction => ({ type: CHAT_CLEARED });
