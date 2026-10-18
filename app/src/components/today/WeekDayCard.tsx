import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { ExerciseId, Goal } from '@/constants/exercises';
import { areasOfAll } from '@/constants/faceMap';
import { MOTION } from '@/constants/motion';
import { useExerciseAccess } from '@/hooks/useContent';
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
  /** The paywall: a locked day's button and its hidden exercises. */
  onUnlock: () => void;
}

/**
 * One day of this week: "Day 4" with the areas it works and its minutes; open, its exercises at that day's reps and
 * hold (today's with its Start button). A done day is green ("Done" and a check, on a soft green head; no fading or
 * strikethrough, it stays easy to read) and opens to what was done that date, each with a check (from the saved
 * workout, so a workout saved through the Coach shows as it was; no reps, a date can have several workouts: History on
 * Progress shows each one's). Without Premium a day after the free ones is locked ("Premium" and a lock): open, it
 * names one free exercise and shows the others locked (ExerciseRow), with Unlock.
 */
export function WeekDayCard({ day, goal, open, onToggle, onExercise, onStart, onUnlock }: WeekDayCardProps) {
  const { t } = useTranslation(['home', 'common', 'exercises']);
  const styles = useStyles();
  const { colors } = useTheme();
  const { canUse } = useExerciseAccess();
  const ids = day.done ? day.done.ids : day.items.map((i) => i.id);
  const areas = areasOfAll(ids);
  const what = areas.length && areas.length <= 3 ? areas.map((a) => t(`exercises:areas.${a}.name`)).join(' · ') : t(`common:programs.${goal}`);
  const title = day.easy ? t('home:thisWeek.easyDay', { day: day.day }) : t('home:thisWeek.day', { day: day.day });
  const minutes = t('common:minutes', { count: toMinutes(day.seconds) });
  // A done day says "Done" before it, in green, a locked one "Premium"; one saved with only minutes has no areas to name.
  const subtitle = [ids.length ? what : null, minutes].filter(Boolean).join(' · ');
  const canOpen = ids.length > 0;
  const status = day.done ? t('home:thisWeek.done') : day.locked ? t('home:thisWeek.locked') : null;
  const label = [title, day.isToday ? t('home:thisWeek.today') : null, status, subtitle];
  // Premium, but not every exercise of today is on this iPhone yet: Start waits (the Today card shows the download).
  const missing = day.items.some((i) => !canUse(i.id));

  return (
    <Card style={day.isToday && styles.today}>
      <Pressable
        onPress={onToggle}
        disabled={!canOpen}
        accessibilityRole="button"
        accessibilityState={canOpen ? { expanded: open } : undefined}
        accessibilityLabel={label.filter(Boolean).join(', ')}
        style={({ pressed }) => [styles.head, day.done && styles.doneHead, pressed && styles.pressed]}
      >
        <View style={styles.text}>
          <AppText variant="headline">{title}</AppText>
          <AppText variant="footnote" muted numberOfLines={1}>
            {status ? <AppText variant="footnote" style={day.done ? styles.doneText : styles.lockedText}>{`${status} · `}</AppText> : null}
            {subtitle}
          </AppText>
        </View>
        {day.isToday ? <Badge label={t('home:thisWeek.today')} tone="primary" /> : null}
        {day.done ? <SymbolView name="checkmark.circle.fill" size={22} tintColor={colors.success} /> : null}
        {day.locked ? <SymbolView name="lock.fill" size={16} tintColor={colors.textMuted} /> : null}
        {canOpen ? <SymbolView name={open ? 'chevron.up' : 'chevron.down'} size={13} weight="semibold" tintColor={colors.textMuted} /> : null}
      </Pressable>
      {open && canOpen ? (
        <Animated.View entering={FadeIn.duration(MOTION.enterMs)} style={styles.list}>
          {day.done ? (
            day.done.ids.map((id, i) => (
              <ExerciseRow key={id} id={id} hideReps done onPress={() => onExercise(id)} divider={i < ids.length - 1} />
            ))
          ) : (
            day.items.map((item, i) => (
              <ExerciseRow
                key={item.id}
                id={item.id}
                reps={item.reps}
                holdSec={item.holdSec}
                // A locked day: only its free exercise opens; the hidden ones lead to the paywall.
                onPress={day.locked && item.id !== day.preview?.id ? onUnlock : () => onExercise(item.id)}
                divider={i < day.items.length - 1}
              />
            ))
          )}
          {day.locked ? (
            <View style={styles.start}>
              <Button title={t('home:today.unlockDay', { day: day.day })} icon="lock.fill" onPress={onUnlock} fullWidth />
            </View>
          ) : day.isToday && !day.done ? (
            <View style={styles.start}>
              <Button title={t('home:today.start')} icon="play.fill" onPress={onStart} disabled={missing} fullWidth />
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
  doneHead: { backgroundColor: colors.successSoft },
  doneText: { color: colors.success, fontWeight: tokens.font.weight.semibold },
  lockedText: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
  list: { borderTopWidth: 1, borderTopColor: colors.border },
  start: { padding: tokens.space.md, paddingTop: tokens.space.xs },
}));
