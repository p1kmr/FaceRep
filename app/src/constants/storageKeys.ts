/** Keys in the SQLite `kv` table (small JSON values; big lists have their own tables). */
export const STORAGE_KEYS = {
  settings: 'facerep.settings',
  appUserId: 'facerep.appUserId',
  /** Free AI answers used this month: { month, count } only. */
  aiUsage: 'facerep.aiUsage',
  /** Face scans finished on this iPhone: { used } only (the scans themselves are in the face_scans table). */
  faceScans: 'facerep.faceScans',
} as const;
