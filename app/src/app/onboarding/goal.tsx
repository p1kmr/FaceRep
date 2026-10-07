import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import { OptionRow } from '@/components/ui/OptionRow';
import { goalsFor } from '@/constants/exercises';
import { useGuide } from '@/hooks/useGuide';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { setGoal } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

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
      primary={{ title: t('common:continue'), onPress: () => router.push('/onboarding/safety') }}
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
