import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

import { Gradient } from './Gradient';

interface IconButtonProps {
  icon: SymbolViewProps['name'];
  onPress: () => void;
  accessibilityLabel: string;
  /** Large round button (player controls). */
  size?: 'small' | 'large';
  tone?: 'surface' | 'primary';
  /** On/off button (voice, mirror): read as a switch by VoiceOver, filled while on. */
  toggled?: boolean;
  /** Dimmed and not tappable (e.g. New chat while the chat is empty). */
  disabled?: boolean;
}

export function IconButton({ icon, onPress, accessibilityLabel, size = 'small', tone: toneProp = 'surface', toggled, disabled }: IconButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const large = size === 'large';
  const tone = toggled ? 'primary' : toneProp;
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      accessibilityRole={toggled === undefined ? 'button' : 'switch'}
      aria-checked={toggled}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={disabled ? { disabled } : undefined}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        large && styles.large,
        tone === 'primary' && styles.primary,
        large && tone === 'primary' && styles.glow,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {tone === 'primary' ? (
        <View style={styles.fill}>
          <Gradient colors={[colors.primaryEnd, colors.primary]} />
        </View>
      ) : null}
      {/* In its own view: the web build paints a bare icon under the gradient. */}
      <View>
        <SymbolView
          name={icon}
          size={large ? 26 : 17}
          weight="semibold"
          tintColor={tone === 'primary' ? colors.onPrimary : colors.text}
        />
      </View>
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
  // The gradient in its own clipped circle, so the button's glow can spread outside it.
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: tokens.radius.pill, overflow: 'hidden' },
  large: { width: 72, height: 72 },
  primary: { backgroundColor: colors.primary },
  glow: { boxShadow: `${tokens.elevation.glow} ${colors.glow}` },
  pressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.4 },
}));
