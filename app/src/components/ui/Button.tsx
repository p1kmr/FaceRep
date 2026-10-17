import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from './AppText';
import { Gradient } from './Gradient';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: Variant;
  /** An SF Symbol after the label (e.g. play.fill on a start button). */
  icon?: SymbolViewProps['name'];
  /** large: the one big call to action of a screen (taller, brand capitals). */
  size?: 'regular' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
}

/** The primary button is the brand gradient with a soft glow; the others are flat. */
export function Button({
  title,
  variant = 'primary',
  icon,
  size = 'regular',
  loading = false,
  fullWidth = false,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const inactive = disabled || loading;
  const filled = variant === 'primary' || variant === 'danger';
  const large = size === 'large';
  const labelColor = filled ? colors.onPrimary : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      // The label as written: VoiceOver can spell out words in capitals.
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: loading }}
      disabled={inactive}
      onPress={(e) => {
        haptics.tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        large && styles.large,
        styles[variant],
        variant === 'primary' && !inactive && styles.glow,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        inactive && styles.disabled,
      ]}
      {...rest}
    >
      {variant === 'primary' ? (
        <View style={styles.fill}>
          <Gradient colors={[colors.primaryEnd, colors.primary]} direction="horizontal" />
        </View>
      ) : null}
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <View style={styles.content}>
          <AppText
            variant={large ? 'brand' : 'body'}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={[large ? styles.largeLabel : styles.label, { color: labelColor }]}
          >
            {large ? title.toUpperCase() : title}
          </AppText>
          {icon ? <SymbolView name={icon} size={large ? 16 : 14} weight="bold" tintColor={labelColor} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  base: {
    minHeight: tokens.hitSize + tokens.space.sm,
    paddingHorizontal: tokens.space.xl,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { minHeight: 60 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceAlt },
  ghost: {},
  danger: { backgroundColor: colors.danger },
  glow: { boxShadow: `${tokens.elevation.glow} ${colors.glow}` },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: tokens.radius.pill, overflow: 'hidden' },
  content: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
  label: { fontWeight: tokens.font.weight.semibold },
  largeLabel: { fontSize: 21, lineHeight: 26, letterSpacing: 1 },
}));
