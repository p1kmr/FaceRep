import { SafetyList } from '@/components/onboarding/SafetyList';
import { Screen } from '@/components/ui/Screen';

/** Settings → Exercise safety (same points as onboarding). */
export default function SafetyScreen() {
  return (
    <Screen edges={['bottom']}>
      <SafetyList />
    </Screen>
  );
}
