import { GOALS } from '@/constants/exercises';
import { REMINDER } from '@/constants/reminders';
import { DEFAULT_THEME_ID } from '@/constants/theme';

import {
  AI_CONSENT_SET,
  GOAL_SET,
  HAPTICS_SET,
  ONBOARDING_COMPLETE,
  REMINDER_SET,
  REVIEW_PROMPTED,
  SETTINGS_HYDRATE,
  SETTINGS_RESET,
  THEME_MODE_SET,
  type SettingsAction,
} from './actions';
import type { Settings, SettingsState } from './types';

export const DEFAULT_SETTINGS: Settings = {
  themeMode: 'system',
  themeId: DEFAULT_THEME_ID,
  onboardingDone: false,
  onboardedOn: null,
  goal: 'jawline',
  reminder: { enabled: false, time: REMINDER.defaultTime },
  haptics: true,
  aiConsent: null,
  lastReviewPromptOn: null,
};

export const initialSettingsState: SettingsState = { hydrated: false, settings: DEFAULT_SETTINGS };

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const THEME_MODES = ['system', 'light', 'dark'];

/** Keeps only valid saved values (a saved file can be old or edited), the rest from defaults. */
export function sanitizeSettings(saved: Partial<Settings> | null): Settings {
  const s = saved ?? {};
  const d = DEFAULT_SETTINGS;
  const reminder = s.reminder ?? d.reminder;
  return {
    ...d,
    themeMode: THEME_MODES.includes(s.themeMode as string) ? (s.themeMode as Settings['themeMode']) : d.themeMode,
    onboardingDone: s.onboardingDone === true,
    onboardedOn: typeof s.onboardedOn === 'string' ? s.onboardedOn : null,
    goal: GOALS.includes(s.goal as Settings['goal']) ? (s.goal as Settings['goal']) : d.goal,
    reminder: {
      enabled: reminder.enabled === true,
      time: typeof reminder.time === 'string' && TIME.test(reminder.time) ? reminder.time : d.reminder.time,
    },
    haptics: s.haptics !== false,
    aiConsent: typeof s.aiConsent === 'boolean' ? s.aiConsent : null,
    lastReviewPromptOn: typeof s.lastReviewPromptOn === 'string' ? s.lastReviewPromptOn : null,
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
    case ONBOARDING_COMPLETE:
      return update(state, { onboardingDone: true, onboardedOn: s.onboardedOn ?? action.payload.today });
    case REMINDER_SET: {
      const time = action.payload.time;
      if (time !== undefined && !TIME.test(time)) return state;
      return update(state, { reminder: { ...s.reminder, ...action.payload } });
    }
    case HAPTICS_SET:
      return update(state, { haptics: action.payload });
    case AI_CONSENT_SET:
      return update(state, { aiConsent: action.payload });
    case REVIEW_PROMPTED:
      return update(state, { lastReviewPromptOn: action.payload });
    case SETTINGS_RESET:
      return { hydrated: state.hydrated, settings: DEFAULT_SETTINGS };
    default:
      return state;
  }
}
