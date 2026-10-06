import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createAccessCheck, createFreeUsage, createPremiumCheck, FREE_PER_MONTH, pruneFreeUsage } from '../src/lib/access.js';
import { createDeviceCheck, deviceCheckJwt } from '../src/lib/devicecheck.js';

const NOW = new Date('2026-10-06T10:00:00Z');
const ID = '0f8fad5b-d9cb-469f-a165-70867728950e';

/** In-memory stand-in for the free_usage statements. */
function fakeDb() {
  const rows = new Map();
  return {
    rows,
    prepare: (sql) => ({
      bind: (...args) => ({
        first: async () => {
          const key = `${args[0]}|${args[1]}`;
          if (sql.startsWith('SELECT')) return rows.has(key) ? { count: rows.get(key) } : null;
          rows.set(key, (rows.get(key) ?? 0) + 1);
          return { count: rows.get(key) };
        },
        run: async () => {
          for (const k of [...rows.keys()]) if (k.split('|')[1] < args[0]) rows.delete(k);
        },
      }),
    }),
  };
}

function fakeDevice({ bit0 = false, month = null, valid = true } = {}) {
  const state = { bit0, bit1: false, month, updates: 0 };
  return {
    state,
    query: async (token) => (valid && token ? { ok: true, ...state, host: 'h' } : { ok: false, reason: 'invalid' }),
    setUsed: async () => {
      state.updates++;
      state.bit0 = true;
      state.month = NOW.toISOString().slice(0, 7);
    },
  };
}

async function useAll(check, input) {
  for (let i = 0; i < FREE_PER_MONTH; i++) {
    const r = await check(input, NOW);
    assert.equal(r.ok, true, `answer ${i + 1}`);
    await r.commit();
  }
}

test('without a RevenueCat key the gate stays open', async () => {
  const check = createAccessCheck({ isPremium: null, freeUsage: createFreeUsage(fakeDb()), deviceCheck: null });
  assert.equal((await check({ appUserId: ID }, NOW)).ok, true);
});

test('premium passes; RevenueCat down → 503', async () => {
  const freeUsage = createFreeUsage(fakeDb());
  assert.equal((await createAccessCheck({ isPremium: async () => true, freeUsage })({ appUserId: ID }, NOW)).ok, true);
  const down = await createAccessCheck({ isPremium: async () => 'unavailable', freeUsage })({ appUserId: ID }, NOW);
  assert.deepEqual([down.status, down.body.error], [503, 'unavailable']);
});

test('free: monthly allowance per app ID, refills next month', async () => {
  const check = createAccessCheck({ isPremium: async () => false, freeUsage: createFreeUsage(fakeDb()) });
  await useAll(check, { appUserId: ID });
  const blocked = await check({ appUserId: ID }, NOW);
  assert.deepEqual([blocked.status, blocked.body.error], [402, 'freeUsed']);
  assert.equal((await check({ appUserId: ID }, new Date('2026-11-01T00:00:00Z'))).ok, true);
});

test('free with DeviceCheck: needs a valid token; the shared per-team bits are never read or written', async () => {
  const device = fakeDevice({ bit0: true, month: '2026-10' }); // e.g. Elowa marked this iPhone this month
  const check = createAccessCheck({ isPremium: async () => false, freeUsage: createFreeUsage(fakeDb()), deviceCheck: device });
  assert.equal((await check({ appUserId: ID }, NOW)).status, 403, 'no token');
  await useAll(check, { appUserId: ID, deviceToken: 'tok' });
  assert.equal(device.state.updates, 0, 'FaceRep never writes the bits');
  const blocked = await check({ appUserId: ID, deviceToken: 'tok' }, NOW);
  assert.deepEqual([blocked.status, blocked.body.error], [402, 'freeUsed']);
  const bad = createAccessCheck({ isPremium: async () => false, freeUsage: createFreeUsage(fakeDb()), deviceCheck: fakeDevice({ valid: false }) });
  assert.equal((await bad({ appUserId: ID, deviceToken: 'tok' }, NOW)).status, 403);
});

