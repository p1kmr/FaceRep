import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';
import { Gradient } from '../ui/Gradient';

/** The current streak, big, on the brand gradient, with the best streak beside it. */
export function StreakHero({ streak, best }: { streak: number; best: number }) {
  const { t } = useTranslation('progress');
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.card} accessible accessibilityLabel={`${t('streak')}: ${t('days', { count: streak })}. ${t('best')}: ${t('days', { count: best })}`}>
      <Gradient colors={[colors.primaryEnd, colors.primary]} />
      <View style={styles.flame}>
        <SymbolView name="flame.fill" size={30} tintColor={colors.onPrimary} />
      </View>
      <View style={styles.main}>
        <AppText variant="brand" style={styles.number}>
          {streak}
        </AppText>
        <AppText variant="footnote" style={styles.label}>
          {t('streak')}
        </AppText>
      </View>
      <View style={styles.best}>
        <AppText variant="brand" style={styles.bestNumber}>
          {best}
        </AppText>
        <AppText variant="caption" style={styles.label}>
          {t('best')}
        </AppText>
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.lg,
    padding: tokens.space.lg,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
    boxShadow: `${tokens.elevation.glow} ${colors.glow}`,
  },
  flame: { width: 56, height: 56, borderRadius: tokens.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.onImageSoft },
  main: { flex: 1 },
  number: { color: colors.onPrimary, fontSize: 52, lineHeight: 58 },
  label: { color: colors.onPrimary, opacity: 0.9, fontWeight: tokens.font.weight.semibold },
  best: { alignItems: 'flex-end' },
  bestNumber: { color: colors.onPrimary, fontSize: 28, lineHeight: 34 },
}));
