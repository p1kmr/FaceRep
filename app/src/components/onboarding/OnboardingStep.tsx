import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { AVAILABLE_GUIDES } from '@/constants/exerciseImages';
import { makeStyles } from '@/theme/makeStyles';

import { ProgressDots } from './ProgressDots';

export type OnboardingStepId = 'guide' | 'goal';

/** Steps after the welcome screen, in order (progress dots). "Who the pictures show" only when there's a choice. */
export const ONBOARDING_STEPS: OnboardingStepId[] = [...(AVAILABLE_GUIDES.length > 1 ? (['guide'] as const) : []), 'goal'];

interface OnboardingStepProps {
  step: OnboardingStepId;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  primary: { title: string; onPress: () => void; disabled?: boolean; loading?: boolean };
  secondary?: { title: string; onPress: () => void };
}

/** One question per screen: progress dots, title, content, big buttons at the bottom. */
export function OnboardingStep({ step, title, subtitle, children, primary, secondary }: OnboardingStepProps) {
  const styles = useStyles();
  return (
    <Screen
      footer={
        <>
          <Button title={primary.title} onPress={primary.onPress} disabled={primary.disabled} loading={primary.loading} fullWidth />
          {secondary ? <Button title={secondary.title} onPress={secondary.onPress} variant="ghost" fullWidth /> : null}
        </>
      }
    >
      <ProgressDots current={ONBOARDING_STEPS.indexOf(step)} total={ONBOARDING_STEPS.length} />
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? <AppText muted>{subtitle}</AppText> : null}
      </View>
      {children}
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  header: { gap: tokens.space.sm, paddingTop: tokens.space.md },
}));
