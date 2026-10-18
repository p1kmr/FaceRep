/**
 * The exercises' names as the app shows them in each of its languages: the free ones from the app's locales, the
 * Premium ones from content/locales (the Worker's own copy, never in the app). The Coach gets the ones this user may
 * see, so an answer names an exercise the way the app does (it was writing "Jaw Clench" in a Spanish answer). The jaw
 * caution comes from the app too, so a warning uses the local word for the jaw joint (it was writing "TMJ" in French),
 * and so does the line the app writes under a card (the Coach must never write it without proposing something).
 */
import coachDe from '../../../app/src/i18n/locales/de/coach.json' with { type: 'json' };
import coachEn from '../../../app/src/i18n/locales/en/coach.json' with { type: 'json' };
import coachEs from '../../../app/src/i18n/locales/es/coach.json' with { type: 'json' };
import coachFr from '../../../app/src/i18n/locales/fr/coach.json' with { type: 'json' };
import coachIt from '../../../app/src/i18n/locales/it/coach.json' with { type: 'json' };
import coachPt from '../../../app/src/i18n/locales/pt-BR/coach.json' with { type: 'json' };
import appDe from '../../../app/src/i18n/locales/de/exercises.json' with { type: 'json' };
import appEn from '../../../app/src/i18n/locales/en/exercises.json' with { type: 'json' };
import appEs from '../../../app/src/i18n/locales/es/exercises.json' with { type: 'json' };
import appFr from '../../../app/src/i18n/locales/fr/exercises.json' with { type: 'json' };
import appIt from '../../../app/src/i18n/locales/it/exercises.json' with { type: 'json' };
import appPt from '../../../app/src/i18n/locales/pt-BR/exercises.json' with { type: 'json' };
import premiumDe from '../../content/locales/de/exercises.json' with { type: 'json' };
import premiumEn from '../../content/locales/en/exercises.json' with { type: 'json' };
import premiumEs from '../../content/locales/es/exercises.json' with { type: 'json' };
import premiumFr from '../../content/locales/fr/exercises.json' with { type: 'json' };
import premiumIt from '../../content/locales/it/exercises.json' with { type: 'json' };
import premiumPt from '../../content/locales/pt-BR/exercises.json' with { type: 'json' };
import { CATALOG } from './catalog.js';

const FILES = {
  de: [appDe, premiumDe],
  en: [appEn, premiumEn],
  es: [appEs, premiumEs],
  fr: [appFr, premiumFr],
  it: [appIt, premiumIt],
  'pt-BR': [appPt, premiumPt],
};

/** { id: name } in one of the app's languages, or null for a language it doesn't have. */
export function namesIn(locale) {
  const files = FILES[locale];
  if (!files) return null;
  return Object.fromEntries(CATALOG.map((e) => [e.id, files.map((f) => f.items?.[e.key]?.name).find((n) => typeof n === 'string') ?? null]));
}

/** The app's jaw caution in one of its languages, or null for a language it doesn't have. */
export const jawCautionIn = (locale) => FILES[locale]?.[0]?.detail?.jawCaution ?? null;

const COACH = { de: coachDe, en: coachEn, es: coachEs, fr: coachFr, it: coachIt, 'pt-BR': coachPt };

/** The line the app writes under a card the Coach proposed ("I prepared this for you…"), English for other languages. */
export const preparedIn = (locale) => (COACH[locale] ?? coachEn).actions.prepared;