test('pruning keeps this and last month', async () => {
  const db = fakeDb();
  const usage = createFreeUsage(db);
  for (const m of ['2026-08', '2026-09', '2026-10']) await usage.add(ID, m);
  await pruneFreeUsage(db, NOW);
  assert.deepEqual([...db.rows.keys()].map((k) => k.split('|')[1]), ['2026-09', '2026-10']);
});

test('RevenueCat: active, expired and missing entitlements', async () => {
  const calls = [];
  const reply = (entitlements) => async (url, init) => {
    calls.push({ url, init });
    return Response.json({ subscriber: { entitlements } });
  };
  const at = (ent) => createPremiumCheck({ secretKey: 'sk_test', fetchImpl: reply(ent) })(ID, NOW);
  assert.equal(await at({ premium: { expires_date: '2026-11-01T00:00:00Z' } }), true);
  assert.equal(await at({ premium: { expires_date: null } }), true, 'lifetime');
  assert.equal(await at({ premium: { expires_date: '2026-10-01T00:00:00Z' } }), false);
  assert.equal(await at({}), false);
  assert.equal(calls[0].url, `https://api.revenuecat.com/v1/subscribers/${ID}`);
  assert.equal(calls[0].init.headers.Authorization, 'Bearer sk_test');
  assert.equal(await createPremiumCheck({ secretKey: 'k', fetchImpl: async () => new Response('', { status: 500 }) })(ID), 'unavailable');
  assert.equal(createPremiumCheck({ secretKey: '' }), null);
});

async function testKey() {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const der = Buffer.from(await crypto.subtle.exportKey('pkcs8', pair.privateKey)).toString('base64');
  return { pem: `-----BEGIN PRIVATE KEY-----\n${der.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`, publicKey: pair.publicKey };
}

test('DeviceCheck JWT: ES256, signed with the .p8 key', async () => {
  const { pem, publicKey } = await testKey();
  const jwt = await deviceCheckJwt({ keyP8: pem, keyId: 'KEY123', teamId: 'TEAM45', now: 1_700_000_000_000 });
  const [h, p, s] = jwt.split('.');
  const json = (part) => JSON.parse(Buffer.from(part, 'base64url').toString());
  assert.deepEqual(json(h), { alg: 'ES256', kid: 'KEY123' });
  assert.deepEqual(json(p), { iss: 'TEAM45', iat: 1_700_000_000 });
  const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, publicKey, Buffer.from(s, 'base64url'), new TextEncoder().encode(`${h}.${p}`));
  assert.ok(ok);
});

test('DeviceCheck: falls back to the development host; unknown devices read as unmarked', async () => {
  const { pem } = await testKey();
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(url);
    if (!url.includes('development')) return new Response('bad token', { status: 400 });
    if (url.endsWith('query_two_bits')) return new Response('Failed to find bit state', { status: 200 });
    return new Response('', { status: 200 });
  };
  const dc = createDeviceCheck({ keyP8: pem, keyId: 'K', teamId: 'T', fetchImpl });
  const state = await dc.query('tok');
  assert.deepEqual(state, { ok: true, bit0: false, bit1: false, month: null, host: 'https://api.development.devicecheck.apple.com' });
  assert.equal(dc.setUsed, undefined, 'query only: the bits are shared by all apps of the team');
  assert.equal(urls.at(-1), 'https://api.development.devicecheck.apple.com/v1/query_two_bits');
  const bad = createDeviceCheck({ keyP8: pem, keyId: 'K', teamId: 'T', fetchImpl: async () => new Response('', { status: 400 }) });
  assert.deepEqual(await bad.query('tok'), { ok: false, reason: 'invalid' });
  assert.equal(createDeviceCheck({ keyP8: '', keyId: 'K', teamId: 'T' }), null);
});
