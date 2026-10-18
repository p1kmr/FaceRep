import { getDatabase } from '@/services/db/database';
import { isISODate, type ISODate } from '@/utils/dates';

import { cleanRawScan, type RawScan } from './score';

/** A saved face scan (docs/face-scan.md). Only on this iPhone. */
export interface FaceScan {
  id: string;
  /** When it was taken (ISO timestamp) and its calendar day on this iPhone. */
  takenAt: string;
  day: ISODate;
  /** How far each move rose above the relaxed face (0–1); the scores come from these (score.ts). */
  moves: RawScan;
  /** The progress photo's file name in the app's photo folder, or null. */
  photo: string | null;
}

interface ScanRow {
  id: string;
  taken_at: string;
  day: string;
  moves: string;
  photo: string | null;
}

function toScan(row: ScanRow): FaceScan | null {
  let moves: RawScan = {};
  try {
    moves = cleanRawScan(JSON.parse(row.moves));
  } catch {
    return null;
  }
  if (!Object.keys(moves).length || !isISODate(row.day)) return null;
  return { id: row.id, takenAt: row.taken_at, day: row.day, moves, photo: row.photo || null };
}

/** Newest first. A scan a week is ~50 small rows a year. */
export async function listScans(): Promise<FaceScan[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ScanRow>('SELECT id, taken_at, day, moves, photo FROM face_scans ORDER BY taken_at DESC');
  return rows.map(toScan).filter((s): s is FaceScan => s !== null);
}

export async function insertScan(s: FaceScan): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO face_scans (id, taken_at, day, moves, photo) VALUES (?, ?, ?, ?, ?)',
    s.id,
    s.takenAt,
    s.day,
    JSON.stringify(s.moves),
    s.photo,
  );
}

export async function deleteScanRow(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM face_scans WHERE id = ?', id);
}

/** Forgets a scan's photo (the file is deleted by the caller), or every scan's photo when `id` is null. */
export async function clearScanPhoto(id: string | null): Promise<void> {
  const db = await getDatabase();
  if (id === null) await db.runAsync('UPDATE face_scans SET photo = NULL');
  else await db.runAsync('UPDATE face_scans SET photo = NULL WHERE id = ?', id);
}
