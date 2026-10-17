/**
 * What the mirror's move check looks for in each exercise (docs/face-tracking.md). The numbers are Apple's face
 * tracking values (ARKit blend shapes: how far one part of the face moves, 0–1) and head turns in degrees, always
 * measured against the user's own relaxed face. First values, to tune on a real iPhone.
 */
import type { ExerciseId } from './exercises';

/** The 52 blend shapes ARKit measures on a face (`ARFaceAnchor.BlendShapeLocation`), with Apple's Swift names. */
export const BLEND_SHAPES = [
  'browDownLeft',
  'browDownRight',
  'browInnerUp',
  'browOuterUpLeft',
  'browOuterUpRight',
  'cheekPuff',
  'cheekSquintLeft',
  'cheekSquintRight',
  'eyeBlinkLeft',
  'eyeBlinkRight',
  'eyeLookDownLeft',
  'eyeLookDownRight',
  'eyeLookInLeft',
  'eyeLookInRight',
  'eyeLookOutLeft',
  'eyeLookOutRight',
  'eyeLookUpLeft',
  'eyeLookUpRight',
  'eyeSquintLeft',
  'eyeSquintRight',
  'eyeWideLeft',
  'eyeWideRight',
  'jawForward',
  'jawLeft',
  'jawOpen',
  'jawRight',
  'mouthClose',
  'mouthDimpleLeft',
  'mouthDimpleRight',
  'mouthFrownLeft',
  'mouthFrownRight',
  'mouthFunnel',
  'mouthLeft',
  'mouthLowerDownLeft',
  'mouthLowerDownRight',
  'mouthPressLeft',
  'mouthPressRight',
  'mouthPucker',
  'mouthRight',
  'mouthRollLower',
  'mouthRollUpper',
  'mouthShrugLower',
  'mouthShrugUpper',
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthStretchLeft',
  'mouthStretchRight',
  'mouthUpperUpLeft',
  'mouthUpperUpRight',
  'noseSneerLeft',
  'noseSneerRight',
  'tongueOut',
] as const;

export type BlendShape = (typeof BLEND_SHAPES)[number];

/** Head turns against the relaxed head, in degrees: nod (chin up or down) and tilt (ear toward a shoulder). */
export type HeadMove = 'headNod' | 'headTilt';

export interface MoveSignal {
  /** Blend shapes averaged together (usually the left and right side), or a head turn. */
  of: readonly BlendShape[] | HeadMove;
  /** How far past the relaxed face counts as doing the move: 0–1 for blend shapes, degrees for head turns. */
  rise: number;
}

/** A part of the face that should stay still; past `rise` the mirror shows the hint (`workout:moveCheck.hint.<hint>`). */
export interface StillSignal extends MoveSignal {
  hint: 'browsStill';
}

export interface Move {
  /** Every one must rise (most moves have one). */
  signals: readonly MoveSignal[];
  still?: StillSignal;
}

const SMILE = ['mouthSmileLeft', 'mouthSmileRight'] as const;
const BROWS_UP = ['browInnerUp', 'browOuterUpLeft', 'browOuterUpRight'] as const;

/**
 * null: the move check doesn't follow this exercise. Inside the mouth or the camera can't see it (Jaw Clench's back
 * teeth, Mewing, Tongue Press, Chin Tuck's glide), the jaw-caution exercises (a meter to fill could tempt someone to
 * push the jaw), and everything done with the hands, which cover the face.
 */
export const MOVES: Record<ExerciseId, Move | null> = {
  '01-jaw-clench': null,
  '02-chin-lift': { signals: [{ of: 'headNod', rise: 20 }] },
  '03-jaw-jut': null,
  '04-mewing': null,
  '12-tongue-press': null,
  '11-chin-tuck': null,
  '05-neck-stretch': { signals: [{ of: 'headTilt', rise: 15 }] },
  '06-cheek-lift': { signals: [{ of: SMILE, rise: 0.4 }] },
  '07-fish-face': { signals: [{ of: ['mouthPucker'], rise: 0.35 }] },
  '13-smiling-fish': { signals: [{ of: ['mouthPucker'], rise: 0.3 }] },
  '08-cheek-puff': { signals: [{ of: ['cheekPuff'], rise: 0.3 }] },
  '14-o-stretch': { signals: [{ of: ['jawOpen'], rise: 0.25 }] },
  '15-lion-face': null,
  '18-lip-press': { signals: [{ of: ['mouthPressLeft', 'mouthPressRight', 'mouthRollLower', 'mouthRollUpper'], rise: 0.2 }] },
  '19-pout': { signals: [{ of: ['mouthPucker'], rise: 0.35 }] },
  '20-lip-corner-lift': { signals: [{ of: SMILE, rise: 0.2 }] },
  '21-smile-line-press': null,
  '09-brow-lift': { signals: [{ of: BROWS_UP, rise: 0.3 }] },
  '22-forehead-press': null,
  '16-wide-eyes': {
    signals: [{ of: ['eyeWideLeft', 'eyeWideRight'], rise: 0.2 }],
    still: { of: BROWS_UP, rise: 0.25, hint: 'browsStill' },
  },
  '17-lower-lid-lift': { signals: [{ of: ['eyeSquintLeft', 'eyeSquintRight'], rise: 0.2 }] },
  '23-v-eyes': null,
  '10-eye-squeeze': { signals: [{ of: ['eyeBlinkLeft', 'eyeBlinkRight'], rise: 0.5 }] },
  '24-jaw-release': null,
  '25-jawline-sweep': null,
  '26-frown-release': null,
  '27-temple-circles': null,
};

/** How the move check reads the samples (services/workout/moveCheck.ts). */
export const MOVE_CHECK = {
  /** Samples a second sent by the camera (modules/face-tracking). */
  sampleHz: 15,
  /** Seconds into Get ready / Relax / Next up before the face counts as relaxed (letting go of the last hold). */
  settleSec: 0.8,
  /** How fast the relaxed face is learned: quickly down, slowly up, so a blink or a word doesn't move it much. */
  learnDown: 0.3,
  learnUp: 0.05,
  learnTurn: 0.1,
  /** Smoothing of the 0–1 level per sample. */
  smoothing: 0.4,
  /** In the pose from this level, out again below `exit` (no flicker at the edge). */
  enter: 0.8,
  exit: 0.5,
  /** A hold counts as seen after this share of it in the pose, between `minSeenSec` and `maxSeenSec` seconds. */
  seenShare: 0.4,
  minSeenSec: 1,
  maxSeenSec: 2.5,
  /** Longest gap between two samples that still counts as time (a stalled camera adds nothing). */
  maxGapSec: 0.25,
  /** A learned relaxed level stays at least this far below the top, so every move can still be reached. */
  headroom: 0.1,
} as const;
