import { router } from 'expo-router';

import { PaywallView } from '@/components/paywall/PaywallView';
import { usePaywall } from '@/hooks/usePaywall';

/** Modal paywall, opened from locked features and Settings. */
export default function PaywallScreen() {
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const paywall = usePaywall(close);
  return (
    <PaywallView
      cards={paywall.cards}
      loading={paywall.loading}
      busy={paywall.busy}
      onPurchase={paywall.buy}
      onRestore={paywall.restore}
      onClose={close}
    />
  );
}
