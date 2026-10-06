import type { Goal } from '@/constants/exercises';
import type { ThemeMode } from '@/constants/theme';
import type { ISODate } from '@/utils/dates';

/** 'HH:mm', 24-hour. */
export type TimeOfDay = string;

export interface ReminderSettings {
  enabled: boolean;
  time: TimeOfDay;
}

export interface Settings {
  themeMode: ThemeMode;
  themeId: string;
  onboardingDone: boolean;
  onboardedOn: ISODate | null;
  goal: Goal;
  reminder: ReminderSettings;
  haptics: boolean;
  /** Consent to send Coach questions to the AI (null = not asked yet). */
  aiConsent: boolean | null;
  lastReviewPromptOn: ISODate | null;
}

export interface SettingsState {
  hydrated: boolean;
  settings: Settings;
}
