/**
 * Workout actions the Coach can PROPOSE, as Workers AI function calling (like the reminder tools): save a workout the
 * user did without the app, or a short routine to start now. The app shows each as a card and saves or starts nothing
 * until the user taps Confirm or Start. Everything the model returns is checked here (and again in the app): unknown
 * exercise ids and anything out of range are dropped, never "fixed up" into something the user didn't ask for.
 * Without Premium the Coach gets only the free exercise ids, so it never names a Premium one (catalog.js idsFor).
 */
import { idsFor } from './catalog.js';

export const WORKOUT_LIMITS = { daysBack: 6, maxMinutes: 120, logMax: 12, routineMin: 2, routineMax: 8, titleChars: 40 };

/** English names of the catalog's exercises, for the prompt (the model answers in the user's language). */
export const EXERCISE_NAMES = {
  '01-jaw-clench': 'Jaw Clench',
  '02-chin-lift': 'Chin Lift',
  '03-jaw-jut': 'Jaw Jut',
  '04-mewing': 'Mewing',
  '12-tongue-press': 'Tongue Press',
  '11-chin-tuck': 'Chin Tuck',
  '05-neck-stretch': 'Neck Side Stretch',
  '06-cheek-lift': 'Cheek Lift',
  '07-fish-face': 'Fish Face',
  '13-smiling-fish': 'Smiling Fish',
  '08-cheek-puff': 'Cheek Puff',
  '14-o-stretch': 'O Stretch',
  '15-lion-face': 'Lion Face',
  '18-lip-press': 'Lip Press',
  '19-pout': 'Pout',
  '20-lip-corner-lift': 'Lip Corner Lift',
  '21-smile-line-press': 'Smile-Line Press',
  '09-brow-lift': 'Brow Lift',
  '22-forehead-press': 'Forehead Press',
  '16-wide-eyes': 'Wide Eyes',
  '17-lower-lid-lift': 'Lower Lid Lift',
  '23-v-eyes': 'V Eyes',
  '10-eye-squeeze': 'Eye Squeeze',
  '24-jaw-release': 'Jaw Release',
  '25-jawline-sweep': 'Jawline Sweep',
  '26-frown-release': 'Frown Release',
  '27-temple-circles': 'Temple Circles',
};

const idsSchema = (premium) => ({ type: 'array', items: { type: 'string', enum: idsFor(premium) } });

/** Function definitions for Workers AI (OpenAI-style "tools"), with the exercise ids this user may get. */
export const workoutTools = (premium) => [
  {
    type: 'function',
    function: {
      name: 'log_workout',
      description:
        'Propose saving a workout the user says they did without the app, or forgot to save: today or up to 6 days ago. Only when they clearly say they did it. The user confirms it in the app.',
      parameters: {
        type: 'object',
        properties: {
          days_ago: { type: 'integer', description: '0 = today, 1 = yesterday, up to 6.' },
          exercises: { ...idsSchema(premium), description: "Exercise ids from the list that they say they did. Empty when they don't say which." },
          minutes: { type: 'integer', description: 'How many minutes, only when they say. 1 to 120.' },
        },
        required: ['days_ago'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_workout',
      description:
        "Propose a short routine of the app's exercises to do now, only when the user asks for a workout or routine. The user taps Start in the app.",
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: "Short name in the user's language, at most 40 characters." },
          exercises: { ...idsSchema(premium), description: '2 to 8 exercise ids from the list, in the order to do them.' },
        },
        required: ['exercises'],
      },
    },
  },
];

const cleanIds = (v, max, ids) =>
  Array.isArray(v) ? [...new Set(v.filter((id) => typeof id === 'string' && ids.includes(id)))].slice(0, max) : [];
const cleanTitle = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, WORKOUT_LIMITS.titleChars) : '');

/**
 * Proposed workout actions the app can show: a log needs a day 0–6 and something to save (exercises or minutes); a
 * routine needs 2–8 known exercises (without Premium, free ones). At most one of each per answer.
 */
export function sanitizeWorkoutCalls(toolCalls, premium = false) {
  const ids = idsFor(premium);
  const out = [];
  for (const { name, args } of toolCalls) {
    if (name === 'log_workout' && !out.some((a) => a.type === 'log')) {
      const daysAgo = args.days_ago;
      if (!Number.isInteger(daysAgo) || daysAgo < 0 || daysAgo > WORKOUT_LIMITS.daysBack) continue;
      const exercises = cleanIds(args.exercises, WORKOUT_LIMITS.logMax, ids);
      const minutes = Number.isInteger(args.minutes) && args.minutes >= 1 && args.minutes <= WORKOUT_LIMITS.maxMinutes ? args.minutes : null;
      if (!exercises.length && !minutes) continue;
      out.push({ type: 'log', daysAgo, exercises, minutes });
    } else if (name === 'suggest_workout' && !out.some((a) => a.type === 'routine')) {
      const exercises = cleanIds(args.exercises, WORKOUT_LIMITS.routineMax, ids);
      if (exercises.length < WORKOUT_LIMITS.routineMin) continue;
      out.push({ type: 'routine', title: cleanTitle(args.title), exercises });
    }
  }
  return out;
}
