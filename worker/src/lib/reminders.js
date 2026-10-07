/**
 * Reminder changes the Coach can PROPOSE (create, change, delete), as Workers AI function calling.
 * The app shows each one as a card and nothing changes until the user taps Confirm. Everything the
 * model returns is checked here (and again in the app): wrong shapes, unknown ids and anything over
 * the limits are dropped, never "fixed up" into something the user didn't ask for.
 */

export const REMINDER_LIMITS = { max: 10, maxTimes: 6, titleChars: 40, actionsPerAnswer: 3 };
export const REMINDER_KINDS = ['workout', 'mewing', 'posture', 'custom'];

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const ID = /^[a-z0-9-]{1,40}$/;
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

/** Valid, unique, sorted 'HH:mm' times (1–6), or null. */
export function cleanTimes(v) {
  if (!Array.isArray(v)) return null;
  const times = [...new Set(v.filter((t) => typeof t === 'string' && TIME.test(t)))].sort().slice(0, REMINDER_LIMITS.maxTimes);
  return times.length ? times : null;
}

/** Valid, unique, sorted weekdays (0 = Sunday … 6 = Saturday), or null. */
export function cleanDays(v) {
  if (!Array.isArray(v)) return null;
  const days = [...new Set(v.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => a - b);
  return days.length ? days : null;
}

const cleanTitle = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, REMINDER_LIMITS.titleChars) : '');

/** The user's current reminders as the app sends them (checked in validate.js). */
export function isReminderContext(r) {
  if (!isObj(r) || Object.keys(r).length !== 6) return false;
  return (
    typeof r.id === 'string' &&
    ID.test(r.id) &&
    typeof r.title === 'string' &&
    r.title.length <= REMINDER_LIMITS.titleChars &&
    REMINDER_KINDS.includes(r.kind) &&
    typeof r.enabled === 'boolean' &&
    cleanTimes(r.times)?.length === r.times.length &&
    cleanDays(r.days)?.length === r.days.length
  );
}

const TIMES_SCHEMA = {
  type: 'array',
  description: "Times of day in 24-hour 'HH:mm', the user's local time. 1 to 6 times.",
  items: { type: 'string' },
};
const DAYS_SCHEMA = {
  type: 'array',
  description: 'Weekdays as numbers: 0 = Sunday, 1 = Monday … 6 = Saturday. All seven for every day.',
  items: { type: 'integer' },
};

/** Function definitions for Workers AI (OpenAI-style "tools"). */
export const REMINDER_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_reminder',
      description: 'Propose a NEW reminder. Only when the user clearly asks for a reminder. The user confirms it in the app.',
      parameters: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: REMINDER_KINDS, description: 'workout, mewing (tongue posture check), posture (chin tuck / neck) or custom.' },
          title: { type: 'string', description: 'Short name in the user\'s language, at most 40 characters. Empty for the default name.' },
          times: TIMES_SCHEMA,
          days: DAYS_SCHEMA,
        },
        required: ['kind', 'times', 'days'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_reminder',
      description: "Propose a change to one of the user's existing reminders (by id): new name, times, days, or turn it on/off.",
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The id of an existing reminder from the list you were given.' },
          title: { type: 'string' },
          times: TIMES_SCHEMA,
          days: DAYS_SCHEMA,
          enabled: { type: 'boolean', description: 'false pauses it, true turns it back on.' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_reminder',
      description: "Propose deleting one of the user's existing reminders (by id).",
      parameters: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    },
  },
];

/** Tool calls in either Workers AI shape: top-level { name, arguments } or OpenAI choices[0].message.tool_calls. */
export function extractToolCalls(result) {
  if (!isObj(result)) return [];
  const raw = Array.isArray(result.tool_calls) ? result.tool_calls : result.choices?.[0]?.message?.tool_calls;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((c) => {
      const name = c?.function?.name ?? c?.name;
      let args = c?.function?.arguments ?? c?.arguments;
      if (typeof args === 'string') {
        try {
          args = JSON.parse(args);
        } catch {
          return null;
        }
      }
      return typeof name === 'string' && isObj(args) ? { name, args } : null;
    })
    .filter(Boolean);
}

/**
 * Proposed actions the app can show: at most 3, one per reminder id, creates only while there's
 * room (10 reminders), updates and deletes only for ids in the user's list.
 */
export function sanitizeActions(toolCalls, reminders = []) {
  const ids = new Set(reminders.map((r) => r.id));
  const touched = new Set();
  let room = REMINDER_LIMITS.max - reminders.length;
  const out = [];
  for (const { name, args } of toolCalls) {
    if (out.length >= REMINDER_LIMITS.actionsPerAnswer) break;
    if (name === 'create_reminder') {
      const times = cleanTimes(args.times);
      const days = cleanDays(args.days);
      if (!times || !days || room <= 0) continue;
      room--;
      out.push({ type: 'create', kind: REMINDER_KINDS.includes(args.kind) ? args.kind : 'custom', title: cleanTitle(args.title), times, days });
      continue;
    }
    const id = typeof args.id === 'string' ? args.id : '';
    if (!ids.has(id) || touched.has(id)) continue;
    if (name === 'delete_reminder') {
      touched.add(id);
      out.push({ type: 'delete', id });
    } else if (name === 'update_reminder') {
      const change = {};
      if (typeof args.title === 'string') change.title = cleanTitle(args.title);
      if (args.times !== undefined) {
        const times = cleanTimes(args.times);
        if (!times) continue;
        change.times = times;
      }
      if (args.days !== undefined) {
        const days = cleanDays(args.days);
        if (!days) continue;
        change.days = days;
      }
      if (typeof args.enabled === 'boolean') change.enabled = args.enabled;
      if (!Object.keys(change).length) continue;
      touched.add(id);
      out.push({ type: 'update', id, ...change });
    }
  }
  return out;
}
