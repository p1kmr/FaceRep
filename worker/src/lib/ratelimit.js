/**
 * Coach questions per day. The free plan allows a few per month in total; this caps Premium and abuse.
 * perUser is promised as "up to N a day" (app: PREMIUM_LIMITS.aiPerDay, Terms page, store description): change them together.
 */
export const LIMITS = { perUser: 40, perIp: 120 };

const toHex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);

/**
 * One-way IP hash for the per-IP counter (raw IPs are never stored, even for a day).
 * With a secret it's an HMAC, so nobody holding the table can reverse it by trying all
 * IPv4 addresses. The day is mixed in, so the same IP gives a different value each day.
 * Web Crypto: works in Workers and Node.
 */
export async function hashIp(ip, day, secret) {
  const data = new TextEncoder().encode(`facerep:${day}:${ip}`);
  if (!secret) return toHex(await crypto.subtle.digest('SHA-256', data));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, data));
}

const UPSERT = `INSERT INTO rate_limits (key, day, count) VALUES (?1, ?2, 1)
  ON CONFLICT (key, day) DO UPDATE SET count = count + 1
  RETURNING count`;

/**
 * Daily counters in Cloudflare D1 (SQLite), one row per user/IP per day. Only counters are
 * stored, never question contents. Returns 'ok' | 'limited' | 'unavailable'.
 */
export function createD1RateLimiter(db, { ipSecret, prefix = '', limits = LIMITS } = {}) {
  return async function checkRateLimit({ appUserId, ip, now = new Date() }) {
    const day = now.toISOString().slice(0, 10);
    try {
      const [user, ipRow] = await db.batch([
        db.prepare(UPSERT).bind(`${prefix}u:${appUserId}`, day),
        db.prepare(UPSERT).bind(`${prefix}ip:${await hashIp(ip, day, ipSecret)}`, day),
      ]);
      const userCount = user.results[0]?.count ?? Infinity;
      const ipCount = ipRow.results[0]?.count ?? Infinity;
      return userCount > limits.perUser || ipCount > limits.perIp ? 'limited' : 'ok';
    } catch {
      return 'unavailable';
    }
  };
}

/** Deletes counters older than 2 days (run daily by the Worker's cron trigger). */
export async function pruneRateLimits(db, now = new Date()) {
  const cutoff = new Date(now.getTime() - 2 * 86_400_000).toISOString().slice(0, 10);
  await db.prepare('DELETE FROM rate_limits WHERE day < ?1').bind(cutoff).run();
}
