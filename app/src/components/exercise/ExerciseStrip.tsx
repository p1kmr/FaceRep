import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import type { ExerciseId } from '@/constants/exercises';
import { useGuideImages } from '@/hooks/useGuide';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

/** The workout's exercises as small round pictures: done ones checked, the current one ringed, the rest faded. */
export function ExerciseStrip({ ids, index }: { ids: readonly ExerciseId[]; index: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const images = useGuideImages();
  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {ids.map((id, i) => (
        <View key={`${id}-${i}`} style={[styles.item, i === index && styles.current, i > index && styles.later]}>
          <Image source={images.exercises[id]?.thumb} style={styles.thumb} contentFit="cover" />
          {i < index ? (
            <View style={styles.done}>
              <SymbolView name="checkmark.circle.fill" size={16} tintColor={colors.success} />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', justifyContent: 'center', gap: tokens.space.sm, flexWrap: 'wrap', paddingHorizontal: tokens.space.lg },
  item: { width: 40, height: 40, borderRadius: tokens.radius.pill, padding: 2, borderWidth: 2, borderColor: colors.background },
  current: { borderColor: colors.primary, transform: [{ scale: 1.12 }] },
  later: { opacity: 0.45 },
  thumb: { width: '100%', height: '100%', borderRadius: tokens.radius.pill, backgroundColor: colors.plate },
  done: { position: 'absolute', right: -4, bottom: -4, borderRadius: tokens.radius.pill, backgroundColor: colors.surface },
}));
