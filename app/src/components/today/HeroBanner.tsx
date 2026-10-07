import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useGuideImages } from '@/hooks/useGuide';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

/** Dark hero photo with the greeting and streak on top (always light text: the photo is dark in both themes). */
export function HeroBanner({ streak, doneToday }: { streak: number; doneToday: boolean }) {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const { colors } = useTheme();
  const { hero } = useGuideImages();
  return (
    <View style={styles.root}>
      <Image source={hero.home} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="right" accessible={false} />
      <View style={styles.content}>
        <View style={styles.streak}>
          <SymbolView name="flame.fill" size={16} tintColor={colors.streak} />
          <AppText variant="footnote" style={styles.streakText}>
            {streak > 0 ? t('streak', { count: streak }) : t('noStreak')}
          </AppText>
        </View>
        <AppText variant="title" style={styles.title} accessibilityRole="header">
          {doneToday ? t('doneGreeting') : t('greeting')}
        </AppText>
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { height: 220, borderRadius: tokens.radius.xl, overflow: 'hidden', backgroundColor: colors.heroBackground },
  content: { flex: 1, justifyContent: 'flex-end', padding: tokens.space.lg, gap: tokens.space.sm, maxWidth: '68%' },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.space.sm + 2,
    paddingVertical: 4,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.onImageSoft,
  },
  streakText: { color: colors.onImage, fontWeight: tokens.font.weight.semibold },
  title: { color: colors.onImage },
}));
