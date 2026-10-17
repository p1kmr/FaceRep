import { router } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { PlanGrid } from '@/components/today/PlanGrid';
import { PlanGridTip } from '@/components/today/PlanGridTip';
import { PlanToggle } from '@/components/today/PlanToggle';
import { StatCards } from '@/components/today/StatCards';
import { TodayCard } from '@/components/today/TodayCard';
import { TodayHeader } from '@/components/today/TodayHeader';
import { WeekStrip } from '@/components/today/WeekStrip';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
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
 * Today: greeting and streak, this week (with the 28-day plan folded under it), today's plan day on the face (the areas
 * it works lit) and the numbers. The Coach is the floating button.
 */
export default function TodayScreen() {
  const styles = useStyles();
  const plan = usePlan();
  const { goal, planGridTipSeen } = useSettings();
  const settingsDispatch = useSettingsDispatch();
  const { isPremium } = usePremium();
  const summary = useProgressSummary();
  const { sessions } = useProgressState();
  const today = useToday();
  const firstWeekday = useFirstWeekday();
  const [planOpen, setPlanOpen] = useState(false);

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
      <PlanToggle open={planOpen} onPress={() => setPlanOpen(!planOpen)} />
      {planOpen ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.plan}>
          {planGridTipSeen ? null : <PlanGridTip onDone={closeTip} />}
          <Card style={styles.grid}>
            <PlanGrid grid={plan.grid} onPressDay={openDay} />
          </Card>
        </Animated.View>
      ) : null}
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
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  plan: { gap: tokens.space.md },
  grid: { padding: tokens.space.lg },
}));
