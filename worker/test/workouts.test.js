import assert from 'node:assert/strict';
import { test } from 'node:test';

import { handleChat } from '../src/lib/handler.js';
import { CATALOG } from '../src/lib/catalog.js';
import { buildMessages } from '../src/lib/prompt.js';
import { EXERCISE_NAMES, sanitizeWorkoutCalls, workoutTools } from '../src/lib/workouts.js';

const call = (name, args) => ({ name, args });
const body = {
  appUserId: '0f8fad5b-d9cb-469f-a165-70867728950e',
  locale: 'en',
  question: 'Give me a quick jaw routine',
  history: [],
  context: { goal: 'jawline', streak: 3, workoutsLast7Days: 4 },
};

const FREE_IDS = CATALOG.filter((e) => e.free).map((e) => e.id);

test('workouts: every catalog exercise has a name for the prompt, and the tools only allow catalog ids', () => {
  assert.deepEqual(Object.keys(EXERCISE_NAMES).sort(), CATALOG.map((e) => e.id).sort());
  assert.deepEqual(workoutTools(true).map((t) => t.function.name), ['suggest_workout']);
  for (const tool of workoutTools(true)) assert.deepEqual(tool.function.parameters.properties.exercises.items.enum, CATALOG.map((e) => e.id));
  // Without Premium the model can't even pick a Premium id.
  for (const tool of workoutTools(false)) assert.deepEqual(tool.function.parameters.properties.exercises.items.enum, FREE_IDS);
});

test('workouts: the Coach never saves a workout (a workout is saved when it is finished in the app)', () => {
  assert.deepEqual(sanitizeWorkoutCalls([call('log_workout', { days_ago: 0, exercises: ['01-jaw-clench', '11-chin-tuck'], minutes: 6 })], true), []);
});

test('workouts: a routine needs 2–8 known exercises; one routine per answer', () => {
  const ids = CATALOG.map((e) => e.id);
  assert.deepEqual(sanitizeWorkoutCalls([call('suggest_workout', { title: '  Quick   jaw  ', exercises: ['01-jaw-clench', '11-chin-tuck'] })], true), [
    { type: 'routine', title: 'Quick jaw', exercises: ['01-jaw-clench', '11-chin-tuck'] },
  ]);
  assert.deepEqual(sanitizeWorkoutCalls([call('suggest_workout', { exercises: ['01-jaw-clench', 'squats'] })], true), []);
  // An id's number alone (the model sometimes sends that) is the same exercise; a number that isn't one is dropped.
  assert.deepEqual(sanitizeWorkoutCalls([call('suggest_workout', { exercises: [4, '12', 11, 2, 99, 4.5] })], true)[0].exercises, [
    '04-mewing',
    '12-tongue-press',
    '11-chin-tuck',
    '02-chin-lift',
  ]);
  // Without Premium a number can't reach a Premium exercise either (1 = Jaw Clench).
  assert.deepEqual(sanitizeWorkoutCalls([call('suggest_workout', { exercises: [1, 2, 6] })])[0].exercises, ['02-chin-lift', '06-cheek-lift']);
  assert.equal(sanitizeWorkoutCalls([call('suggest_workout', { exercises: ids })], true)[0].exercises.length, 8);
  const twice = sanitizeWorkoutCalls([
    call('suggest_workout', { exercises: ids.slice(0, 3) }),
    call('suggest_workout', { exercises: ids.slice(3, 6) }),
    call('create_reminder', { kind: 'workout', times: ['08:00'], days: [1] }),
  ], true);
  assert.deepEqual(twice.map((a) => [a.type, a.exercises[0]]), [['routine', ids[0]]]);
});

test('workouts: without Premium only free exercises get through (and a routine still needs 2 of them)', () => {
  assert.deepEqual(sanitizeWorkoutCalls([call('suggest_workout', { exercises: ['01-jaw-clench', '02-chin-lift'] })]), []);
  assert.deepEqual(sanitizeWorkoutCalls([call('suggest_workout', { exercises: ['02-chin-lift', '06-cheek-lift', '04-mewing'] })])[0].exercises, [
    '02-chin-lift',
    '06-cheek-lift',
  ]);
});

