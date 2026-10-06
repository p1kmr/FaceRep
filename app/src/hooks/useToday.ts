import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayISO, type ISODate } from '@/utils/dates';

/** Today's date; updates when the app returns to the foreground and at midnight. */
export function useToday(): ISODate {
  const [today, setToday] = useState(todayISO);

  useEffect(() => {
    const refresh = () => setToday(todayISO());
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(refresh, msToMidnight + 1000);
    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, [today]);

  return today;
}
