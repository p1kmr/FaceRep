import type { Goal } from '@/constants/exercises';
import type { GuideId } from '@/constants/guides';
import type { ThemeMode } from '@/constants/theme';
import type { ISODate } from '@/utils/dates';

import type { Reminder } from '@/services/reminders/reminders';

import type { AskButtonSettings, SavedSettings } from './types';

export const SETTINGS_HYDRATE = 'settings/hydrate';
export const THEME_MODE_SET = 'settings/themeModeSet';
export const GOAL_SET = 'settings/goalSet';
export const GUIDE_SET = 'settings/guideSet';
export const ONBOARDING_COMPLETE = 'settings/onboardingComplete';
export const REMINDER_SAVED = 'settings/reminderSaved';
export const REMINDER_DELETED = 'settings/reminderDeleted';
export const HAPTICS_SET = 'settings/hapticsSet';
export const VOICE_CUES_SET = 'settings/voiceCuesSet';
export const MIRROR_SET = 'settings/mirrorSet';
export const AI_CONSENT_SET = 'settings/aiConsentSet';
export const REVIEW_PROMPTED = 'settings/reviewPrompted';
export const ASK_BUTTON_SET = 'settings/askButtonSet';
export const SETTINGS_RESET = 'settings/reset';

export type SettingsAction =
  | { type: typeof SETTINGS_HYDRATE; payload: SavedSettings | null }
  | { type: typeof THEME_MODE_SET; payload: ThemeMode }
  | { type: typeof GOAL_SET; payload: Goal }
  | { type: typeof GUIDE_SET; payload: GuideId }
  | { type: typeof ONBOARDING_COMPLETE; payload: { today: ISODate } }
  | { type: typeof REMINDER_SAVED; payload: Reminder }
  | { type: typeof REMINDER_DELETED; payload: string }
  | { type: typeof HAPTICS_SET; payload: boolean }
  | { type: typeof VOICE_CUES_SET; payload: boolean }
  | { type: typeof MIRROR_SET; payload: boolean }
  | { type: typeof AI_CONSENT_SET; payload: boolean }
  | { type: typeof REVIEW_PROMPTED; payload: ISODate }
  | { type: typeof ASK_BUTTON_SET; payload: Partial<AskButtonSettings> }
  | { type: typeof SETTINGS_RESET };

export const hydrateSettings = (saved: SavedSettings | null): SettingsAction => ({ type: SETTINGS_HYDRATE, payload: saved });
export const setThemeMode = (mode: ThemeMode): SettingsAction => ({ type: THEME_MODE_SET, payload: mode });
export const setGoal = (goal: Goal): SettingsAction => ({ type: GOAL_SET, payload: goal });
/** Who the exercise pictures show. Ignored when it isn't a known guide. */
export const setGuide = (guide: GuideId): SettingsAction => ({ type: GUIDE_SET, payload: guide });
export const completeOnboarding = (today: ISODate): SettingsAction => ({ type: ONBOARDING_COMPLETE, payload: { today } });
/** Adds a reminder, or replaces the one with the same id. Ignored when invalid or over the limits. */
export const saveReminder = (reminder: Reminder): SettingsAction => ({ type: REMINDER_SAVED, payload: reminder });
export const deleteReminder = (id: string): SettingsAction => ({ type: REMINDER_DELETED, payload: id });
export const setHaptics = (on: boolean): SettingsAction => ({ type: HAPTICS_SET, payload: on });
export const setVoiceCues = (on: boolean): SettingsAction => ({ type: VOICE_CUES_SET, payload: on });
export const setMirror = (on: boolean): SettingsAction => ({ type: MIRROR_SET, payload: on });
export const setAiConsent = (consent: boolean): SettingsAction => ({ type: AI_CONSENT_SET, payload: consent });
export const reviewPrompted = (today: ISODate): SettingsAction => ({ type: REVIEW_PROMPTED, payload: today });
/** Show/hide, move (side + height) or count a hint of the floating Coach button. */
export const setAskButton = (patch: Partial<AskButtonSettings>): SettingsAction => ({ type: ASK_BUTTON_SET, payload: patch });
/** Back to a fresh install (used by "Delete all data"). */
export const resetSettings = (): SettingsAction => ({ type: SETTINGS_RESET });
