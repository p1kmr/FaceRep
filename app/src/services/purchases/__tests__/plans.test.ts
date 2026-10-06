import { freeTrialDays, yearlySavePercent, type StorePlan } from '../plans';

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
    expect(yearlySavePercent({ monthly: plan('monthly', 3.99), yearly: plan('yearly', 29.99, 2.49) })).toBe(38);
    expect(yearlySavePercent({ monthly: plan('monthly', 3.99), yearly: plan('yearly', 29.99) })).toBe(37);
    expect(yearlySavePercent({ monthly: null, yearly: plan('yearly', 29.99) })).toBeNull();
    // Never shows a "saving" when yearly isn't cheaper.
    expect(yearlySavePercent({ monthly: plan('monthly', 1.99), yearly: plan('yearly', 29.99) })).toBeNull();
  });
});
