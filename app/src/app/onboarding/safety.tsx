import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import { SafetyList } from '@/components/onboarding/SafetyList';

/** Shown to everyone before the first workout (App Store guideline 1.4: physical safety). */
export default function SafetyScreen() {
  const { t } = useTranslation('onboarding');
  return (
    <OnboardingStep
      step="safety"
      title={t('safety.title')}
      primary={{ title: t('safety.accept'), onPress: () => router.push('/onboarding/reminder') }}
    >
      <SafetyList />
    </OnboardingStep>
  );
}
