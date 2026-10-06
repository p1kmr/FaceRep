import { CHAT_LIMITS } from '@/constants/limits';

import { answerReceived, chatCleared, hydrateChat, questionSent, requestFailed } from '../actions';
import { chatReducer, historyFor, initialChatState } from '../reducer';
import type { ChatMessage } from '../types';

const m = (id: string, role: ChatMessage['role'] = 'user'): ChatMessage => ({ id, role, text: id, createdAt: '2026-10-06T10:00:00Z' });

describe('chatReducer', () => {
  it('a question joins the history only together with its answer', () => {
    let s = chatReducer(initialChatState, hydrateChat([m('old')]));
    s = chatReducer(s, questionSent(m('q')));
    expect(s.messages.map((x) => x.id)).toEqual(['old']);
    expect(s.pending?.id).toBe('q');
    s = chatReducer(s, answerReceived(m('a', 'assistant')));
    expect(s.messages.map((x) => x.id)).toEqual(['old', 'q', 'a']);
    expect(s.pending).toBeNull();
  });

  it('a failed request drops the question and keeps the error', () => {
    let s = chatReducer(initialChatState, questionSent(m('q')));
    s = chatReducer(s, requestFailed('offline'));
    expect(s).toMatchObject({ messages: [], pending: null, error: 'offline' });
    expect(chatReducer(s, chatCleared()).error).toBeNull();
  });

  it('sends at most historyTurns earlier messages', () => {
    const many = Array.from({ length: 30 }, (_, i) => m(`m${i}`));
    const s = chatReducer(initialChatState, hydrateChat(many));
    expect(historyFor(s)).toHaveLength(CHAT_LIMITS.historyTurns);
    expect(historyFor(s)[0]).toEqual({ role: 'user', text: 'm20' });
  });
});
