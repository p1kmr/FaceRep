import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CoachCard } from '@/components/today/CoachCard';
import { HeroBanner } from '@/components/today/HeroBanner';
import { RoutineCard } from '@/components/today/RoutineCard';
import { WeekStrip } from '@/components/today/WeekStrip';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useProgressSummary } from '@/hooks/useProgress';
import { useRoutine } from '@/hooks/useRoutine';
import { useToday } from '@/hooks/useToday';
import { makeStyles } from '@/theme/makeStyles';

/** Today: hero + streak, today's routine, this week, Coach shortcut. The screen only composes. */
export default function TodayScreen() {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const today = useToday();
  const routine = useRoutine();
  const { streak, doneToday, week } = useProgressSummary();

  const start = () =>
    router.push({ pathname: '/workout', params: { ids: routine.ids.join(','), kind: 'routine' } });

  return (
    <Screen>
      <HeroBanner streak={streak} doneToday={doneToday} />
      <RoutineCard ids={routine.ids} seconds={routine.seconds} goal={routine.goal} doneToday={doneToday} onStart={start} />
      <SectionHeader title={t('week')} />
      <Card style={styles.week}>
        <WeekStrip week={week} today={today} />
      </Card>
      <CoachCard onPress={() => router.navigate('/coach')} />
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  week: { padding: tokens.space.lg },
}));
