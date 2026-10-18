/**
 * The workout the Coach can PROPOSE, as function calling (like the reminder tools): a short routine to start
 * now. The app shows it as a card and starts nothing until the user taps Start. It doesn't save workouts: a workout is
 * saved when it's finished in the app. Everything the model returns is checked here (and again in the app): unknown
 * exercise ids and anything out of range are dropped, never "fixed up" into something the user didn't ask for.
 * Without Premium the Coach gets only the free exercise ids, so it never names a Premium one (catalog.js idsFor).
 */
import { idsFor } from './catalog.js';

export const WORKOUT_LIMITS = { routineMin: 2, routineMax: 8, titleChars: 40 };

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

/** Function definitions for the models (OpenAI-style "tools", taken by Gemini and Workers AI), with the exercise ids this user may get. */
export const workoutTools = (premium) => [
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

/** An id from the list, or null. The model sometimes sends only an id's number (4 for '04-mewing'): that is the same exercise. */
const toId = (v, ids) => {
  if (typeof v === 'string' && ids.includes(v)) return v;
  const n = typeof v === 'number' ? v : typeof v === 'string' && /^\d{1,2}$/.test(v) ? Number(v) : NaN;
  return Number.isInteger(n) ? (ids.find((id) => id.startsWith(`${String(n).padStart(2, '0')}-`)) ?? null) : null;
};
const cleanIds = (v, max, ids) => (Array.isArray(v) ? [...new Set(v.map((x) => toId(x, ids)).filter(Boolean))].slice(0, max) : []);
const cleanTitle = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, WORKOUT_LIMITS.titleChars) : '');

/** A proposed routine the app can show: 2–8 known exercises (without Premium, free ones). At most one per answer. */
export function sanitizeWorkoutCalls(toolCalls, premium = false) {
  const ids = idsFor(premium);
  const out = [];
  for (const { name, args } of toolCalls) {
    if (name === 'suggest_workout' && !out.some((a) => a.type === 'routine')) {
      const exercises = cleanIds(args.exercises, WORKOUT_LIMITS.routineMax, ids);
      if (exercises.length < WORKOUT_LIMITS.routineMin) continue;
      out.push({ type: 'routine', title: cleanTitle(args.title), exercises });
    }
  }
  return out;
}
