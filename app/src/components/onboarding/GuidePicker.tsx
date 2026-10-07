import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AVAILABLE_GUIDES, guideImages } from '@/constants/exerciseImages';
import type { ExerciseId } from '@/constants/exercises';
import type { GuideId } from '@/constants/guides';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

/** The picture each card shows (a smile reads well at thumbnail size). */
const PREVIEW: ExerciseId = '06-cheek-lift';

/** Side-by-side cards with each guide's face; nothing selected until the user picks one. */
export function GuidePicker({ value, onChange }: { value: GuideId | null; onChange: (guide: GuideId) => void }) {
  const { t } = useTranslation('common');
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {AVAILABLE_GUIDES.map((g) => {
        const selected = g === value;
        return (
          <Pressable
            key={g}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t(`guides.${g}`)}
            onPress={() => {
              haptics.select();
              onChange(g);
            }}
            style={[styles.card, selected && styles.selected]}
          >
            <Image source={guideImages(g).exercises[PREVIEW].thumb} style={styles.image} contentFit="cover" accessible={false} />
            <View style={styles.label}>
              <AppText variant="headline">{t(`guides.${g}`)}</AppText>
              <View style={[styles.radio, selected && styles.radioOn]}>
                {selected ? <SymbolView name="checkmark" size={12} weight="bold" tintColor={colors.onPrimary} /> : null}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', gap: tokens.space.md },
  card: {
    flex: 1,
    borderRadius: tokens.radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  selected: { borderColor: colors.primary },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.plate },
  label: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: tokens.space.md },
  radio: {
    width: 24,
    height: 24,
    borderRadius: tokens.radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
}));
