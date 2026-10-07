import { isReminderContext, REMINDER_LIMITS } from './reminders.js';

// Strict input check: anything unexpected is rejected.
export const CHAT_LIMITS = { questionChars: 500, turnChars: 1500, historyTurns: 10 };
export const GOALS = ['jawline', 'cheekbones', 'lips', 'eyes', 'massage', 'full'];

const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
const isText = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const isUserId = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/.test(v);
const isLocale = (v) => typeof v === 'string' && /^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(v);
/** Apple DeviceCheck token (base64), optional: the simulator and old builds don't send one. */
const isDeviceToken = (v) => v === undefined || (typeof v === 'string' && /^[A-Za-z0-9+/=]{16,6000}$/.test(v));

/** Anonymous training context: focus area, streak, workouts in the last 7 days. Nothing else. */
function isContext(v) {
  if (!isObj(v) || Object.keys(v).length !== 3) return false;
  return GOALS.includes(v.goal) && isInt(v.streak, 0, 3650) && isInt(v.workoutsLast7Days, 0, 100);
}

const isTurn = (t) =>
  isObj(t) && Object.keys(t).length === 2 && (t.role === 'user' || t.role === 'assistant') && isText(t.text, CHAT_LIMITS.turnChars);

/** Returns the clean request or null. */
export function validateChatRequest(body) {
  if (!isObj(body)) return null;
  const { appUserId, locale, question, history, context, deviceToken, reminders, ...rest } = body;
  if (Object.keys(rest).length) return null;
  if (!isUserId(appUserId) || !isLocale(locale) || !isDeviceToken(deviceToken)) return null;
  if (!isText(question, CHAT_LIMITS.questionChars)) return null;
  if (!Array.isArray(history) || history.length > CHAT_LIMITS.historyTurns || !history.every(isTurn)) return null;
  if (!isContext(context)) return null;
  // Optional: the user's reminders (names, times, days), so the Coach can propose changes to them.
  if (reminders !== undefined && !(Array.isArray(reminders) && reminders.length <= REMINDER_LIMITS.max && reminders.every(isReminderContext))) return null;
  return { appUserId, locale, question: question.trim(), history, context, deviceToken, reminders: reminders ?? [] };
}

/** POST /plan: { appUserId, goal, level }. Levels 1–3 (see lib/plan.js MAX_LEVEL). */
export function validatePlanRequest(body) {
  if (!isObj(body)) return null;
  // catalog: the app's exercise catalog version (apps before it existed send none: version 1).
  const { appUserId, goal, level, catalog = 1, ...rest } = body;
  if (Object.keys(rest).length) return null;
  if (!isUserId(appUserId) || !GOALS.includes(goal) || !isInt(level, 1, 3) || !isInt(catalog, 1, 1000)) return null;
  return { appUserId, goal, level, catalog };
}
