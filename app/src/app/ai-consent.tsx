import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useSettingsDispatch } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { setAiConsent } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

/**
 * Asked once before the first Coach question: App Store guideline 5.1.2(i) requires saying where
 * personal data goes (including third-party AI) and getting explicit permission. Revocable in Settings.
 */
export default function AiConsentScreen() {
  const { t } = useTranslation('coach');
  const { colors } = useTheme();
  const styles = useStyles();
  const dispatch = useSettingsDispatch();
  const answer = (consent: boolean) => {
    dispatch(setAiConsent(consent));
    router.back();
  };

  return (
    <Screen
      edges={['bottom']}
      footer={
        <>
          <Button title={t('consent.allow')} onPress={() => answer(true)} fullWidth />
          <Button title={t('consent.notNow')} variant="ghost" onPress={() => answer(false)} fullWidth />
        </>
      }
    >
      <View style={styles.header}>
        <SymbolView name="sparkles" size={40} tintColor={colors.primary} />
        <AppText variant="title" center accessibilityRole="header">
          {t('consent.title')}
        </AppText>
      </View>
      <Card style={styles.card}>
        <AppText>{t('consent.what')}</AppText>
        <AppText variant="footnote" muted>
          {t('consent.sent')}
        </AppText>
        <AppText variant="footnote" muted>
          {t('consent.notSent')}
        </AppText>
        <AppText variant="footnote" muted>
          {t('consent.storage')}
        </AppText>
        <AppText variant="footnote" muted>
          {t('consent.medical')}
        </AppText>
      </Card>
      <AppText variant="footnote" muted center>
        {t('consent.withdraw')}
      </AppText>
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  header: { alignItems: 'center', gap: tokens.space.md, paddingTop: tokens.space.lg },
  card: { padding: tokens.space.lg, gap: tokens.space.md },
}));
