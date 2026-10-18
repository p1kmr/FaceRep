import type { Goal } from '@/constants/exercises';
import type { GuideId } from '@/constants/guides';
import type { Reminder } from '@/services/reminders/reminders';
import type { ThemeMode } from '@/constants/theme';
import type { ISODate } from '@/utils/dates';
import type { Spot } from '@/utils/spot';

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

/** Where the user dragged the workout's small tile (mirror or figure): fractions of the free space, so it fits any screen. */
export type TileSpot = Spot;

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
  /** Spoken cues in workouts ("Squeeze", "Relax", "Next up: …"), with the iPhone's own voice. */
  voiceCues: boolean;
  /** Front camera as a mirror in workouts. Nothing is recorded or saved. */
  mirror: boolean;
  /** In the mirror, Apple's face tracking shows when it sees the move (iPhones that have it). Nothing is recorded or saved. */
  moveCheck: boolean;
  /** Where the small tile sits in workouts (null = the figure's bottom-right corner, until it's dragged). */
  tileSpot: TileSpot | null;
  /** Consent to send Coach questions to the AI (null = not asked yet). */
  aiConsent: boolean | null;
  /**
   * Save a progress photo with each face scan, only in the app on this iPhone (null = not asked yet, so no photo).
   * docs/face-scan.md.
   */
  scanPhotos: boolean | null;
  lastReviewPromptOn: ISODate | null;
  askButton: AskButtonSettings;
}

/** What a save can hold: also older saves with one daily reminder ({ enabled, time }). */
export type SavedSettings = Partial<Settings> & { reminder?: { enabled?: unknown; time?: unknown } };

export interface SettingsState {
  hydrated: boolean;
  settings: Settings;
}
