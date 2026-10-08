import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { getLocales } from 'expo-localization';
import { useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { haptics } from '@/services/haptics';
import { voice } from '@/services/voice';
import { cueFor, speechLanguage, type Cue } from '@/services/workout/cues';
import type { WorkoutItem } from '@/services/workout/items';
import { createWorkout, workoutReducer, type Phase, type WorkoutState } from '@/services/workout/timer';

import { useAppActive } from './useAppActive';
import { useSettings } from './useSettings';

const KEEP_AWAKE_TAG = 'workout';

/**
 * Runs the workout state machine: one tick per second while the screen is open and the app is in
 * the foreground (leaving the app pauses it). Haptics mark every squeeze and release, the voice says
 * them (Settings → Voice cues), and the screen stays on while it runs: iOS Auto-Lock would otherwise
 * lock the phone after 30 s without a touch, which sends the app to the background and pauses it.
 */
export function useWorkout(items: WorkoutItem[]) {
  const [state, dispatch] = useReducer(workoutReducer, items, createWorkout);
  const active = useAppActive();
  const lastPhase = useRef<Phase>(state.phase);
  const running = !state.paused && state.phase !== 'done';

  useEffect(() => {
    if (!active && state.phase !== 'done') dispatch({ type: 'pause' });
  }, [active, state.phase]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [running]);

  useEffect(() => {
    if (lastPhase.current === state.phase) return;
    lastPhase.current = state.phase;
    if (state.phase === 'hold') haptics.squeeze();
    else if (state.phase === 'relax' || state.phase === 'rest') haptics.release();
    else if (state.phase === 'done') haptics.success();
  }, [state.phase]);

  useVoiceCues(state);

  return {
    state,
    pause: () => dispatch({ type: 'pause' }),
    resume: () => dispatch({ type: 'resume' }),
    skip: () => dispatch({ type: 'skip' }),
  };
}

/** Speaks each new cue while voice cues are on; quiet while paused, and stops when the screen closes. */
function useVoiceCues(state: WorkoutState) {
  const { voiceCues } = useSettings();
  const { t, i18n } = useTranslation(['workout', 'exercises']);
  const prev = useRef<WorkoutState | null>(null);

  useEffect(() => {
    const cue = cueFor(prev.current, state);
    prev.current = state;
    if (!voiceCues) return;
    if (state.paused) voice.stop();
    else if (cue) voice.say(cueText(cue, t), speechLanguage(i18n.language, getLocales().map((l) => l.languageTag)));
  }, [state, voiceCues, t, i18n.language]);

  useEffect(() => {
    if (!voiceCues) voice.stop();
  }, [voiceCues]);

  useEffect(
    () => () => {
      voice.stop();
      prev.current = null;
    },
    [],
  );
}

function cueText(cue: Cue, t: (key: string, options?: Record<string, unknown>) => string): string {
  switch (cue.kind) {
    case 'start':
      return t('voice.start', { name: t(`exercises:items.${cue.exercise}.name`) });
    case 'next':
      return t('voice.next', { name: t(`exercises:items.${cue.exercise}.name`) });
    case 'hold':
      return t(cue.last ? 'voice.holdLast' : 'voice.hold', { context: cue.massage ? 'massage' : undefined });
    case 'relax':
      return t('voice.relax');
    case 'done':
      return t('voice.done');
  }
}
