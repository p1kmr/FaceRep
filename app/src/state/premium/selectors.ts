import { FREE_LIMITS } from '@/constants/limits';
import type { ISODate } from '@/utils/dates';

import type { PremiumState } from './types';

/** 'YYYY-MM' for a date. */
export const monthOf = (date: ISODate) => date.slice(0, 7);

/** First day of the month after `today`: when the free allowance refills. */
export function nextRefillDate(today: ISODate): ISODate {
  const [y, m] = today.split('-').map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
}

/** Free AI answers left this month (Coach); Infinity for Premium. */
export function selectFreeAiLeft(s: PremiumState, today: ISODate): number {
  if (s.isPremium) return Infinity;
  const used = s.aiUsage.month === monthOf(today) ? s.aiUsage.count : 0;
  return Math.max(0, FREE_LIMITS.aiPerMonth - used);
}