test('workouts: the prompt explains the tools and lists the ids only when tools are on', () => {
  const withTools = buildMessages({ ...body, canPropose: true, premium: true })[0].content;
  assert.match(withTools, /call suggest_workout/);
  assert.match(withTools, /You can't save workouts/);
  assert.match(withTools, /27-temple-circles Temple Circles/);
  assert.match(withTools, /01-jaw-clench Jaw Clench/);
  const without = buildMessages({ ...body, canPropose: false })[0].content;
  assert.doesNotMatch(without, /suggest_workout|01-jaw-clench/);
  assert.match(without, /can't save or start workouts/);
});

test('workouts: a free user\'s prompt names no Premium exercise, and says Premium unlocks the rest', () => {
  for (const canPropose of [true, false]) {
    const free = buildMessages({ ...body, canPropose })[0].content;
    for (const e of CATALOG.filter((x) => !x.free)) {
      assert.doesNotMatch(free, new RegExp(e.id), e.id);
      assert.doesNotMatch(free, new RegExp(`${EXERCISE_NAMES[e.id]}\\b`), EXERCISE_NAMES[e.id]);
    }
    assert.match(free, /Chin Lift/);
    assert.match(free, /Premium unlocks every exercise/);
  }
  assert.doesNotMatch(buildMessages({ ...body, premium: true })[0].content, /doesn't have Premium/);
});

test('workouts: /chat returns the cleaned proposals next to the answer, reminders first, at most 3', async () => {
  const deps = (toolCalls, answer = '', premium = true) => ({
    ai: { run: async () => ({ choices: [{ message: { content: answer, tool_calls: toolCalls.map(({ name, args }) => ({ function: { name, arguments: JSON.stringify(args) } })) } }] }) },
    model: 'm',
    appName: 'FaceRep',
    checkRateLimit: async () => 'ok',
    checkAccess: async () => ({ ok: true, premium, commit: async () => {} }),
  });
  const res = await handleChat(
    { method: 'POST', rawBody: JSON.stringify(body), ip: '1.2.3.4' },
    deps([call('suggest_workout', { title: 'Quick jaw', exercises: ['01-jaw-clench', '11-chin-tuck', '02-chin-lift'] })], 'Here you go. Check it below.'),
  );
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    answer: 'Here you go. Check it below.',
    actions: [{ type: 'routine', title: 'Quick jaw', exercises: ['01-jaw-clench', '11-chin-tuck', '02-chin-lift'] }],
  });
  // The same answer for a free user: the Premium exercises are dropped, and one free exercise is no routine.
  const free = await handleChat(
    { method: 'POST', rawBody: JSON.stringify(body), ip: '1.2.3.4' },
    deps([call('suggest_workout', { exercises: ['01-jaw-clench', '11-chin-tuck', '02-chin-lift'] })], 'Here you go.', false),
  );
  assert.deepEqual(free.body, { answer: 'Here you go.' });
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

test('workouts: a proposal that is dropped, with no text, goes to the fallback, which answers in text', async () => {
  const empty = { choices: [{ message: { content: '', tool_calls: [{ function: { name: 'suggest_workout', arguments: '{"exercises":["02-chin-lift"]}' } }] } }] };
  const answers = [empty, { response: 'Try Chin Lift and Cheek Lift.' }];
  const models = [];
  const res = await handleChat(
    { method: 'POST', rawBody: JSON.stringify(body), ip: '1.2.3.4' },
    {
      ai: { run: async (model) => answers[models.push(model) - 1] },
      model: 'main',
      fallbackModel: 'lite',
      checkRateLimit: async () => 'ok',
      checkAccess: async () => ({ ok: true, premium: true, commit: async () => {} }),
    },
  );
  assert.deepEqual(models, ['main', 'lite']);
  assert.deepEqual(res, { status: 200, body: { answer: 'Try Chin Lift and Cheek Lift.' } });
});

test('names: every language has every exercise, English matches the prompt, and a free user gets no Premium name', async () => {
  const { namesIn } = await import('../src/lib/names.js');
  for (const locale of ['en', 'es', 'pt-BR', 'de', 'fr', 'it']) {
    const names = namesIn(locale);
    for (const e of CATALOG) assert.ok(names[e.id], `${locale} ${e.id}`);
  }
  for (const e of CATALOG) assert.equal(namesIn('en')[e.id], EXERCISE_NAMES[e.id], e.id);
  assert.equal(namesIn('ja'), null);
  const es = namesIn('es');
  const premium = buildMessages({ ...body, locale: 'es', canPropose: true, premium: true })[0].content;
  assert.match(premium, new RegExp(`Jaw Clench = ${es['01-jaw-clench']}`));
  for (const canPropose of [true, false]) {
    const free = buildMessages({ ...body, locale: 'es', canPropose })[0].content;
    assert.match(free, new RegExp(`Chin Lift = ${es['02-chin-lift']}`));
    for (const e of CATALOG.filter((x) => !x.free)) if (es[e.id] !== EXERCISE_NAMES[e.id]) assert.doesNotMatch(free, new RegExp(es[e.id]), e.id);
  }
  assert.doesNotMatch(buildMessages({ ...body, canPropose: true })[0].content, /Exercise names:/);
});

test('jaw caution: every language has the app\'s own, and the prompt gives it outside English', async () => {
  const { jawCautionIn } = await import('../src/lib/names.js');
  for (const locale of ['en', 'es', 'pt-BR', 'de', 'fr', 'it']) assert.ok(jawCautionIn(locale), locale);
  assert.equal(jawCautionIn('ja'), null);
  const fr = buildMessages({ ...body, locale: 'fr', canPropose: true })[0].content;
  assert.ok(fr.includes(jawCautionIn('fr')));
  assert.match(fr, /Never write the English abbreviation TMJ/);
  assert.doesNotMatch(buildMessages({ ...body, canPropose: true })[0].content, /Jaw caution:/);
});
