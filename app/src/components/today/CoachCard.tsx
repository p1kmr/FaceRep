import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

export function CoachCard({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation('home');
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <SymbolView name="sparkles" size={20} tintColor={colors.primary} />
      </View>
      <View style={styles.text}>
        <AppText variant="headline">{t('coachCard.title')}</AppText>
        <AppText variant="footnote" muted>
          {t('coachCard.body')}
        </AppText>
      </View>
      <SymbolView name="chevron.right" size={14} weight="semibold" tintColor={colors.textMuted} />
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
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
  icon: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  text: { flex: 1, gap: 2 },
}));
