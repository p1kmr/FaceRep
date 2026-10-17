import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { EXERCISES, type ExerciseId } from '@/constants/exercises';
import { useGuideImages } from '@/hooks/useGuide';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

interface ExerciseTileProps {
  id: ExerciseId;
  onPress: () => void;
  /** Done today: a check on the picture. */
  done?: boolean;
}

/** A grid tile: the exercise drawing (muscle in red), name, main muscle and reps × hold. */
export function ExerciseTile({ id, onPress, done }: ExerciseTileProps) {
  const { t } = useTranslation(['exercises', 'common']);
  const { colors } = useTheme();
  const styles = useStyles();
  const images = useGuideImages();
  const e = EXERCISES[id];
  const name = t(`exercises:items.${e.key}.name`);
  const meta = `${t(`exercises:muscles.${e.muscles[0]}`)} · ${t('common:reps', { reps: e.reps, hold: e.holdSec })}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${meta}`}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={styles.picture}>
        <Image source={images.exercises[id].exercise} style={styles.image} contentFit="cover" contentPosition="top" transition={150} />
        {done ? (
          <View style={styles.done}>
            <SymbolView name="checkmark.circle.fill" size={22} tintColor={colors.success} />
          </View>
        ) : null}
      </View>
      <View style={styles.text}>
        <AppText variant="headline" numberOfLines={1} style={styles.name}>
          {name}
        </AppText>
        <AppText variant="caption" muted numberOfLines={1}>
          {meta}
        </AppText>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  tile: {
    width: '48%',
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    boxShadow: `${tokens.elevation.card} ${colors.shadow}`,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  picture: { aspectRatio: 0.86, backgroundColor: colors.plate },
  image: { width: '100%', height: '100%' },
  done: { position: 'absolute', top: tokens.space.sm, right: tokens.space.sm, borderRadius: tokens.radius.pill, backgroundColor: colors.surface },
  text: { padding: tokens.space.md, gap: 2 },
  name: { fontSize: tokens.font.size.body, fontWeight: tokens.font.weight.semibold },
}));
