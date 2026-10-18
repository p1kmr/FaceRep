import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Gradient } from '@/components/ui/Gradient';
import { useFaceScans } from '@/hooks/useFaceScans';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

/**
 * Today's nudge for the face scan: shown when this iPhone can scan, a scan is left (free or Premium) and there's none
 * from the last week. Never shown to lead to the paywall.
 */
export function ScanTodayCard() {
  const { t } = useTranslation('scan');
  const styles = useStyles();
  const { colors } = useTheme();
  const { hydrated, canScan, due, latest } = useFaceScans();
  if (!hydrated || !canScan || !due) return null;
  const subtitle = latest ? t('today.due') : t('today.first');
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        router.push('/scan');
      }}
      accessibilityRole="button"
      accessibilityLabel={`${t('today.title')}. ${subtitle}`}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.card}>
        <View style={styles.badge}>
          <Gradient colors={[colors.primaryEnd, colors.primary]} />
          <SymbolView name="faceid" size={26} tintColor={colors.onPrimary} />
        </View>
        <View style={styles.text}>
          <AppText variant="headline">{t('today.title')}</AppText>
          <AppText variant="footnote" muted>
            {subtitle}
          </AppText>
        </View>
        <View style={styles.pill}>
          <AppText variant="footnote" style={styles.pillText}>
            {t('today.start')}
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, padding: tokens.space.lg },
  badge: { width: 48, height: 48, borderRadius: tokens.radius.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  pill: { paddingHorizontal: tokens.space.lg, paddingVertical: tokens.space.sm, borderRadius: tokens.radius.pill, backgroundColor: colors.primarySoft },
  pillText: { color: colors.primary, fontWeight: tokens.font.weight.bold },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
}));
