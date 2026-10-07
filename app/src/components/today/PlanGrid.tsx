import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { PLAN } from '@/constants/plan';
import { useTheme } from '@/hooks/useTheme';
import type { PlanCell, PlanCellStatus } from '@/services/plan/plan';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, weekdayShort } from '@/utils/format';

import { AppText } from '../ui/AppText';

interface PlanGridProps {
  grid: PlanCell[];
  /** A day was tapped (locked days too, so the screen can open the paywall). */
  onPressDay: (day: number, status: PlanCellStatus) => void;
}

/**
 * The 28 days as 4 rows of 7: a check when done, a ring for today, a lock for Premium days, with the
 * weekday each one was done on (or falls on if you train every day). Tap a day to open it.
 */
export function PlanGrid({ grid, onPressDay }: PlanGridProps) {
  const { t, i18n } = useTranslation('home');
  const { colors } = useTheme();
  const styles = useStyles();
  const weeks = Array.from({ length: PLAN.days / PLAN.daysPerWeek }, (_, w) => grid.slice(w * PLAN.daysPerWeek, (w + 1) * PLAN.daysPerWeek));

  return (
    <View style={styles.root}>
      {weeks.map((cells, w) => (
        <View key={w} style={styles.row}>
          <AppText variant="caption" muted style={styles.week}>
            {t('plan.grid.week', { week: w + 1 })}
          </AppText>
          {cells.map(({ day, status, date }) => (
            <Pressable
              key={day}
              onPress={() => onPressDay(day, status)}
              accessibilityRole="button"
              accessibilityLabel={`${t(`plan.grid.cell.${status}`, { day })}, ${formatDay(date, i18n.language)}`}
              hitSlop={2}
              style={({ pressed }) => [styles.column, pressed && styles.pressed]}
            >
              <View style={[styles.cell, status === 'done' && styles.done, status === 'today' && styles.today]}>
                {status === 'done' ? (
                  <SymbolView name="checkmark" size={13} weight="bold" tintColor={colors.onPrimary} />
                ) : status === 'locked' ? (
                  <SymbolView name="lock.fill" size={11} tintColor={colors.textMuted} />
                ) : (
                  <AppText variant="caption" style={status === 'today' ? styles.todayText : styles.dayText}>
                    {day}
                  </AppText>
                )}
              </View>
              <AppText variant="caption" muted style={[styles.weekday, status === 'today' && styles.todayText]} numberOfLines={1}>
                {weekdayShort(date, i18n.language)}
              </AppText>
            </Pressable>
          ))}
        </View>
      ))}
      <AppText variant="footnote" muted>
        {t('plan.grid.hint')}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { gap: tokens.space.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: tokens.space.sm },
  week: { width: 26, paddingTop: tokens.space.sm + 2 },
  column: { flex: 1, alignItems: 'center', gap: 2 },
  cell: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 40,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  done: { backgroundColor: colors.primary },
  today: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.surface },
  pressed: { opacity: 0.6 },
  dayText: { color: colors.textMuted },
  weekday: { fontSize: tokens.font.size.caption - 2 },
  todayText: { color: colors.primary, fontWeight: tokens.font.weight.bold },
}));
