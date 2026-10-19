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

/**
 * The cues as beeps instead of words (Settings → Sound cues → Beeps), at most one a second: `count` for 3, 2, 1 before
 * an exercise, `go` when a squeeze starts and a soft `tick` for each second of it, `release` when it ends (relaxing is
 * quiet, so ticking always means squeeze), and `done` at the end.
 */
export type Beep = 'count' | 'go' | 'tick' | 'release' | 'done';

/** The last seconds before an exercise's first squeeze, counted down with beeps. */
const COUNTDOWN_SEC = 3;

/** The beep for going from `prev` to `next`; null when nothing sounds (a pause, a resume, a second of relaxing). */
export function beepFor(prev: WorkoutState | null, next: WorkoutState): Beep | null {
  if (!next.queue.length || next.paused) return null;
  if (!prev) return next.phase === 'ready' && next.remaining <= COUNTDOWN_SEC ? 'count' : null;
  const moved = prev.phase !== next.phase || prev.index !== next.index || prev.rep !== next.rep;
  if (!moved && prev.remaining === next.remaining) return null;
  switch (next.phase) {
    case 'hold':
      return moved ? 'go' : 'tick';
    case 'relax':
      return moved ? 'release' : null;
    case 'rest':
      if (moved) return 'release';
      return next.remaining <= COUNTDOWN_SEC ? 'count' : null;
    case 'ready':
      return next.remaining <= COUNTDOWN_SEC ? 'count' : null;
    case 'done':
      return 'done';
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
