import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { haptics } from '@/services/haptics';
import {
  FALLBACK_PRICES,
  freeTrialDays,
  PLAN_IDS,
  visiblePlanIds,
  yearlySavePercent,
  type PlanId,
  type StorePlans,
} from '@/services/purchases/plans';
import {
  fetchPlans,
  isPurchasesConfigured,
  isUserCancelled,
  purchasePlan,
  restorePurchases,
} from '@/services/purchases/purchases';
import { setPlans, setPremium } from '@/state/premium/actions';

import { usePremium, usePremiumDispatch } from './usePremium';

export interface PlanCard {
  id: PlanId;
  title: string;
  price: string;
  /** e.g. "per week", "per month" or "$2.49 / month". */
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
  const [reloading, setReloading] = useState(true); // until the refresh below finishes

  /** Loads the plans again: the single load at launch can fail (slow network, an App Store hiccup). */
  const reloadPlans = useCallback(async (): Promise<StorePlans | null> => {
    if (!isPurchasesConfigured()) return null;
    try {
      const fresh = await fetchPlans();
      if (PLAN_IDS.some((id) => fresh[id])) dispatch(setPlans(fresh)); // never replace loaded plans with nothing
      return fresh;
    } catch {
      return null;
    }
  }, [dispatch]);

  // Each time the paywall opens: brings back plans that failed at launch and keeps trial eligibility current.
  useEffect(() => {
    if (!ready) return;
    reloadPlans().finally(() => setReloading(false));
  }, [ready, reloadPlans]);

  const cards = useMemo<PlanCard[]>(() => {
    const save = yearlySavePercent(plans);
    return visiblePlanIds(plans, ready).map((id) => {
      const plan = plans[id];
      const trialDays = plan ? freeTrialDays(plan.intro) : null;
      // Weekly shows only its billed price: a "per month" figure next to it would read as the price.
      const subtitle =
        id === 'weekly'
          ? t('perWeek')
          : id === 'monthly'
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
  }, [plans, ready, t]);

  const succeed = () => {
    dispatch(setPremium(true));
    haptics.success();
    onSuccess();
  };

  const buy = async (id: PlanId) => {
    if (busy) return;
    setBusy(true);
    try {
      const plan = plans[id] ?? (await reloadPlans())?.[id] ?? null; // one more try before giving up
      if (!plan) {
        Alert.alert(t('errors.unavailableTitle'), t('errors.unavailable'));
        return;
      }
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

  const anyPlan = PLAN_IDS.some((id) => plans[id]);
  return { cards, loading: !ready || (reloading && !anyPlan), busy, buy, restore };
}
