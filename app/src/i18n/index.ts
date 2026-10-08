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
import en_reminders from './locales/en/reminders.json';
import en_settings from './locales/en/settings.json';
import en_workout from './locales/en/workout.json';
import es_coach from './locales/es/coach.json';
import es_common from './locales/es/common.json';
import es_exercises from './locales/es/exercises.json';
import es_home from './locales/es/home.json';
import es_notifications from './locales/es/notifications.json';
import es_onboarding from './locales/es/onboarding.json';
import es_paywall from './locales/es/paywall.json';
import es_progress from './locales/es/progress.json';
import es_reminders from './locales/es/reminders.json';
import es_settings from './locales/es/settings.json';
import es_workout from './locales/es/workout.json';
import ptBR_coach from './locales/pt-BR/coach.json';
import ptBR_common from './locales/pt-BR/common.json';
import ptBR_exercises from './locales/pt-BR/exercises.json';
import ptBR_home from './locales/pt-BR/home.json';
import ptBR_notifications from './locales/pt-BR/notifications.json';
import ptBR_onboarding from './locales/pt-BR/onboarding.json';
import ptBR_paywall from './locales/pt-BR/paywall.json';
import ptBR_progress from './locales/pt-BR/progress.json';
import ptBR_reminders from './locales/pt-BR/reminders.json';
import ptBR_settings from './locales/pt-BR/settings.json';
import ptBR_workout from './locales/pt-BR/workout.json';
import de_coach from './locales/de/coach.json';
import de_common from './locales/de/common.json';
import de_exercises from './locales/de/exercises.json';
import de_home from './locales/de/home.json';
import de_notifications from './locales/de/notifications.json';
import de_onboarding from './locales/de/onboarding.json';
import de_paywall from './locales/de/paywall.json';
import de_progress from './locales/de/progress.json';
import de_reminders from './locales/de/reminders.json';
import de_settings from './locales/de/settings.json';
import de_workout from './locales/de/workout.json';
import fr_coach from './locales/fr/coach.json';
import fr_common from './locales/fr/common.json';
import fr_exercises from './locales/fr/exercises.json';
import fr_home from './locales/fr/home.json';
import fr_notifications from './locales/fr/notifications.json';
import fr_onboarding from './locales/fr/onboarding.json';
import fr_paywall from './locales/fr/paywall.json';
import fr_progress from './locales/fr/progress.json';
import fr_reminders from './locales/fr/reminders.json';
import fr_settings from './locales/fr/settings.json';
import fr_workout from './locales/fr/workout.json';
import it_coach from './locales/it/coach.json';
import it_common from './locales/it/common.json';
import it_exercises from './locales/it/exercises.json';
import it_home from './locales/it/home.json';
import it_notifications from './locales/it/notifications.json';
import it_onboarding from './locales/it/onboarding.json';
import it_paywall from './locales/it/paywall.json';
import it_progress from './locales/it/progress.json';
import it_reminders from './locales/it/reminders.json';
import it_settings from './locales/it/settings.json';
import it_workout from './locales/it/workout.json';

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
    reminders: en_reminders,
    settings: en_settings,
    workout: en_workout,
  },
  es: {
    coach: es_coach,
    common: es_common,
    exercises: es_exercises,
    home: es_home,
    notifications: es_notifications,
    onboarding: es_onboarding,
    paywall: es_paywall,
    progress: es_progress,
    reminders: es_reminders,
    settings: es_settings,
    workout: es_workout,
  },
  'pt-BR': {
    coach: ptBR_coach,
    common: ptBR_common,
    exercises: ptBR_exercises,
    home: ptBR_home,
    notifications: ptBR_notifications,
    onboarding: ptBR_onboarding,
    paywall: ptBR_paywall,
    progress: ptBR_progress,
    reminders: ptBR_reminders,
    settings: ptBR_settings,
    workout: ptBR_workout,
  },
  de: {
    coach: de_coach,
    common: de_common,
    exercises: de_exercises,
    home: de_home,
    notifications: de_notifications,
    onboarding: de_onboarding,
    paywall: de_paywall,
    progress: de_progress,
    reminders: de_reminders,
    settings: de_settings,
    workout: de_workout,
  },
  fr: {
    coach: fr_coach,
    common: fr_common,
    exercises: fr_exercises,
    home: fr_home,
    notifications: fr_notifications,
    onboarding: fr_onboarding,
    paywall: fr_paywall,
    progress: fr_progress,
    reminders: fr_reminders,
    settings: fr_settings,
    workout: fr_workout,
  },
  it: {
    coach: it_coach,
    common: it_common,
    exercises: it_exercises,
    home: it_home,
    notifications: it_notifications,
    onboarding: it_onboarding,
    paywall: it_paywall,
    progress: it_progress,
    reminders: it_reminders,
    settings: it_settings,
    workout: it_workout,
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
