import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';
import { fromISODate, type ISODate } from '@/utils/dates';
import { formatDay, weekdayNarrow } from '@/utils/format';

import { AppText } from '../ui/AppText';

interface MonthCalendarProps {
  weeks: (ISODate | null)[][];
  /** Seven days of any week, for the weekday letters on top. */
  weekdays: ISODate[];
  today: ISODate;
  selected: ISODate | null;
  workoutsOn: (day: ISODate) => number;
  onPressDay: (day: ISODate) => void;
}

/** A month like the iOS Calendar: filled circle on days with a workout, ring on today. Tap a day to see it. */
export function MonthCalendar({ weeks, weekdays, today, selected, workoutsOn, onPressDay }: MonthCalendarProps) {
  const { t, i18n } = useTranslation('progress');
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {weekdays.map((d) => (
          <AppText key={d} variant="caption" muted center style={styles.cellBox}>
            {weekdayNarrow(d, i18n.language)}
          </AppText>
        ))}
      </View>
      {weeks.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((day, c) => {
            if (!day) return <View key={c} style={styles.cellBox} />;
            const count = workoutsOn(day);
            const future = day > today;
            return (
              <Pressable
                key={day}
                onPress={() => onPressDay(day)}
                disabled={future}
                accessibilityRole="button"
                accessibilityLabel={t('dayA11y', { date: formatDay(day, i18n.language), count })}
                accessibilityState={{ selected: day === selected }}
                style={styles.cellBox}
              >
                <View style={[styles.cell, count > 0 && styles.done, day === today && styles.today, day === selected && styles.selected]}>
                  <AppText variant="footnote" style={count > 0 ? styles.doneText : future ? styles.futureText : styles.dayText}>
                    {fromISODate(day).getDate()}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { gap: tokens.space.xs },
  row: { flexDirection: 'row' },
  cellBox: { flex: 1, alignItems: 'center' },
  cell: { width: 36, height: 36, borderRadius: tokens.radius.pill, alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: colors.primary },
  today: { borderWidth: 2, borderColor: colors.primary },
  selected: { borderWidth: 2, borderColor: colors.text },
  dayText: { color: colors.text },
  doneText: { color: colors.onPrimary, fontWeight: tokens.font.weight.bold },
  futureText: { color: colors.textMuted },
}));
