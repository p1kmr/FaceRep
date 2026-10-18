import assert from 'node:assert/strict';
import { test } from 'node:test';

import { chooseModels, createGemini, createModels, GEMINI_URL, THINKING_TOKENS } from '../src/lib/gemini.js';
import { handleChat } from '../src/lib/handler.js';

const body = {
  appUserId: '0f8fad5b-d9cb-469f-a165-70867728950e',
  locale: 'en',
  question: 'Remind me to train at 7 pm every day',
  history: [],
  context: { goal: 'jawline', streak: 3, workoutsLast7Days: 4 },
  reminders: [],
};
const request = (b) => ({ method: 'POST', rawBody: JSON.stringify(b), ip: '1.2.3.4' });
const answer = (message) => ({ choices: [{ message, finish_reason: 'stop' }] });

/** Fake fetch: answers with each response in turn and records each request. */
function fakeFetch(responses) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    const [status, json] = responses[Math.min(calls.length - 1, responses.length - 1)];
    return { ok: status < 400, status, json: async () => json };
  };
  return { calls, fetchImpl };
}

/** Fake Workers AI (env.AI) that records each call. */
function fakeWorkersAi(result) {
  const calls = [];
  return { calls, run: async (model, input) => (calls.push({ model, input }), result) };
}

const tools = [{ type: 'function', function: { name: 'delete_reminder', parameters: { type: 'object', properties: {} } } }];

test('gemini: posts the messages and tools with the key, thinking low, Google\'s default temperature, no Workers AI options', async () => {
  const { calls, fetchImpl } = fakeFetch([[200, answer({ content: 'Hi' })]]);
  const gemini = createGemini({ apiKey: 'k', fetchImpl });
  const messages = [{ role: 'user', content: 'Hi' }];
  const out = await gemini.run('gemini-x', { messages, max_completion_tokens: 700, temperature: 0.6, chat_template_kwargs: { enable_thinking: false }, tools });
  assert.deepEqual(out, answer({ content: 'Hi' }));
  assert.equal(calls[0].url, GEMINI_URL);
  assert.equal(calls[0].init.headers.authorization, 'Bearer k');
  assert.deepEqual(calls[0].body, { model: 'gemini-x', messages, max_tokens: 700 + THINKING_TOKENS, reasoning_effort: 'low', tools, tool_choice: 'auto' });

  await gemini.run('gemini-x', { messages, max_completion_tokens: 700, temperature: 0.6 });
  assert.equal(calls[1].body.tools, undefined);
  assert.equal(calls[1].body.tool_choice, undefined);
});

test('gemini: an error carries the status and Google\'s message; no key fails without a request', async () => {
  const { calls, fetchImpl } = fakeFetch([[429, [{ error: { message: 'Quota exceeded' } }]], [400, { error: { message: 'Bad model' } }]]);
  const gemini = createGemini({ apiKey: 'k', fetchImpl });
  await assert.rejects(gemini.run('gemini-x', { messages: [] }), /gemini 429: Quota exceeded/);
  await assert.rejects(gemini.run('gemini-x', { messages: [] }), /gemini 400: Bad model/);
  await assert.rejects(createGemini({ apiKey: '', fetchImpl }).run('gemini-x', { messages: [] }), /no GEMINI_API_KEY/);
  assert.equal(calls.length, 2);
});

test('models: "gemini-…" goes to Google, "@cf/…" to Workers AI; without the key the fallback answers alone', async () => {
  const ai = fakeWorkersAi(answer({ content: 'from Cloudflare' }));
  const gemini = { run: async () => answer({ content: 'from Gemini' }) };
  const models = createModels({ ai, gemini });
  assert.equal((await models.run('gemini-x', {})).choices[0].message.content, 'from Gemini');
  assert.equal((await models.run('@cf/google/gemma', {})).choices[0].message.content, 'from Cloudflare');

  assert.deepEqual(chooseModels({ model: 'gemini-x', fallbackModel: '@cf/a', geminiKey: 'k' }), { model: 'gemini-x', fallbackModel: '@cf/a' });
  assert.deepEqual(chooseModels({ model: 'gemini-x', fallbackModel: '@cf/a', geminiKey: undefined }), { model: '@cf/a', fallbackModel: '@cf/a' });
  assert.deepEqual(chooseModels({ model: '@cf/b', fallbackModel: '@cf/a', geminiKey: undefined }), { model: '@cf/b', fallbackModel: '@cf/a' });
});

