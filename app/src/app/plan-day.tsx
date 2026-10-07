import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseRow } from '@/components/exercise/ExerciseRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { PLAN } from '@/constants/plan';
import { usePlan } from '@/hooks/usePlan';
import { weekOf } from '@/services/plan/plan';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, toMinutes } from '@/utils/format';

/** One day of the plan, opened from the 28-day grid: its exercises, then start it (or practise it). */
export default function PlanDayScreen() {
  const { t, i18n } = useTranslation(['home', 'common']);
  const styles = useStyles();
  const params = useLocalSearchParams<{ day?: string }>();
  const n = Math.min(PLAN.days, Math.max(1, Number(params.day) || 1));
  const plan = usePlan();
  const day = plan.dayAt(n);
  const counts = plan.countsFor(n);
  const week = weekOf(n);
  const cell = plan.grid[n - 1];
  const date = formatDay(cell.date, i18n.language);
  const when =
    cell.status === 'done'
      ? t('plan.preview.doneOn', { date })
      : cell.status === 'today'
        ? t('plan.preview.today', { date })
        : t('plan.preview.plannedFor', { date });

  const start = () => router.replace({ pathname: '/workout', params: { kind: 'plan', day: String(n) } });

  let body;
  if (day.status === 'ready') {
    const subtitle = day.day.kind === 'light' ? t('plan.light') : day.day.kind === 'final' ? t('plan.final') : t(`plan.weeks.${PLAN.weeks[week - 1]}`);
    body = (
      <>
        <AppText muted>
          {subtitle} · {t('common:minutes', { count: toMinutes(day.seconds) })}
        </AppText>
        <Card>
          {day.items.map((item, i) => (
            <ExerciseRow key={item.id} id={item.id} reps={item.reps} holdSec={item.holdSec} divider={i < day.items.length - 1} />
          ))}
        </Card>
        {counts ? null : (
          <AppText variant="footnote" muted>
            {plan.next ? t('plan.preview.practiceNote', { day: plan.next.day }) : t('plan.preview.practiceNoteDone')}
          </AppText>
        )}
        <Button title={counts ? t('plan.start', { day: n }) : t('plan.preview.practice', { day: n })} onPress={start} fullWidth />
      </>
    );
  } else if (day.status === 'locked') {
    body = (
      <>
        <AppText muted>{t('plan.locked.body')}</AppText>
        <Button title={t('plan.locked.cta')} onPress={() => router.replace('/paywall')} fullWidth />
      </>
    );
  } else if (day.status === 'loading') {
    body = <AppText muted>{t('plan.loading')}</AppText>;
  } else {
    body = (
      <>
        <AppText muted>{t(`plan.error.${day.error === 'offline' || day.error === 'premium' ? day.error : 'server'}`)}</AppText>
        <Button title={t('plan.error.retry')} variant="secondary" onPress={plan.retry} fullWidth />
      </>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <View style={styles.root}>
        <View style={styles.titles}>
          <AppText variant="title" accessibilityRole="header">
            {t('plan.header', { week, day: n, total: PLAN.days })}
          </AppText>
          <AppText variant="footnote" muted>
            {when}
          </AppText>
        </View>
        {body}
      </View>
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  root: { gap: tokens.space.lg },
  titles: { gap: tokens.space.xs },
}));
