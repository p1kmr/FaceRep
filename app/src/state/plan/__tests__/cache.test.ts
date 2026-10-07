import { CATALOG_VERSION } from '@/constants/exercises';
import type { PlanDay } from '@/constants/plan';

import { validCache } from '../cache';

const days: PlanDay[] = Array.from({ length: 21 }, (_, i) => ({ day: i + 8, kind: 'workout', ids: ['01-jaw-clench'], repPct: 85, holdPlusSec: 0 }));
const cache = { goal: 'jawline' as const, level: 1, catalog: CATALOG_VERSION, days };

describe('validCache', () => {
  it('keeps a saved plan from this catalog version', () => {
    expect(validCache(cache)).toEqual(cache);
  });

  it('drops a copy from another catalog version (after an update with new exercises), or a broken one', () => {
    expect(validCache({ ...cache, catalog: CATALOG_VERSION - 1 })).toBeNull();
    expect(validCache({ ...cache, catalog: undefined as never })).toBeNull();
    expect(validCache({ ...cache, goal: 'nose' as never })).toBeNull();
    expect(validCache({ ...cache, days: days.slice(1) })).toBeNull();
    expect(validCache(null)).toBeNull();
  });
});
