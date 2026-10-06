import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

interface IconButtonProps {
  icon: SymbolViewProps['name'];
  onPress: () => void;
  accessibilityLabel: string;
  /** Large round button (player controls). */
  size?: 'small' | 'large';
  tone?: 'surface' | 'primary';
}

export function IconButton({ icon, onPress, accessibilityLabel, size = 'small', tone = 'surface' }: IconButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const large = size === 'large';
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.base, large && styles.large, tone === 'primary' && styles.primary, pressed && styles.pressed]}
    >
      <SymbolView
        name={icon}
        size={large ? 26 : 17}
        weight="semibold"
        tintColor={tone === 'primary' ? colors.onPrimary : colors.text}
      />
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  base: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  large: { width: 72, height: 72 },
  primary: { backgroundColor: colors.primary },
  pressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
}));
