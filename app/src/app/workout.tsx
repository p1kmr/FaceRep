import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseFrames } from '@/components/exercise/ExerciseFrames';
import { MirrorView } from '@/components/exercise/MirrorView';
import { RepPips } from '@/components/exercise/RepPips';
import { WorkoutComplete } from '@/components/exercise/WorkoutComplete';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { isExerciseId } from '@/constants/exercises';
import { useMirror } from '@/hooks/useMirror';
import { usePlan } from '@/hooks/usePlan';
import { useProgressSummary, useSaveWorkout } from '@/hooks/useProgress';
import { useReviewPrompt } from '@/hooks/useReviewPrompt';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { useWorkout } from '@/hooks/useWorkout';
import { defaultItem, type WorkoutItem } from '@/services/workout/items';
import { currentExercise, phaseDuration, workoutResult, type WorkoutResult } from '@/services/workout/timer';
import { setVoiceCues } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

/**
 * The guided player: the figure squeezes and relaxes with the timer.
 * ?kind=plan[&day=n] → a plan day (today's by default). It counts for the plan only when it's the next day;
 *   any other day, or today's again, is practice.
 * ?ids=a,b,c&kind=single → exercises from the library with their usual reps.
 */
export default function WorkoutScreen() {
  const params = useLocalSearchParams<{ ids?: string; kind?: string; day?: string }>();
  const plan = usePlan();
  // Fixed when the screen opens: saving the workout moves the plan on, the running workout stays as it was.
  const [setup] = useState<{ items: WorkoutItem[]; kind: 'routine' | 'single'; counts: typeof plan.next }>(() => {
    if (params.kind === 'plan') {
      const n = params.day ? Number(params.day) : plan.showing.day;
      const day = plan.dayAt(n);
      return { items: day.status === 'ready' ? day.items : [], kind: 'routine', counts: plan.countsFor(n) };
    }
    const ids = (params.ids ?? '').split(',').filter(isExerciseId);
    return { items: ids.map(defaultItem), kind: 'single', counts: null };
  });
  const { kind } = setup;
  const { t } = useTranslation(['workout', 'exercises']);
  const { colors } = useTheme();
  const styles = useStyles();
  const { state, pause, resume, skip } = useWorkout(setup.items);
  const { voiceCues } = useSettings();
  const settingsDispatch = useSettingsDispatch();
  const mirror = useMirror();
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
    const session = await saveWorkout(result, kind, setup.counts);
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
  const phaseLabel = state.paused ? t('paused') : t(`phase.${state.phase}`, { context: e.program === 'massage' ? 'massage' : undefined });
  const squeeze = state.phase === 'hold';
  // Before a jaw exercise starts, the jaw warning replaces the cue (onboarding has no safety step).
  const caution = (state.phase === 'ready' || state.phase === 'rest') && !!e.jawCaution;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <IconButton icon="xmark" onPress={confirmEnd} accessibilityLabel={t('end')} />
        <AppText variant="footnote" muted>
          {t('exerciseOf', { index: state.index + 1, total: state.queue.length })}
        </AppText>
        <View style={styles.actions}>
          <IconButton
            icon={voiceCues ? 'speaker.wave.2.fill' : 'speaker.slash.fill'}
            onPress={() => settingsDispatch(setVoiceCues(!voiceCues))}
            accessibilityLabel={t('voiceCues')}
            toggled={voiceCues}
          />
          <IconButton icon="person.crop.square" onPress={() => mirror.setOn(!mirror.on)} accessibilityLabel={t('mirror')} toggled={mirror.on} />
          <IconButton icon="forward.end.fill" onPress={skip} accessibilityLabel={t('skip')} />
        </View>
      </View>

      <View style={styles.frames}>
        <ExerciseFrames id={e.id} squeeze={squeeze} label={`${name}, ${phaseLabel}`} fill />
        {mirror.on ? <MirrorView style={styles.mirror} /> : null}
      </View>

      <View style={styles.info}>
        <AppText variant="title" center>
          {name}
        </AppText>
        <AppText muted={!caution} center numberOfLines={2} style={caution ? styles.caution : undefined}>
          {caution ? t('exercises:detail.jawCaution') : t(`exercises:items.${e.key}.cue`)}
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
            {/* Some languages' phase words are 9–10 letters: shrink to stay inside the ring. */}
            <AppText
              variant="caption"
              center
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[styles.phase, squeeze ? styles.phaseOn : styles.phaseOff]}
            >
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
  actions: { flexDirection: 'row', gap: tokens.space.sm },
  frames: { flex: 1, marginHorizontal: tokens.space.lg },
  mirror: { position: 'absolute', right: tokens.space.md, bottom: tokens.space.md, width: '38%' },
  info: { paddingHorizontal: tokens.space.xl, paddingTop: tokens.space.lg, gap: tokens.space.xs },
  caution: { fontWeight: tokens.font.weight.bold },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.space.xl,
    paddingVertical: tokens.space.lg,
  },
  side: { width: 88, alignItems: 'center' },
  seconds: { fontSize: 40, lineHeight: 44, fontWeight: tokens.font.weight.heavy, color: colors.text, fontVariant: ['tabular-nums'] },
  phase: { maxWidth: 84, fontWeight: tokens.font.weight.bold, letterSpacing: 0.5 },
  phaseOn: { color: colors.primary },
  phaseOff: { color: colors.textMuted },
}));
