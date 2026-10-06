import * as SQLite from 'expo-sqlite';

import { CONFIG } from '@/constants/config';

import { MIGRATIONS } from './migrations';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(CONFIG.databaseName);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  // Each migration runs once, in order, inside a transaction; user_version records the last one.
  for (; version < MIGRATIONS.length; version++) {
    const sql = MIGRATIONS[version];
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
  return db;
}

/** The app's one SQLite database (opened and migrated on first use). */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = open().catch((err) => {
      dbPromise = null; // let the next call try again
      throw err;
    });
  }
  return dbPromise;
}

/** "Delete all data": empties every table but keeps the schema. */
export async function wipeDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM session_exercises; DELETE FROM sessions; DELETE FROM chat_messages; DELETE FROM kv;');
  });
}
