import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { DayBar } from '@/services/progress/stats';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, toMinutes, weekdayNarrow } from '@/utils/format';

import { AppText } from '../ui/AppText';

const HEIGHT = 120;

/** Minutes per day for the last 7 days. Bars are relative to the busiest day (at least 5 min). */
export function WeekBars({ week }: { week: DayBar[] }) {
  const { t, i18n } = useTranslation('common');
  const styles = useStyles();
  const max = Math.max(300, ...week.map((d) => d.seconds));
  return (
    <View style={styles.chart}>
      {week.map(({ day, seconds }) => {
        const minutes = toMinutes(seconds);
        return (
          <View
            key={day}
            style={styles.column}
            accessible
            accessibilityLabel={`${formatDay(day, i18n.language)}: ${t('minutes', { count: minutes })}`}
          >
            <AppText variant="caption" muted>
              {minutes > 0 ? minutes : ''}
            </AppText>
            <View style={styles.track}>
              <View style={[styles.bar, { height: Math.max(seconds > 0 ? 6 : 0, (seconds / max) * HEIGHT) }]} />
            </View>
            <AppText variant="caption" muted>
              {weekdayNarrow(day, i18n.language)}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  chart: { flexDirection: 'row', justifyContent: 'space-between', gap: tokens.space.sm },
  column: { flex: 1, alignItems: 'center', gap: tokens.space.xs },
  track: {
    width: '100%',
    maxWidth: 28,
    height: HEIGHT,
    justifyContent: 'flex-end',
    borderRadius: tokens.radius.sm,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  bar: { width: '100%', borderRadius: tokens.radius.sm, backgroundColor: colors.primary },
}));
