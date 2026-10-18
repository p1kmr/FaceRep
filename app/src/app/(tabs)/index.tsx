import { router } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ScanTodayCard } from '@/components/scan/ScanTodayCard';
import { MonthCard } from '@/components/today/MonthCard';
import { MonthToggle } from '@/components/today/MonthToggle';
import { StatCards } from '@/components/today/StatCards';
import { TodayCard } from '@/components/today/TodayCard';
import { TodayHeader } from '@/components/today/TodayHeader';
import { WeekStrip } from '@/components/today/WeekStrip';
import { Screen } from '@/components/ui/Screen';
import type { FaceArea } from '@/constants/faceMap';
import { useFirstWeekday } from '@/hooks/useFirstWeekday';
import { usePremium } from '@/hooks/usePremium';
import { useProgressState, useProgressSummary } from '@/hooks/useProgress';
import { useSettings } from '@/hooks/useSettings';
import { useToday } from '@/hooks/useToday';
import { useTodayWorkout } from '@/hooks/useTodayWorkout';
import { minutesBetween } from '@/services/progress/stats';
import { weekStart } from '@/utils/dates';

/**
 * Today: greeting and streak, this week (with this month folded under it), today's workout on the face (the areas it
 * works lit), the weekly face scan when one is due, and the numbers. The Coach is the floating button.
 */
export default function TodayScreen() {
  const workout = useTodayWorkout();
  const { goal } = useSettings();
  const { isPremium } = usePremium();
  const summary = useProgressSummary();
  const { sessions } = useProgressState();
  const today = useToday();
  const firstWeekday = useFirstWeekday();
  const [monthOpen, setMonthOpen] = useState(false);

  const start = () => router.push({ pathname: '/workout', params: { kind: 'today' } });
  const unlock = () => router.push('/paywall');
  const showWeek = () => router.push('/week');
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
        workout={workout}
        goal={goal}
        isPremium={isPremium}
        onStart={start}
        onUnlock={unlock}
        onWeek={showWeek}
        onArea={learnArea}
      />
      <ScanTodayCard />
      <StatCards summary={summary} weekMinutes={minutesBetween(sessions, weekStart(today, firstWeekday), today)} />
    </Screen>
  );
}
