import { GOALS } from '@/constants/exercises';
import { DEFAULT_GUIDE, isGuideId } from '@/constants/guides';
import { REMINDER } from '@/constants/reminders';
import { cleanReminder, saveProblem, workoutReminder, type Reminder } from '@/services/reminders/reminders';
import { DEFAULT_THEME_ID } from '@/constants/theme';

import {
  AI_CONSENT_SET,
  ASK_BUTTON_SET,
  GOAL_SET,
  GUIDE_SET,
  HAPTICS_SET,
  MIRROR_SET,
  ONBOARDING_COMPLETE,
  PLAN_GRID_TIP_SEEN,
  REMINDER_DELETED,
  REMINDER_SAVED,
  REVIEW_PROMPTED,
  SETTINGS_HYDRATE,
  SETTINGS_RESET,
  THEME_MODE_SET,
  VOICE_CUES_SET,
  type SettingsAction,
} from './actions';
import type { AskButtonSettings, SavedSettings, Settings, SettingsState } from './types';

export const DEFAULT_SETTINGS: Settings = {
  themeMode: 'system',
  themeId: DEFAULT_THEME_ID,
  onboardingDone: false,
  onboardedOn: null,
  goal: 'jawline',
  guide: DEFAULT_GUIDE,
  reminders: [workoutReminder()],
  haptics: true,
  voiceCues: true,
  mirror: false,
  aiConsent: null,
  lastReviewPromptOn: null,
  askButton: { visible: true, side: 'right', y: 1, hintShows: 0 },
  planGridTipSeen: false,
};

export const initialSettingsState: SettingsState = { hydrated: false, settings: DEFAULT_SETTINGS };

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;


function sanitizeReminders(s: SavedSettings): Reminder[] {
  if (Array.isArray(s.reminders)) {
    const seen = new Set<string>();
    return s.reminders
      .map(cleanReminder)
      .filter((r): r is Reminder => !!r && !seen.has(r.id) && !!seen.add(r.id))
      .slice(0, REMINDER.max);
  }
  const old = s.reminder;
  if (old) return [workoutReminder(old.enabled === true, typeof old.time === 'string' && TIME.test(old.time) ? old.time : undefined)];
  return DEFAULT_SETTINGS.reminders;
}
const THEME_MODES = ['system', 'light', 'dark'];

/** Valid values only: side left/right, y within 0–1, a whole number of hint shows. */
function sanitizeAskButton(saved: Partial<AskButtonSettings> | undefined, base: AskButtonSettings): AskButtonSettings {
  const a = saved ?? {};
  return {
    visible: typeof a.visible === 'boolean' ? a.visible : base.visible,
    side: a.side === 'left' || a.side === 'right' ? a.side : base.side,
    y: typeof a.y === 'number' && Number.isFinite(a.y) ? Math.min(1, Math.max(0, a.y)) : base.y,
    hintShows: Number.isInteger(a.hintShows) && (a.hintShows as number) >= 0 ? (a.hintShows as number) : base.hintShows,
  };
}

/** Keeps only valid saved values (a saved file can be old or edited), the rest from defaults. */
export function sanitizeSettings(saved: SavedSettings | null): Settings {
  const s = saved ?? {};
  const d = DEFAULT_SETTINGS;
  return {
    ...d,
    themeMode: THEME_MODES.includes(s.themeMode as string) ? (s.themeMode as Settings['themeMode']) : d.themeMode,
    onboardingDone: s.onboardingDone === true,
    onboardedOn: typeof s.onboardedOn === 'string' ? s.onboardedOn : null,
    goal: GOALS.includes(s.goal as Settings['goal']) ? (s.goal as Settings['goal']) : d.goal,
    guide: isGuideId(s.guide) ? s.guide : d.guide,
    reminders: sanitizeReminders(s),
    haptics: s.haptics !== false,
    voiceCues: s.voiceCues !== false,
    mirror: s.mirror === true,
    aiConsent: typeof s.aiConsent === 'boolean' ? s.aiConsent : null,
    lastReviewPromptOn: typeof s.lastReviewPromptOn === 'string' ? s.lastReviewPromptOn : null,
    askButton: sanitizeAskButton(s.askButton, d.askButton),
    planGridTipSeen: s.planGridTipSeen === true,
  };
}

function update(state: SettingsState, patch: Partial<Settings>): SettingsState {
  return { ...state, settings: { ...state.settings, ...patch } };
}

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  const s = state.settings;
  switch (action.type) {
    case SETTINGS_HYDRATE:
      return { hydrated: true, settings: sanitizeSettings(action.payload) };
    case THEME_MODE_SET:
      return update(state, { themeMode: action.payload });
    case GOAL_SET:
      return update(state, { goal: action.payload });
    case GUIDE_SET:
      return isGuideId(action.payload) ? update(state, { guide: action.payload }) : state;
    case ONBOARDING_COMPLETE:
      return update(state, { onboardingDone: true, onboardedOn: s.onboardedOn ?? action.payload.today });
    case REMINDER_SAVED: {
      const r = cleanReminder(action.payload);
      if (!r || saveProblem(s.reminders, r)) return state;
      const exists = s.reminders.some((x) => x.id === r.id);
      return update(state, { reminders: exists ? s.reminders.map((x) => (x.id === r.id ? r : x)) : [...s.reminders, r] });
    }
    case REMINDER_DELETED:
      return update(state, { reminders: s.reminders.filter((x) => x.id !== action.payload) });
    case HAPTICS_SET:
      return update(state, { haptics: action.payload });
    case VOICE_CUES_SET:
      return update(state, { voiceCues: action.payload === true });
    case MIRROR_SET:
      return update(state, { mirror: action.payload === true });
    case AI_CONSENT_SET:
      return update(state, { aiConsent: action.payload });
    case REVIEW_PROMPTED:
      return update(state, { lastReviewPromptOn: action.payload });
    case ASK_BUTTON_SET:
      return update(state, { askButton: sanitizeAskButton({ ...s.askButton, ...action.payload }, s.askButton) });
    case PLAN_GRID_TIP_SEEN:
      return update(state, { planGridTipSeen: true });
    case SETTINGS_RESET:
      return { hydrated: state.hydrated, settings: DEFAULT_SETTINGS };
    default:
      return state;
  }
}
