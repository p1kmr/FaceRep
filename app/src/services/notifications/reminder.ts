import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER } from '@/constants/reminders';

/** Show reminders as banners even while the app is open (called once at startup). */
export function configureNotifications() {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Asks only when needed; true when allowed. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** Replaces the daily workout reminder (or removes it when `time` is null). 'HH:mm', 24-hour. */
export async function syncDailyReminder(time: string | null, content: { title: string; body: string }): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(REMINDER.notificationId).catch(() => {});
  if (!time) return;
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER.notificationId,
    content,
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}
