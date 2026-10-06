import { Pressable, View } from 'react-native';

import type { PlanCard } from '@/hooks/usePaywall';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

export function PlanCardView({ card, selected, onPress }: { card: PlanCard; selected: boolean; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={[card.title, card.price, card.subtitle, card.badge].filter(Boolean).join(', ')}
      style={[styles.card, selected && styles.selected]}
    >
      {card.badge ? (
        <View style={styles.badge}>
          <AppText variant="caption" style={styles.badgeText}>
            {card.badge}
          </AppText>
        </View>
      ) : null}
      <View style={[styles.radio, selected && styles.radioOn]} />
      <View style={styles.text}>
        <AppText variant="headline">{card.title}</AppText>
        <AppText variant="footnote" muted>
          {card.subtitle}
        </AppText>
      </View>
      <AppText variant="headline">{card.price}</AppText>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: {
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
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border },
  radioOn: { borderColor: colors.primary, borderWidth: 6 },
  text: { flex: 1, gap: 2 },
  badge: {
    position: 'absolute',
    top: -10,
    right: tokens.space.lg,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.primary,
  },
  badgeText: { color: colors.onPrimary, fontWeight: tokens.font.weight.bold },
}));
