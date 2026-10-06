import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SessionRow } from '@/components/progress/SessionRow';
import { StatTile } from '@/components/progress/StatTile';
import { WeekBars } from '@/components/progress/WeekBars';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useProgressState, useProgressSummary } from '@/hooks/useProgress';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';
import { toMinutes } from '@/utils/format';

const HISTORY_ROWS = 30;

export default function ProgressScreen() {
  const { t } = useTranslation('progress');
  const { colors } = useTheme();
  const styles = useStyles();
  const { sessions } = useProgressState();
  const { streak, best, week, totals } = useProgressSummary();
  const recent = sessions.slice(0, HISTORY_ROWS);

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('title')}
      </AppText>
      <Card style={styles.streakCard}>
        <SymbolView name="flame.fill" size={34} tintColor={colors.streak} />
        <View style={styles.streakText}>
          <AppText variant="caption" muted>
            {t('streak')}
          </AppText>
          <AppText variant="title">{t('days', { count: streak })}</AppText>
        </View>
        <View style={styles.best}>
          <AppText variant="caption" muted>
            {t('best')}
          </AppText>
          <AppText variant="headline">{t('days', { count: best })}</AppText>
        </View>
      </Card>
      <View style={styles.tiles}>
        <StatTile label={t('workouts')} value={String(totals.workouts)} />
        <StatTile label={t('minutes')} value={String(toMinutes(totals.seconds))} />
        <StatTile label={t('reps')} value={String(totals.reps)} />
      </View>
      <SectionHeader title={t('week')} />
      <Card style={styles.chart}>
        <WeekBars week={week} />
      </Card>
      <SectionHeader title={t('history')} />
      {recent.length ? (
        <Card>
          {recent.map((s, i) => (
            <SessionRow key={s.id} session={s} divider={i < recent.length - 1} />
          ))}
        </Card>
      ) : (
        <Card style={styles.empty}>
          <AppText variant="headline">{t('empty.title')}</AppText>
          <AppText muted>{t('empty.body')}</AppText>
        </Card>
      )}
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.lg, padding: tokens.space.lg },
  streakText: { flex: 1 },
  best: { alignItems: 'flex-end' },
  tiles: { flexDirection: 'row', gap: tokens.space.sm },
  chart: { padding: tokens.space.lg },
  empty: { padding: tokens.space.lg, gap: tokens.space.xs },
}));
