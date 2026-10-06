import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseFrames } from '@/components/exercise/ExerciseFrames';
import { MuscleBadges } from '@/components/exercise/MuscleBadges';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { EXERCISES, isExerciseId } from '@/constants/exercises';
import { useDemoSqueeze } from '@/hooks/useDemoSqueeze';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

/** One exercise: animated preview, muscles, how-to steps, start it on its own. */
export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('exercises');
  const { colors } = useTheme();
  const styles = useStyles();
  const squeeze = useDemoSqueeze();
  if (!isExerciseId(id)) return null;
  const e = EXERCISES[id];
  const name = t(`items.${e.key}.name`);
  const steps = t(`items.${e.key}.steps`, { returnObjects: true }) as string[];

  return (
    <Screen
      edges={['bottom']}
      footer={
        <Button
          title={t('detail.start')}
          onPress={() => router.push({ pathname: '/workout', params: { ids: e.id, kind: 'single' } })}
          fullWidth
        />
      }
    >
      <ExerciseFrames id={e.id} squeeze={squeeze} label={name} />
      <View style={styles.titles}>
        <AppText variant="title" accessibilityRole="header">
          {name}
        </AppText>
        <AppText muted>{t('detail.plan', { reps: e.reps, hold: e.holdSec, relax: e.relaxSec })}</AppText>
        <MuscleBadges muscles={e.muscles} />
      </View>
      {e.jawCaution ? (
        <Card style={styles.caution}>
          <SymbolView name="exclamationmark.triangle.fill" size={18} tintColor={colors.warning} />
          <AppText variant="footnote" style={styles.flex}>
            {t('detail.jawCaution')}
          </AppText>
        </Card>
      ) : null}
      <Card style={styles.steps}>
        <AppText variant="headline">{t('detail.how')}</AppText>
        {steps.map((step, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.number}>
              <AppText variant="caption" style={styles.numberText}>
                {i + 1}
              </AppText>
            </View>
            <AppText style={styles.flex}>{step}</AppText>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  titles: { gap: tokens.space.sm },
  caution: { flexDirection: 'row', gap: tokens.space.md, padding: tokens.space.md, alignItems: 'center' },
  steps: { padding: tokens.space.lg, gap: tokens.space.md },
  step: { flexDirection: 'row', gap: tokens.space.md, alignItems: 'flex-start' },
  number: {
    width: 24,
    height: 24,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  numberText: { color: colors.primary, fontWeight: tokens.font.weight.bold },
  flex: { flex: 1 },
}));
