import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { CONFIG } from '@/constants/config';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from '@/constants/i18n';

import en_coach from './locales/en/coach.json';
import en_common from './locales/en/common.json';
import en_exercises from './locales/en/exercises.json';
import en_home from './locales/en/home.json';
import en_notifications from './locales/en/notifications.json';
import en_onboarding from './locales/en/onboarding.json';
import en_paywall from './locales/en/paywall.json';
import en_progress from './locales/en/progress.json';
import en_settings from './locales/en/settings.json';
import en_workout from './locales/en/workout.json';

export const resources = {
  en: {
    coach: en_coach,
    common: en_common,
    exercises: en_exercises,
    home: en_home,
    notifications: en_notifications,
    onboarding: en_onboarding,
    paywall: en_paywall,
    progress: en_progress,
    settings: en_settings,
    workout: en_workout,
  },
} as const;

/** Best supported language for the device's preferred languages (exact tag, then base language). */
export function matchLanguage(tags: readonly string[]): Language {
  for (const tag of tags) {
    const base = tag.split('-')[0].toLowerCase();
    const match = SUPPORTED_LANGUAGES.find((l) => l.toLowerCase() === tag.toLowerCase() || l.split('-')[0] === base);
    if (match) return match;
  }
  return DEFAULT_LANGUAGE;
}

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: matchLanguage(getLocales().map((l) => l.languageTag)),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  defaultNS: 'common',
  ns: Object.keys(resources.en),
  // {{app}} in any string is the app name, so a rename is one line in constants/config.ts.
  interpolation: { escapeValue: false, defaultVariables: { app: CONFIG.appName } },
});

export default i18n;
