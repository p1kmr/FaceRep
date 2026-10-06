import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { OnboardingStep } from '@/components/onboarding/OnboardingStep';
import { OptionRow } from '@/components/ui/OptionRow';
import { GOALS } from '@/constants/exercises';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { setGoal } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

export default function GoalScreen() {
  const { t } = useTranslation(['onboarding', 'common']);
  const { goal } = useSettings();
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
        {GOALS.map((g) => (
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
