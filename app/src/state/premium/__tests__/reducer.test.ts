import { FREE_LIMITS } from '@/constants/limits';
import { EMPTY_PLANS } from '@/services/purchases/plans';

import { aiAnswerUsed, aiFreeUsedUp, hydratePremium, premiumReady, setPlans, setPremium } from '../actions';
import { initialPremiumState, premiumReducer } from '../reducer';
import { nextRefillDate, selectFreeAiLeft } from '../selectors';

const LIMIT = FREE_LIMITS.aiPerMonth;

describe('premiumReducer', () => {
  it('hydrates, becomes ready and tracks premium', () => {
    let s = premiumReducer(initialPremiumState, hydratePremium({ month: '2026-09', count: 2 }, 'id-1'));
    s = premiumReducer(s, setPlans(EMPTY_PLANS));
    s = premiumReducer(s, premiumReady());
    expect(s).toMatchObject({ ready: true, aiUsage: { month: '2026-09', count: 2 }, appUserId: 'id-1', isPremium: false });
    expect(premiumReducer(s, setPremium(true)).isPremium).toBe(true);
  });

  it('counts AI answers this month and never goes below zero left', () => {
    let s = premiumReducer(initialPremiumState, hydratePremium({ month: '2026-09', count: LIMIT - 1 }, 'id'));
    expect(selectFreeAiLeft(s, '2026-09-27')).toBe(1);
    s = premiumReducer(premiumReducer(s, aiAnswerUsed('2026-09')), aiAnswerUsed('2026-09'));
    expect(selectFreeAiLeft(s, '2026-09-30')).toBe(0);
    expect(selectFreeAiLeft(premiumReducer(s, setPremium(true)), '2026-09-30')).toBe(Infinity);
  });

  it('syncs to "none left" when the server says the free answers are used up', () => {
    const s = premiumReducer(initialPremiumState, aiFreeUsedUp('2026-09'));
    expect(selectFreeAiLeft(s, '2026-09-27')).toBe(0);
    expect(selectFreeAiLeft(s, '2026-10-01')).toBe(LIMIT);
  });

  it('refills on the first day of a new month', () => {
    let s = premiumReducer(initialPremiumState, hydratePremium({ month: '2026-09', count: LIMIT }, 'id'));
    expect(selectFreeAiLeft(s, '2026-09-30')).toBe(0);
    expect(selectFreeAiLeft(s, '2026-10-01')).toBe(LIMIT);
    s = premiumReducer(s, aiAnswerUsed('2026-10'));
    expect(s.aiUsage).toEqual({ month: '2026-10', count: 1 });
    expect(selectFreeAiLeft(s, '2026-10-02')).toBe(LIMIT - 1);
  });

  it('starts new users with the full allowance', () => {
    expect(selectFreeAiLeft(initialPremiumState, '2026-09-27')).toBe(LIMIT);
  });

  it('knows the refill date, across the year end too', () => {
    expect(nextRefillDate('2026-09-27')).toBe('2026-10-01');
    expect(nextRefillDate('2026-12-31')).toBe('2027-01-01');
  });
});
