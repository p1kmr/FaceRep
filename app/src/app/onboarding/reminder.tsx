import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import { TimeRow } from '@/components/settings/TimeRow';
import { Card } from '@/components/ui/Card';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { ensureNotificationPermission } from '@/services/notifications/reminder';
import { completeOnboarding, setReminder } from '@/state/settings/actions';
import { todayISO } from '@/utils/dates';

/** Last step. Finishing it flips `onboardingDone`, and the root layout swaps to the tabs. */
export default function ReminderScreen() {
  const { t } = useTranslation('onboarding');
  const { reminder } = useSettings();
  const dispatch = useSettingsDispatch();
  const [busy, setBusy] = useState(false);

  const finish = async (wantsReminder: boolean) => {
    setBusy(true);
    const allowed = wantsReminder ? await ensureNotificationPermission().catch(() => false) : false;
    dispatch(setReminder({ enabled: allowed }));
    dispatch(completeOnboarding(todayISO()));
  };

  return (
    <OnboardingStep
      step="reminder"
      title={t('reminder.title')}
      subtitle={t('reminder.body')}
      primary={{ title: t('reminder.allow'), onPress: () => finish(true), loading: busy }}
      secondary={{ title: t('reminder.skip'), onPress: () => finish(false) }}
    >
      <Card>
        <TimeRow title={t('reminder.time')} value={reminder.time} onChange={(time) => dispatch(setReminder({ time }))} />
      </Card>
    </OnboardingStep>
  );
}
