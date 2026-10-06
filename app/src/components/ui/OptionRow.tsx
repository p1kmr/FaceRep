import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from './AppText';

interface OptionRowProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

/** Large single-choice card (radio). */
export function OptionRow({ title, subtitle, selected, onPress }: OptionRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => {
        haptics.select();
        onPress();
      }}
      style={[styles.row, selected && styles.selected]}
    >
      <View style={styles.text}>
        <AppText variant="headline">{title}</AppText>
        {subtitle ? (
          <AppText variant="footnote" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <SymbolView name="checkmark" size={12} weight="bold" tintColor={colors.onPrimary} /> : null}
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
    padding: tokens.space.lg,
    borderRadius: tokens.radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.primary },
  text: { flex: 1, gap: 2 },
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
