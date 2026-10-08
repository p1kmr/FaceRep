/**
 * App languages (the same set as Elowa). Adding one: add it here and to LANGUAGE_NAMES, add `i18n/locales/<code>/`
 * and its imports in `i18n/index.ts`, add `locales-native/<code>.json` to app.json, then `npm run i18n:check`
 * (docs/i18n.md).
 */
export const SUPPORTED_LANGUAGES = ['en', 'es', 'pt-BR', 'de', 'fr', 'it'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

/** Each language's name in that language (shown in Settings, never translated). */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  'pt-BR': 'Português (Brasil)',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
};
