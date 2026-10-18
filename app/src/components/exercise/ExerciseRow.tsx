import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { EXERCISES, type ExerciseId } from '@/constants/exercises';
import { useExerciseAccess } from '@/hooks/useContent';
import { useGuideImages } from '@/hooks/useGuide';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';
import { LockedPicture } from './LockedPicture';

interface ExerciseRowProps {
  id: ExerciseId;
  onPress?: () => void;
  /** Done today: a check instead of the chevron. */
  done?: boolean;
  divider?: boolean;
  /** This session's reps and hold (a plan day); the catalog values otherwise. */
  reps?: number;
  holdSec?: number;
  /** A workout done before: the reps it did (its hold isn't saved). */
  repsDone?: number;
  /** A workout done before, without its reps (a date of the week page can have several workouts): only the muscle. */
  hideReps?: boolean;
}

/**
 * Thumbnail, name, main muscle and reps × hold. A locked exercise (Premium, or not on this iPhone yet) shows only that
 * it's a Premium exercise and its program, on the locked card (LockedPicture): its name and picture aren't in the app.
 */
export function ExerciseRow({ id, onPress, done, divider, reps, holdSec, repsDone, hideReps }: ExerciseRowProps) {
  const { t } = useTranslation(['exercises', 'common', 'progress']);
  const { colors } = useTheme();
  const styles = useStyles();
  const images = useGuideImages();
  const lock = useExerciseAccess().lockOf(id);
  const e = EXERCISES[id];
  if (lock) {
    const title = t('exercises:locked.name');
    const meta = lock === 'premium' ? t(`common:programs.${e.program}`) : t(`exercises:locked.${lock}`);
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${meta}`}
        style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}
      >
        <LockedPicture lock={lock} iconSize={9} style={styles.thumb} />
        <View style={styles.text}>
          <AppText variant="headline" muted numberOfLines={1}>
            {title}
          </AppText>
          <AppText variant="footnote" muted numberOfLines={1}>
            {meta}
          </AppText>
        </View>
        {onPress ? <SymbolView name="chevron.right" size={14} weight="semibold" tintColor={colors.textMuted} /> : null}
      </Pressable>
    );
  }
  const name = t(`exercises:items.${e.key}.name`);
  const muscle = t(`exercises:muscles.${e.muscles[0]}`);
  const meta = hideReps
    ? muscle
    : repsDone !== undefined
      ? `${muscle} · ${t('progress:repsCount', { count: repsDone })}`
      : `${muscle} · ${t('common:reps', { reps: reps ?? e.reps, hold: holdSec ?? e.holdSec })}`;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${meta}`}
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}
    >
      <Image source={images.exercises[id]?.thumb} style={styles.thumb} contentFit="cover" />
      <View style={styles.text}>
        <AppText variant="headline" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="footnote" muted numberOfLines={1}>
          {meta}
        </AppText>
      </View>
      {done ? (
        <SymbolView name="checkmark.circle.fill" size={22} tintColor={colors.success} />
      ) : onPress ? (
        <SymbolView name="chevron.right" size={14} weight="semibold" tintColor={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, padding: tokens.space.md },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  pressed: { backgroundColor: colors.surfaceAlt },
  thumb: { width: 60, height: 60, borderRadius: tokens.radius.md, backgroundColor: colors.plate },
  text: { flex: 1, gap: 2 },
}));
