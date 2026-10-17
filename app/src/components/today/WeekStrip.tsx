import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useFirstWeekday } from '@/hooks/useFirstWeekday';
import { useProgressState } from '@/hooks/useProgress';
import { useTheme } from '@/hooks/useTheme';
import { useToday } from '@/hooks/useToday';
import { workoutDays } from '@/services/progress/stats';
import { makeStyles } from '@/theme/makeStyles';
import { addDays, weekStart } from '@/utils/dates';
import { formatDay, weekdayNarrow } from '@/utils/format';

import { AppText } from '../ui/AppText';
import { Gradient } from '../ui/Gradient';

/** This week (from the region's first weekday): days with a workout filled, today ringed. */
export function WeekStrip() {
  const { t, i18n } = useTranslation('home');
  const styles = useStyles();
  const { colors } = useTheme();
  const today = useToday();
  const firstWeekday = useFirstWeekday();
  const { sessions } = useProgressState();
  const done = useMemo(() => workoutDays(sessions), [sessions]);
  const start = weekStart(today, firstWeekday);
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <View style={styles.row}>
      {week.map((day) => {
        const isDone = done.has(day);
        const isToday = day === today;
        const date = formatDay(day, i18n.language);
        return (
          <View
            key={day}
            style={styles.cell}
            accessible
            accessibilityLabel={isDone ? t('week.done', { date }) : isToday ? t('week.today', { date }) : date}
          >
            <AppText variant="caption" style={[styles.weekday, isToday && styles.todayText]}>
              {weekdayNarrow(day, i18n.language)}
            </AppText>
            <View style={[styles.dot, isToday && !isDone && styles.ring]}>
              {isDone ? <Gradient colors={[colors.primaryEnd, colors.primary]} /> : null}
              <AppText
                variant="footnote"
                style={[styles.number, day > today && styles.future, isToday && styles.todayText, isDone && styles.doneText]}
              >
                {Number(day.slice(8))}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { alignItems: 'center', gap: tokens.space.xs, minWidth: 40 },
  weekday: { color: colors.textMuted, fontWeight: tokens.font.weight.semibold },
  dot: {
    width: 38,
    height: 38,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ring: { borderWidth: 2, borderColor: colors.primary },
  number: { fontWeight: tokens.font.weight.semibold, fontVariant: ['tabular-nums'] },
  future: { color: colors.textMuted },
  todayText: { color: colors.primary },
  doneText: { color: colors.onPrimary },
}));
