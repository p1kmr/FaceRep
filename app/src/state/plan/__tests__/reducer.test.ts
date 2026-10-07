import type { PlanDay } from '@/constants/plan';

import { hydratePlan, planFailed, planLoaded, planRequested, resetPlan } from '../actions';
import { initialPlanState, planReducer } from '../reducer';
import { planKey, selectPremiumDays, selectRequest } from '../selectors';

const days: PlanDay[] = [{ day: 8, kind: 'workout', ids: ['01-jaw-clench'], repPct: 85, holdPlusSec: 0 }];

describe('planReducer', () => {
  it('hydrates the saved copy and serves it only for the same goal and level', () => {
    const s = planReducer(initialPlanState, hydratePlan({ goal: 'jawline', level: 1, catalog: 1, days }));
    expect(s.hydrated).toBe(true);
    expect(selectPremiumDays(s, 'jawline', 1)).toBe(days);
    expect(selectPremiumDays(s, 'eyes', 1)).toBeNull();
    expect(selectPremiumDays(s, 'jawline', 2)).toBeNull();
  });

  it('tracks a request per goal and level: loading → loaded, or failed', () => {
    let s = planReducer(initialPlanState, planRequested(planKey('eyes', 1)));
    expect(selectRequest(s, 'eyes', 1)).toBe('loading');
    expect(selectRequest(s, 'jawline', 1)).toBe('idle');
    const failed = planReducer(s, planFailed(planKey('eyes', 1), 'offline'));
    expect([selectRequest(failed, 'eyes', 1), failed.error]).toEqual(['error', 'offline']);
    s = planReducer(s, planLoaded({ goal: 'eyes', level: 1, catalog: 1, days }));
    expect(selectRequest(s, 'eyes', 1)).toBe('idle');
    expect(selectPremiumDays(s, 'eyes', 1)).toBe(days);
  });

  it('a load that finished first wins over the older saved copy; reset forgets everything', () => {
    let s = planReducer(initialPlanState, planLoaded({ goal: 'eyes', level: 1, catalog: 1, days }));
    s = planReducer(s, hydratePlan({ goal: 'jawline', level: 1, catalog: 1, days }));
    expect(s.cache?.goal).toBe('eyes');
    s = planReducer(s, resetPlan());
    expect(s).toEqual({ ...initialPlanState, hydrated: true });
  });
});
