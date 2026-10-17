import { router } from 'expo-router';

import { PlanGrid } from '@/components/today/PlanGrid';
import { PlanGridTip } from '@/components/today/PlanGridTip';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { usePlan } from '@/hooks/usePlan';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import type { PlanCellStatus } from '@/services/plan/plan';
import { planGridTipSeen as tipSeen } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

/**
 * The 28-day plan, opened from the week and day on Today's card: every day of the four weeks (with a first-use tip).
 * A day opens its preview; a locked day opens the paywall. Also how App Review reaches Weeks 2–4 after a purchase.
 */
export default function PlanScreen() {
  const styles = useStyles();
  const plan = usePlan();
  const { planGridTipSeen } = useSettings();
  const dispatch = useSettingsDispatch();
  const closeTip = () => dispatch(tipSeen());
  const openDay = (day: number, status: PlanCellStatus) => {
    if (!planGridTipSeen) closeTip();
    if (status === 'locked') router.push('/paywall');
    else router.push({ pathname: '/plan-day', params: { day: String(day) } });
  };

  return (
    <Screen edges={['bottom']}>
      {planGridTipSeen ? null : <PlanGridTip onDone={closeTip} />}
      <Card style={styles.grid}>
        <PlanGrid grid={plan.grid} onPressDay={openDay} />
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  grid: { padding: tokens.space.lg },
}));
