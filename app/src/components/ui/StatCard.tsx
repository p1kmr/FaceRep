import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from './AppText';

interface StatCardProps {
  icon: SymbolViewProps['name'];
  /** Icon color and its soft background, from the theme. */
  tint: string;
  soft: string;
  value: number | string;
  label: string;
  /** What VoiceOver reads (the number with its words). */
  a11y: string;
  /** Makes the card a button (Today's open Progress), with what it does for VoiceOver. */
  onPress?: () => void;
  hint?: string;
}

/** A small card: icon, big number, label (Today and Progress). Lay several out in a row. */
export function StatCard({ icon, tint, soft, value, label, a11y, onPress, hint }: StatCardProps) {
  const styles = useStyles();
  const content = (
    <>
      <View style={[styles.icon, { backgroundColor: soft }]}>
        <SymbolView name={icon} size={16} tintColor={tint} />
      </View>
      <AppText variant="brand" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" muted numberOfLines={1}>
        {label}
      </AppText>
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.card} accessible accessibilityLabel={a11y}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityHint={hint}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: {
    flex: 1,
    padding: tokens.space.md,
    gap: 2,
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    boxShadow: `${tokens.elevation.card} ${colors.shadow}`,
  },
  icon: { width: 30, height: 30, borderRadius: tokens.radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: tokens.space.xs },
  value: { fontSize: 30, lineHeight: 36 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
}));
