import { useCalendars } from 'expo-localization';

/**
 * First day of the week from the iPhone's region settings (Settings → General → Language & Region),
 * as 0 = Sunday … 6 = Saturday. Monday when the device doesn't say (e.g. some web browsers).
 */
export function useFirstWeekday(): number {
  const [calendar] = useCalendars();
  const first = calendar?.firstWeekday; // expo-localization: 1 = Sunday … 7 = Saturday
  return first ? first - 1 : 1;
}
