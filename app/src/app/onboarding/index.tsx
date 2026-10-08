import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ONBOARDING_STEPS } from '@/components/onboarding/OnboardingStep';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { WELCOME_IMAGE } from '@/constants/exerciseImages';
import { makeStyles } from '@/theme/makeStyles';

/** Full-bleed hero photo (dark in both themes), headline, one button, one safety line (full list: Settings → Exercise safety). */
export default function WelcomeScreen() {
  const { t } = useTranslation('onboarding');
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <Image source={WELCOME_IMAGE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
      <SafeAreaView edges={['bottom']} style={styles.bottom}>
        <AppText variant="display" style={styles.title} accessibilityRole="header">
          {t('welcome.title')}
        </AppText>
        <AppText style={styles.body}>{t('welcome.body')}</AppText>
        <Button title={t('welcome.cta')} onPress={() => router.push(ONBOARDING_STEPS[0] === 'guide' ? '/onboarding/guide' : '/onboarding/goal')} fullWidth />
        <AppText variant="caption" center style={styles.safety}>
          {t('welcome.safety')}
        </AppText>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.heroBackground },
  bottom: { flex: 1, justifyContent: 'flex-end', padding: tokens.space.xl, gap: tokens.space.lg },
  title: { color: colors.onImage },
  body: { color: colors.onImage, opacity: 0.8 },
  safety: { color: colors.onImage, opacity: 0.7 },
}));
