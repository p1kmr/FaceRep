import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View, type LayoutRectangle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseStrip } from '@/components/exercise/ExerciseStrip';
import { MirrorView } from '@/components/exercise/MirrorView';
import { PlayerFigure } from '@/components/exercise/PlayerFigure';
import { PlayerStage } from '@/components/exercise/PlayerStage';
import { RepPips } from '@/components/exercise/RepPips';
import { WorkoutComplete } from '@/components/exercise/WorkoutComplete';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { isExerciseId, isFreeExercise } from '@/constants/exercises';
import { useMirror } from '@/hooks/useMirror';
import { usePremium } from '@/hooks/usePremium';
import { useProgressSummary, useSaveWorkout } from '@/hooks/useProgress';
import { useReviewPrompt } from '@/hooks/useReviewPrompt';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { useTodayWorkout } from '@/hooks/useTodayWorkout';
import { useWorkout } from '@/hooks/useWorkout';
import { defaultItem, type WorkoutItem } from '@/services/workout/items';
import { movePhaseOf } from '@/services/workout/moveCheck';
import { currentExercise, phaseDuration, workoutResult, type WorkoutResult } from '@/services/workout/timer';
import { setVoiceCues } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

/**
 * The guided player: the figure squeezes and relaxes with the timer.
 * ?kind=today → today's workout (hooks/useTodayWorkout).
 * ?ids=a,b,c&kind=single → exercises from the library or the Coach with their usual reps. Without Premium only the free
 *   ones run; when none of them is free, the paywall opens instead.
 */
export default function WorkoutScreen() {
  const params = useLocalSearchParams<{ ids?: string; kind?: string }>();
  const todayWorkout = useTodayWorkout();
  const { isPremium } = usePremium();
  // Fixed when the screen opens: the running workout stays as it was.
  const [setup] = useState<{ items: WorkoutItem[]; kind: 'routine' | 'single'; locked: boolean }>(() => {
    if (params.kind === 'today') return { items: todayWorkout.items, kind: 'routine', locked: false };
    const ids = (params.ids ?? '').split(',').filter(isExerciseId);
    const allowed = isPremium ? ids : ids.filter(isFreeExercise);
    return { items: allowed.map(defaultItem), kind: 'single', locked: ids.length > 0 && !allowed.length };
  });
  const { kind } = setup;
  const { t } = useTranslation(['workout', 'exercises', 'common']);
  const { colors, tokens } = useTheme();
  const styles = useStyles();
  // Insets from the app root, not SafeAreaView: inside this full-screen modal SafeAreaView gave no top inset on notch
  // iPhones (11, 17e), so the top buttons sat under the status bar, where taps don't reach the app.
  const insets = useSafeAreaInsets();
  const safe = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom + tokens.space.md,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
  const { state, pause, resume, skip } = useWorkout(setup.items);
  const { voiceCues } = useSettings();
  const settingsDispatch = useSettingsDispatch();
  const mirror = useMirror();
  const [mirrorBig, setMirrorBig] = useState(false);
  // Where the frame is on the screen, for PlayerStage (measured once it's laid out).
  const [area, setArea] = useState<LayoutRectangle | null>(null);
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

  // Only Premium exercises were asked for (from the Coach or a link): the paywall instead of an empty player.
  useEffect(() => {
    if (setup.locked) router.replace('/paywall');
  }, [setup.locked]);

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
      <View style={[styles.root, safe]}>
        <WorkoutComplete result={finished} streak={streak} onDone={close} />
      </View>
    );
  }

  const e = currentExercise(state);
  if (!e) return <View style={[styles.root, safe]} />;
  const name = t(`exercises:items.${e.key}.name`);
  const duration = phaseDuration(state);
  const phaseLabel = state.paused ? t('paused') : t(`phase.${state.phase}`, { context: e.program === 'massage' ? 'massage' : undefined });
  const squeeze = state.phase === 'hold';
  // Before a jaw exercise starts, the jaw warning replaces the cue (onboarding has no safety step).
  const caution = (state.phase === 'ready' || state.phase === 'rest') && !!e.jawCaution;
  const big = mirror.on && mirrorBig;

  return (
    <View style={[styles.root, safe]}>
      <View style={styles.top}>
        <IconButton icon="xmark" onPress={confirmEnd} accessibilityLabel={t('end')} />
        <AppText variant="caption" muted style={styles.where} numberOfLines={1}>
          {`${t(`common:programs.${e.program}`)} · ${t('exerciseOf', { index: state.index + 1, total: state.queue.length })}`.toUpperCase()}
        </AppText>
        <View style={styles.actions}>
          <IconButton
            icon={voiceCues ? 'speaker.wave.2.fill' : 'speaker.slash.fill'}
            onPress={() => settingsDispatch(setVoiceCues(!voiceCues))}
            accessibilityLabel={t('voiceCues')}
            toggled={voiceCues}
          />
          <IconButton
            icon="person.crop.square"
            onPress={() => {
              setMirrorBig(false);
              mirror.setOn(!mirror.on);
            }}
            accessibilityLabel={t('mirror')}
            toggled={mirror.on}
          />
          <IconButton icon="forward.end.fill" onPress={skip} accessibilityLabel={t('skip')} />
        </View>
      </View>

      {state.queue.length > 1 ? <ExerciseStrip ids={state.queue.map((q) => q.id)} index={state.index} /> : null}

      {/* The frame keeps the figure's place and glow; the figure and the mirror are drawn by PlayerStage on top. */}
      <View style={[styles.frames, squeeze && !state.paused && styles.glow]} onLayout={(ev) => setArea(ev.nativeEvent.layout)} />

      <View style={styles.info}>
        <AppText variant="brand" center numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={styles.name}>
          {name.toUpperCase()}
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
          color={colors.textMuted}
          gradient={squeeze}
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

      {area ? (
        <PlayerStage
          area={area}
          mirrorBig={big}
          onSwap={() => setMirrorBig(!big)}
          onCloseMirror={() => {
            setMirrorBig(false);
            mirror.setOn(false);
          }}
          figure={
            <PlayerFigure
              id={e.id}
              squeeze={squeeze}
              preview={state.phase === 'ready' || state.phase === 'rest'}
              paused={state.paused}
              label={`${name}, ${phaseLabel}`}
            />
          }
          mirror={
            mirror.on ? (
              <MirrorView
                style={StyleSheet.absoluteFill}
                exercise={e}
                index={state.index}
                phase={movePhaseOf(state.phase, state.paused)}
                rep={state.rep}
                large={big}
              />
            ) : null
          }
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.background },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
  },
  actions: { flexDirection: 'row', gap: tokens.space.sm },
  frames: { flex: 1, marginHorizontal: tokens.space.lg, marginTop: tokens.space.md, borderRadius: tokens.radius.xl },
  // The big frame (the figure, or the mirror when it's swapped) glows in the brand red while the muscle works.
  glow: { boxShadow: `0px 0px 36px ${colors.glow}` },
  where: { fontWeight: tokens.font.weight.bold, letterSpacing: 0.8, flexShrink: 1, textAlign: 'center' },
  name: { fontSize: 34, lineHeight: 40 },
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
