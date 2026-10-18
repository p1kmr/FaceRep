import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EXERCISES } from '@/constants/exercises';
import { useExerciseAccess } from '@/hooks/useContent';
import { useTheme } from '@/hooks/useTheme';
import type { RoutineAction } from '@/services/ai/types';
import { defaultItem, workoutSeconds } from '@/services/workout/items';
import type { ProposedAction } from '@/state/chat/types';
import { makeStyles } from '@/theme/makeStyles';
import { toMinutes } from '@/utils/format';

import { ExerciseAvatars } from '../exercise/ExerciseAvatars';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';

interface WorkoutActionCardProps {
  proposed: ProposedAction & { action: RoutineAction };
  onResolve: (accept: boolean) => void;
}

/**
 * A routine the Coach proposed, to start now. The card shows its exercises with the app's own reps and time, and nothing
 * starts until Start.
 */
export function WorkoutActionCard({ proposed, onResolve }: WorkoutActionCardProps) {
  const { t } = useTranslation(['coach', 'common', 'exercises']);
  const { colors } = useTheme();
  const styles = useStyles();
  const { canUse } = useExerciseAccess();
  const { action, status } = proposed;
  // A routine runs only what this iPhone can show (the workout screen leaves the rest out).
  const ids = action.exercises.filter(canUse);
  const seconds = workoutSeconds(ids.map(defaultItem));
  const names = ids.map((id) => t(`exercises:items.${EXERCISES[id].key}.name`));
  const listed = names.length > 4 ? [...names.slice(0, 3), t('coach:actions.more', { count: names.length - 3 })] : names;
  const meta = [ids.length ? t('common:exercises', { count: ids.length }) : '', seconds ? t('common:minutes', { count: toMinutes(seconds) }) : '']
    .filter(Boolean)
    .join(' · ');
  const heading = t('coach:actions.routine');
  const title = action.title || t('coach:actions.routineTitle');

  let footer;
  if (status === 'pending') {
    footer = (
      <View style={styles.buttons}>
        <View style={styles.button}>
          <Button title={t('coach:actions.start')} icon="play.fill" onPress={() => onResolve(true)} fullWidth />
        </View>
        <View style={styles.button}>
          <Button title={t('coach:actions.decline')} variant="secondary" onPress={() => onResolve(false)} fullWidth />
        </View>
      </View>
    );
  } else if (status === 'done') {
    footer = (
      <AppText variant="footnote" style={styles.done}>
        {t('coach:actions.started')}
      </AppText>
    );
  } else {
    footer = (
      <AppText variant="footnote" muted>
        {t('coach:actions.notStarted')}
      </AppText>
    );
  }

  return (
    <View style={styles.card} accessibilityLabel={heading}>
      <View style={styles.header}>
        <SymbolView name="play.fill" size={16} tintColor={colors.primary} />
        <AppText variant="footnote" style={styles.heading}>
          {heading}
        </AppText>
      </View>
      <AppText variant="headline">{title}</AppText>
      {ids.length ? (
        <View style={styles.exercises}>
          <ExerciseAvatars ids={ids} />
          <View style={styles.flex}>
            <AppText variant="footnote" numberOfLines={2}>
              {listed.join(', ')}
            </AppText>
            {meta ? (
              <AppText variant="caption" muted>
                {meta}
              </AppText>
            ) : null}
          </View>
        </View>
      ) : null}
      {footer}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: {
    gap: tokens.space.md,
    padding: tokens.space.lg,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    boxShadow: `${tokens.elevation.card} ${colors.shadow}`,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  heading: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
  exercises: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md },
  flex: { flex: 1, gap: 2 },
  buttons: { flexDirection: 'row', gap: tokens.space.sm },
  button: { flex: 1 },
  done: { color: colors.success, fontWeight: tokens.font.weight.semibold },
}));
