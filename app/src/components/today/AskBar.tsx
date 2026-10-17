import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';
import { Gradient } from '../ui/Gradient';

/** A bar that opens the Coach (also the floating button); it says what to ask. */
export function AskBar() {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        router.push('/coach');
      }}
      accessibilityRole="button"
      accessibilityLabel={t('ask')}
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Gradient colors={[colors.primaryEnd, colors.primary]} />
        {/* In its own view: the web build paints a bare icon under the gradient. */}
        <View>
          <SymbolView name="sparkles" size={16} weight="semibold" tintColor={colors.onPrimary} />
        </View>
      </View>
      <AppText muted numberOfLines={1} style={styles.text}>
        {t('ask')}
      </AppText>
      <SymbolView name="chevron.right" size={13} weight="semibold" tintColor={colors.textMuted} />
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
    minHeight: 56,
    paddingHorizontal: tokens.space.md,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    boxShadow: `${tokens.elevation.card} ${colors.shadow}`,
  },
  pressed: { opacity: 0.9 },
  icon: { width: 34, height: 34, borderRadius: tokens.radius.pill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
}));
