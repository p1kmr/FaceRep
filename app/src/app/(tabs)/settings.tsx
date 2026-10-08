import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, View } from 'react-native';

import { ToggleRow } from '@/components/settings/ToggleRow';
import { TrainingCard } from '@/components/settings/TrainingCard';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type Language } from '@/constants/i18n';
import { LINKS } from '@/constants/links';
import type { ThemeMode } from '@/constants/theme';
import { usePlanDispatch } from '@/hooks/usePlan';
import { usePremium, usePremiumDispatch } from '@/hooks/usePremium';
import { useProgressDispatch } from '@/hooks/useProgress';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { useToast } from '@/hooks/useToast';
import { useChat } from '@/hooks/useChat';
import { wipeDatabase } from '@/services/db/database';
import { openSystemSettings } from '@/services/notifications/reminder';
import { hasPurchasesKey, restorePurchases } from '@/services/purchases/purchases';
import { resetPlan } from '@/state/plan/actions';
import { setPremium } from '@/state/premium/actions';
import { resetProgress } from '@/state/progress/actions';
import { resetSettings, setAiConsent, setAskButton, setThemeMode } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation(['settings', 'common', 'paywall']);
  const styles = useStyles();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const progressDispatch = useProgressDispatch();
  const planDispatch = usePlanDispatch();
  const { isPremium } = usePremium();
  const premiumDispatch = usePremiumDispatch();
  const chat = useChat();
  const toast = useToast();
  const open = (url: string) => () => WebBrowser.openBrowserAsync(url).catch(() => {});

  const restore = async () => {
    try {
      const premium = await restorePurchases();
      premiumDispatch(setPremium(premium));
      Alert.alert(
        premium ? t('paywall:restore.doneTitle') : t('paywall:restore.noneTitle'),
        premium ? t('paywall:restore.done') : t('paywall:restore.none'),
      );
    } catch {
      Alert.alert(t('paywall:restore.failedTitle'), t('paywall:restore.failed'));
    }
  };

  const deleteAll = () =>
    Alert.alert(t('settings:delete.title'), t('settings:delete.body'), [
      { text: t('common:cancel'), style: 'cancel' },
      {
        text: t('settings:delete.confirm'),
        style: 'destructive',
        onPress: async () => {
          await wipeDatabase().catch(() => {});
          chat.clear();
          progressDispatch(resetProgress());
          planDispatch(resetPlan());
          dispatch(resetSettings()); // onboarding starts again
          toast({ message: t('settings:deleted') });
        },
      },
    ]);

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('settings:title')}
      </AppText>

      <SectionHeader title={t('settings:sections.training')} />
      <TrainingCard />

      <SectionHeader title={t('settings:sections.appearance')} />
      <Card>
        <View style={styles.block}>
          <AppText variant="footnote" muted>
            {t('settings:theme.title')}
          </AppText>
          <Segmented
            options={THEME_MODES.map((m) => ({ id: m, label: t(`settings:theme.${m}`) }))}
            value={settings.themeMode}
            onChange={(m) => dispatch(setThemeMode(m))}
          />
        </View>
        {/* iOS keeps a per-app language in the Settings app (Apple's recommended way); the app restarts in it. */}
        {SUPPORTED_LANGUAGES.length > 1 && Platform.OS === 'ios' ? (
          <ListRow
            title={t('settings:language')}
            subtitle={`${LANGUAGE_NAMES[i18n.language as Language] ?? i18n.language} · ${t('settings:languageHint')}`}
            onPress={openSystemSettings}
            chevron
          />
        ) : null}
      </Card>

      <SectionHeader title={t('settings:sections.premium')} />
      <Card>
        {isPremium ? (
          <ListRow title={t('settings:premium.active')} divider />
        ) : (
          <ListRow title={t('settings:premium.upgrade')} onPress={() => router.push('/paywall')} chevron divider />
        )}
        {hasPurchasesKey() ? <ListRow title={t('settings:premium.restore')} onPress={restore} divider /> : null}
        <ListRow title={t('settings:premium.manage')} onPress={open(LINKS.manageSubscriptions)} chevron />
      </Card>

      <SectionHeader title={t('settings:sections.privacy')} />
      <Card>
        <ToggleRow
          title={t('settings:aiConsent')}
          subtitle={t('settings:aiConsentHint')}
          value={settings.aiConsent === true}
          onValueChange={(on) => dispatch(setAiConsent(on))}
          divider
        />
        <ToggleRow
          title={t('settings:askButton')}
          subtitle={t('settings:askButtonHint')}
          value={settings.askButton.visible}
          onValueChange={(on) => dispatch(setAskButton({ visible: on }))}
          divider
        />
        <ListRow title={t('settings:safety')} onPress={() => router.push('/safety')} chevron divider />
        <ListRow title={t('settings:privacyPolicy')} onPress={open(LINKS.privacy)} chevron divider />
        <ListRow title={t('settings:terms')} onPress={open(LINKS.terms)} chevron divider />
        <ListRow title={t('settings:delete.row')} onPress={deleteAll} />
      </Card>

      <SectionHeader title={t('settings:sections.about')} />
      <Card>
        <ListRow title={t('settings:support')} onPress={open(LINKS.support)} chevron divider />
        <ListRow title={t('settings:version', { version: Constants.expoConfig?.version ?? '1.0.0' })} />
      </Card>
      <AppText variant="caption" muted center>
        {t('common:aiImages')}
      </AppText>
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  block: { padding: tokens.space.lg, gap: tokens.space.sm },
}));
