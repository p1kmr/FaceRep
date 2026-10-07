import type { Goal } from '@/constants/exercises';
import type { ThemeMode } from '@/constants/theme';
import type { ISODate } from '@/utils/dates';

import type { AskButtonSettings, ReminderSettings, Settings } from './types';

export const SETTINGS_HYDRATE = 'settings/hydrate';
export const THEME_MODE_SET = 'settings/themeModeSet';
export const GOAL_SET = 'settings/goalSet';
export const ONBOARDING_COMPLETE = 'settings/onboardingComplete';
export const REMINDER_SET = 'settings/reminderSet';
export const HAPTICS_SET = 'settings/hapticsSet';
export const AI_CONSENT_SET = 'settings/aiConsentSet';
export const REVIEW_PROMPTED = 'settings/reviewPrompted';
export const ASK_BUTTON_SET = 'settings/askButtonSet';
export const SETTINGS_RESET = 'settings/reset';

export type SettingsAction =
  | { type: typeof SETTINGS_HYDRATE; payload: Partial<Settings> | null }
  | { type: typeof THEME_MODE_SET; payload: ThemeMode }
  | { type: typeof GOAL_SET; payload: Goal }
  | { type: typeof ONBOARDING_COMPLETE; payload: { today: ISODate } }
  | { type: typeof REMINDER_SET; payload: Partial<ReminderSettings> }
  | { type: typeof HAPTICS_SET; payload: boolean }
  | { type: typeof AI_CONSENT_SET; payload: boolean }
  | { type: typeof REVIEW_PROMPTED; payload: ISODate }
  | { type: typeof ASK_BUTTON_SET; payload: Partial<AskButtonSettings> }
  | { type: typeof SETTINGS_RESET };

export const hydrateSettings = (saved: Partial<Settings> | null): SettingsAction => ({ type: SETTINGS_HYDRATE, payload: saved });
export const setThemeMode = (mode: ThemeMode): SettingsAction => ({ type: THEME_MODE_SET, payload: mode });
export const setGoal = (goal: Goal): SettingsAction => ({ type: GOAL_SET, payload: goal });
export const completeOnboarding = (today: ISODate): SettingsAction => ({ type: ONBOARDING_COMPLETE, payload: { today } });
export const setReminder = (patch: Partial<ReminderSettings>): SettingsAction => ({ type: REMINDER_SET, payload: patch });
export const setHaptics = (on: boolean): SettingsAction => ({ type: HAPTICS_SET, payload: on });
export const setAiConsent = (consent: boolean): SettingsAction => ({ type: AI_CONSENT_SET, payload: consent });
export const reviewPrompted = (today: ISODate): SettingsAction => ({ type: REVIEW_PROMPTED, payload: today });
/** Show/hide, move (side + height) or count a hint of the floating Coach button. */
export const setAskButton = (patch: Partial<AskButtonSettings>): SettingsAction => ({ type: ASK_BUTTON_SET, payload: patch });
/** Back to a fresh install (used by "Delete all data"). */
export const resetSettings = (): SettingsAction => ({ type: SETTINGS_RESET });
