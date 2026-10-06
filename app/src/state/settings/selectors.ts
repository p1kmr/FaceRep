import type { SettingsState } from './types';

export const selectSettings = (s: SettingsState) => s.settings;
export const selectHydrated = (s: SettingsState) => s.hydrated;
export const selectThemeMode = (s: SettingsState) => s.settings.themeMode;
export const selectGoal = (s: SettingsState) => s.settings.goal;
export const selectOnboardingDone = (s: SettingsState) => s.settings.onboardingDone;
