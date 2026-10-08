import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HeroBanner } from '@/components/today/HeroBanner';
import { PlanCard } from '@/components/today/PlanCard';
import { PlanGrid } from '@/components/today/PlanGrid';
import { PlanGridTip } from '@/components/today/PlanGridTip';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { usePlan } from '@/hooks/usePlan';
import { usePremium } from '@/hooks/usePremium';
import { useProgressSummary } from '@/hooks/useProgress';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import type { PlanCellStatus } from '@/services/plan/plan';
import { planGridTipSeen as tipSeen } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

/** Today: hero + streak, today's plan day, the 28-day grid (with a first-use tip). The Coach is the floating button. */
export default function TodayScreen() {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const plan = usePlan();
  const { goal, planGridTipSeen } = useSettings();
  const settingsDispatch = useSettingsDispatch();
  const { isPremium } = usePremium();
  const { streak, doneToday } = useProgressSummary();

  const startPlan = () => router.push({ pathname: '/workout', params: { kind: 'plan' } });
  const unlock = () => router.push('/paywall');
  const closeTip = () => settingsDispatch(tipSeen());
  const openDay = (day: number, status: PlanCellStatus) => {
    if (!planGridTipSeen) closeTip();
    if (status === 'locked') unlock();
    else router.push({ pathname: '/plan-day', params: { day: String(day) } });
  };

  return (
    <Screen>
      <HeroBanner streak={streak} doneToday={doneToday} />
      <PlanCard plan={plan} goal={goal} isPremium={isPremium} onStart={startPlan} onPractice={startPlan} onUnlock={unlock} />
      <SectionHeader title={t('plan.grid.title')} />
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
