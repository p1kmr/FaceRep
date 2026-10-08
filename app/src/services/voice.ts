import * as Speech from 'expo-speech';

/**
 * Spoken workout cues with the iPhone's built-in voice (on the device, works offline, no permission).
 * The only file that imports expo-speech. `useApplicationAudioSession: false` gives speech its own iOS audio
 * session, so music or a podcast is turned down while a cue plays and comes back after, instead of stopping.
 * Failures (no voice for the language, web without speech) are ignored: the timer and haptics still work.
 */
export const voice = {
  /** Says `text` now, cutting off a cue that is still talking so the words stay in time with the timer. */
  say(text: string, language: string) {
    try {
      Speech.stop().catch(() => {});
      Speech.speak(text, { language, useApplicationAudioSession: false });
    } catch {
      // ignored, see above
    }
  },
  stop() {
    try {
      Speech.stop().catch(() => {});
    } catch {
      // ignored
    }
  },
};
