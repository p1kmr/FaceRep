import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from './AppText';

interface ListRowProps {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  /** Show a chevron (navigates to another screen). */
  chevron?: boolean;
  divider?: boolean;
}

export function ListRow({ title, subtitle, left, right, onPress, chevron, divider }: ListRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const content = (
    <>
      {left}
      <View style={styles.text}>
        <AppText>{title}</AppText>
        {subtitle ? (
          <AppText variant="footnote" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
      {chevron ? (
        <SymbolView name="chevron.right" size={14} tintColor={colors.textMuted} weight="semibold" />
      ) : null}
    </>
  );

  // A row without an action is a plain View, so controls inside it (switches, pickers) stay usable.
  if (!onPress) return <View style={[styles.row, divider && styles.divider]}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: {
    minHeight: tokens.hitSize + tokens.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  pressed: { backgroundColor: colors.surfaceAlt },
  text: { flex: 1, gap: 2 },
}));
