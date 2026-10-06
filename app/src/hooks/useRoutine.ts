import { useMemo } from 'react';

import { buildDailyRoutine, routineSeconds } from '@/services/workout/routine';

import { useSettings } from './useSettings';
import { useToday } from './useToday';

/** Today's routine for the user's goal, and how long it takes. */
export function useRoutine() {
  const { goal } = useSettings();
  const today = useToday();
  return useMemo(() => {
    const ids = buildDailyRoutine(goal, today);
    return { ids, seconds: routineSeconds(ids), goal };
  }, [goal, today]);
}
