import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { DayBar } from '@/services/progress/stats';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, weekdayNarrow } from '@/utils/format';

import { AppText } from '../ui/AppText';

/** The last 7 days as circles: filled when a workout was done, ringed for today. */
export function WeekStrip({ week, today }: { week: DayBar[]; today: string }) {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.row}>
      {week.map(({ day, seconds }) => {
        const done = seconds > 0;
        return (
          <View key={day} style={styles.day} accessible accessibilityLabel={`${formatDay(day, i18n.language)}${done ? ', ✓' : ''}`}>
            <AppText variant="caption" muted>
              {weekdayNarrow(day, i18n.language)}
            </AppText>
            <View style={[styles.dot, done && styles.done, day === today && !done && styles.today]}>
              {done ? <SymbolView name="checkmark" size={13} weight="bold" tintColor={colors.onPrimary} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: tokens.space.xs },
  dot: {
    width: 34,
    height: 34,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  done: { backgroundColor: colors.primary },
  today: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.surface },
}));
