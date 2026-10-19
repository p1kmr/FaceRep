import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { ProgressSummary } from '@/state/progress/selectors';
import { makeStyles } from '@/theme/makeStyles';

import { StatCard } from '../ui/StatCard';

/** Streak, minutes this week (the week strip's week), all workouts. Each one opens Progress (`onPress`). */
export function StatCards({ summary, weekMinutes, onPress }: { summary: ProgressSummary; weekMinutes: number; onPress: () => void }) {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const { colors } = useTheme();
  const button = { onPress, hint: t('openProgress') };
  return (
    <View style={styles.row}>
      <StatCard
        icon="flame.fill"
        tint={colors.streak}
        soft={colors.streakSoft}
        value={summary.streak}
        label={t('stats.streak')}
        a11y={t('stats.streakA11y', { count: summary.streak })}
        {...button}
      />
      <StatCard
        icon="clock.fill"
        tint={colors.info}
        soft={colors.infoSoft}
        value={weekMinutes}
        label={t('stats.minutes')}
        a11y={t('stats.minutesA11y', { count: weekMinutes })}
        {...button}
      />
      <StatCard
        icon="checkmark.seal.fill"
        tint={colors.success}
        soft={colors.successSoft}
        value={summary.totals.workouts}
        label={t('stats.workouts')}
        a11y={t('stats.workoutsA11y', { count: summary.totals.workouts })}
        {...button}
      />
    </View>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  row: { flexDirection: 'row', gap: tokens.space.md },
}));
