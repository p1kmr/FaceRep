import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PlanGrid } from '@/components/today/PlanGrid';
import { PlanGridTip } from '@/components/today/PlanGridTip';
import { StatCards } from '@/components/today/StatCards';
import { TodayCard } from '@/components/today/TodayCard';
import { TodayHeader } from '@/components/today/TodayHeader';
import { WeekStrip } from '@/components/today/WeekStrip';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { FaceArea } from '@/constants/faceMap';
import { useFirstWeekday } from '@/hooks/useFirstWeekday';
import { usePlan } from '@/hooks/usePlan';
import { usePremium } from '@/hooks/usePremium';
import { useProgressState, useProgressSummary } from '@/hooks/useProgress';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { useToday } from '@/hooks/useToday';
import type { PlanCellStatus } from '@/services/plan/plan';
import { minutesBetween } from '@/services/progress/stats';
import { planGridTipSeen as tipSeen } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';
import { weekStart } from '@/utils/dates';

/**
 * Today: greeting and streak, this week, today's plan day on the face (the areas it works lit), the numbers, and the
 * 28-day grid (with a first-use tip). The Coach is the floating button.
 */
export default function TodayScreen() {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const plan = usePlan();
  const { goal, planGridTipSeen } = useSettings();
  const settingsDispatch = useSettingsDispatch();
  const { isPremium } = usePremium();
  const summary = useProgressSummary();
  const { sessions } = useProgressState();
  const today = useToday();
  const firstWeekday = useFirstWeekday();

  const startPlan = () => router.push({ pathname: '/workout', params: { kind: 'plan' } });
  const unlock = () => router.push('/paywall');
  const learnArea = (area: FaceArea) => router.navigate({ pathname: '/exercises', params: { area } });
  const closeTip = () => settingsDispatch(tipSeen());
  const openDay = (day: number, status: PlanCellStatus) => {
    if (!planGridTipSeen) closeTip();
    if (status === 'locked') unlock();
    else router.push({ pathname: '/plan-day', params: { day: String(day) } });
  };

  return (
    <Screen>
      <TodayHeader streak={summary.streak} />
      <WeekStrip />
      <TodayCard
        plan={plan}
        goal={goal}
        isPremium={isPremium}
        onStart={startPlan}
        onPractice={startPlan}
        onUnlock={unlock}
        onArea={learnArea}
      />
      <StatCards summary={summary} weekMinutes={minutesBetween(sessions, weekStart(today, firstWeekday), today)} />
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
