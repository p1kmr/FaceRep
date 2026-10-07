/** Keys in the SQLite `kv` table (small JSON values; big lists have their own tables). */
export const STORAGE_KEYS = {
  settings: 'facerep.settings',
  appUserId: 'facerep.appUserId',
  /** Free AI answers used this month: { month, count } only. */
  aiUsage: 'facerep.aiUsage',
  /** The Premium plan days last loaded from the server: { goal, level, days } (kept for offline use). */
  planCache: 'facerep.planCache',
} as const;
