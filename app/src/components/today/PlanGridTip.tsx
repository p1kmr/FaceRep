import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

/** First-use tip above the 28-day grid: how to read it. Shown until "Got it" or the first tap on a day. */
export function PlanGridTip({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation('home');
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.card}>
      <View style={styles.header}>
        <SymbolView name="lightbulb.fill" size={16} tintColor={colors.primary} />
        <AppText variant="footnote" style={styles.title}>
          {t('plan.grid.tip.title')}
        </AppText>
      </View>
      <AppText variant="footnote" muted>
        {t('plan.grid.hint')}
      </AppText>
      <Pressable onPress={onDone} accessibilityRole="button" hitSlop={6} style={({ pressed }) => [styles.done, pressed && styles.pressed]}>
        <AppText variant="footnote" style={styles.doneText}>
          {t('plan.grid.tip.done')}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: {
    padding: tokens.space.md,
    gap: tokens.space.sm,
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 8px 24px ${colors.shadow}`,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  title: { flex: 1, fontWeight: tokens.font.weight.semibold },
  done: {
    alignSelf: 'flex-end',
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.xs + 2,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  doneText: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
  pressed: { opacity: 0.6 },
}));
