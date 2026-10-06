import * as Haptics from 'expo-haptics';

let enabled = true;

/** Settings → Haptics. Called by the SettingsProvider whenever the setting changes. */
export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

const run = (fn: () => Promise<void>) => {
  if (enabled) fn().catch(() => {});
};

// One place for haptics so every tap feels the same. Failures (web, old devices) are ignored.
export const haptics = {
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  select: () => run(() => Haptics.selectionAsync()),
  /** Start of a hold: a firm bump you can feel without looking. */
  squeeze: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  release: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
