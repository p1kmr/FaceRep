import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';
import type { ISODate } from '@/utils/dates';
import { formatMonthYear, monthNarrow } from '@/utils/format';

import { AppText } from '../ui/AppText';

const HEIGHT = 120;

interface YearBarsProps {
  months: { month: ISODate; workouts: number }[];
  today: ISODate;
  onPressMonth: (month: ISODate) => void;
}

/** Workouts per month. Bars are relative to the busiest month (at least 10). Tap a month to open it. */
export function YearBars({ months, today, onPressMonth }: YearBarsProps) {
  const { t, i18n } = useTranslation('progress');
  const styles = useStyles();
  const max = Math.max(10, ...months.map((m) => m.workouts));
  return (
    <View style={styles.chart}>
      {months.map(({ month, workouts }) => {
        const future = month > today;
        return (
          <Pressable
            key={month}
            onPress={() => onPressMonth(month)}
            disabled={future}
            accessibilityRole="button"
            accessibilityLabel={t('monthA11y', { month: formatMonthYear(month, i18n.language), count: workouts })}
            style={({ pressed }) => [styles.column, pressed && styles.pressed]}
          >
            <AppText variant="caption" muted>
              {workouts > 0 ? workouts : ''}
            </AppText>
            <View style={styles.track}>
              <View style={[styles.bar, { height: Math.max(workouts > 0 ? 6 : 0, (workouts / max) * HEIGHT) }]} />
            </View>
            <AppText variant="caption" muted>
              {monthNarrow(month, i18n.language)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  chart: { flexDirection: 'row', justifyContent: 'space-between', gap: tokens.space.xs },
  column: { flex: 1, alignItems: 'center', gap: tokens.space.xs },
  pressed: { opacity: 0.6 },
  track: {
    width: '100%',
    maxWidth: 18,
    height: HEIGHT,
    justifyContent: 'flex-end',
    borderRadius: tokens.radius.sm,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  bar: { width: '100%', borderRadius: tokens.radius.sm, backgroundColor: colors.primary },
}));
