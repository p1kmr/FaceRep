import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { ExerciseId } from '@/constants/exercises';
import { MOTION } from '@/constants/motion';
import { useTheme } from '@/hooks/useTheme';
import type { SessionSummary } from '@/services/progress/stats';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, toMinutes } from '@/utils/format';

import { ExerciseRow } from '../exercise/ExerciseRow';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';

interface SessionRowProps {
  session: SessionSummary;
  open: boolean;
  onToggle: () => void;
  /** Its page (a locked one shows locked there). */
  onExercise: (id: ExerciseId) => void;
  divider?: boolean;
}

/**
 * One saved workout: date, exercises, minutes and reps. Tap it to see what was done, as the week page opens a day: each
 * exercise with the reps it did (tap one for its page). One saved through the Coach with only minutes has nothing to open.
 */
export function SessionRow({ session, open, onToggle, onExercise, divider }: SessionRowProps) {
  const { t, i18n } = useTranslation(['progress', 'common']);
  const { colors } = useTheme();
  const styles = useStyles();
  const date = formatDay(session.day, i18n.language);
  const meta = t('progress:session', {
    exercises: t('common:exercises', { count: session.exerciseIds.length }),
    minutes: t('common:minutes', { count: toMinutes(session.durationSec) }),
  });
  const reps = t('progress:repsCount', { count: session.totalReps });
  const canOpen = session.exerciseIds.length > 0;
  return (
    <View style={divider && styles.divider}>
      <Pressable
        onPress={onToggle}
        disabled={!canOpen}
        accessibilityRole="button"
        accessibilityState={canOpen ? { expanded: open } : undefined}
        accessibilityLabel={[date, session.logged ? t('progress:logged') : null, meta, reps].filter(Boolean).join(', ')}
        style={({ pressed }) => [styles.row, open && canOpen && styles.openHead, pressed && styles.pressed]}
      >
        <View style={styles.text}>
          <View style={styles.title}>
            <AppText>{date}</AppText>
            {/* Saved from the Coach (done without the app), not finished in the player. */}
            {session.logged ? <Badge label={t('progress:logged')} /> : null}
          </View>
          <AppText variant="footnote" muted>
            {meta}
          </AppText>
        </View>
        <AppText variant="footnote" muted>
          {reps}
        </AppText>
        {canOpen ? <SymbolView name={open ? 'chevron.up' : 'chevron.down'} size={13} weight="semibold" tintColor={colors.textMuted} /> : null}
      </Pressable>
      {open && canOpen ? (
        <Animated.View entering={FadeIn.duration(MOTION.enterMs)} style={styles.list}>
          {session.exerciseIds.map((id, i) => {
            const done = session.exerciseReps?.[i];
            return (
              <ExerciseRow
                key={`${id}-${i}`}
                id={id}
                repsDone={done}
                hideReps={done === undefined}
                done
                onPress={() => onExercise(id)}
                divider={i < session.exerciseIds.length - 1}
              />
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, paddingHorizontal: tokens.space.lg, paddingVertical: tokens.space.md },
  // Open: a soft head, so its exercises read as its own (the week page tints a done day's head the same way).
  openHead: { backgroundColor: colors.surfaceAlt },
  pressed: { backgroundColor: colors.surfaceAlt },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  text: { flex: 1, gap: 2 },
  title: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  list: { borderTopWidth: 1, borderTopColor: colors.border },
}));
