import { CHAT_LIMITS } from '@/constants/limits';

import { ACTION_RESOLVED, ANSWER_RECEIVED, CHAT_CLEARED, CHAT_HYDRATE, QUESTION_SENT, REQUEST_FAILED, type ChatAction } from './actions';
import type { ChatState } from './types';

export const initialChatState: ChatState = { hydrated: false, messages: [], pending: null, error: null, actions: {} };

const keepRecent = <T>(list: T[]) => list.slice(-CHAT_LIMITS.storedMessages);

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case CHAT_HYDRATE:
      // A question asked while loading stays on top of the saved history.
      return { ...state, hydrated: true, messages: keepRecent([...action.payload, ...state.messages]) };
    case QUESTION_SENT:
      return { ...state, pending: action.payload, error: null };
    case ANSWER_RECEIVED: {
      // The question and its answer join the history together; proposed reminder changes wait for the user.
      const { answer, actions } = action.payload;
      return {
        ...state,
        messages: keepRecent([...state.messages, ...(state.pending ? [state.pending] : []), answer]),
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
      return { ...state, pending: null, error: action.payload };
    case CHAT_CLEARED:
      return { ...state, messages: [], pending: null, error: null, actions: {} };
    default:
      return state;
  }
}

/** The last turns sent along with a new question (the Worker accepts at most historyTurns). */
export function historyFor(state: ChatState) {
  return state.messages
    .slice(-CHAT_LIMITS.historyTurns)
    .map((m) => ({ role: m.role, text: m.text.slice(0, CHAT_LIMITS.turnChars) }));
}
