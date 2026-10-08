import { EMPTY_PLANS, PLAN_PERIOD, freeTrialDays, visiblePlanIds, yearlySavePercent, type StorePlan, type StorePlans } from '../plans';

const plans = (p: Partial<StorePlans>): StorePlans => ({ ...EMPTY_PLANS, ...p });

const plan = (id: StorePlan['id'], price: number, pricePerMonth: number | null = null): StorePlan => ({
  id,
  price,
  priceString: `$${price}`,
  pricePerMonth,
  pricePerMonthString: null,
  intro: null,
  pkg: null,
});

describe('plans', () => {
  it('counts only genuinely free intro offers as trials', () => {
    expect(freeTrialDays({ price: 0, periodUnit: 'DAY', periodNumberOfUnits: 7, cycles: 1 })).toBe(7);
    expect(freeTrialDays({ price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1, cycles: 1 })).toBe(7);
    expect(freeTrialDays({ price: 0.99, periodUnit: 'WEEK', periodNumberOfUnits: 1, cycles: 1 })).toBeNull();
    expect(freeTrialDays(null)).toBeNull();
  });

  it('computes the yearly saving from live prices', () => {
    // $29.99 / 12 = $2.50 a month vs $3.99 → 37%.
    expect(yearlySavePercent(plans({ monthly: plan('monthly', 3.99), yearly: plan('yearly', 29.99, 2.49) }))).toBe(38);
    expect(yearlySavePercent(plans({ monthly: plan('monthly', 3.99), yearly: plan('yearly', 29.99) }))).toBe(37);
    expect(yearlySavePercent(plans({ yearly: plan('yearly', 29.99) }))).toBeNull();
    // Never shows a "saving" when yearly isn't cheaper.
    expect(yearlySavePercent(plans({ monthly: plan('monthly', 1.99), yearly: plan('yearly', 29.99) }))).toBeNull();
    // Compared with monthly only, never with weekly ($1.99 × 52 = $103.48 would make it look like 71%).
    const all = plans({ weekly: plan('weekly', 1.99), monthly: plan('monthly', 3.99), yearly: plan('yearly', 29.99) });
    expect(yearlySavePercent(all)).toBe(37);
    expect(yearlySavePercent(plans({ weekly: plan('weekly', 1.99), yearly: plan('yearly', 29.99) }))).toBeNull();
  });

  it('shows weekly, monthly, yearly; only the ones the store sells once it answered', () => {
    expect(visiblePlanIds(EMPTY_PLANS, false)).toEqual(['weekly', 'monthly', 'yearly']);
    // Store answered with nothing (offline, web): fallback prices, buying says "not available".
    expect(visiblePlanIds(EMPTY_PLANS, true)).toEqual(['weekly', 'monthly', 'yearly']);
    // Weekly not set up in App Store Connect yet: hidden instead of failing on tap.
    expect(visiblePlanIds(plans({ monthly: plan('monthly', 3.99), yearly: plan('yearly', 29.99) }), true)).toEqual(['monthly', 'yearly']);
    expect(visiblePlanIds(plans({ weekly: plan('weekly', 1.99), monthly: plan('monthly', 3.99), yearly: plan('yearly', 29.99) }), true)).toEqual([
      'weekly',
      'monthly',
      'yearly',
    ]);
    expect(PLAN_PERIOD).toEqual({ weekly: 'week', monthly: 'month', yearly: 'year' });
  });
});
