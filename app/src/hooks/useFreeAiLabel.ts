import { useTranslation } from 'react-i18next';

import { nextRefillDate } from '@/state/premium/selectors';
import { fromISODate } from '@/utils/dates';

import { usePremium } from './usePremium';
import { useToday } from './useToday';

/** "2 free answers left this month", or when none are left, the date they refill. Null for Premium. */
export function useFreeAiLabel(): string | null {
  const { t, i18n } = useTranslation('coach');
  const { isPremium, freeAiLeft } = usePremium();
  const today = useToday();
  if (isPremium) return null;
  if (freeAiLeft > 0) return t('freeLeft', { count: freeAiLeft });
  const date = fromISODate(nextRefillDate(today)).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' });
  return t('freeRefill', { date });
}
