import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CATALOG } from '../src/lib/catalog.js';
import { CONTENT_LIMITS, createContentTokens, handleContentFile, handleContentRequest, isContentPath } from '../src/lib/content.js';
import { buildPack, GUIDES, languages } from '../scripts/content.js';

const ID = '0f8fad5b-d9cb-469f-a165-70867728950e';
const NOW = Date.parse('2026-10-17T10:00:00Z');
const tokens = createContentTokens('sk_test_secret');
const request = (body, method = 'POST') => ({ method, rawBody: typeof body === 'string' ? body : JSON.stringify(body), ip: '1.2.3.4' });
const deps = (over = {}) => ({
  checkRateLimit: async () => 'ok',
  isPremium: async () => true,
  tokens,
  readPack: async () => '{"v":1,"version":"abc","texts":{},"files":[]}',
  now: NOW,
  ...over,
});

test('content: tokens are valid for an hour, and only with the same secret', async () => {
  const { token, expires } = await tokens.sign(NOW);
  assert.equal(expires, NOW + CONTENT_LIMITS.tokenMs);
  assert.equal(await tokens.verify(token, NOW), true);
  assert.equal(await tokens.verify(token, expires), false, 'expired');
  assert.equal(await createContentTokens('another secret').verify(token, NOW), false);
  // A later expiry with the old signature doesn't pass.
  const [, signature] = token.split('.');
  assert.equal(await tokens.verify(`${expires + 3_600_000}.${signature}`, NOW), false);
  for (const bad of ['', 'abc', `${expires}.`, `${expires}.${signature}x`, null, undefined, 42]) assert.equal(await tokens.verify(bad, NOW), false);
  assert.equal(createContentTokens(''), null);
});

test('content: POST /content gives the pack and a token only to Premium', async () => {
  const ok = await handleContentRequest(request({ appUserId: ID }), deps());
  assert.equal(ok.status, 200);
  const body = JSON.parse(ok.body);
  assert.deepEqual(body.pack, { v: 1, version: 'abc', texts: {}, files: [] });
  assert.equal(await tokens.verify(body.token, NOW), true);
  assert.equal(body.expires, NOW + CONTENT_LIMITS.tokenMs);

  assert.deepEqual(await handleContentRequest(request({ appUserId: ID }), deps({ isPremium: async () => false })), { status: 402, body: { error: 'premium' } });
  assert.equal((await handleContentRequest(request({ appUserId: ID }), deps({ isPremium: async () => 'unavailable' }))).status, 503);
});

test('content: strict input, rate limited, and closed without its setup', async () => {
  for (const bad of ['', 'not json', [], { appUserId: 'me' }, { appUserId: ID, extra: 1 }, { appUserId: ID.toUpperCase() }]) {
    assert.ok([400, 413].includes((await handleContentRequest(request(bad), deps())).status), JSON.stringify(bad));
  }
  assert.equal((await handleContentRequest(request('x'.repeat(500)), deps())).status, 413);
  assert.equal((await handleContentRequest(request({ appUserId: ID }, 'GET'), deps())).status, 405);
  assert.equal((await handleContentRequest(request({ appUserId: ID }), deps({ checkRateLimit: async () => 'limited' }))).status, 429);
  assert.equal((await handleContentRequest(request({ appUserId: ID }), deps({ checkRateLimit: async () => 'unavailable' }))).status, 503);
  // No RevenueCat key, no token key or no built pack: nothing goes out.
  for (const over of [{ isPremium: null }, { tokens: null }, { readPack: null }, { readPack: async () => null }]) {
    assert.equal((await handleContentRequest(request({ appUserId: ID }), deps(over))).status, 503, JSON.stringify(Object.keys(over)));
  }
  // RevenueCat is asked only after the rate limit and the input check pass.
  let asked = 0;
  await handleContentRequest(request({ appUserId: 'x' }), deps({ isPremium: async () => ++asked }));
  await handleContentRequest(request({ appUserId: ID }), deps({ checkRateLimit: async () => 'limited', isPremium: async () => ++asked }));
  assert.equal(asked, 0);
});

test('content: files need a valid token and a Premium file path', async () => {
  const { token } = await tokens.sign(NOW);
  const served = [];
  const fileDeps = {
    tokens,
    now: NOW,
    fetchAsset: async (path) => {
      served.push(path);
      return path.includes('missing') ? { ok: false } : { ok: true, path };
    },
  };
  const ok = await handleContentFile({ method: 'GET', path: 'man/04-mewing/clip.mp4', token }, fileDeps);
  assert.deepEqual(ok, { asset: { ok: true, path: 'man/04-mewing/clip.mp4' } });
  assert.equal((await handleContentFile({ method: 'GET', path: 'man/04-mewing/clip.mp4', token: '' }, fileDeps)).status, 401);
  assert.equal((await handleContentFile({ method: 'GET', path: 'man/04-mewing/clip.mp4', token }, { ...fileDeps, now: NOW + CONTENT_LIMITS.tokenMs })).status, 401);
  for (const path of ['pack.json', '../pack.json', 'man/04-mewing/../../pack.json', 'kid/04-mewing/clip.mp4', 'man/04-mewing/clip.mov', 'man/missing-x/clip.mp4']) {
    assert.equal((await handleContentFile({ method: 'GET', path, token }, fileDeps)).status, 404, path);
  }
  assert.equal((await handleContentFile({ method: 'POST', path: 'man/04-mewing/clip.mp4', token }, fileDeps)).status, 405);
  assert.deepEqual(served, ['man/04-mewing/clip.mp4']);
  assert.equal(isContentPath('woman/20-lip-corner-lift/thumb.webp'), true);
});

test('content: the pack has every Premium exercise, in both guides and every language, and nothing free', () => {
  const { pack, files } = buildPack();
  const premium = CATALOG.filter((e) => !e.free);
  assert.deepEqual(Object.keys(pack.texts).sort(), languages());
  for (const lang of languages()) assert.deepEqual(Object.keys(pack.texts[lang]).sort(), premium.map((e) => e.key).sort(), lang);
  for (const guide of GUIDES) {
    for (const e of premium) {
      for (const name of ['relaxed.webp', 'exercise.webp', 'thumb.webp']) assert.ok(pack.files.some((f) => f.path === `${guide}/${e.id}/${name}`), `${guide}/${e.id}/${name}`);
    }
  }
  for (const e of CATALOG.filter((x) => x.free)) assert.ok(!pack.files.some((f) => f.path.includes(e.id)), e.id);
  assert.ok(pack.files.every((f) => isContentPath(f.path) && /^[0-9a-f]{12}$/.test(f.hash) && f.size > 0));
  assert.equal(files.length, pack.files.length);
  assert.match(pack.version, /^[0-9a-f]{12}$/);
});
