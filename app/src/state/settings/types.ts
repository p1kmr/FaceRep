import type { Goal } from '@/constants/exercises';
import type { GuideId } from '@/constants/guides';
import type { Reminder } from '@/services/reminders/reminders';
import type { ThemeMode } from '@/constants/theme';
import type { ISODate } from '@/utils/dates';

/** 'HH:mm', 24-hour. */
export type TimeOfDay = string;

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
  /** Who the exercise pictures show (man or woman). Display only: the plan doesn't depend on it. */
  guide: GuideId;
  /** The user's reminders (workout, mewing, posture, own). The first install has a workout one, off. */
  reminders: Reminder[];
  haptics: boolean;
  /** Consent to send Coach questions to the AI (null = not asked yet). */
  aiConsent: boolean | null;
  lastReviewPromptOn: ISODate | null;
  askButton: AskButtonSettings;
}

/** What a save can hold: also older saves with one daily reminder ({ enabled, time }). */
export type SavedSettings = Partial<Settings> & { reminder?: { enabled?: unknown; time?: unknown } };

export interface SettingsState {
  hydrated: boolean;
  settings: Settings;
}
