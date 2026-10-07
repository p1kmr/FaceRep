import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';
import type { ISODate } from '@/utils/dates';
import { formatMonthYear, monthShort } from '@/utils/format';

import { AppText } from '../ui/AppText';

interface MonthSummary {
  month: ISODate;
  weeks: (ISODate | null)[][];
  /** Days with a workout. */
  days: number;
}

interface YearMonthsProps {
  months: MonthSummary[];
  today: ISODate;
  workoutsOn: (day: ISODate) => number;
  onPressMonth: (month: ISODate) => void;
}

/**
 * 12 small months (same idea as Elowa's Year view): a red dot on every day with a workout, so gaps and
 * good months show at a glance. No day numbers (too small to read); tap a month to open it.
 */
export function YearMonths({ months, today, workoutsOn, onPressMonth }: YearMonthsProps) {
  const styles = useStyles();
  return (
    <View style={styles.grid}>
      {months.map((m) => (
        <MiniMonth key={m.month} summary={m} today={today} workoutsOn={workoutsOn} onPress={onPressMonth} />
      ))}
    </View>
  );
}

const MiniMonth = memo(function MiniMonth({
  summary: { month, weeks, days },
  today,
  workoutsOn,
  onPress,
}: {
  summary: MonthSummary;
  today: ISODate;
  workoutsOn: (day: ISODate) => number;
  onPress: (month: ISODate) => void;
}) {
  const { t, i18n } = useTranslation('progress');
  const styles = useStyles();
  const future = month > today;
  const current = today.startsWith(month.slice(0, 7));
  const name = monthShort(month, i18n.language);
  return (
    <Pressable
      onPress={() => onPress(month)}
      disabled={future}
      accessibilityRole="button"
      accessibilityLabel={t('monthDaysA11y', { month: formatMonthYear(month, i18n.language), count: days })}
      style={({ pressed }) => [styles.month, future && styles.future, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <AppText variant="footnote" style={[styles.name, current && styles.current]}>
          {name}
        </AppText>
        {days > 0 ? (
          <AppText variant="caption" muted>
            {days}
          </AppText>
        ) : null}
      </View>
      {weeks.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((day, c) => (
            <View key={c} style={styles.cell}>
              {day ? <View style={[styles.dot, workoutsOn(day) > 0 && styles.done, day === today && styles.today]} /> : null}
            </View>
          ))}
        </View>
      ))}
    </Pressable>
  );
});

const useStyles = makeStyles(({ colors, tokens }) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: tokens.space.lg },
  month: { width: '30%', gap: 2 },
  future: { opacity: 0.4 },
  pressed: { opacity: 0.6 },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: tokens.space.xs },
  name: { fontWeight: tokens.font.weight.semibold, color: colors.text },
  current: { color: colors.primary },
  row: { flexDirection: 'row' },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { width: '70%', height: '70%', borderRadius: tokens.radius.pill, backgroundColor: colors.surfaceAlt },
  done: { backgroundColor: colors.primary },
  today: { borderWidth: 1.5, borderColor: colors.primary },
}));
