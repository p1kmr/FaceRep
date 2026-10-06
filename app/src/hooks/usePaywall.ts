import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { haptics } from '@/services/haptics';
import {
  FALLBACK_PRICES,
  freeTrialDays,
  yearlySavePercent,
  type PlanId,
} from '@/services/purchases/plans';
import { isUserCancelled, purchasePlan, restorePurchases } from '@/services/purchases/purchases';
import { setPremium } from '@/state/premium/actions';

import { usePremium, usePremiumDispatch } from './usePremium';

export interface PlanCard {
  id: PlanId;
  title: string;
  price: string;
  /** e.g. "per month" or "$2.49 / month". */
  subtitle: string;
  badge: string | null;
  trialDays: number | null;
  available: boolean;
}

/** Builds plan cards from live store data and handles buy / restore / errors / double taps. */
export function usePaywall(onSuccess: () => void) {
  const { t } = useTranslation('paywall');
  const { plans, ready } = usePremium();
  const dispatch = usePremiumDispatch();
  const [busy, setBusy] = useState(false);

  const cards = useMemo<PlanCard[]>(() => {
    const save = yearlySavePercent(plans);
    return (['monthly', 'yearly'] as PlanId[]).map((id) => {
      const plan = plans[id];
      const trialDays = plan ? freeTrialDays(plan.intro) : null;
      const subtitle =
        id === 'monthly'
          ? t('perMonth')
          : plan?.pricePerMonthString
            ? t('perMonthPrice', { price: plan.pricePerMonthString })
            : t('perYear');
      return {
        id,
        title: t(`plans.${id}`),
        price: plan?.priceString ?? FALLBACK_PRICES[id],
        subtitle,
        // Never call yearly the "best value" when live prices show it isn't cheaper per month.
        badge: id !== 'yearly' ? null : save ? t('bestValueSave', { percent: save }) : plans.monthly ? null : t('bestValue'),
        trialDays,
        available: !!plan,
      };
    });
  }, [plans, t]);

  const succeed = () => {
    dispatch(setPremium(true));
    haptics.success();
    onSuccess();
  };

  const buy = async (id: PlanId) => {
    if (busy) return;
    const plan = plans[id];
    if (!plan) {
      Alert.alert(t('errors.unavailableTitle'), t('errors.unavailable'));
      return;
    }
    setBusy(true);
    try {
      if (await purchasePlan(plan)) succeed();
    } catch (err) {
      if (!isUserCancelled(err)) Alert.alert(t('errors.failedTitle'), (err as Error)?.message ?? '');
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (await restorePurchases()) {
        Alert.alert(t('restore.doneTitle'), t('restore.done'));
        succeed();
      } else {
        Alert.alert(t('restore.noneTitle'), t('restore.none'));
      }
    } catch {
      Alert.alert(t('restore.failedTitle'), t('restore.failed'));
    } finally {
      setBusy(false);
    }
  };

  return { cards, loading: !ready, busy, buy, restore };
}
