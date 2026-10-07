import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { buildPlan, CATALOG, CATALOG_VERSION, FREE_DAYS, freeWeek, LIGHT_DAY, MAX_LEVEL, PLAN_DAYS, premiumDays, WEEKS } from '../src/lib/plan.js';
import { handlePlan } from '../src/lib/planHandler.js';
import { GOALS } from '../src/lib/validate.js';

const appFile = (path) => readFileSync(new URL(`../../app/src/${path}`, import.meta.url), 'utf8');
const loadsJaw = new Set(CATALOG.filter((e) => e.loadsJaw).map((e) => e.id));
const programOf = Object.fromEntries(CATALOG.map((e) => [e.id, e.program]));

test('plan: catalog matches the app (order, program, jaw caution, catalog version)', () => {
  const source = appFile('constants/exercises.ts');
  const appVersion = Number(source.match(/export const CATALOG_VERSION = (\d+);/)[1]);
  assert.equal(appVersion, CATALOG_VERSION, 'bump CATALOG_VERSION in the app and here together');
  const ids = [...source.match(/export const EXERCISE_IDS = \[([\s\S]*?)\] as const/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const fromApp = ids.map((id) => {
    const entry = source.match(new RegExp(`'${id}': \\{([^}]*)\\}`))[1];
    return { id, program: entry.match(/program: '(\w+)'/)[1], loadsJaw: /jawCaution: true/.test(entry) };
  });
  assert.deepEqual(
    CATALOG.map(({ since: _, ...e }) => e),
    fromApp,
  );
  assert.ok(CATALOG.every((e) => Number.isInteger(e.since) && e.since >= 1 && e.since <= CATALOG_VERSION));
});

test('plan: an app only gets exercises its catalog version has', () => {
  for (const goal of GOALS) {
    for (let catalog = 1; catalog <= CATALOG_VERSION; catalog++) {
      const known = new Set(CATALOG.filter((e) => e.since <= catalog).map((e) => e.id));
      for (let level = 1; level <= MAX_LEVEL; level++) {
        assert.ok(buildPlan(goal, level, catalog).every((d) => d.ids.every((id) => known.has(id))), `${goal} L${level} v${catalog}`);
      }
    }
  }
  assert.ok(LIGHT_DAY.ids.every((id) => CATALOG.find((e) => e.id === id).since === 1), 'light days work for every app');
});

test('plan: the free week bundled in the app is exactly Level 1, days 1–7 (run npm run plan:export)', () => {
  assert.deepEqual(JSON.parse(appFile('constants/planFreeWeek.json')), freeWeek());
});

test('plan: 28 days, light days 7/14/21, final day 28, harder each week', () => {
  for (const goal of GOALS) {
    const plan = buildPlan(goal, 1);
    assert.equal(plan.length, PLAN_DAYS);
    plan.forEach((d, i) => {
      assert.equal(d.day, i + 1);
      const week = WEEKS[Math.floor(i / 7)];
      if ([7, 14, 21].includes(d.day)) {
        assert.equal(d.kind, 'light');
        assert.deepEqual(d.ids, LIGHT_DAY.ids);
        return;
      }
      assert.equal(d.kind, d.day === 28 ? 'final' : 'workout');
      assert.equal(d.ids.length, week.count + (d.day === 28 ? 1 : 0), `${goal} day ${d.day}`);
      assert.equal(new Set(d.ids).size, d.ids.length);
      assert.equal(d.repPct, week.repPct);
      assert.equal(d.holdPlusSec, week.holdPlusSec);
      // Always in catalog order (jaw → cheeks → eyes)
      const order = d.ids.map((id) => CATALOG.findIndex((e) => e.id === id));
      assert.deepEqual(order, [...order].sort((a, b) => a - b));
    });
  }
});

test('plan: week 1 of Level 1 leaves out the exercises that load the jaw; later weeks bring them in', () => {
  for (const goal of GOALS) {
    const plan = buildPlan(goal, 1);
    assert.ok(plan.slice(0, 7).every((d) => d.ids.every((id) => !loadsJaw.has(id))), goal);
  }
  assert.ok(buildPlan('jawline', 1).slice(7).some((d) => d.ids.includes('01-jaw-clench')));
  assert.ok(buildPlan('jawline', 2)[0].ids.some((id) => loadsJaw.has(id)), 'Level 2 has them from day 1');
  assert.ok(LIGHT_DAY.ids.every((id) => !loadsJaw.has(id)));
});

test('plan: a program goal mostly trains that program and every one of its exercises comes up each week', () => {
  for (const goal of ['jawline', 'cheekbones', 'eyes']) {
    const own = CATALOG.filter((e) => e.program === goal).map((e) => e.id);
    const plan = buildPlan(goal, 1);
    for (let w = 1; w < 4; w++) {
      const workouts = plan.slice(w * 7, w * 7 + 7).filter((d) => d.kind !== 'light');
      const seen = new Set(workouts.flatMap((d) => d.ids));
      assert.ok(own.every((id) => seen.has(id)), `${goal} week ${w + 1}`);
      for (const d of workouts) {
        const mine = d.ids.filter((id) => programOf[id] === goal).length;
        assert.ok(mine >= Math.min(own.length, d.ids.length), `${goal} day ${d.day}`);
      }
    }
  }
});

test('plan: full face covers the whole catalog', () => {
  const seen = new Set(buildPlan('full', 1).flatMap((d) => d.ids));
  assert.equal(seen.size, CATALOG.length);
});

test('plan: each level adds reps and hold time; premium days are Level 1 without its free week', () => {
  const [l1, l2, l3] = [1, 2, 3].map((l) => buildPlan('jawline', l));
  assert.equal(l2[20].repPct, l1[20].repPct + 10);
  assert.equal(l3[20].holdPlusSec, l1[20].holdPlusSec + 2);
  assert.deepEqual(premiumDays('eyes', 1).map((d) => d.day), Array.from({ length: PLAN_DAYS - FREE_DAYS }, (_, i) => i + FREE_DAYS + 1));
  assert.equal(premiumDays('eyes', MAX_LEVEL).length, PLAN_DAYS);
});

const appUserId = '0f8fad5b-d9cb-469f-a165-70867728950e';
const request = (b, method = 'POST') => ({ method, rawBody: typeof b === 'string' ? b : JSON.stringify(b), ip: '1.2.3.4' });
const deps = (over = {}) => ({ checkRateLimit: async () => 'ok', isPremium: async () => true, ...over });

test('/plan: Premium gets the premium days of its goal and level', async () => {
  const res = await handlePlan(request({ appUserId, goal: 'jawline', level: 1 }), deps());
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { goal: 'jawline', level: 1, days: premiumDays('jawline', 1) });
});

test('/plan: the catalog version is optional (older apps: 1); a newer app gets what this Worker has', async () => {
  const days = (catalog) => handlePlan(request({ appUserId, goal: 'full', level: 2, ...(catalog ? { catalog } : {}) }), deps()).then((r) => r.body.days);
  assert.deepEqual(await days(undefined), premiumDays('full', 2, 1));
  assert.deepEqual(await days(1), premiumDays('full', 2, 1));
  assert.deepEqual(await days(CATALOG_VERSION + 5), premiumDays('full', 2, CATALOG_VERSION));
});

test('/plan: free users, missing setup and outages never get the plan', async () => {
  const body = { appUserId, goal: 'eyes', level: 1 };
  const free = await handlePlan(request(body), deps({ isPremium: async () => false }));
  assert.deepEqual([free.status, free.body], [402, { error: 'premium' }]);
  const unconfigured = await handlePlan(request(body), deps({ isPremium: null }));
  assert.equal(unconfigured.status, 503);
  const rcDown = await handlePlan(request(body), deps({ isPremium: async () => 'unavailable' }));
  assert.equal(rcDown.status, 503);
  for (const res of [free, unconfigured, rcDown]) assert.equal(res.body.days, undefined);
});

test('/plan: strict input, rate limits before asking RevenueCat', async () => {
  let asked = 0;
  const isPremium = async () => {
    asked++;
    return true;
  };
  const bad = [
    request({ appUserId, goal: 'jawline', level: 1 }, 'GET'),
    request('not json'),
    request({ appUserId, goal: 'jawline', level: 4 }),
    request({ appUserId, goal: 'nose', level: 1 }),
    request({ appUserId: 'me', goal: 'jawline', level: 1 }),
    request({ appUserId, goal: 'jawline', level: 1, isPremium: true }),
    request({ appUserId, goal: 'jawline', level: 1, catalog: 0 }),
    request({ appUserId, goal: 'jawline', level: 1, catalog: '2' }),
    request('x'.repeat(2_000)),
  ];
  const statuses = await Promise.all(bad.map((r) => handlePlan(r, deps({ isPremium })).then((res) => res.status)));
  assert.deepEqual(statuses, [405, 400, 400, 400, 400, 400, 400, 400, 413]);
  const limited = await handlePlan(request({ appUserId, goal: 'jawline', level: 1 }), deps({ isPremium, checkRateLimit: async () => 'limited' }));
  assert.equal(limited.status, 429);
  const limiterDown = await handlePlan(request({ appUserId, goal: 'jawline', level: 1 }), deps({ isPremium, checkRateLimit: async () => 'unavailable' }));
  assert.equal(limiterDown.status, 503);
  assert.equal(asked, 0);
});
