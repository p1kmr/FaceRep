import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { ToggleRow } from '@/components/settings/ToggleRow';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { AVAILABLE_GUIDES } from '@/constants/exerciseImages';
import { GOALS } from '@/constants/exercises';
import { LINKS } from '@/constants/links';
import type { ThemeMode } from '@/constants/theme';
import { useGuide } from '@/hooks/useGuide';
import { usePlanDispatch } from '@/hooks/usePlan';
import { usePremium, usePremiumDispatch } from '@/hooks/usePremium';
import { useProgressDispatch } from '@/hooks/useProgress';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { useToast } from '@/hooks/useToast';
import { useChat } from '@/hooks/useChat';
import { wipeDatabase } from '@/services/db/database';
import { hasPurchasesKey, restorePurchases } from '@/services/purchases/purchases';
import { resetPlan } from '@/state/plan/actions';
import { setPremium } from '@/state/premium/actions';
import { resetProgress } from '@/state/progress/actions';
import { resetSettings, setAiConsent, setAskButton, setGoal, setGuide, setHaptics, setThemeMode } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { t } = useTranslation(['settings', 'common', 'paywall']);
  const styles = useStyles();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const guide = useGuide();
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
        {AVAILABLE_GUIDES.length > 1 ? (
          <View style={styles.block}>
            <AppText variant="footnote" muted>
              {t('settings:guide')}
            </AppText>
            <Segmented
              options={AVAILABLE_GUIDES.map((g) => ({ id: g, label: t(`common:guides.${g}`) }))}
              value={guide}
              onChange={(g) => dispatch(setGuide(g))}
            />
          </View>
        ) : null}
        <ListRow
          title={t('settings:reminders')}
          subtitle={t('settings:remindersOn', { count: settings.reminders.filter((r) => r.enabled).length })}
          onPress={() => router.push('/reminders')}
          chevron
          divider
        />
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
