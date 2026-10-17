import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { ProgressSummary } from '@/state/progress/selectors';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

interface StatProps {
  icon: SymbolViewProps['name'];
  tint: string;
  soft: string;
  value: number;
  label: string;
  a11y: string;
}

function Stat({ icon, tint, soft, value, label, a11y }: StatProps) {
  const styles = useStyles();
  return (
    <View style={styles.card} accessible accessibilityLabel={a11y}>
      <View style={[styles.icon, { backgroundColor: soft }]}>
        <SymbolView name={icon} size={16} tintColor={tint} />
      </View>
      <AppText variant="brand" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" muted numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

/** Streak, minutes this week (the week strip's week), all workouts: three small cards. */
export function StatCards({ summary, weekMinutes }: { summary: ProgressSummary; weekMinutes: number }) {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Stat
        icon="flame.fill"
        tint={colors.streak}
        soft={colors.streakSoft}
        value={summary.streak}
        label={t('stats.streak')}
        a11y={t('stats.streakA11y', { count: summary.streak })}
      />
      <Stat
        icon="clock.fill"
        tint={colors.info}
        soft={colors.infoSoft}
        value={weekMinutes}
        label={t('stats.minutes')}
        a11y={t('stats.minutesA11y', { count: weekMinutes })}
      />
      <Stat
        icon="checkmark.seal.fill"
        tint={colors.success}
        soft={colors.successSoft}
        value={summary.totals.workouts}
        label={t('stats.workouts')}
        a11y={t('stats.workoutsA11y', { count: summary.totals.workouts })}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', gap: tokens.space.md },
  card: {
    flex: 1,
    padding: tokens.space.md,
    gap: 2,
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    boxShadow: `${tokens.elevation.card} ${colors.shadow}`,
  },
  icon: { width: 30, height: 30, borderRadius: tokens.radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: tokens.space.xs },
  value: { fontSize: 30, lineHeight: 36 },
}));
