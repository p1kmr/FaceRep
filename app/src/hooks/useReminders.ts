import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { REMINDER } from '@/constants/reminders';
import { ensureNotificationPermission, openSystemSettings } from '@/services/notifications/reminder';
import { saveProblem, type Reminder } from '@/services/reminders/reminders';
import { deleteReminder, saveReminder } from '@/state/settings/actions';

import { useSettings, useSettingsDispatch } from './useSettings';

/**
 * The reminder list and the two things screens (and the Coach's confirm card) do with it.
 * `save` checks the limits, asks for notification permission when needed, and explains a "no".
 */
export function useReminders() {
  const { t } = useTranslation(['reminders', 'common']);
  const { reminders } = useSettings();
  const dispatch = useSettingsDispatch();

  const save = async (r: Reminder): Promise<boolean> => {
    const problem = saveProblem(reminders, r);
    if (problem) {
      Alert.alert(t('reminders:title'), t(`reminders:errors.${problem}`, { max: REMINDER.max }));
      return false;
    }
    if (r.enabled && !(await ensureNotificationPermission().catch(() => false))) {
      // Saved anyway: it starts working as soon as notifications are turned on.
      Alert.alert(t('reminders:permission.deniedTitle'), t('reminders:permission.denied'), [
        { text: t('common:cancel'), style: 'cancel' },
        { text: t('reminders:permission.open'), onPress: openSystemSettings },
      ]);
    }
    dispatch(saveReminder(r));
    return true;
  };

  const remove = (id: string) => dispatch(deleteReminder(id));

  return { reminders, save, remove, canAdd: reminders.length < REMINDER.max };
}
