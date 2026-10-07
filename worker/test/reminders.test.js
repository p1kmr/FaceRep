import assert from 'node:assert/strict';
import { test } from 'node:test';

import { handleChat } from '../src/lib/handler.js';
import { buildMessages } from '../src/lib/prompt.js';
import { extractToolCalls, REMINDER_TOOLS, sanitizeActions } from '../src/lib/reminders.js';
import { validateChatRequest } from '../src/lib/validate.js';

const mewing = { id: 'm1', title: 'Tongue up', kind: 'mewing', enabled: true, times: ['10:00', '14:00'], days: [1, 2, 3, 4, 5] };
const body = {
  appUserId: '0f8fad5b-d9cb-469f-a165-70867728950e',
  locale: 'en',
  question: 'Remind me to do mewing checks every 2 hours on weekdays',
  history: [],
  context: { goal: 'jawline', streak: 3, workoutsLast7Days: 4 },
  reminders: [mewing],
};
const call = (name, args) => ({ name, args });

test('reminders: the app may send its reminder list; anything malformed is rejected', () => {
  assert.deepEqual(validateChatRequest(body).reminders, [mewing]);
  assert.deepEqual(validateChatRequest({ ...body, reminders: undefined }).reminders, []);
  const bad = [
    [{ ...mewing, times: ['7pm'] }],
    [{ ...mewing, days: [7] }],
    [{ ...mewing, note: 'extra key' }],
    [{ ...mewing, kind: 'nap' }],
    [{ ...mewing, id: 'Robert"); DROP' }],
    Array.from({ length: 11 }, (_, i) => ({ ...mewing, id: `r${i}` })),
    'not a list',
  ];
  for (const reminders of bad) assert.equal(validateChatRequest({ ...body, reminders }), null);
});

test('reminders: tool calls are read from both Workers AI shapes; bad JSON is skipped', () => {
  const openAi = { choices: [{ message: { content: null, tool_calls: [{ function: { name: 'delete_reminder', arguments: '{"id":"m1"}' } }, { function: { name: 'x', arguments: '{oops' } }] } }] };
  assert.deepEqual(extractToolCalls(openAi), [call('delete_reminder', { id: 'm1' })]);
  assert.deepEqual(extractToolCalls({ tool_calls: [{ name: 'delete_reminder', arguments: { id: 'm1' } }] }), [call('delete_reminder', { id: 'm1' })]);
  assert.deepEqual(extractToolCalls({ response: 'just text' }), []);
  assert.deepEqual(
    REMINDER_TOOLS.map((t) => t.function.name),
    ['create_reminder', 'update_reminder', 'delete_reminder'],
  );
});

test('reminders: proposals are cleaned, limited and only touch the user\'s own reminders', () => {
  const actions = sanitizeActions(
    [
      call('create_reminder', { kind: 'mewing', title: '  Tongue   up  ', times: ['16:00', '10:00', '10:00', '25:00'], days: [5, 1] }),
      call('create_reminder', { kind: 'posture', times: [], days: [1] }), // no valid time
      call('update_reminder', { id: 'm1', enabled: false }),
      call('update_reminder', { id: 'm1', title: 'twice' }), // one change per reminder
      call('delete_reminder', { id: 'someone-else' }), // not in the list
      call('update_reminder', { id: 'm1' }),
    ],
    [mewing],
  );
  assert.deepEqual(actions, [
    { type: 'create', kind: 'mewing', title: 'Tongue up', times: ['10:00', '16:00'], days: [1, 5] },
    { type: 'update', id: 'm1', enabled: false },
  ]);
  const unknownKind = sanitizeActions([call('create_reminder', { kind: 'nap', times: ['09:00'], days: [0] })]);
  assert.equal(unknownKind[0].kind, 'custom');
  const full = Array.from({ length: 10 }, (_, i) => ({ ...mewing, id: `r${i}` }));
  assert.deepEqual(sanitizeActions([call('create_reminder', { kind: 'workout', times: ['19:00'], days: [0] })], full), []);
  const many = Array.from({ length: 5 }, () => call('create_reminder', { kind: 'workout', times: ['19:00'], days: [0] }));
  assert.equal(sanitizeActions(many).length, 3);
});

test('reminders: the prompt lists them only when the model can propose changes', () => {
  const [withTools] = buildMessages({ ...validateChatRequest(body), canPropose: true });
  assert.match(withTools.content, /create_reminder/);
  assert.match(withTools.content, /"id":"m1"/);
  const [without] = buildMessages({ ...validateChatRequest(body), canPropose: false });
  assert.doesNotMatch(without.content, /"id":"m1"/);
  assert.match(without.content, /Settings, Reminders/);
});

/** Fake env.AI: answers in order and records what each call got. */
function fakeAi(answers) {
  const calls = [];
  return {
    calls,
    run: async (model, input) => {
      calls.push({ model, input });
      const next = answers[Math.min(calls.length - 1, answers.length - 1)];
      if (next instanceof Error) throw next;
      return next;
    },
  };
}
const request = (b) => ({ method: 'POST', rawBody: JSON.stringify(b), ip: '1.2.3.4' });

test('/chat: a reminder proposal comes back as an action next to the answer (and counts as an answer)', async () => {
  let committed = 0;
  const ai = fakeAi([
    {
      choices: [
        {
          message: {
            content: 'I prepared a mewing check every 2 hours on weekdays. Confirm it below.',
            tool_calls: [{ function: { name: 'create_reminder', arguments: JSON.stringify({ kind: 'mewing', times: ['10:00', '12:00'], days: [1, 2, 3, 4, 5] }) } }],
          },
        },
      ],
    },
  ]);
  const res = await handleChat(request(body), {
    ai,
    model: 'main',
    fallbackModel: 'lite',
    checkRateLimit: async () => 'ok',
    checkAccess: async () => ({ ok: true, commit: async () => committed++ }),
  });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.actions, [{ type: 'create', kind: 'mewing', title: '', times: ['10:00', '12:00'], days: [1, 2, 3, 4, 5] }]);
  assert.match(res.body.answer, /Confirm/);
  assert.equal(committed, 1);
  assert.equal(ai.calls[0].input.tools.length, 3);
});

test('/chat: tool calls without text are fine; the fallback model gets no tools', async () => {
  const toolsOnly = fakeAi([{ tool_calls: [{ name: 'delete_reminder', arguments: { id: 'm1' } }], response: '' }]);
  const res = await handleChat(request(body), { ai: toolsOnly, model: 'main', checkRateLimit: async () => 'ok' });
  assert.deepEqual(res.body, { answer: '', actions: [{ type: 'delete', id: 'm1' }] });

  const fallback = fakeAi([new Error('down'), { response: 'Set it in Settings, Reminders.' }]);
  const res2 = await handleChat(request(body), { ai: fallback, model: 'main', fallbackModel: 'lite', checkRateLimit: async () => 'ok' });
  assert.deepEqual(res2.body, { answer: 'Set it in Settings, Reminders.' });
  assert.equal(fallback.calls[1].input.tools, undefined);
  assert.match(fallback.calls[1].input.messages[0].content, /can't change reminders/);
});
