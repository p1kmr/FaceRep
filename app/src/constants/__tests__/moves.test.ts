import { EXERCISES, EXERCISE_IDS } from '../exercises';
import { BLEND_SHAPES, MOVES } from '../moves';

describe('move check catalog', () => {
  it('has an entry for every exercise and 52 different blend shapes', () => {
    expect(Object.keys(MOVES).sort()).toEqual([...EXERCISE_IDS].sort());
    expect(new Set(BLEND_SHAPES).size).toBe(52);
  });

  it('never follows hands-on or jaw-caution exercises', () => {
    for (const id of EXERCISE_IDS) {
      if (EXERCISES[id].handsOn || EXERCISES[id].jawCaution) expect([id, MOVES[id]]).toEqual([id, null]);
    }
  });

  it('gives every followed exercise a reachable move', () => {
    const followed = EXERCISE_IDS.filter((id) => MOVES[id]);
    expect(followed.length).toBeGreaterThanOrEqual(10);
    for (const id of followed) {
      const move = MOVES[id]!;
      expect(move.signals.length).toBeGreaterThan(0);
      for (const signal of [...move.signals, ...(move.still ? [move.still] : [])]) {
        if (typeof signal.of === 'string') expect(signal.rise).toBeGreaterThanOrEqual(5);
        else expect(signal.of.length).toBeGreaterThan(0);
        expect(signal.rise).toBeLessThanOrEqual(typeof signal.of === 'string' ? 45 : 0.6);
        expect(signal.rise).toBeGreaterThan(0);
      }
    }
  });
});
