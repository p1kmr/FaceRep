import type { StorePlans } from '@/services/purchases/plans';

/** 'YYYY-MM' of the month the count belongs to. */
export interface AiUsage {
  month: string | null;
  count: number;
}

export interface PremiumState {
  /** True once the first RevenueCat load finished, success OR failure (the app never hangs). */
  ready: boolean;
  /** Only ever written from RevenueCat's answer (purchase, restore, customer info updates). */
  isPremium: boolean;
  plans: StorePlans;
  appUserId: string | null;
  /** Free AI answers (Coach) used in `aiMonth` (persisted; a new month starts at 0). */
  aiUsage: AiUsage;
}
