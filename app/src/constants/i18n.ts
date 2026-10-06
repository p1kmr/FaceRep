/** App languages. Adding one: add it here and add `i18n/locales/<code>/` with the same files as `en`. */
export const SUPPORTED_LANGUAGES = ['en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';
