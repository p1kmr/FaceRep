import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useProgressCalendar } from '@/hooks/useProgressCalendar';
import { useToday } from '@/hooks/useToday';
import { makeStyles } from '@/theme/makeStyles';
import { toMinutes } from '@/utils/format';

import { MonthCalendar } from '../progress/MonthCalendar';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';

/** This month on Today, opened from the month under the week: the days with a workout filled. A day opens Progress. */
export function MonthCard() {
  const { t } = useTranslation(['progress', 'common']);
  const styles = useStyles();
  const today = useToday();
  const cal = useProgressCalendar('month', today);
  const summary = t('progress:summaryPeriod', {
    workouts: t('progress:workoutCount', { count: cal.summary.workouts }),
    days: t('progress:dayCount', { count: cal.summary.days }),
    minutes: t('common:minutes', { count: toMinutes(cal.summary.seconds) }),
  });
  return (
    <Card style={styles.card}>
      <MonthCalendar
        weeks={cal.month}
        weekdays={cal.weekdays}
        today={cal.today}
        selected={null}
        workoutsOn={cal.workoutsOn}
        onPressDay={() => router.navigate('/progress')}
      />
      <AppText variant="footnote" muted center>
        {summary}
      </AppText>
    </Card>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  card: { padding: tokens.space.lg, gap: tokens.space.md },
}));
