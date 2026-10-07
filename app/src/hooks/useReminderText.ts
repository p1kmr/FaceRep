import { useTranslation } from 'react-i18next';

import { daysPattern, type Reminder } from '@/services/reminders/reminders';
import { formatTime, weekdayShortOf } from '@/utils/format';

import { useFirstWeekday } from './useFirstWeekday';

/** How a reminder reads in lists and cards: its name and "Weekdays · 10:00 AM, 2:00 PM". */
export function useReminderText() {
  const { t, i18n } = useTranslation('reminders');
  const first = useFirstWeekday();
  const lang = i18n.language;
  const name = (r: Pick<Reminder, 'title' | 'kind'>) => r.title || t(`kinds.${r.kind}`);
  const days = (list: readonly number[]) => {
    const pattern = daysPattern(list);
    if (pattern !== 'some') return t(`days.${pattern}`);
    // In the order of the user's week (Monday first in most of the world).
    return [...list]
      .sort((a, b) => ((a - first + 7) % 7) - ((b - first + 7) % 7))
      .map((d) => weekdayShortOf(d, lang))
      .join(', ');
  };
  const times = (list: readonly string[]) => list.map((x) => formatTime(x, lang)).join(', ');
  const summary = (r: Pick<Reminder, 'days' | 'times'>) => t('summary', { days: days(r.days), times: times(r.times) });
  return { name, days, times, summary };
}
