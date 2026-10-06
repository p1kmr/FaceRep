import { createContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ensureAppUserId } from '@/services/purchases/appUserId';
import {
  configurePurchases,
  fetchIsPremium,
  fetchPlans,
  hasPurchasesKey,
  onPremiumChange,
} from '@/services/purchases/purchases';
import { load, save } from '@/services/storage/kv';

import { hydratePremium, premiumReady, setPlans, setPremium, type PremiumAction } from './actions';
import { initialPremiumState, premiumReducer } from './reducer';
import type { AiUsage, PremiumState } from './types';

const VERSION = 1;

export const PremiumStateContext = createContext<PremiumState | null>(null);
export const PremiumDispatchContext = createContext<Dispatch<PremiumAction> | null>(null);

function validUsage(v: AiUsage | null): AiUsage {
  return v && typeof v.month === 'string' && Number.isInteger(v.count) && v.count >= 0 ? v : { month: null, count: 0 };
}

let initPromise: Promise<void> | null = null;

/** Single-flight init: runs once per launch and ALWAYS ends with `ready`, even on failure. */
function initialize(dispatch: Dispatch<PremiumAction>): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const [usage, appUserId] = await Promise.all([load<AiUsage>(STORAGE_KEYS.aiUsage, VERSION), ensureAppUserId()]);
      dispatch(hydratePremium(validUsage(usage), appUserId));
      if (!hasPurchasesKey()) return; // no key (web, Expo Go without setup) → free
      configurePurchases(appUserId);
      onPremiumChange((premium) => dispatch(setPremium(premium))); // renewals, expiry, refunds
      await Promise.all([
        fetchPlans().then((plans) => dispatch(setPlans(plans))).catch(() => {}),
        fetchIsPremium().then((premium) => dispatch(setPremium(premium))).catch(() => {}),
      ]);
    } catch {
      // Stay free; purchases can be retried from the paywall.
    } finally {
      dispatch(premiumReady());
    }
  })();
  return initPromise;
}

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(premiumReducer, initialPremiumState);

  useEffect(() => {
    initialize(dispatch);
  }, []);

  useEffect(() => {
    if (state.ready) save(STORAGE_KEYS.aiUsage, VERSION, state.aiUsage).catch(() => {});
  }, [state.ready, state.aiUsage]);

  return (
    <PremiumStateContext.Provider value={state}>
      <PremiumDispatchContext.Provider value={dispatch}>{children}</PremiumDispatchContext.Provider>
    </PremiumStateContext.Provider>
  );
}
