import { bestStreak, currentStreak, totals, workoutDays } from '@/services/progress/stats';
import { addDays, type ISODate } from '@/utils/dates';

import type { ProgressState } from './types';

/** Everything the Today and Progress screens show, from the session list (memoize in the hook). */
export function selectProgressSummary(s: ProgressState, today: ISODate) {
  const days = workoutDays(s.sessions);
  const weekAgo = addDays(today, -6);
  return {
    streak: currentStreak(days, today),
    best: bestStreak(days),
    doneToday: days.has(today),
    workoutsLast7Days: s.sessions.filter((x) => x.day >= weekAgo && x.day <= today).length,
    totals: totals(s.sessions),
  };
}

export type ProgressSummary = ReturnType<typeof selectProgressSummary>;
