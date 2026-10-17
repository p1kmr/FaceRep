import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { CATALOG, idsFor } from '../src/lib/catalog.js';

test('catalog: matches the app (order, program, jaw caution, key, free)', () => {
  const source = readFileSync(new URL('../../app/src/constants/exercises.ts', import.meta.url), 'utf8');
  const ids = [...source.match(/export const EXERCISE_IDS = \[([\s\S]*?)\] as const/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const free = [...source.match(/export const FREE_EXERCISE_IDS[^=]*= \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const fromApp = ids.map((id) => {
    const entry = source.match(new RegExp(`'${id}': \\{([^}]*)\\}`))[1];
    return {
      id,
      program: entry.match(/program: '(\w+)'/)[1],
      loadsJaw: /jawCaution: true/.test(entry),
      key: entry.match(/key: '(\w+)'/)[1],
      free: free.includes(id),
    };
  });
  assert.deepEqual(CATALOG, fromApp);
});

test('catalog: free users hear only the free exercises', () => {
  assert.deepEqual(idsFor(false), CATALOG.filter((e) => e.free).map((e) => e.id));
  assert.equal(idsFor(true).length, CATALOG.length);
  assert.ok(idsFor(false).length > 0 && idsFor(false).length < CATALOG.length);
});
