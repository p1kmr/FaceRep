/**
 * SQLite schema, one entry per version. NEVER edit a shipped entry: append a new one instead
 * (MIGRATIONS[n] upgrades a database at user_version n to n + 1).
 */
export const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    day TEXT NOT NULL,
    finished_at TEXT NOT NULL,
    duration_sec INTEGER NOT NULL,
    total_reps INTEGER NOT NULL,
    kind TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_day ON sessions (day);
  CREATE TABLE IF NOT EXISTS session_exercises (
    session_id TEXT NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    exercise_id TEXT NOT NULL,
    reps INTEGER NOT NULL,
    PRIMARY KEY (session_id, position)
  );
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  `,
  // 2: which 28-day plan day a workout counted for (NULL for single exercises and older workouts). The plan is gone;
  // the columns stay (a shipped migration never changes) and are no longer written or read.
  `
  ALTER TABLE sessions ADD COLUMN plan_level INTEGER;
  ALTER TABLE sessions ADD COLUMN plan_day INTEGER;
  `,
  // 3: the Coach keeps several chats (History). The one conversation so far becomes the first chat.
  `
  ALTER TABLE chat_messages ADD COLUMN chat_id TEXT;
  UPDATE chat_messages SET chat_id = 'first-chat';
  CREATE INDEX IF NOT EXISTS chat_messages_chat ON chat_messages (chat_id, created_at);
  `,
];
