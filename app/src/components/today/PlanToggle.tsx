import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

/** Under the week strip: opens and closes the 28-day plan (it starts closed, the week above is enough day to day). */
export function PlanToggle({ open, onPress }: { open: boolean; onPress: () => void }) {
  const { t } = useTranslation('home');
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      hitSlop={8}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <AppText variant="footnote" style={styles.text}>
        {t('plan.grid.title')}
      </AppText>
      <SymbolView name={open ? 'chevron.up' : 'chevron.down'} size={12} weight="semibold" tintColor={colors.primary} />
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: tokens.space.xs, paddingVertical: tokens.space.xs },
  text: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
  pressed: { opacity: 0.6 },
}));
