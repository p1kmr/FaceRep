import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { syncReminders } from '@/services/notifications/reminder';
import { planNotifications } from '@/services/reminders/reminders';

import { useSettings } from './useSettings';

/** Keeps the scheduled notifications in line with the reminder list (and the app language). */
export function useReminderSync() {
  const { t, i18n } = useTranslation('notifications');
  const { reminders, onboardingDone } = useSettings();
  const plan = useMemo(() => (onboardingDone ? planNotifications(reminders) : []), [reminders, onboardingDone]);

  useEffect(() => {
    const byId = new Map(reminders.map((r) => [r.id, r]));
    syncReminders(plan, (id) => {
      const r = byId.get(id);
      const kind = r?.kind ?? 'custom';
      return { title: r?.title || t(`kinds.${kind}.title`), body: t(`kinds.${kind}.body`) };
    }).catch(() => {});
  }, [plan, reminders, t, i18n.language]);
}
