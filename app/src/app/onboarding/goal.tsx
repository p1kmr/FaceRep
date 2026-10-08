import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import { OptionRow } from '@/components/ui/OptionRow';
import { goalsFor } from '@/constants/exercises';
import { useGuide } from '@/hooks/useGuide';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { completeOnboarding, setGoal } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';
import { todayISO } from '@/utils/dates';

/** Last step. Continue flips `onboardingDone`, and the root layout swaps to the tabs. */
export default function GoalScreen() {
  const { t } = useTranslation(['onboarding', 'common']);
  const { goal } = useSettings();
  const guide = useGuide();
  const dispatch = useSettingsDispatch();
  const styles = useStyles();
  return (
    <OnboardingStep
      step="goal"
      title={t('onboarding:goal.title')}
      subtitle={t('onboarding:goal.body')}
      primary={{ title: t('common:continue'), onPress: () => dispatch(completeOnboarding(todayISO())) }}
    >
      <View style={styles.options} accessibilityRole="radiogroup">
        {goalsFor(guide).map((g) => (
          <OptionRow
            key={g}
            title={t(`common:programs.${g}`)}
            subtitle={t(`onboarding:goal.options.${g}`)}
            selected={goal === g}
            onPress={() => dispatch(setGoal(g))}
          />
        ))}
      </View>
    </OnboardingStep>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  options: { gap: tokens.space.md },
}));
