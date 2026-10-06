import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseFrames } from '@/components/exercise/ExerciseFrames';
import { RepPips } from '@/components/exercise/RepPips';
import { WorkoutComplete } from '@/components/exercise/WorkoutComplete';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { isExerciseId } from '@/constants/exercises';
import { useProgressSummary, useSaveWorkout } from '@/hooks/useProgress';
import { useReviewPrompt } from '@/hooks/useReviewPrompt';
import { useTheme } from '@/hooks/useTheme';
import { useWorkout } from '@/hooks/useWorkout';
import { currentExercise, phaseDuration, workoutResult, type WorkoutResult } from '@/services/workout/timer';
import { makeStyles } from '@/theme/makeStyles';

/** The guided player: the figure squeezes and relaxes with the timer. ?ids=a,b,c&kind=routine|single */
export default function WorkoutScreen() {
  const params = useLocalSearchParams<{ ids?: string; kind?: string }>();
  const ids = useMemo(() => (params.ids ?? '').split(',').filter(isExerciseId), [params.ids]);
  const kind = params.kind === 'single' ? 'single' : 'routine';
  const { t } = useTranslation(['workout', 'exercises']);
  const { colors } = useTheme();
  const styles = useStyles();
  const { state, pause, resume, skip } = useWorkout(ids);
  const saveWorkout = useSaveWorkout();
  const askForReview = useReviewPrompt();
  const { streak } = useProgressSummary();
  const [finished, setFinished] = useState<WorkoutResult | null>(null);
  const saved = useRef(false);

  const finish = async () => {
    if (saved.current) return;
    saved.current = true;
    const result = workoutResult(state);
    setFinished(result);
    const session = await saveWorkout(result, kind);
    if (session && kind === 'routine') askForReview();
  };

  useEffect(() => {
    if (state.phase === 'done') finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- finish runs once, guarded by `saved`
  }, [state.phase]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const confirmEnd = () => {
    pause();
    Alert.alert(t('endConfirm.title'), t('endConfirm.body'), [
      { text: t('endConfirm.keep'), style: 'cancel', onPress: resume },
      {
        text: t('endConfirm.end'),
        style: 'destructive',
        onPress: async () => {
          await finish();
        },
      },
    ]);
  };

  if (finished) {
    return (
      <SafeAreaView style={styles.root}>
        <WorkoutComplete result={finished} streak={streak} onDone={close} />
      </SafeAreaView>
    );
  }

  const e = currentExercise(state);
  if (!e) return <SafeAreaView style={styles.root} />;
  const name = t(`exercises:items.${e.key}.name`);
  const duration = phaseDuration(state);
  const phaseLabel = state.paused ? t('paused') : t(`phase.${state.phase}`);
  const squeeze = state.phase === 'hold';

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <IconButton icon="xmark" onPress={confirmEnd} accessibilityLabel={t('end')} />
        <AppText variant="footnote" muted>
          {t('exerciseOf', { index: state.index + 1, total: state.queue.length })}
        </AppText>
        <IconButton icon="forward.end.fill" onPress={skip} accessibilityLabel={t('skip')} />
      </View>

      <ExerciseFrames id={e.id} squeeze={squeeze} label={`${name}, ${phaseLabel}`} fill style={styles.frames} />

      <View style={styles.info}>
        <AppText variant="title" center>
          {name}
        </AppText>
        <AppText muted center numberOfLines={2}>
          {t(`exercises:items.${e.key}.cue`)}
        </AppText>
      </View>

      <View style={styles.controls}>
        <View style={styles.side}>
          <AppText variant="footnote" muted>
            {state.phase === 'rest' || state.phase === 'ready' ? '' : t('rep', { rep: state.rep, reps: e.reps })}
          </AppText>
        </View>
        <ProgressRing
          progress={duration ? 1 - state.remaining / duration : 0}
          size={112}
          stroke={8}
          color={squeeze ? colors.primary : colors.textMuted}
        >
          <View accessible accessibilityLiveRegion="polite" accessibilityLabel={t('a11y.timer', { phase: phaseLabel, seconds: state.remaining })}>
            <AppText style={styles.seconds} center>
              {state.remaining}
            </AppText>
            <AppText variant="caption" center style={squeeze ? styles.phaseOn : styles.phaseOff}>
              {phaseLabel.toUpperCase()}
            </AppText>
          </View>
        </ProgressRing>
        <View style={styles.side}>
          <IconButton
            icon={state.paused ? 'play.fill' : 'pause.fill'}
            onPress={state.paused ? resume : pause}
            accessibilityLabel={state.paused ? t('resume') : t('pause')}
            size="large"
            tone="primary"
          />
        </View>
      </View>
      <RepPips total={e.reps} done={state.completedReps[state.index]} current={state.rep} />
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.background, paddingBottom: tokens.space.md },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
  },
  frames: { marginHorizontal: tokens.space.lg },
  info: { paddingHorizontal: tokens.space.xl, paddingTop: tokens.space.lg, gap: tokens.space.xs },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.space.xl,
    paddingVertical: tokens.space.lg,
  },
  side: { width: 88, alignItems: 'center' },
  seconds: { fontSize: 40, lineHeight: 44, fontWeight: tokens.font.weight.heavy, color: colors.text, fontVariant: ['tabular-nums'] },
  phaseOn: { color: colors.primary, fontWeight: tokens.font.weight.bold, letterSpacing: 1 },
  phaseOff: { color: colors.textMuted, fontWeight: tokens.font.weight.bold, letterSpacing: 1 },
}));
