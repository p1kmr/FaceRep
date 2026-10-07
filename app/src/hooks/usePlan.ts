import { useCallback, useContext, useEffect, useMemo } from 'react';

import { PLAN, type PlanDay, type PlanRef } from '@/constants/plan';
import { contentLevel, freeWeek, isFreeDay, nextPlanRef, planDates, planGrid, planItems, planProgress, weekOf } from '@/services/plan/plan';
import type { PlanError } from '@/services/plan/planApi';
import { workoutSeconds, type WorkoutItem } from '@/services/workout/items';
import { LoadPlanContext, PlanDispatchContext, PlanStateContext } from '@/state/plan/PlanProvider';
import { selectPremiumDays, selectRequest } from '@/state/plan/selectors';

import { usePremium } from './usePremium';
import { useProgressState } from './useProgress';
import { useSettings } from './useSettings';
import { useToday } from './useToday';

/**
 * What today's plan card shows:
 * ready (with the exercises), locked (a Premium day for a free user), loading or error (Premium
 * days not on the device yet).
 */
export type PlanToday =
  | { status: 'ready'; day: PlanDay; items: WorkoutItem[]; seconds: number }
  | { status: 'locked' }
  | { status: 'loading' }
  | { status: 'error'; error: PlanError };

/**
 * The 28-day plan for the Today screen and the player: where the user is, today's day, the 4×7
 * grid. Premium days are loaded from the Worker as soon as the user has Premium (so they are on
 * the device before they're needed, and buying unlocks them right away).
 */
export function usePlan() {
  const state = useContext(PlanStateContext);
  const loadPlan = useContext(LoadPlanContext);
  if (!state || !loadPlan) throw new Error('usePlan must be used inside <PlanProvider>');
  const { goal } = useSettings();
  const { isPremium, appUserId } = usePremium();
  const { sessions } = useProgressState();
  const today = useToday();

  const progress = useMemo(() => planProgress(sessions, today), [sessions, today]);
  /** The day the Start button counts for; when today's day is done, that day (practice again). */
  const next = useMemo(() => nextPlanRef(progress), [progress]);
  const ref = useMemo<PlanRef>(() => next ?? { level: progress.level, day: progress.day }, [next, progress]);
  const fetchLevel = contentLevel(ref.level);
  const premiumDays = selectPremiumDays(state, goal, fetchLevel);
  const request = selectRequest(state, goal, fetchLevel);

  useEffect(() => {
    if (!isPremium || !appUserId || !state.hydrated || premiumDays || request !== 'idle') return;
    loadPlan({ appUserId, goal, level: fetchLevel });
  }, [isPremium, appUserId, state.hydrated, premiumDays, request, goal, fetchLevel, loadPlan]);

  /** Any day of the level shown (today's, or one tapped in the grid). */
  const dayAt = useCallback(
    (n: number): PlanToday => {
      let day: PlanDay | undefined;
      if (isFreeDay({ level: ref.level, day: n })) day = freeWeek(goal)[n - 1];
      else if (!isPremium) return { status: 'locked' };
      else day = premiumDays?.find((d) => d.day === n);
      if (!day) return request === 'error' ? { status: 'error', error: state.error ?? 'server' } : { status: 'loading' };
      const items = planItems(day);
      return { status: 'ready', day, items, seconds: workoutSeconds(items) };
    },
    [ref.level, goal, isPremium, premiumDays, request, state.error],
  );
  const todayPlan = useMemo(() => dayAt(ref.day), [dayAt, ref.day]);

  // After a finished level the grid shows the next one, starting at day 1 (today).
  const shown = useMemo(
    () => (progress.finished && next ? { level: next.level, day: 1, completed: 0, doneToday: false, finished: false } : progress),
    [progress, next],
  );
  const dates = useMemo(() => planDates(sessions, shown, today), [sessions, shown, today]);
  const grid = useMemo(() => planGrid(shown, isPremium, dates), [shown, isPremium, dates]);

  return {
    progress,
    /** Level and day the next workout counts for (null when today's plan day is already done). */
    next,
    /** Level, week and day shown in the header. */
    showing: { level: ref.level, day: ref.day, week: weekOf(ref.day), weekName: PLAN.weeks[weekOf(ref.day) - 1], date: dates[ref.day - 1] },
    today: todayPlan,
    dayAt,
    /** The plan day a workout of day `n` counts for: only the next day; any other day is practice. */
    countsFor: (n: number): PlanRef | null => (next && next.day === n ? next : null),
    grid,
    retry: () => {
      if (appUserId) loadPlan({ appUserId, goal, level: fetchLevel });
    },
  };
}

export function usePlanDispatch() {
  const dispatch = useContext(PlanDispatchContext);
  if (!dispatch) throw new Error('usePlanDispatch must be used inside <PlanProvider>');
  return dispatch;
}
