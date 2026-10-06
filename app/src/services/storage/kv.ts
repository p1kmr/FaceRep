import { getDatabase } from '@/services/db/database';

interface Envelope<T> {
  version: number;
  data: T;
}

type Migration = (data: unknown) => unknown;

/**
 * Upgrades for saved values: MIGRATIONS[key][n] turns data saved at version n into n + 1.
 * Add one whenever the shape of a saved value changes, and bump that store's VERSION.
 */
const MIGRATIONS: Record<string, Record<number, Migration>> = {};

function migrate(key: string, from: number, to: number, data: unknown): unknown | null {
  let current = data;
  for (let v = from; v < to; v++) {
    const step = MIGRATIONS[key]?.[v];
    if (!step) return null; // no path: start fresh rather than crash on unknown data
    current = step(current);
  }
  return current;
}

/** Loads a small JSON value saved with `save`. Null when missing, corrupt or from a newer app. */
export async function load<T>(key: string, version: number): Promise<T | null> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', key);
    if (!row) return null;
    const parsed = JSON.parse(row.value) as Envelope<T>;
    if (parsed.version === version) return parsed.data;
    if (parsed.version < version) return migrate(key, parsed.version, version, parsed.data) as T | null;
    return null;
  } catch {
    return null;
  }
}

export async function save<T>(key: string, version: number, data: T): Promise<void> {
  const db = await getDatabase();
  const envelope: Envelope<T> = { version, data };
  await db.runAsync(
    'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value',
    key,
    JSON.stringify(envelope),
  );
}

/** Returns a save function that waits `delayMs` after the last call before writing. */
export function createDebouncedSave<T>(key: string, version: number, delayMs = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (data: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      save(key, version, data).catch(() => {
        // Storage unavailable: keep running with in-memory state.
      });
    }, delayMs);
  };
}
