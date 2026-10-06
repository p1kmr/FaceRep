/** Store-independent plan data (no SDK import: testable, and the UI never sees RevenueCat types). */
export type PlanId = 'monthly' | 'yearly';

export interface IntroOffer {
  price: number;
  periodUnit: string;
  periodNumberOfUnits: number;
  cycles: number;
}

export interface StorePlan {
  id: PlanId;
  price: number;
  /** Localized by the store, e.g. "$29.99" or "29,99 €". */
  priceString: string;
  /** Store-computed monthly equivalent (yearly: price / 12), localized. */
  pricePerMonth: number | null;
  pricePerMonthString: string | null;
  intro: IntroOffer | null;
  /** The SDK package. Only services/purchases/purchases.ts reads it. */
  pkg: unknown;
}

export type StorePlans = Record<PlanId, StorePlan | null>;

export const EMPTY_PLANS: StorePlans = { monthly: null, yearly: null };

/** Shown while the store loads or if it fails. Never claims a free trial. */
export const FALLBACK_PRICES: Record<PlanId, string> = {
  monthly: '$3.99',
  yearly: '$29.99',
};

const DAYS_PER_UNIT: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

/** Days of a genuinely free intro offer, else null (a discounted intro is not a "free trial"). */
export function freeTrialDays(intro: IntroOffer | null): number | null {
  if (!intro || intro.price !== 0 || !intro.periodNumberOfUnits) return null;
  const perUnit = DAYS_PER_UNIT[intro.periodUnit.toUpperCase()];
  return perUnit ? perUnit * intro.periodNumberOfUnits * Math.max(intro.cycles, 1) : null;
}

/** "Save X%" for yearly vs. 12 months of monthly, from live prices so it's right in every currency. */
export function yearlySavePercent(plans: StorePlans): number | null {
  const monthly = plans.monthly?.price;
  const yearlyPerMonth = plans.yearly?.pricePerMonth ?? (plans.yearly ? plans.yearly.price / 12 : null);
  if (!monthly || !yearlyPerMonth) return null;
  const save = Math.round((1 - yearlyPerMonth / monthly) * 100);
  return save > 0 ? save : null;
}
