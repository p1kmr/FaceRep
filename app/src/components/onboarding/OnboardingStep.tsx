import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { makeStyles } from '@/theme/makeStyles';

import { ProgressDots } from './ProgressDots';

/** Steps after the welcome screen, in order (used for the progress dots). */
export const ONBOARDING_STEPS = ['goal', 'safety', 'reminder'] as const;
export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];

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
