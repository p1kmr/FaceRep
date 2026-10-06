import { CHAT_LIMITS } from '@/constants/limits';
import { getDatabase } from '@/services/db/database';

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

/** The Coach conversation is kept on this iPhone only (never on our server). Oldest first. */
export async function loadMessages(): Promise<StoredMessage[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string; role: string; text: string; created_at: string }>(
    'SELECT id, role, text, created_at FROM chat_messages ORDER BY created_at DESC, rowid DESC LIMIT ?',
    CHAT_LIMITS.storedMessages,
  );
  return rows
    .reverse()
    .map((r) => ({ id: r.id, role: r.role === 'assistant' ? 'assistant' : 'user', text: r.text, createdAt: r.created_at }));
}

export async function addMessage(m: StoredMessage): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO chat_messages (id, role, text, created_at) VALUES (?, ?, ?, ?)', m.id, m.role, m.text, m.createdAt);
  await db.runAsync(
    'DELETE FROM chat_messages WHERE rowid NOT IN (SELECT rowid FROM chat_messages ORDER BY created_at DESC, rowid DESC LIMIT ?)',
    CHAT_LIMITS.storedMessages,
  );
}

export async function clearMessages(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM chat_messages');
}
