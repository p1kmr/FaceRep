import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseClip, useExerciseClip } from '@/components/exercise/ExerciseClip';
import { ExerciseFrames } from '@/components/exercise/ExerciseFrames';
import { LockedPicture } from '@/components/exercise/LockedPicture';
import { MuscleBadges } from '@/components/exercise/MuscleBadges';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Gradient } from '@/components/ui/Gradient';
import { Screen } from '@/components/ui/Screen';
import { EXERCISES, isExerciseId, type ExerciseId } from '@/constants/exercises';
import { areasOf } from '@/constants/faceMap';
import { useExerciseAccess, usePremiumContent, type ExerciseLock } from '@/hooks/useContent';
import { useDemoSqueeze } from '@/hooks/useDemoSqueeze';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

/**
 * One exercise: its clip (or the drawings), muscles, how-to steps, start it on its own. A locked one (Premium, or not
 * on this iPhone yet) shows only its program and areas, with Unlock (or the download): its name, steps and video aren't
 * in the app.
 */
export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lockOf } = useExerciseAccess();
  if (!isExerciseId(id)) return null;
  const lock = lockOf(id);
  return lock ? <LockedExercise id={id} lock={lock} /> : <ExerciseDetail id={id} />;
}

function LockedExercise({ id, lock }: { id: ExerciseId; lock: ExerciseLock }) {
  const { t } = useTranslation(['exercises', 'common']);
  const styles = useStyles();
  const content = usePremiumContent();
  const e = EXERCISES[id];
  const footer =
    lock === 'premium' ? (
      <Button title={t('exercises:detail.unlock')} onPress={() => router.push('/paywall')} icon="lock.fill" size="large" fullWidth />
    ) : lock === 'failed' ? (
      <Button title={t('exercises:locked.retry')} onPress={content.retry} size="large" fullWidth />
    ) : (
      <Button title={t('exercises:locked.downloading')} onPress={() => {}} disabled size="large" fullWidth />
    );
  return (
    <Screen edges={['bottom']} footer={footer}>
      <LockedPicture id={id} lock={lock} kind="exercise" iconSize={28} style={styles.lockedPicture} />
      <View style={styles.titles}>
        <AppText variant="caption" style={styles.program}>
          {t(`common:programs.${e.program}`).toUpperCase()}
        </AppText>
        <AppText variant="brand" accessibilityRole="header" style={styles.name}>
          {t('exercises:locked.name').toUpperCase()}
        </AppText>
        {/* Only the area: a muscle name like "Tongue posture" would already say which exercise it is. */}
        <View style={styles.areas}>
          {areasOf(e.id).map((a) => (
            <Chip key={a} label={`${t(`exercises:areas.${a}.name`)} ›`} onPress={() => router.navigate({ pathname: '/exercises', params: { area: a } })} />
          ))}
        </View>
      </View>
      <Card style={styles.steps}>
        <AppText>{t(`exercises:locked.${lock}Body`)}</AppText>
      </Card>
    </Screen>
  );
}

function ExerciseDetail({ id }: { id: ExerciseId }) {
  const { t } = useTranslation(['exercises', 'common']);
  const { colors } = useTheme();
  const styles = useStyles();
  const clip = useExerciseClip(id);
  const squeeze = useDemoSqueeze(1800, !clip);
  const e = EXERCISES[id];
  const name = t(`exercises:items.${e.key}.name`);
  const steps = t(`exercises:items.${e.key}.steps`, { returnObjects: true }) as string[];

  return (
    <Screen
      edges={['bottom']}
      footer={
        <Button
          title={t('exercises:detail.start')}
          onPress={() => router.push({ pathname: '/workout', params: { ids: e.id, kind: 'single' } })}
          icon="play.fill"
          size="large"
          fullWidth
        />
      }
    >
      {clip ? <ExerciseClip id={e.id} clip={clip} label={name} controls /> : <ExerciseFrames id={e.id} squeeze={squeeze} label={name} />}
      <View style={styles.titles}>
        <AppText variant="caption" style={styles.program}>
          {t(`common:programs.${e.program}`).toUpperCase()}
        </AppText>
        <AppText variant="brand" accessibilityRole="header" style={styles.name}>
          {name.toUpperCase()}
        </AppText>
        <AppText muted>{t('exercises:detail.plan', { reps: e.reps, hold: e.holdSec, relax: e.relaxSec })}</AppText>
        <MuscleBadges muscles={e.muscles} />
        {/* The areas it works: open them in the library's face map. */}
        <View style={styles.areas}>
          {areasOf(e.id).map((a) => (
            <Chip key={a} label={`${t(`exercises:areas.${a}.name`)} ›`} onPress={() => router.navigate({ pathname: '/exercises', params: { area: a } })} />
          ))}
        </View>
      </View>
      {e.jawCaution ? (
        <Card style={styles.caution}>
          <SymbolView name="exclamationmark.triangle.fill" size={18} tintColor={colors.warning} />
          <AppText variant="footnote" style={styles.flex}>
            {t('exercises:detail.jawCaution')}
          </AppText>
        </Card>
      ) : null}
      {e.handsOn ? (
        <Card style={styles.caution}>
          <SymbolView name="hand.raised.fill" size={18} tintColor={colors.primary} />
          <AppText variant="footnote" style={styles.flex}>
            {t('exercises:detail.handsCaution')}
          </AppText>
        </Card>
      ) : null}
      <Card style={styles.steps}>
        <AppText variant="headline">{t('exercises:detail.how')}</AppText>
        {steps.map((step, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.number}>
              <Gradient colors={[colors.primaryEnd, colors.primary]} />
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
  lockedPicture: { alignSelf: 'stretch', aspectRatio: 757 / 1024, borderRadius: tokens.radius.xl },
  titles: { gap: tokens.space.sm },
  program: { color: colors.primary, fontWeight: tokens.font.weight.bold, letterSpacing: 0.8 },
  name: { fontSize: 36, lineHeight: 42 },
  areas: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
  caution: { flexDirection: 'row', gap: tokens.space.md, padding: tokens.space.md, alignItems: 'center' },
  steps: { padding: tokens.space.lg, gap: tokens.space.md },
  step: { flexDirection: 'row', gap: tokens.space.md, alignItems: 'flex-start' },
  number: {
    width: 26,
    height: 26,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  numberText: { color: colors.onPrimary, fontWeight: tokens.font.weight.bold },
  flex: { flex: 1 },
}));
