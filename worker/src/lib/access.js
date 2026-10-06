/**
 * Who may use the AI, checked on the server (the app's own checks can be skipped by anyone
 * calling the URL directly):
 * - Premium (RevenueCat says the "premium" entitlement is active) → yes (daily limits still apply).
 * - Free → FREE_PER_MONTH Coach answers per calendar month (UTC), counted per app ID in D1.
 *   With DeviceCheck set up, the request must also carry a valid Apple DeviceCheck token (a real
 *   iPhone running this app). The app ID lives in the Keychain, so reinstalling keeps the count.
 *
 * DeviceCheck's two bits are NOT used here: Apple keeps one pair of bits per iPhone per developer
 * team, shared by all of the team's apps, and Elowa already uses bit0 for its own free answers.
 */

/** Same as FREE_LIMITS.aiPerMonth in the app. */
export const FREE_PER_MONTH = 3;
export const ENTITLEMENT = 'premium';

const monthOf = (now) => now.toISOString().slice(0, 7);

/** RevenueCat REST API v1: true / false, or 'unavailable' when RevenueCat can't be reached. */
export function createPremiumCheck({ secretKey, fetchImpl = fetch }) {
  if (!secretKey) return null;
  return async function isPremium(appUserId, now = new Date()) {
    try {
      const res = await fetchImpl(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      if (!res.ok) return 'unavailable';
      const data = await res.json();
      const entitlement = data?.subscriber?.entitlements?.[ENTITLEMENT];
      if (!entitlement) return false;
      const expires = entitlement.expires_date;
      return expires == null || new Date(expires).getTime() > now.getTime();
    } catch {
      return 'unavailable';
    }
  };
}

const ADD = `INSERT INTO free_usage (app_user_id, month, count) VALUES (?1, ?2, 1)
  ON CONFLICT (app_user_id, month) DO UPDATE SET count = count + 1
  RETURNING count`;

/** Free answers used per app ID and month (only counts, never content). */
export function createFreeUsage(db) {
  return {
    async get(appUserId, month) {
      const row = await db.prepare('SELECT count FROM free_usage WHERE app_user_id = ?1 AND month = ?2').bind(appUserId, month).first();
      return row?.count ?? 0;
    },
    async add(appUserId, month) {
      const row = await db.prepare(ADD).bind(appUserId, month).first();
      return row?.count ?? Infinity;
    },
  };
}

/** Deletes counters from before last month (run daily by the cron trigger). */
export async function pruneFreeUsage(db, now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  await db.prepare('DELETE FROM free_usage WHERE month < ?1').bind(monthOf(d)).run();
}

const deny = (status, error) => ({ ok: false, status, body: { error } });

/**
 * Returns { ok: true, commit } or { ok: false, status, body }. Call commit() after a successful
 * answer: it counts a free answer (Premium: nothing to do).
 * Without a RevenueCat key the gate is open (older setup; the daily limits still apply).
 */
export function createAccessCheck({ isPremium, freeUsage, deviceCheck, freePerMonth = FREE_PER_MONTH }) {
  return async function checkAccess({ appUserId, deviceToken }, now = new Date()) {
    const open = { ok: true, commit: async () => {} };
    if (!isPremium) return open;

    const premium = await isPremium(appUserId, now);
    if (premium === 'unavailable') return deny(503, 'unavailable');
    if (premium) return open;

    const month = monthOf(now);
    if (deviceCheck) {
      if (!deviceToken) return deny(403, 'device');
      const device = await deviceCheck.query(deviceToken);
      if (!device.ok) return device.reason === 'invalid' ? deny(403, 'device') : deny(503, 'unavailable');
    }

    let used;
    try {
      used = await freeUsage.get(appUserId, month);
    } catch {
      return deny(503, 'unavailable');
    }
    if (used >= freePerMonth) return deny(402, 'freeUsed');

    return {
      ok: true,
      commit: async () => {
        await freeUsage.add(appUserId, month).catch(() => console.error('free usage: count failed'));
      },
    };
  };
}
