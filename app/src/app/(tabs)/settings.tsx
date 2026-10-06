import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { TimeRow } from '@/components/settings/TimeRow';
import { ToggleRow } from '@/components/settings/ToggleRow';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { GOALS } from '@/constants/exercises';
import { LINKS } from '@/constants/links';
import type { ThemeMode } from '@/constants/theme';
import { usePremium, usePremiumDispatch } from '@/hooks/usePremium';
import { useProgressDispatch } from '@/hooks/useProgress';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { useToast } from '@/hooks/useToast';
import { useChat } from '@/hooks/useChat';
import { wipeDatabase } from '@/services/db/database';
import { ensureNotificationPermission } from '@/services/notifications/reminder';
import { hasPurchasesKey, restorePurchases } from '@/services/purchases/purchases';
import { setPremium } from '@/state/premium/actions';
import { resetProgress } from '@/state/progress/actions';
import { resetSettings, setAiConsent, setGoal, setHaptics, setReminder, setThemeMode } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { t } = useTranslation(['settings', 'common', 'paywall']);
  const styles = useStyles();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const progressDispatch = useProgressDispatch();
  const { isPremium } = usePremium();
  const premiumDispatch = usePremiumDispatch();
  const chat = useChat();
  const toast = useToast();
  const open = (url: string) => () => WebBrowser.openBrowserAsync(url).catch(() => {});

  const toggleReminder = async (on: boolean) => {
    if (on && !(await ensureNotificationPermission().catch(() => false))) {
      Alert.alert(t('settings:reminder'), t('settings:reminderDenied'));
      return;
    }
    dispatch(setReminder({ enabled: on }));
  };

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
      <Card>
        <View style={styles.block}>
          <AppText variant="footnote" muted>
            {t('settings:goal')}
          </AppText>
          <Segmented
            options={GOALS.map((g) => ({ id: g, label: t(`common:programs.${g}`) }))}
            value={settings.goal}
            onChange={(g) => dispatch(setGoal(g))}
          />
        </View>
        <ToggleRow title={t('settings:reminder')} value={settings.reminder.enabled} onValueChange={toggleReminder} divider />
        {settings.reminder.enabled ? (
          <TimeRow
            title={t('settings:reminderTime')}
            value={settings.reminder.time}
            onChange={(time) => dispatch(setReminder({ time }))}
            divider
          />
        ) : null}
        <ToggleRow title={t('settings:haptics')} value={settings.haptics} onValueChange={(on) => dispatch(setHaptics(on))} />
      </Card>

      <SectionHeader title={t('settings:sections.appearance')} />
      <Card style={styles.block}>
        <AppText variant="footnote" muted>
          {t('settings:theme.title')}
        </AppText>
        <Segmented
          options={THEME_MODES.map((m) => ({ id: m, label: t(`settings:theme.${m}`) }))}
          value={settings.themeMode}
          onChange={(m) => dispatch(setThemeMode(m))}
        />
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