test('/chat: Gemini proposes; the app ID and IP never go to Google; when Gemini fails Workers AI answers with tools', async () => {
  const call = { id: 'c1', type: 'function', function: { name: 'create_reminder', arguments: '{"kind":"workout","times":["19:00"],"days":[0,1,2,3,4,5,6]}' } };
  const { calls, fetchImpl } = fakeFetch([[200, answer({ content: 'Check it below.', tool_calls: [call] })]]);
  const ai = fakeWorkersAi(answer({ content: 'unused' }));
  const deps = (f) => ({ ai: createModels({ ai, gemini: createGemini({ apiKey: 'k', fetchImpl: f }) }), model: 'gemini-x', fallbackModel: '@cf/g', checkRateLimit: async () => 'ok' });

  const res = await handleChat(request(body), deps(fetchImpl));
  assert.equal(res.status, 200);
  assert.equal(res.body.actions[0].type, 'create');
  assert.equal(ai.calls.length, 0);
  const sent = JSON.stringify(calls[0].body);
  assert.ok(!sent.includes(body.appUserId) && !sent.includes('1.2.3.4'));

  const down = fakeFetch([[503, { error: { message: 'Overloaded' } }]]);
  const res2 = await handleChat(request(body), deps(down.fetchImpl));
  assert.deepEqual(res2.body, { answer: 'unused' });
  assert.equal(ai.calls[0].model, '@cf/g');
  assert.ok(ai.calls[0].input.tools.length > 0);
  assert.deepEqual(ai.calls[0].input.chat_template_kwargs, { enable_thinking: false });
});

test('/chat: an answer pointing at a card without a proposal is not shown; the fallback answers', async () => {
  const { fetchImpl } = fakeFetch([[200, answer({ content: 'Ho preparato il promemoria. Conferma qui sotto!' })]]);
  const call = { id: 'c1', type: 'function', function: { name: 'create_reminder', arguments: '{"kind":"workout","times":["19:00"],"days":[0,1,2,3,4,5,6]}' } };
  const ai = fakeWorkersAi(answer({ content: '', tool_calls: [call] }));
  const res = await handleChat(request(body), { ai: createModels({ ai, gemini: createGemini({ apiKey: 'k', fetchImpl }) }), model: 'gemini-x', fallbackModel: '@cf/g', checkRateLimit: async () => 'ok' });
  assert.equal(res.body.actions[0].type, 'create');
  assert.equal(ai.calls.length, 1);

  const plain = fakeFetch([[200, answer({ content: 'Keep your jaw relaxed and breathe.' })]]);
  const res2 = await handleChat(request(body), { ai: createModels({ ai, gemini: createGemini({ apiKey: 'k', fetchImpl: plain.fetchImpl }) }), model: 'gemini-x', fallbackModel: '@cf/g', checkRateLimit: async () => 'ok' });
  assert.deepEqual(res2.body, { answer: 'Keep your jaw relaxed and breathe.' });
  assert.equal(ai.calls.length, 1);
});

test('prompt: propose by calling the tool and writing nothing about it; the app\'s card line is explained in every language', async () => {
  const { buildMessages } = await import('../src/lib/prompt.js');
  const { preparedIn } = await import('../src/lib/names.js');
  for (const locale of ['en', 'es', 'pt-BR', 'de', 'fr', 'it']) {
    const system = buildMessages({ ...body, locale, canPropose: true })[0].content;
    assert.ok(system.includes(`"${preparedIn(locale)}" is the app's own line under a card`), locale);
    assert.doesNotMatch(system, /say briefly what you prepared/);
  }
  assert.equal(preparedIn('ja'), preparedIn('en'));
  assert.doesNotMatch(buildMessages({ ...body, canPropose: false })[0].content, /Cards:/);
});
