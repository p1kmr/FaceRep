import { EXERCISES } from '@/constants/exercises';

import type { WorkoutState } from './timer';

/**
 * What the voice says when the workout moves on, so it can be followed with the eyes closed or the hands on the
 * face. Pure: the hook turns a cue into words (t) and speech.
 */
export type Cue =
  | { kind: 'start'; exercise: string }
  | { kind: 'next'; exercise: string }
  | { kind: 'hold'; last: boolean; massage: boolean }
  | { kind: 'relax' }
  | { kind: 'done' };

const keyAt = (s: WorkoutState) => EXERCISES[s.queue[s.index].id].key;

/** The cue for going from `prev` to `next`; null when nothing new happened (a tick, a pause or a resume). */
export function cueFor(prev: WorkoutState | null, next: WorkoutState): Cue | null {
  if (!next.queue.length) return null;
  if (!prev) return next.phase === 'ready' ? { kind: 'start', exercise: keyAt(next) } : null;
  if (prev.phase === next.phase && prev.index === next.index && prev.rep === next.rep) return null;
  switch (next.phase) {
    case 'rest':
      return { kind: 'next', exercise: keyAt(next) };
    case 'hold': {
      const item = next.queue[next.index];
      return { kind: 'hold', last: item.reps > 1 && next.rep === item.reps, massage: EXERCISES[item.id].program === 'massage' };
    }
    case 'relax':
      return { kind: 'relax' };
    case 'done':
      return { kind: 'done' };
    default:
      return null;
  }
}

/** A regional voice for each app language when the device has none of its own ("de" → "de-DE"). */
const FALLBACK_REGION: Record<string, string> = { en: 'en-US', es: 'es-ES', pt: 'pt-BR', de: 'de-DE', fr: 'fr-FR', it: 'it-IT' };

/**
 * The voice to use (same rule as Elowa): the app language when it has a region (pt-BR), else the device's own
 * regional variant of it (en-GB, de-AT…), else a default region. iOS needs the region to pick the right voice.
 */
export function speechLanguage(appLanguage: string, deviceTags: readonly string[]): string {
  if (appLanguage.includes('-')) return appLanguage;
  const base = appLanguage.toLowerCase();
  const device = deviceTags.find((tag) => tag.includes('-') && tag.split('-')[0].toLowerCase() === base);
  return device ?? FALLBACK_REGION[base] ?? appLanguage;
}
