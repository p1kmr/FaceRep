import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import { TimeRow } from '@/components/settings/TimeRow';
import { Card } from '@/components/ui/Card';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { ensureNotificationPermission } from '@/services/notifications/reminder';
import { REMINDER } from '@/constants/reminders';
import { workoutReminder } from '@/services/reminders/reminders';
import { completeOnboarding, saveReminder } from '@/state/settings/actions';
import { todayISO } from '@/utils/dates';

/** Last step. Finishing it flips `onboardingDone`, and the root layout swaps to the tabs. */
export default function ReminderScreen() {
  const { t } = useTranslation('onboarding');
  const { reminders } = useSettings();
  // The workout reminder every install starts with: this step sets its time and turns it on.
  const workout = reminders.find((r) => r.id === REMINDER.workoutId) ?? workoutReminder();
  const dispatch = useSettingsDispatch();
  const [busy, setBusy] = useState(false);

  const finish = async (wantsReminder: boolean) => {
    setBusy(true);
    const allowed = wantsReminder ? await ensureNotificationPermission().catch(() => false) : false;
    dispatch(saveReminder({ ...workout, enabled: allowed }));
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
        <TimeRow
          title={t('reminder.time')}
          value={workout.times[0]}
          onChange={(time) => dispatch(saveReminder({ ...workout, times: [time] }))}
        />
      </Card>
    </OnboardingStep>
  );
}
