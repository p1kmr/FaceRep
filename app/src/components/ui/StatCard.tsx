import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { View } from 'react-native';

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
}

/** A small card: icon, big number, label (Today and Progress). Lay several out in a row. */
export function StatCard({ icon, tint, soft, value, label, a11y }: StatCardProps) {
  const styles = useStyles();
  return (
    <View style={styles.card} accessible accessibilityLabel={a11y}>
      <View style={[styles.icon, { backgroundColor: soft }]}>
        <SymbolView name={icon} size={16} tintColor={tint} />
      </View>
      <AppText variant="brand" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" muted numberOfLines={1}>
        {label}
      </AppText>
    </View>
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
}));
