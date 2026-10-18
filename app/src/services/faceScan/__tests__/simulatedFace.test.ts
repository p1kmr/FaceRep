import { SCAN, SCAN_MOVE_IDS } from '@/constants/faceScan';

import { createScanRun, scanReadings, scanRunReducer, scanSample } from '../engine';
import { scoreScan } from '../score';
import { createSimulatedFace } from '../simulatedFace';

/** A repeatable stand-in for Math.random. */
function seeded(seed: number) {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
}

describe('simulated face (Simulator)', () => {
  it('does every move when asked, so a whole scan is read with Balance below 100', () => {
    const next = createSimulatedFace(seeded(42));
    let s = createScanRun();
    for (let t = 0; t < 60 && s.stage !== 'done'; t += 1 / SCAN.sampleHz) s = scanRunReducer(s, scanSample(next(t, s.stage, s.step)));
    expect(s.stage).toBe('done');
    const readings = scanReadings(s);
    expect(Object.keys(readings ?? {})).toEqual([...SCAN_MOVE_IDS]);
    const score = scoreScan(readings ?? {});
    expect(score.movement).toBeGreaterThan(50);
    expect(score.balance).toBeGreaterThan(70);
    expect(score.balance).toBeLessThan(100);
  });
});
