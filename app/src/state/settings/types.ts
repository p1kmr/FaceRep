import type { Goal } from '@/constants/exercises';
import type { ThemeMode } from '@/constants/theme';
import type { ISODate } from '@/utils/dates';

/** 'HH:mm', 24-hour. */
export type TimeOfDay = string;

export interface ReminderSettings {
  enabled: boolean;
  time: TimeOfDay;
}

/** The floating Coach button: shown or not, and where the user dragged it (same as Elowa's Ask button). */
export interface AskButtonSettings {
  visible: boolean;
  side: 'left' | 'right';
  /** Vertical position as a fraction of the free space (0 = top, 1 = bottom), so it fits any screen. */
  y: number;
  /** App opens that showed the first-time "ask me about…" hint (stops at ASK_HINT.maxShows). */
  hintShows: number;
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
  askButton: AskButtonSettings;
}

export interface SettingsState {
  hydrated: boolean;
  settings: Settings;
}
