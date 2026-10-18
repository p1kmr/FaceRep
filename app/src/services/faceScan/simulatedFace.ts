import { SCAN_MOVE_IDS, SCAN_MOVES, SCAN_STEPS, type ScanMoveId } from '@/constants/faceScan';
import type { BlendShape } from '@/constants/moves';

import type { ScanStage } from './engine';

/**
 * A pretend face for the iOS Simulator, which has no camera (services/faceTracking.ts `faceScanMode`). It sends samples
 * shaped like the camera's and does whatever the scan asks, so the scan's screens, saving, history, chart and photos
 * can be tried there. Each scan gets its own strength, so the chart moves. Never used on an iPhone.
 */
export interface SimulatedSample {
  tracked: true;
  t: number;
  shapes: Partial<Record<BlendShape, number>>;
  turn: number;
  distance: number;
}

/** `random` returns 0–1 (Math.random; a fixed one in tests). */
export function createSimulatedFace(random: () => number = Math.random) {
  const strength = 0.7 + random() * 0.3;
  // The right side moves a little less, so Balance shows something below 100.
  const rightShare = 0.8 + random() * 0.15;
  const current: Partial<Record<BlendShape, number>> = {};

  const targets = (moving: ScanMoveId | null): Partial<Record<BlendShape, number>> => {
    const out: Partial<Record<BlendShape, number>> = {};
    for (const id of SCAN_MOVE_IDS) {
      const m = SCAN_MOVES[id];
      const level = id === moving ? m.full * strength : 0.03;
      for (const shape of m.left ?? []) out[shape] = level;
      for (const shape of m.right ?? []) out[shape] = id === moving ? level * rightShare : level;
      for (const shape of m.center ?? []) out[shape] = level;
    }
    return out;
  };

  /** The next sample at time `t` (seconds) for the scan's stage and step. */
  return (t: number, stage: ScanStage, step: number): SimulatedSample => {
    const moving = (stage === 'prepare' || stage === 'hold') && step > 0 ? (SCAN_STEPS[step] as ScanMoveId) : null;
    const goal = targets(moving);
    for (const [shape, value] of Object.entries(goal) as [BlendShape, number][]) {
      const was = current[shape] ?? 0;
      // Eases toward the goal in about a third of a second, with a little jitter like a real camera.
      current[shape] = Math.min(1, Math.max(0, was + (value - was) * 0.35 + (random() - 0.5) * 0.03));
    }
    return { tracked: true, t, shapes: { ...current }, turn: 4 + random() * 3, distance: 0.35 + random() * 0.02 };
  };
}
