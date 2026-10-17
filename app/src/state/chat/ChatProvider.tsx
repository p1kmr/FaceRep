import { router } from 'expo-router';
import { createContext, useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CHAT_LIMITS } from '@/constants/limits';
import { usePlan } from '@/hooks/usePlan';
import { usePremium, usePremiumDispatch } from '@/hooks/usePremium';
import { useReminders } from '@/hooks/useReminders';
import { useLogWorkout, useProgressSummary } from '@/hooks/useProgress';
import { useSettings } from '@/hooks/useSettings';
import { requestChat } from '@/services/ai/client';
import { AiRequestError, type CoachAction, type LogAction } from '@/services/ai/types';
import { addMessage, clearMessages, loadMessages } from '@/services/chat/chatRepo';
import { loggedWorkout, type LoggedWorkout, type PlanToday } from '@/services/progress/log';
import { aiAnswerUsed, aiFreeUsedUp } from '@/state/premium/actions';
import { todayISO } from '@/utils/dates';
import { createId } from '@/utils/ids';

import { actionResolved, answerReceived, chatCleared, hydrateChat, questionSent, requestFailed } from './actions';
import { chatReducer, historyFor, initialChatState } from './reducer';
import type { ChatState } from './types';

interface ChatContextValue extends ChatState {
  thinking: boolean;
  /** False when it didn't send (consent or paywall opened, busy, empty): keep the draft. */
  send: (question: string) => boolean;
  retry: () => void;
  clear: () => void;
  /** Confirm (apply) or decline something the Coach proposed under answer `messageId`. */
  resolveAction: (messageId: string, index: number, accept: boolean) => Promise<void>;
  /** What confirming a proposed log would save (the card shows it), or null when there's nothing to save. */
  previewLog: (action: LogAction) => LoggedWorkout | null;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * The AI Coach. History is saved in SQLite on this iPhone only. Each question sends the last few
 * turns plus an anonymous training context (goal, streak) and the reminder list (names, times, days)
 * after AI consent. Only answered questions count toward the free monthly allowance. What the Coach
 * proposes (reminder changes, a workout to save or to start) happens only when the user confirms it.
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation('coach');
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const { aiConsent, goal } = useSettings();
  const { isPremium, freeAiLeft, appUserId, month } = usePremium();
  const premiumDispatch = usePremiumDispatch();
  const { streak, workoutsLast7Days } = useProgressSummary();
  const reminderList = useReminders();
  const { next: nextPlanDay, today: planDay } = usePlan();
  const logWorkout = useLogWorkout();
  const lastQuestion = useRef('');
  // A workout saved today counts for the plan only as the next plan day, when it is ready (same as the Start button).
  const planToday = useMemo<PlanToday | null>(
    () => (nextPlanDay && planDay.status === 'ready' ? { ref: nextPlanDay, items: planDay.items } : null),
    [nextPlanDay, planDay],
  );
  const previewLog = useCallback((action: LogAction) => loggedWorkout(action, todayISO(), planToday), [planToday]);
  const thinking = state.pending !== null;

  useEffect(() => {
    loadMessages()
      .then((messages) => dispatch(hydrateChat(messages)))
      .catch(() => dispatch(hydrateChat([])));
  }, []);

  const ask = useCallback(
    async (text: string, userId: string) => {
      const question = { id: createId(), role: 'user' as const, text, createdAt: new Date().toISOString() };
      const history = historyFor(state);
      lastQuestion.current = text;
      dispatch(questionSent(question));
      try {
        const reply = await requestChat({
          appUserId: userId,
          locale: i18n.language,
          question: text,
          history,
          context: { goal, streak, workoutsLast7Days },
          reminders: reminderList.reminders.map(({ id, title, kind, enabled, times, days }) => ({ id, title, kind, enabled, times, days })),
        });
        // An answer that is only a proposal still gets a line of text in the history.
        const answerText = reply.answer || t('actions.prepared');
        const answer = { id: createId(), role: 'assistant' as const, text: answerText, createdAt: new Date().toISOString() };
        dispatch(answerReceived(answer, reply.actions));
        premiumDispatch(aiAnswerUsed(month));
        await addMessage(question).catch(() => {});
        await addMessage(answer).catch(() => {});
      } catch (err) {
        const kind = err instanceof AiRequestError ? err.kind : 'server';
        if (kind === 'freeUsed') premiumDispatch(aiFreeUsedUp(month));
        dispatch(requestFailed(kind));
      }
    },
    [state, i18n.language, t, goal, streak, workoutsLast7Days, reminderList.reminders, premiumDispatch, month],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim().slice(0, CHAT_LIMITS.questionChars);
      if (!text || thinking || !appUserId) return false;
      if (!aiConsent) {
        router.push('/ai-consent');
        return false;
      }
      if (!isPremium && freeAiLeft <= 0) {
        router.push('/paywall');
        return false;
      }
      ask(text, appUserId);
      return true;
    },
    [thinking, appUserId, aiConsent, isPremium, freeAiLeft, ask],
  );

  const retry = useCallback(() => {
    if (lastQuestion.current) send(lastQuestion.current);
  }, [send]);

  const clear = useCallback(() => {
    dispatch(chatCleared());
    clearMessages().catch(() => {});
  }, []);

  const apply = useCallback(
    async (a: CoachAction): Promise<boolean> => {
      if (a.type === 'routine') {
        router.push({ pathname: '/workout', params: { ids: a.exercises.join(','), kind: 'single' } });
        return true;
      }
      if (a.type === 'log') {
        const workout = previewLog(a);
        if (!workout) return false;
        await logWorkout(workout);
        return true;
      }
      if (a.type === 'create') {
        const { type: _type, ...fields } = a;
        return reminderList.save({ id: createId(), enabled: true, ...fields });
      }
      const existing = reminderList.reminders.find((r) => r.id === a.id);
      if (!existing) return false;
      if (a.type === 'delete') {
        reminderList.remove(a.id);
        return true;
      }
      const { type: _type, id: _id, ...changes } = a;
      return reminderList.save({ ...existing, ...changes });
    },
    [reminderList, previewLog, logWorkout],
  );

  const resolveAction = useCallback(
    async (messageId: string, index: number, accept: boolean) => {
      const proposed = state.actions[messageId]?.[index];
      if (!proposed || proposed.status !== 'pending') return;
      if (!accept) {
        dispatch(actionResolved(messageId, index, 'declined'));
        return;
      }
      // When it can't be saved (limits), `save` explains why and the card stays open.
      if (await apply(proposed.action)) dispatch(actionResolved(messageId, index, 'done'));
    },
    [state.actions, apply],
  );

  return <ChatContext.Provider value={{ ...state, thinking, send, retry, clear, resolveAction, previewLog }}>{children}</ChatContext.Provider>;
}
