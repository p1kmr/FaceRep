import assert from 'node:assert/strict';
import { test } from 'node:test';

import { handleChat } from '../src/lib/handler.js';
import { CATALOG } from '../src/lib/plan.js';
import { buildMessages } from '../src/lib/prompt.js';
import { EXERCISE_NAMES, sanitizeWorkoutCalls, WORKOUT_TOOLS } from '../src/lib/workouts.js';

const call = (name, args) => ({ name, args });
const body = {
  appUserId: '0f8fad5b-d9cb-469f-a165-70867728950e',
  locale: 'en',
  question: 'I did my jaw clench and chin tucks this morning, about 6 minutes',
  history: [],
  context: { goal: 'jawline', streak: 3, workoutsLast7Days: 4 },
};

test('workouts: every catalog exercise has a name for the prompt, and the tools only allow catalog ids', () => {
  assert.deepEqual(Object.keys(EXERCISE_NAMES).sort(), CATALOG.map((e) => e.id).sort());
  assert.deepEqual(WORKOUT_TOOLS.map((t) => t.function.name), ['log_workout', 'suggest_workout']);
  for (const tool of WORKOUT_TOOLS) assert.deepEqual(tool.function.parameters.properties.exercises.items.enum, CATALOG.map((e) => e.id));
});

test('workouts: a log needs a day 0–6 and something to save; plan days only today; unknown ids go', () => {
  assert.deepEqual(sanitizeWorkoutCalls([call('log_workout', { days_ago: 0, exercises: ['01-jaw-clench', '11-chin-tuck', '01-jaw-clench', 'push-ups'], minutes: 6 })]), [
    { type: 'log', daysAgo: 0, plan: false, exercises: ['01-jaw-clench', '11-chin-tuck'], minutes: 6 },
  ]);
  assert.deepEqual(sanitizeWorkoutCalls([call('log_workout', { days_ago: 0, plan_day: true })]), [
    { type: 'log', daysAgo: 0, plan: true, exercises: [], minutes: null },
  ]);
  // A plan day is only today's; minutes out of range are dropped, not clamped.
  assert.deepEqual(sanitizeWorkoutCalls([call('log_workout', { days_ago: 1, plan_day: true, minutes: 500 })]), []);
  assert.deepEqual(sanitizeWorkoutCalls([call('log_workout', { days_ago: 2, minutes: 10 })]), [
    { type: 'log', daysAgo: 2, plan: false, exercises: [], minutes: 10 },
  ]);
  for (const days_ago of [-1, 7, 1.5, '0', undefined]) assert.deepEqual(sanitizeWorkoutCalls([call('log_workout', { days_ago, minutes: 5 })]), []);
});

test('workouts: a routine needs 2–8 known exercises; one log and one routine per answer', () => {
  const ids = CATALOG.map((e) => e.id);
  assert.deepEqual(sanitizeWorkoutCalls([call('suggest_workout', { title: '  Quick   jaw  ', exercises: ['01-jaw-clench', '11-chin-tuck'] })]), [
    { type: 'routine', title: 'Quick jaw', exercises: ['01-jaw-clench', '11-chin-tuck'] },
  ]);
  assert.deepEqual(sanitizeWorkoutCalls([call('suggest_workout', { exercises: ['01-jaw-clench', 'squats'] })]), []);
  assert.equal(sanitizeWorkoutCalls([call('suggest_workout', { exercises: ids })])[0].exercises.length, 8);
  const twice = sanitizeWorkoutCalls([
    call('log_workout', { days_ago: 0, minutes: 5 }),
    call('log_workout', { days_ago: 1, minutes: 5 }),
    call('suggest_workout', { exercises: ids.slice(0, 3) }),
    call('suggest_workout', { exercises: ids.slice(3, 6) }),
    call('create_reminder', { kind: 'workout', times: ['08:00'], days: [1] }),
  ]);
  assert.deepEqual(twice.map((a) => [a.type, a.daysAgo ?? a.exercises[0]]), [['log', 0], ['routine', ids[0]]]);
});

test('workouts: the prompt explains the tools and lists the ids only when tools are on', () => {
  const withTools = buildMessages({ ...body, canPropose: true })[0].content;
  assert.match(withTools, /call log_workout/);
  assert.match(withTools, /27-temple-circles Temple Circles/);
  const without = buildMessages({ ...body, canPropose: false })[0].content;
  assert.doesNotMatch(without, /log_workout|01-jaw-clench/);
  assert.match(without, /can't save or start workouts/);
});

test('workouts: /chat returns the cleaned proposals next to the answer, reminders first, at most 3', async () => {
  const deps = (toolCalls, answer = '') => ({
    ai: { run: async () => ({ choices: [{ message: { content: answer, tool_calls: toolCalls.map(({ name, args }) => ({ function: { name, arguments: JSON.stringify(args) } })) } }] }) },
    model: 'm',
    appName: 'FaceRep',
    checkRateLimit: async () => 'ok',
  });
  const res = await handleChat(
    { method: 'POST', rawBody: JSON.stringify(body), ip: '1.2.3.4' },
    deps([call('log_workout', { days_ago: 0, exercises: ['01-jaw-clench', '11-chin-tuck'], minutes: 6 })], 'Nice work! Check it below.'),
  );
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    answer: 'Nice work! Check it below.',
    actions: [{ type: 'log', daysAgo: 0, plan: false, exercises: ['01-jaw-clench', '11-chin-tuck'], minutes: 6 }],
  });
  const many = await handleChat(
    { method: 'POST', rawBody: JSON.stringify({ ...body, reminders: [] }), ip: '1.2.3.4' },
    deps([
      call('suggest_workout', { exercises: ['06-cheek-lift', '07-fish-face'] }),
      call('create_reminder', { kind: 'workout', times: ['08:00'], days: [1] }),
      call('create_reminder', { kind: 'mewing', times: ['12:00'], days: [2] }),
      call('create_reminder', { kind: 'posture', times: ['16:00'], days: [3] }),
    ]),
  );
  assert.deepEqual(many.body.actions.map((a) => a.type), ['create', 'create', 'create']);
});
