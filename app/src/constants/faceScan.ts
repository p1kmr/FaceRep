/**
 * The face scan (docs/face-scan.md): six moves read by Apple's face tracking on the iPhone, each measured against the
 * user's own relaxed face. It reads movement only: how far each part moves and how evenly both sides move, never face
 * shape, looks or age. Values are ARKit blend shapes (0–1, constants/moves.ts).
 */
import type { FaceArea } from './faceMap';
import type { BlendShape } from './moves';

export const SCAN_MOVE_IDS = ['browRaise', 'eyeSquint', 'smile', 'lipPucker', 'mouthOpen', 'cheekPuff'] as const;
export type ScanMoveId = (typeof SCAN_MOVE_IDS)[number];

export interface ScanMove {
  id: ScanMoveId;
  /** Blend shapes of the user's own left and right side (ARKit's "Left" is the face's left), for the balance. */
  left?: readonly BlendShape[];
  right?: readonly BlendShape[];
  /** Blend shapes of the whole move, without a side. */
  center?: readonly BlendShape[];
  /**
   * The rise above the relaxed face that scores 100: a big, comfortable move. First values, to tune on an iPhone
   * (docs/face-scan.md "Tuning"); scans keep their raw readings, so a change re-scores the old ones too. The mouth's
   * is low on purpose: a comfortable opening already scores 100, so nobody forces the jaw.
   */
  full: number;
  /** "Exercises for this area" on the results. */
  area: FaceArea;
}

export const SCAN_MOVES: Record<ScanMoveId, ScanMove> = {
  browRaise: { id: 'browRaise', left: ['browOuterUpLeft'], right: ['browOuterUpRight'], center: ['browInnerUp'], full: 0.8, area: 'forehead' },
  eyeSquint: { id: 'eyeSquint', left: ['eyeSquintLeft'], right: ['eyeSquintRight'], full: 0.7, area: 'eyes' },
  smile: { id: 'smile', left: ['mouthSmileLeft'], right: ['mouthSmileRight'], full: 0.9, area: 'cheeks' },
  lipPucker: { id: 'lipPucker', center: ['mouthPucker'], full: 0.9, area: 'lips' },
  mouthOpen: { id: 'mouthOpen', center: ['jawOpen'], full: 0.6, area: 'lips' },
  cheekPuff: { id: 'cheekPuff', center: ['cheekPuff'], full: 0.7, area: 'cheeks' },
};

/** The steps in order: the relaxed face first (the baseline, and the progress photo), then the moves. */
export const SCAN_STEPS = ['rest', ...SCAN_MOVE_IDS] as const;
export type ScanStepId = (typeof SCAN_STEPS)[number];

/** How the scan runs (services/faceScan/engine.ts). Times are seconds of camera time. About 35 seconds in all. */
export const SCAN = {
  /** Samples a second sent by the camera (modules/face-tracking). */
  sampleHz: 15,
  /** A good face this long in a row before the countdown starts. */
  findSec: 0.5,
  countdownSec: 3,
  /** The move is shown (and spoken) this long before it's measured. */
  prepareSec: 1.2,
  /** Seconds of good samples measured in each step; the time with the face turned away or out of view doesn't count. */
  holdSec: 2.5,
  releaseSec: 1,
  /** A step that can't get its good samples in this long is skipped (not read). */
  stepTimeoutSec: 10,
  /** Longest gap between two samples that still counts as time (a stalled camera adds nothing). */
  maxGapSec: 0.25,
  /** The face must point at the screen within this many degrees: a turned head reads one side less. */
  maxTurnDeg: 20,
  /** Metres between the face and the camera. */
  minDistance: 0.18,
  maxDistance: 0.7,
  /** A hold's value: this share of its samples is lower (robust to a twitch or the first moment of the move). */
  peak: 0.8,
  /** A step read with fewer good samples counts as not read. */
  minSamples: 8,
  /** Balance is shown only when the side that moved more rose at least this much (smaller moves are noise). */
  minSideRise: 0.12,
  /** A scan is saved only with at least this many moves read, and shows Balance with at least this many balances. */
  minMoves: 4,
  minBalances: 2,
  /** The progress photo is taken this far into the relaxed face's hold (the face is still and looking at the screen). */
  photoAt: 0.5,
  /** Today suggests a new scan this many days after the last one. */
  dueDays: 7,
  /** Scans shown in the chart (the newest). */
  chartScans: 12,
} as const;
