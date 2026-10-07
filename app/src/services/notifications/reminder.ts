import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import type { PlannedNotification } from '@/services/reminders/reminders';

const supported = Platform.OS !== 'web';

/** Show reminders as banners even while the app is open (called once at startup). */
export function configureNotifications() {
  if (!supported) return;
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
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** 'denied' = the user said no; only the iPhone Settings app can change it now. */
export async function notificationPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (!supported) return 'undetermined';
  const p = await Notifications.getPermissionsAsync();
  return p.granted ? 'granted' : p.canAskAgain ? 'undetermined' : 'denied';
}

/** This app's page in the iPhone Settings app (where notifications can be turned back on). */
export const openSystemSettings = () => Linking.openSettings().catch(() => {});

/**
 * Cancels everything, then schedules the plan as repeating notifications (daily, or weekly on one
 * weekday). iOS repeats them by itself, so they keep working without opening the app.
 */
export async function syncReminders(plan: PlannedNotification[], content: (reminderId: string) => { title: string; body: string }) {
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!plan.length || !(await Notifications.getPermissionsAsync()).granted) return;
  for (const n of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: n.id,
      content: { ...content(n.reminderId), data: { reminderId: n.reminderId } },
      trigger:
        n.weekday === undefined
          ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: n.hour, minute: n.minute }
          : { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: n.weekday, hour: n.hour, minute: n.minute },
    });
  }
}
