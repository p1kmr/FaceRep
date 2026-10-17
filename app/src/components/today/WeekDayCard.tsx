import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { ExerciseId, Goal } from '@/constants/exercises';
import { areasOfAll } from '@/constants/faceMap';
import { MOTION } from '@/constants/motion';
import type { WeekDayWorkout } from '@/hooks/useThisWeek';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';
import { toMinutes } from '@/utils/format';

import { ExerciseRow } from '../exercise/ExerciseRow';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface WeekDayCardProps {
  day: WeekDayWorkout;
  goal: Goal;
  open: boolean;
  onToggle: () => void;
  onExercise: (id: ExerciseId) => void;
  onStart: () => void;
}

/**
 * One day of this week: "Day 4" with the areas it works and its minutes; open, its exercises at that day's reps and
 * hold (today's with its Start button). A day done before today only shows that it is done: the exercises it had may
 * have been another mix (a workout saved through the Coach, or another focus area then).
 */
export function WeekDayCard({ day, goal, open, onToggle, onExercise, onStart }: WeekDayCardProps) {
  const { t } = useTranslation(['home', 'common', 'exercises']);
  const styles = useStyles();
  const { colors } = useTheme();
  const ids = day.items.map((i) => i.id);
  const areas = areasOfAll(ids);
  const what = areas.length && areas.length <= 3 ? areas.map((a) => t(`exercises:areas.${a}.name`)).join(' · ') : t(`common:programs.${goal}`);
  const title = day.easy ? t('home:thisWeek.easyDay', { day: day.day }) : t('home:thisWeek.day', { day: day.day });
  const past = day.done && !day.isToday;
  const subtitle = past ? t('home:thisWeek.done') : `${what} · ${t('common:minutes', { count: toMinutes(day.seconds) })}`;
  const canOpen = !past && ids.length > 0;

  return (
    <Card style={day.isToday && styles.today}>
      <Pressable
        onPress={onToggle}
        disabled={!canOpen}
        accessibilityRole="button"
        accessibilityState={canOpen ? { expanded: open } : undefined}
        accessibilityLabel={[title, day.isToday ? t('home:thisWeek.today') : null, subtitle].filter(Boolean).join(', ')}
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
      >
        <View style={styles.text}>
          <AppText variant="headline">{title}</AppText>
          <AppText variant="footnote" muted numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
        {day.isToday ? <Badge label={t('home:thisWeek.today')} tone="primary" /> : null}
        {day.done ? <SymbolView name="checkmark.circle.fill" size={22} tintColor={colors.success} /> : null}
        {canOpen ? <SymbolView name={open ? 'chevron.up' : 'chevron.down'} size={13} weight="semibold" tintColor={colors.textMuted} /> : null}
      </Pressable>
      {open && canOpen ? (
        <Animated.View entering={FadeIn.duration(MOTION.enterMs)} style={styles.list}>
          {day.items.map((item, i) => (
            <ExerciseRow
              key={item.id}
              id={item.id}
              reps={item.reps}
              holdSec={item.holdSec}
              onPress={() => onExercise(item.id)}
              divider={i < day.items.length - 1}
            />
          ))}
          {day.isToday && !day.done ? (
            <View style={styles.start}>
              <Button title={t('home:today.start')} icon="play.fill" onPress={onStart} fullWidth />
            </View>
          ) : null}
        </Animated.View>
      ) : null}
    </Card>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  today: { borderColor: colors.primary },
  head: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm, padding: tokens.space.md, paddingLeft: tokens.space.lg },
  pressed: { backgroundColor: colors.surfaceAlt },
  text: { flex: 1, gap: 2 },
  list: { borderTopWidth: 1, borderTopColor: colors.border },
  start: { padding: tokens.space.md, paddingTop: tokens.space.xs },
}));
