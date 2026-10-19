/**
 * How workouts and the face scan sound (Settings → Sound cues, and the speaker button in the player, which goes through
 * them in this order): the iPhone's voice says the cues, beeps mark them (services/beeps.ts), or nothing.
 */
export const SOUND_CUES = ['voice', 'beeps', 'off'] as const;
export type SoundCues = (typeof SOUND_CUES)[number];

export const isSoundCues = (v: unknown): v is SoundCues => SOUND_CUES.includes(v as SoundCues);
