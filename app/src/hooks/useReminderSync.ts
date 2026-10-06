import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { syncDailyReminder } from '@/services/notifications/reminder';

import { useSettings } from './useSettings';

/** Keeps the scheduled daily reminder in line with Settings (time, on/off, language). */
export function useReminderSync() {
  const { t, i18n } = useTranslation('notifications');
  const { reminder, onboardingDone } = useSettings();
  const time = onboardingDone && reminder.enabled ? reminder.time : null;

  useEffect(() => {
    syncDailyReminder(time, { title: t('daily.title'), body: t('daily.body') }).catch(() => {});
  }, [time, t, i18n.language]);
}
