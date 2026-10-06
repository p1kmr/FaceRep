import { useContext } from 'react';

import { PremiumDispatchContext, PremiumStateContext } from '@/state/premium/PremiumProvider';
import { monthOf, selectFreeAiLeft } from '@/state/premium/selectors';

import { useToday } from './useToday';

export function usePremium() {
  const state = useContext(PremiumStateContext);
  if (!state) throw new Error('usePremium must be used inside <PremiumProvider>');
  const today = useToday();
  return { ...state, freeAiLeft: selectFreeAiLeft(state, today), month: monthOf(today) };
}

export function usePremiumDispatch() {
  const dispatch = useContext(PremiumDispatchContext);
  if (!dispatch) throw new Error('usePremiumDispatch must be used inside <PremiumProvider>');
  return dispatch;
}
