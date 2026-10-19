import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync, type AudioPlayer } from 'expo-audio';

import type { Beep } from '@/services/workout/cues';

/**
 * The beeps of Settings → Sound cues → Beeps (made by scripts/sounds.js). The only file that imports expo-audio.
 * They mix with the user's music (it keeps playing at its volume) and play with the ring switch on silent, like the
 * voice. Failures (web, no audio) are ignored: the timer and haptics still work.
 */
const FILES: Record<Beep, number> = {
  count: require('../../assets/sounds/count.wav'),
  go: require('../../assets/sounds/go.wav'),
  tick: require('../../assets/sounds/tick.wav'),
  release: require('../../assets/sounds/release.wav'),
  done: require('../../assets/sounds/done.wav'),
};

type Players = Record<Beep, AudioPlayer>;

/** done.wav, the longest beep, is about a second. */
const LONGEST_MS = 1200;

/** The loaded players; set by load(). A beep waits for it, so it never plays before the audio mode is set. */
let loaded: Promise<Players | null> | null = null;

export const beeps = {
  /** Gets the sounds ready when a screen with beeps opens (hooks/useBeeps.ts), so the first one isn't late. */
  load() {
    // The audio mode first: before it, iOS's default would stop the user's music on the first beep.
    loaded ??= setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' })
      .then(
        () =>
          Object.fromEntries(
            Object.entries(FILES).map(([beep, file]) => [beep, createAudioPlayer(file, { keepAudioSessionActive: true })]),
          ) as Players,
      )
      .catch(() => null);
  },
  /** Plays `beep` from its start. */
  play(beep: Beep) {
    loaded
      ?.then((players) => {
        const player = players?.[beep];
        return player?.seekTo(0).then(() => player.play());
      })
      .catch(() => {});
  },
  /**
   * Frees the sounds when the screen closes, and tells iOS the app's audio is done (unless another screen loaded them
   * again). It waits for the longest sound, so the last beep (a scan's done) isn't cut off by the screen closing.
   */
  unload() {
    const players = loaded;
    loaded = null;
    setTimeout(() => {
      players
        ?.then((p) => {
          if (!p) return;
          Object.values(p).forEach((player) => player.remove());
          if (!loaded) return setIsAudioActiveAsync(false);
        })
        .catch(() => {});
    }, LONGEST_MS);
  },
};
