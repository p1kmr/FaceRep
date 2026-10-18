import { CHAT_LIMITS } from '@/constants/limits';

import {
  ACTION_RESOLVED,
  ALL_CHATS_DELETED,
  ANSWER_RECEIVED,
  CHAT_DELETED,
  CHAT_HYDRATE,
  CHAT_OPENED,
  CHAT_STARTED,
  QUESTION_SENT,
  REQUEST_FAILED,
  type ChatAction,
} from './actions';
import type { ChatMessage, ChatState, ChatSummary } from './types';

export const initialChatState: ChatState = { hydrated: false, chatId: '', chats: [], messages: [], pending: null, error: null, actions: {} };

const keepRecent = <T>(list: T[]) => list.slice(-CHAT_LIMITS.storedMessages);

/** Another chat opens: nothing is waiting or failed in it. */
const open = (state: ChatState, chatId: string, messages: ChatMessage[]): ChatState => ({
  ...state,
  chatId,
  messages: keepRecent(messages),
  pending: null,
  error: null,
});

/** A chat that got an answer goes to the top of History; a new one is named after its first question. */
function touch(chats: ChatSummary[], id: string, title: string, updatedAt: string): ChatSummary[] {
  const saved = chats.find((c) => c.id === id);
  return [{ id, title: saved?.title ?? title, updatedAt }, ...chats.filter((c) => c.id !== id)].slice(0, CHAT_LIMITS.storedChats);
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case CHAT_HYDRATE: {
      // The most recent chat opens (the Coach goes on where it was); with none saved, the new chat stays.
      const { chats, messages } = action.payload;
      return chats.length ? { ...open(state, chats[0].id, messages), hydrated: true, chats } : { ...state, hydrated: true, chats };
    }
    case CHAT_STARTED:
      return open(state, action.payload.id, []);
    case CHAT_OPENED:
      return open(state, action.payload.id, action.payload.messages);
    case CHAT_DELETED: {
      const { id, nextId } = action.payload;
      const chats = state.chats.filter((c) => c.id !== id);
      return id === state.chatId ? { ...open(state, nextId, []), chats } : { ...state, chats };
    }
    case ALL_CHATS_DELETED:
      return { ...open(state, action.payload.nextId, []), chats: [], actions: {} };
    case QUESTION_SENT:
      return { ...state, pending: action.payload, error: null };
    case ANSWER_RECEIVED: {
      // The question and its answer join the chat together; proposed changes wait for the user. A question dropped
      // meanwhile (its chat deleted) gets no answer here.
      const { question, answer, actions } = action.payload;
      if (state.pending?.id !== question.id) return state;
      return {
        ...state,
        messages: keepRecent([...state.messages, question, answer]),
        chats: touch(state.chats, state.chatId, question.text, answer.createdAt),
        pending: null,
        error: null,
        actions: actions.length ? { ...state.actions, [answer.id]: actions.map((a) => ({ action: a, status: 'pending' as const })) } : state.actions,
      };
    }
    case ACTION_RESOLVED: {
      const { messageId, index, status } = action.payload;
      const list = state.actions[messageId];
      if (!list?.[index] || list[index].status !== 'pending') return state;
      return { ...state, actions: { ...state.actions, [messageId]: list.map((p, i) => (i === index ? { ...p, status } : p)) } };
    }
    case REQUEST_FAILED:
      if (state.pending?.id !== action.payload.questionId) return state;
      return { ...state, pending: null, error: action.payload.error };
    default:
      return state;
  }
}

/** The open chat's last turns, sent along with a new question (the Worker accepts at most historyTurns). */
export function historyFor(state: ChatState) {
  return state.messages
    .slice(-CHAT_LIMITS.historyTurns)
    .map((m) => ({ role: m.role, text: m.text.slice(0, CHAT_LIMITS.turnChars) }));
}
