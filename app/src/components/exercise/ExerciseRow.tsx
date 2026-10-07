import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { EXERCISES, type ExerciseId } from '@/constants/exercises';
import { useGuideImages } from '@/hooks/useGuide';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

interface ExerciseRowProps {
  id: ExerciseId;
  onPress?: () => void;
  /** Done today: a check instead of the chevron. */
  done?: boolean;
  divider?: boolean;
  /** This session's reps and hold (a plan day); the catalog values otherwise. */
  reps?: number;
  holdSec?: number;
}

/** Thumbnail, name, main muscle and reps × hold. */
export function ExerciseRow({ id, onPress, done, divider, reps, holdSec }: ExerciseRowProps) {
  const { t } = useTranslation(['exercises', 'common']);
  const { colors } = useTheme();
  const styles = useStyles();
  const images = useGuideImages();
  const e = EXERCISES[id];
  const name = t(`exercises:items.${e.key}.name`);
  const meta = `${t(`exercises:muscles.${e.muscles[0]}`)} · ${t('common:reps', { reps: reps ?? e.reps, hold: holdSec ?? e.holdSec })}`;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${meta}`}
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}
    >
      <Image source={images.exercises[id].thumb} style={styles.thumb} contentFit="cover" />
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
