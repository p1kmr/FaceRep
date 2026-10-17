import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { CATALOG } from '../src/lib/catalog.js';

test('catalog: matches the app (order, program, jaw caution)', () => {
  const source = readFileSync(new URL('../../app/src/constants/exercises.ts', import.meta.url), 'utf8');
  const ids = [...source.match(/export const EXERCISE_IDS = \[([\s\S]*?)\] as const/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const fromApp = ids.map((id) => {
    const entry = source.match(new RegExp(`'${id}': \\{([^}]*)\\}`))[1];
    return { id, program: entry.match(/program: '(\w+)'/)[1], loadsJaw: /jawCaution: true/.test(entry) };
  });
  assert.deepEqual(CATALOG, fromApp);
});
