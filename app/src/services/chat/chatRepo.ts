import { CHAT_LIMITS } from '@/constants/limits';
import { getDatabase } from '@/services/db/database';

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

/** A saved chat in History: named after its first question. */
export interface ChatSummary {
  id: string;
  title: string;
  /** When its last answer came (ISO timestamp). */
  updatedAt: string;
}

type Row = { id: string; role: string; text: string; created_at: string };

const toMessage = (r: Row): StoredMessage => ({
  id: r.id,
  role: r.role === 'assistant' ? 'assistant' : 'user',
  text: r.text,
  createdAt: r.created_at,
});

/**
 * The Coach chats are kept on this iPhone only (never on our server). A chat is saved with its first answer, so a new
 * chat nobody asked anything in leaves nothing behind.
 */
export async function listChats(): Promise<ChatSummary[]> {
  const db = await getDatabase();
  return db.getAllAsync<ChatSummary>(
    `SELECT chat_id AS id, MAX(created_at) AS updatedAt,
       (SELECT text FROM chat_messages f WHERE f.chat_id = m.chat_id ORDER BY f.role = 'user' DESC, f.created_at, f.rowid LIMIT 1) AS title
     FROM chat_messages m GROUP BY chat_id ORDER BY updatedAt DESC, id DESC`,
  );
}

/** A chat's messages, oldest first. */
export async function loadChat(chatId: string): Promise<StoredMessage[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Row>(
    'SELECT id, role, text, created_at FROM chat_messages WHERE chat_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?',
    chatId,
    CHAT_LIMITS.storedMessages,
  );
  return rows.reverse().map(toMessage);
}

/** History and the most recent chat's messages: the Coach opens where it was. */
export async function loadHistory(): Promise<{ chats: ChatSummary[]; messages: StoredMessage[] }> {
  const chats = await listChats();
  return { chats, messages: chats.length ? await loadChat(chats[0].id) : [] };
}

/** A question and its answer, saved together. Keeps each chat's last storedMessages and the last storedChats chats. */
export async function saveTurn(chatId: string, question: StoredMessage, answer: StoredMessage): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const m of [question, answer]) {
      await db.runAsync(
        'INSERT INTO chat_messages (id, chat_id, role, text, created_at) VALUES (?, ?, ?, ?, ?)',
        m.id,
        chatId,
        m.role,
        m.text,
        m.createdAt,
      );
    }
    await db.runAsync(
      'DELETE FROM chat_messages WHERE chat_id = ? AND rowid NOT IN (SELECT rowid FROM chat_messages WHERE chat_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?)',
      chatId,
      chatId,
      CHAT_LIMITS.storedMessages,
    );
    await db.runAsync(
      'DELETE FROM chat_messages WHERE chat_id NOT IN (SELECT chat_id FROM chat_messages GROUP BY chat_id ORDER BY MAX(created_at) DESC LIMIT ?)',
      CHAT_LIMITS.storedChats,
    );
  });
}

export async function deleteChat(chatId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM chat_messages WHERE chat_id = ?', chatId);
}

export async function deleteAllChats(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM chat_messages');
}
