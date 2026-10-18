import { SCAN, SCAN_MOVE_IDS, SCAN_MOVES, type ScanMoveId } from '@/constants/faceScan';

/**
 * The face scan's numbers, from its raw readings (docs/face-scan.md). Pure, so a change to SCAN_MOVES re-scores every
 * saved scan the same way. Movement: how far each move went (0–100, 100 = a big, full move). Balance: how evenly the
 * left and right side moved in the moves that have sides (100 = the same). Never face shape, looks or age.
 */

/** How far a move rose above the relaxed face, 0–1: left and right side (moves with sides) and the middle. */
export interface MoveReading {
  l?: number;
  r?: number;
  c?: number;
}

/** A scan's readings, for the moves that could be read. */
export type RawScan = Partial<Record<ScanMoveId, MoveReading>>;

export interface MoveScore {
  id: ScanMoveId;
  /** 0–100. */
  score: number;
  /** 0–100 per side (moves with sides), else null. */
  left: number | null;
  right: number | null;
  /** 0–100: the smaller side's share of the bigger one; null without sides or when the move was too small to judge. */
  balance: number | null;
}

export interface ScanScore {
  /** Average of the moves' scores; null when too few moves were read. */
  movement: number | null;
  /** Average of the moves' balances; null when too few had one. */
  balance: number | null;
  /** The moves read, in scan order. */
  moves: MoveScore[];
}

/** The value below which a share `p` (0–1) of the values lie, interpolated between neighbours. */
export function percentile(values: readonly number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const at = Math.min(1, Math.max(0, p)) * (sorted.length - 1);
  const low = Math.floor(at);
  const high = Math.ceil(at);
  return sorted[low] + (sorted[high] - sorted[low]) * (at - low);
}

const mean = (values: readonly number[]) => values.reduce((a, b) => a + b, 0) / values.length;
const valid = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

export function scoreMove(id: ScanMoveId, reading: MoveReading): MoveScore {
  const { full } = SCAN_MOVES[id];
  // Each side is capped at `full`, so the balance agrees with the two side numbers shown.
  const cap = (v: number) => Math.min(v, full);
  const toScore = (v: number) => Math.round((100 * cap(v)) / full);
  const sides = valid(reading.l) && valid(reading.r) ? { l: reading.l, r: reading.r } : null;
  const parts = [sides ? (cap(sides.l) + cap(sides.r)) / 2 : null, valid(reading.c) ? cap(reading.c) : null].filter(
    (v): v is number => v !== null,
  );
  const bigger = sides ? Math.max(cap(sides.l), cap(sides.r)) : 0;
  return {
    id,
    score: parts.length ? toScore(mean(parts)) : 0,
    left: sides ? toScore(sides.l) : null,
    right: sides ? toScore(sides.r) : null,
    balance: sides && bigger >= SCAN.minSideRise ? Math.round((100 * Math.min(cap(sides.l), cap(sides.r))) / bigger) : null,
  };
}

export function scoreScan(raw: RawScan): ScanScore {
  const moves = SCAN_MOVE_IDS.filter((id) => raw[id]).map((id) => scoreMove(id, raw[id] as MoveReading));
  const balances = moves.map((m) => m.balance).filter((b): b is number => b !== null);
  return {
    movement: moves.length >= SCAN.minMoves ? Math.round(mean(moves.map((m) => m.score))) : null,
    balance: balances.length >= SCAN.minBalances ? Math.round(mean(balances)) : null,
    moves,
  };
}

/** The move with the lowest score (the one to work on), or null with fewer than two moves. */
export function smallestMove(score: ScanScore): MoveScore | null {
  if (score.moves.length < 2) return null;
  return score.moves.reduce((low, m) => (m.score < low.score ? m : low));
}

/** Change from an earlier number to a later one; null when either is missing. */
export const change = (now: number | null, before: number | null | undefined): number | null =>
  now === null || before === null || before === undefined ? null : now - before;

/** Readings as saved (JSON from SQLite), checked: unknown moves and broken numbers are dropped. */
export function cleanRawScan(value: unknown): RawScan {
  if (!value || typeof value !== 'object') return {};
  const out: RawScan = {};
  for (const id of SCAN_MOVE_IDS) {
    const r = (value as Record<string, unknown>)[id];
    if (!r || typeof r !== 'object') continue;
    const reading: MoveReading = {};
    for (const key of ['l', 'r', 'c'] as const) {
      const v = (r as Record<string, unknown>)[key];
      if (valid(v)) reading[key] = Math.min(1, v);
    }
    if (Object.keys(reading).length) out[id] = reading;
  }
  return out;
}
