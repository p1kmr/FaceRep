import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

export type AskHintChoice = 'technique' | 'mewing' | 'ask';

const CHOICES: AskHintChoice[] = ['technique', 'mewing', 'ask'];

/**
 * First-time speech bubble next to the floating Coach button (same as Elowa's): what the Coach can do,
 * with shortcuts that open it with a question ready (the user still sends it).
 */
export function AskHint({
  position,
  side,
  onChoose,
  onClose,
}: {
  /** Absolute placement next to the button (computed by AskBubble). */
  position: ViewStyle;
  side: 'left' | 'right';
  onChoose: (choice: AskHintChoice) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation('coach');
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(14)}
      exiting={FadeOut.duration(150)}
      style={[styles.card, position, { transformOrigin: side === 'right' ? 'bottom right' : 'bottom left' }]}
    >
      <View style={styles.header}>
        <AppText variant="footnote" style={styles.title}>
          {t('hint.title')}
        </AppText>
        <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('hint.close')}>
          <SymbolView
            name="xmark"
            size={12}
            weight="bold"
            tintColor={colors.textMuted}
            fallback={<AppText variant="footnote" muted>✕</AppText>}
          />
        </Pressable>
      </View>
      <AppText variant="footnote" muted>
        {t('hint.body')}
      </AppText>
      <View style={styles.chips}>
        {CHOICES.map((c) => (
          <Pressable key={c} onPress={() => onChoose(c)} accessibilityRole="button" style={styles.chip}>
            <AppText variant="footnote" style={styles.chipText}>
              {t(`hint.${c}`)}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: {
    position: 'absolute',
    width: 260,
    padding: tokens.space.md,
    gap: tokens.space.sm,
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 8px 24px ${colors.shadow}`,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: tokens.space.sm },
  title: { flex: 1, fontWeight: tokens.font.weight.semibold },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.xs },
  chip: {
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.xs + 2,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  chipText: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
}));
