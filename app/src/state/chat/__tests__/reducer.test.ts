import { CHAT_LIMITS } from '@/constants/limits';

import {
  actionResolved,
  allChatsDeleted,
  answerReceived,
  chatDeleted,
  chatOpened,
  chatStarted,
  hydrateChat,
  questionSent,
  requestFailed,
} from '../actions';
import { chatReducer, historyFor, initialChatState } from '../reducer';
import type { ChatMessage, ChatState } from '../types';

const m = (id: string, role: ChatMessage['role'] = 'user', createdAt = '2026-10-06T10:00:00Z'): ChatMessage => ({ id, role, text: id, createdAt });
const fresh: ChatState = { ...initialChatState, chatId: 'new' };
/** Asks `q` in the open chat and gets answer `a`. */
const turn = (s: ChatState, q: string, a: string, at = '2026-10-06T10:00:05Z') =>
  chatReducer(chatReducer(s, questionSent(m(q))), answerReceived(m(q), m(a, 'assistant', at)));

describe('chatReducer', () => {
  it('opens the most recent chat once History has loaded', () => {
    const chats = [
      { id: 'c2', title: 'Jaw routine?', updatedAt: '2026-10-06T10:00:00Z' },
      { id: 'c1', title: 'Mewing?', updatedAt: '2026-10-05T10:00:00Z' },
    ];
    const s = chatReducer(fresh, hydrateChat(chats, [m('q'), m('a', 'assistant')]));
    expect(s).toMatchObject({ hydrated: true, chatId: 'c2', chats });
    expect(s.messages.map((x) => x.id)).toEqual(['q', 'a']);
  });

  it('keeps the new chat when nothing is saved yet', () => {
    expect(chatReducer(fresh, hydrateChat([], []))).toMatchObject({ hydrated: true, chatId: 'new', chats: [], messages: [] });
  });

  it('a question joins the chat only together with its answer; the chat is named after its first question', () => {
    let s = chatReducer(fresh, questionSent(m('How long?')));
    expect(s.messages).toEqual([]);
    expect(s.pending?.id).toBe('How long?');
    s = chatReducer(s, answerReceived(m('How long?'), m('a1', 'assistant', '2026-10-06T10:00:05Z')));
    expect(s.messages.map((x) => x.id)).toEqual(['How long?', 'a1']);
    expect(s.pending).toBeNull();
    expect(s.chats).toEqual([{ id: 'new', title: 'How long?', updatedAt: '2026-10-06T10:00:05Z' }]);
    s = turn(s, 'And then?', 'a2', '2026-10-06T10:05:00Z');
    expect(s.chats).toEqual([{ id: 'new', title: 'How long?', updatedAt: '2026-10-06T10:05:00Z' }]);
  });

  it('a chat that gets an answer goes to the top of History', () => {
    const chats = [
      { id: 'c2', title: 'Newer', updatedAt: '2026-10-06T10:00:00Z' },
      { id: 'c1', title: 'Older', updatedAt: '2026-10-05T10:00:00Z' },
    ];
    let s = chatReducer(fresh, hydrateChat(chats, []));
    s = chatReducer(s, chatOpened('c1', [m('Older'), m('x', 'assistant')]));
    s = turn(s, 'More?', 'y', '2026-10-07T08:00:00Z');
    expect(s.chats.map((c) => [c.id, c.title])).toEqual([
      ['c1', 'Older'],
      ['c2', 'Newer'],
    ]);
    expect(s.messages.map((x) => x.id)).toEqual(['Older', 'x', 'More?', 'y']);
  });

  it('History keeps at most storedChats chats', () => {
    const chats = Array.from({ length: CHAT_LIMITS.storedChats }, (_, i) => ({ id: `c${i}`, title: `t${i}`, updatedAt: '2026-10-05T10:00:00Z' }));
    let s = chatReducer(fresh, hydrateChat(chats, []));
    s = chatReducer(s, chatStarted('newest'));
    s = turn(s, 'q', 'a');
    expect(s.chats).toHaveLength(CHAT_LIMITS.storedChats);
    expect(s.chats[0].id).toBe('newest');
    expect(s.chats.map((c) => c.id)).not.toContain(`c${CHAT_LIMITS.storedChats - 1}`);
  });

  it('a new chat starts empty; the one before stays in History and can be opened again', () => {
    let s = turn(fresh, 'q1', 'a1');
    s = chatReducer(s, chatStarted('next'));
    expect(s).toMatchObject({ chatId: 'next', messages: [], pending: null, error: null });
    expect(s.chats.map((c) => c.id)).toEqual(['new']);
    s = chatReducer(s, chatOpened('new', [m('q1'), m('a1', 'assistant')]));
    expect(s.chatId).toBe('new');
    expect(s.messages.map((x) => x.id)).toEqual(['q1', 'a1']);
  });

  it('a failed request drops the question and keeps the error, until another chat opens', () => {
    let s = chatReducer(fresh, questionSent(m('q')));
    s = chatReducer(s, requestFailed('q', 'offline'));
    expect(s).toMatchObject({ messages: [], pending: null, error: 'offline' });
    expect(chatReducer(s, chatStarted('next')).error).toBeNull();
  });

  it('deleting another chat only takes it out of History', () => {
    const chats = [
      { id: 'c2', title: 'Open', updatedAt: '2026-10-06T10:00:00Z' },
      { id: 'c1', title: 'Other', updatedAt: '2026-10-05T10:00:00Z' },
    ];
    const s = chatReducer(chatReducer(fresh, hydrateChat(chats, [m('q'), m('a', 'assistant')])), chatDeleted('c1', 'next'));
    expect(s.chatId).toBe('c2');
    expect(s.messages).toHaveLength(2);
    expect(s.chats.map((c) => c.id)).toEqual(['c2']);
  });

  it('deleting the open chat opens a new one, and its waiting question gets no answer there', () => {
    let s = turn(fresh, 'q1', 'a1');
    s = chatReducer(s, questionSent(m('q2')));
    s = chatReducer(s, chatDeleted('new', 'next'));
    expect(s).toMatchObject({ chatId: 'next', chats: [], messages: [], pending: null });
    expect(chatReducer(s, answerReceived(m('q2'), m('a2', 'assistant')))).toBe(s);
    expect(chatReducer(s, requestFailed('q2', 'server'))).toBe(s);
  });

  it('deleting all chats empties History and the cards', () => {
    const create = { type: 'create' as const, kind: 'mewing' as const, title: '', times: ['10:00'], days: [1] };
    let s = chatReducer(fresh, questionSent(m('q')));
    s = chatReducer(s, answerReceived(m('q'), m('a', 'assistant'), [create]));
    s = chatReducer(s, allChatsDeleted('next'));
    expect(s).toMatchObject({ chatId: 'next', chats: [], messages: [], pending: null, error: null, actions: {} });
  });

  it('sends at most historyTurns earlier messages, from the open chat only', () => {
    const many = Array.from({ length: 30 }, (_, i) => m(`m${i}`));
    let s = chatReducer(fresh, hydrateChat([{ id: 'c1', title: 'm0', updatedAt: '2026-10-06T10:00:00Z' }], many));
    expect(historyFor(s)).toHaveLength(CHAT_LIMITS.historyTurns);
    expect(historyFor(s)[0]).toEqual({ role: 'user', text: 'm20' });
    s = chatReducer(s, chatStarted('next'));
    expect(historyFor(s)).toEqual([]);
  });

  it('keeps proposed reminder changes with their answer until the user confirms or declines, also in another chat', () => {
    const create = { type: 'create' as const, kind: 'mewing' as const, title: '', times: ['10:00'], days: [1] };
    let s = chatReducer(fresh, questionSent(m('q')));
    s = chatReducer(s, answerReceived(m('q'), m('a', 'assistant'), [create, { type: 'delete', id: 'workout' }]));
    expect(s.actions.a.map((p) => p.status)).toEqual(['pending', 'pending']);
    s = chatReducer(s, chatStarted('next'));
    s = chatReducer(s, actionResolved('a', 0, 'done'));
    s = chatReducer(s, actionResolved('a', 1, 'declined'));
    expect(s.actions.a.map((p) => p.status)).toEqual(['done', 'declined']);
    expect(chatReducer(s, actionResolved('a', 0, 'declined'))).toBe(s); // resolved once only
  });
});
