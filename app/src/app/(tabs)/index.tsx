import { router } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { MonthCard } from '@/components/today/MonthCard';
import { MonthToggle } from '@/components/today/MonthToggle';
import { StatCards } from '@/components/today/StatCards';
import { TodayCard } from '@/components/today/TodayCard';
import { TodayHeader } from '@/components/today/TodayHeader';
import { WeekStrip } from '@/components/today/WeekStrip';
import { Screen } from '@/components/ui/Screen';
import type { FaceArea } from '@/constants/faceMap';
import { useFirstWeekday } from '@/hooks/useFirstWeekday';
import { usePlan } from '@/hooks/usePlan';
import { usePremium } from '@/hooks/usePremium';
import { useProgressState, useProgressSummary } from '@/hooks/useProgress';
import { useSettings } from '@/hooks/useSettings';
import { useToday } from '@/hooks/useToday';
import { minutesBetween } from '@/services/progress/stats';
import { weekStart } from '@/utils/dates';

/**
 * Today: greeting and streak, this week (with this month folded under it), today's plan day on the face (the areas it
 * works lit) and the numbers. The Coach is the floating button.
 */
export default function TodayScreen() {
  const plan = usePlan();
  const { goal } = useSettings();
  const { isPremium } = usePremium();
  const summary = useProgressSummary();
  const { sessions } = useProgressState();
  const today = useToday();
  const firstWeekday = useFirstWeekday();
  const [monthOpen, setMonthOpen] = useState(false);

  const startPlan = () => router.push({ pathname: '/workout', params: { kind: 'plan' } });
  const unlock = () => router.push('/paywall');
  const learnArea = (area: FaceArea) => router.navigate({ pathname: '/exercises', params: { area } });

  return (
    <Screen>
      <TodayHeader streak={summary.streak} />
      <WeekStrip />
      <MonthToggle open={monthOpen} onPress={() => setMonthOpen(!monthOpen)} />
      {monthOpen ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <MonthCard />
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
