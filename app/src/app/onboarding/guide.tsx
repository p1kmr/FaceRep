import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GuidePicker } from '@/components/onboarding/GuidePicker';
import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import type { GuideId } from '@/constants/guides';
import { useSettingsDispatch } from '@/hooks/useSettings';
import { setGuide } from '@/state/settings/actions';

/** Who the exercise pictures show. Only in the flow when the build has more than one guide. */
export default function GuideScreen() {
  const { t } = useTranslation(['onboarding', 'common']);
  const dispatch = useSettingsDispatch();
  // Nobody is picked for the user: Continue waits for a choice.
  const [picked, setPicked] = useState<GuideId | null>(null);
  return (
    <OnboardingStep
      step="guide"
      title={t('onboarding:guide.title')}
      subtitle={t('onboarding:guide.body')}
      primary={{ title: t('common:continue'), onPress: () => router.push('/onboarding/goal'), disabled: !picked }}
    >
      <GuidePicker
        value={picked}
        onChange={(g) => {
          setPicked(g);
          dispatch(setGuide(g));
        }}
      />
    </OnboardingStep>
  );
}
