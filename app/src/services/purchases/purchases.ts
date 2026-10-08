import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import { CONFIG } from '@/constants/config';

import { EMPTY_PLANS, type PlanId, type StorePlan, type StorePlans } from './plans';

// The ONLY file that imports react-native-purchases (see docs/architecture.md).
// Public SDK key only (appl_...). Secret RevenueCat keys must never ship in the app.
const IOS_API_KEY = CONFIG.revenueCatIosKey;

/** The single RevenueCat entitlement both products unlock. */
export const PREMIUM_ENTITLEMENT = CONFIG.premiumEntitlement;

let configured = false;

export function hasPurchasesKey(): boolean {
  return Platform.OS === 'ios' && IOS_API_KEY.length > 0;
}

export function configurePurchases(appUserID: string) {
  if (configured || !hasPurchasesKey()) return;
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.INFO).catch(() => undefined);
  Purchases.configure({ apiKey: IOS_API_KEY, appUserID });
  configured = true;
}

export function isPremium(info: CustomerInfo | null): boolean {
  return !!info && info.entitlements.active[PREMIUM_ENTITLEMENT] != null;
}

function toPlan(id: PlanId, pkg: PurchasesPackage | null): StorePlan | null {
  if (!pkg) return null;
  const p = pkg.product;
  return {
    id,
    price: p.price,
    priceString: p.priceString,
    pricePerMonth: p.pricePerMonth,
    pricePerMonthString: p.pricePerMonthString,
    intro: p.introPrice
      ? {
          price: p.introPrice.price,
          periodUnit: p.introPrice.periodUnit,
          periodNumberOfUnits: p.introPrice.periodNumberOfUnits,
          cycles: p.introPrice.cycles,
        }
      : null,
    pkg,
  };
}

/** Standard package slots ($rc_weekly / $rc_monthly / $rc_annual): no product IDs in the app. */
export function mapOffering(offering: PurchasesOffering | null): StorePlans {
  if (!offering) return EMPTY_PLANS;
  return {
    weekly: toPlan('weekly', offering.weekly),
    monthly: toPlan('monthly', offering.monthly),
    yearly: toPlan('yearly', offering.annual),
  };
}

export async function fetchPlans(): Promise<StorePlans> {
  const offerings = await Purchases.getOfferings();
  return mapOffering(offerings.current ?? null);
}

export async function fetchIsPremium(): Promise<boolean> {
  return isPremium(await Purchases.getCustomerInfo());
}

/** Resolves to "is Premium now?". Throws on errors; `isUserCancelled(err)` tells a cancel apart. */
export async function purchasePlan(plan: StorePlan): Promise<boolean> {
  const { customerInfo } = await Purchases.purchasePackage(plan.pkg as PurchasesPackage);
  return isPremium(customerInfo);
}

export async function restorePurchases(): Promise<boolean> {
  return isPremium(await Purchases.restorePurchases());
}

export function onPremiumChange(cb: (premium: boolean) => void): () => void {
  const listener = (info: CustomerInfo) => cb(isPremium(info));
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

export function isUserCancelled(err: unknown): boolean {
  return !!(err as { userCancelled?: boolean | null })?.userCancelled;
}
