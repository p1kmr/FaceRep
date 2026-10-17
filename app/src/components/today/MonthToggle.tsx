import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useToday } from '@/hooks/useToday';
import { makeStyles } from '@/theme/makeStyles';
import { formatMonthYear } from '@/utils/format';

import { AppText } from '../ui/AppText';

/** Under the week strip: "October 2026 ⌄" opens and closes this month's calendar (it starts closed). */
export function MonthToggle({ open, onPress }: { open: boolean; onPress: () => void }) {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const today = useToday();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      hitSlop={8}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <AppText variant="footnote" style={styles.text}>
        {formatMonthYear(today, i18n.language)}
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
