import { SCAN_MOVES } from '@/constants/faceScan';

import { change, cleanRawScan, percentile, scoreMove, scoreScan, smallestMove } from '../score';

describe('face scan scores', () => {
  it('takes percentiles between neighbours', () => {
    expect(percentile([], 0.8)).toBe(0);
    expect(percentile([10, 0], 0.5)).toBe(5);
    expect(percentile([5, 1, 3, 2, 4], 0.8)).toBeCloseTo(4.2);
  });

  it('scores a move with sides: average, each side and the balance', () => {
    const full = SCAN_MOVES.smile.full;
    const m = scoreMove('smile', { l: full, r: full * 0.8 });
    expect(m).toEqual({ id: 'smile', score: 90, left: 100, right: 80, balance: 80 });
  });

  it('caps each side at a full move, so the balance agrees with the side numbers', () => {
    const full = SCAN_MOVES.smile.full;
    expect(scoreMove('smile', { l: 1, r: full + 0.02 })).toEqual({ id: 'smile', score: 100, left: 100, right: 100, balance: 100 });
  });

  it('shows no balance for a move too small to judge, or without sides', () => {
    expect(scoreMove('eyeSquint', { l: 0.08, r: 0.02 }).balance).toBeNull();
    expect(scoreMove('lipPucker', { c: SCAN_MOVES.lipPucker.full / 2 })).toEqual({ id: 'lipPucker', score: 50, left: null, right: null, balance: null });
  });

  it('averages the sides with the middle (brows: outer sides and inner brows)', () => {
    const full = SCAN_MOVES.browRaise.full;
    expect(scoreMove('browRaise', { l: full / 2, r: full / 2, c: full }).score).toBe(75);
  });

  it('needs four moves for Movement and two balances for Balance', () => {
    const three = scoreScan({ smile: { l: 0.5, r: 0.5 }, lipPucker: { c: 0.5 }, cheekPuff: { c: 0.5 } });
    expect(three.movement).toBeNull();
    expect(three.balance).toBeNull();
    expect(three.moves.map((m) => m.id)).toEqual(['smile', 'lipPucker', 'cheekPuff']);

    const four = scoreScan({
      eyeSquint: { l: 0.35, r: 0.35 },
      smile: { l: 0.9, r: 0.45 },
      lipPucker: { c: 0.45 },
      cheekPuff: { c: 0.7 },
    });
    expect(four.movement).toBe(Math.round((50 + 75 + 50 + 100) / 4));
    expect(four.balance).toBe(75);
    expect(smallestMove(four)?.id).toBe('eyeSquint');
  });

  it('gives the change between two numbers only when both exist', () => {
    expect(change(80, 74)).toBe(6);
    expect(change(70, 74)).toBe(-4);
    expect(change(null, 74)).toBeNull();
    expect(change(70, null)).toBeNull();
    expect(change(70, undefined)).toBeNull();
  });

  it('cleans saved readings', () => {
    expect(cleanRawScan(null)).toEqual({});
    expect(cleanRawScan({ smile: { l: 0.5, r: -1, c: 'x' }, wink: { l: 1 }, lipPucker: { c: 3 }, cheekPuff: {} })).toEqual({
      smile: { l: 0.5 },
      lipPucker: { c: 1 },
    });
  });
});
