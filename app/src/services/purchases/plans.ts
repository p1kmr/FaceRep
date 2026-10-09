/** Store-independent plan data (no SDK import: testable, and the UI never sees RevenueCat types). */
export type PlanId = 'weekly' | 'monthly' | 'yearly';

/** Paywall order, shortest first; yearly (pre-selected) sits next to the buy button. */
export const PLAN_IDS: PlanId[] = ['weekly', 'monthly', 'yearly'];

/** The billing period of each plan, for "per week" / "then $X per year" texts. */
export const PLAN_PERIOD: Record<PlanId, 'week' | 'month' | 'year'> = { weekly: 'week', monthly: 'month', yearly: 'year' };

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

export const EMPTY_PLANS: StorePlans = { weekly: null, monthly: null, yearly: null };

/** Shown while the store loads or if it fails. Never claims a free trial. */
export const FALLBACK_PRICES: Record<PlanId, string> = {
  weekly: '$1.99',
  monthly: '$3.99',
  yearly: '$29.99',
};

/**
 * The plans to show. While loading, or when the store gave nothing (offline, no key), all of them with fallback
 * prices (buying then says "not available"). Once the store answered, only plans it really sells: a plan whose
 * product isn't set up in App Store Connect yet (e.g. weekly) is hidden instead of failing on tap.
 */
export function visiblePlanIds(plans: StorePlans, ready: boolean): PlanId[] {
  const sold = PLAN_IDS.filter((id) => plans[id]);
  return ready && sold.length ? sold : PLAN_IDS;
}

const DAYS_PER_UNIT: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

/** Days of a genuinely free intro offer, else null (a discounted intro is not a "free trial"). */
export function freeTrialDays(intro: IntroOffer | null): number | null {
  if (!intro || intro.price !== 0 || !intro.periodNumberOfUnits) return null;
  const perUnit = DAYS_PER_UNIT[intro.periodUnit.toUpperCase()];
  return perUnit ? perUnit * intro.periodNumberOfUnits * Math.max(intro.cycles, 1) : null;
}

/**
 * "Save X%" for yearly vs. 12 months of monthly, from live prices so it's right in every currency. Deliberately
 * not vs. weekly: that would show a much bigger number for a plan few people would keep for a year.
 * Uses the exact yearly price / 12, not the store's per-month price (StoreKit cuts $2.4992 to $2.49, which made
 * 37.4% show as 38%), and rounds down so the saving is never overstated (2.3.1, 3.1.2).
 */
export function yearlySavePercent(plans: StorePlans): number | null {
  const monthly = plans.monthly?.price;
  const yearly = plans.yearly?.price;
  if (!monthly || !yearly) return null;
  // The tiny epsilon keeps an exact 50% from flooring to 49 through floating-point error.
  const save = Math.floor((1 - yearly / 12 / monthly) * 100 + 1e-9);
  return save > 0 ? save : null;
}
