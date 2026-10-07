import { Image } from 'expo-image';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HERO_IMAGES } from '@/constants/exerciseImages';
import { LINKS } from '@/constants/links';
import type { PlanCard } from '@/hooks/usePaywall';
import { useTheme } from '@/hooks/useTheme';
import type { PlanId } from '@/services/purchases/plans';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { PlanCardView } from './PlanCardView';

interface PaywallViewProps {
  cards: PlanCard[];
  loading: boolean;
  busy: boolean;
  onPurchase: (id: PlanId) => void;
  onRestore: () => void;
  onClose: () => void;
}

const BENEFITS: { key: string; icon: SymbolViewProps['name'] }[] = [
  { key: 'plan', icon: 'calendar' },
  { key: 'levels', icon: 'chart.line.uptrend.xyaxis' },
  { key: 'coach', icon: 'sparkles' },
];

/**
 * Pure UI: knows nothing about RevenueCat. Yearly is pre-selected. Price, period, trial and
 * auto-renewal are stated next to the button, and Restore / Terms / Privacy are always visible
 * (App Store guideline 3.1.2).
 */
export function PaywallView({ cards, loading, busy, onPurchase, onRestore, onClose }: PaywallViewProps) {
  const { t } = useTranslation('paywall');
  const { colors } = useTheme();
  const styles = useStyles();
  const [selected, setSelected] = useState<PlanId>('yearly');
  const card = cards.find((c) => c.id === selected) ?? cards[0];
  const trial = card.trialDays;

  const footnote = trial
    ? t('trialThen', { count: trial, price: card.price, period: t(card.id === 'monthly' ? 'month' : 'year') })
    : t('cancelAnytime');

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.hero}>
          <Image source={HERO_IMAGES.paywall} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
          <SafeAreaView edges={['top']} style={styles.top}>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('close')} hitSlop={12} style={styles.close}>
              <SymbolView name="xmark" size={15} weight="bold" tintColor={colors.onImage} />
            </Pressable>
          </SafeAreaView>
        </View>
        <View style={styles.body}>
          <View style={styles.titles}>
            <AppText variant="title" center accessibilityRole="header">
              {t('headline')}
            </AppText>
            <AppText muted center>
              {t('subhead')}
            </AppText>
          </View>
          <View style={styles.benefits}>
            {BENEFITS.map((b) => (
              <View key={b.key} style={styles.benefit}>
                <SymbolView name={b.icon} size={20} tintColor={colors.primary} />
                <AppText style={styles.benefitText}>{t(`benefits.${b.key}`)}</AppText>
              </View>
            ))}
          </View>
          <View style={[styles.plans, loading && styles.loading]} accessibilityRole="radiogroup">
            {cards.map((c) => (
              <PlanCardView key={c.id} card={c} selected={c.id === selected} onPress={() => setSelected(c.id)} />
            ))}
          </View>
          <AppText variant="caption" muted center>
            {t('renewal')}
          </AppText>
          <AppText variant="caption" muted center>
            {t('aiNote')}
          </AppText>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={trial ? t('startTrial') : t('continue')} onPress={() => onPurchase(selected)} loading={busy} fullWidth />
        <AppText variant="caption" muted center>
          {footnote}
        </AppText>
        <View style={styles.links}>
          <Pressable onPress={onRestore} accessibilityRole="button" hitSlop={8}>
            <AppText variant="caption" style={styles.link}>
              {t('restoreButton')}
            </AppText>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(LINKS.terms)} accessibilityRole="link" hitSlop={8}>
            <AppText variant="caption" style={styles.link}>
              {t('terms')}
            </AppText>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(LINKS.privacy)} accessibilityRole="link" hitSlop={8}>
            <AppText variant="caption" style={styles.link}>
              {t('privacy')}
            </AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: tokens.space.lg },
  hero: { height: 300, backgroundColor: colors.heroBackground },
  top: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: tokens.space.lg, paddingTop: tokens.space.sm },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.onImageSoft,
  },
  body: { padding: tokens.space.lg, gap: tokens.space.xl, marginTop: -tokens.space.xl, borderTopLeftRadius: tokens.radius.xl, borderTopRightRadius: tokens.radius.xl, backgroundColor: colors.background },
  titles: { gap: tokens.space.sm },
  benefits: { gap: tokens.space.md },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md },
  benefitText: { flex: 1 },
  plans: { gap: tokens.space.lg, paddingTop: tokens.space.sm },
  loading: { opacity: 0.6 },
  footer: { paddingHorizontal: tokens.space.lg, paddingTop: tokens.space.sm, paddingBottom: tokens.space.sm, gap: tokens.space.sm },
  links: { flexDirection: 'row', justifyContent: 'center', gap: tokens.space.xl },
  link: { color: colors.textMuted, textDecorationLine: 'underline' },
}));
