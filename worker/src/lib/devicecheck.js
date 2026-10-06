/**
 * Apple DeviceCheck token validation: a valid token proves the request comes from this app on a
 * real Apple device. FaceRep only queries (never writes) the per-device bits, because Apple keeps
 * ONE pair of bits per iPhone per developer team, shared by all of the team's apps (Elowa uses
 * bit0 for its free-answer mark). Writing them here would mix the two apps' limits.
 * Docs: https://developer.apple.com/documentation/devicecheck/accessing-and-modifying-per-device-data
 */

const HOSTS = ['https://api.devicecheck.apple.com', 'https://api.development.devicecheck.apple.com'];

const base64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const encodeJson = (v) => base64url(new TextEncoder().encode(JSON.stringify(v)));

async function importKey(pem) {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

/** ES256 JWT for the DeviceCheck API (Web Crypto already returns the raw r||s signature JWS wants). */
export async function deviceCheckJwt({ keyP8, keyId, teamId, now = Date.now() }) {
  const input = `${encodeJson({ alg: 'ES256', kid: keyId })}.${encodeJson({ iss: teamId, iat: Math.floor(now / 1000) })}`;
  const key = await importKey(keyP8);
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(input));
  return `${input}.${base64url(signature)}`;
}

/**
 * Returns null when not configured (the Worker then skips device checks).
 * query(token) → { ok: true, bit0, bit1, month, host } | { ok: false, reason: 'invalid' | 'unavailable' }
 */
export function createDeviceCheck({ keyP8, keyId, teamId, fetchImpl = fetch }) {
  if (!keyP8 || !keyId || !teamId) return null;

  async function call(host, path, token, extra) {
    const jwt = await deviceCheckJwt({ keyP8, keyId, teamId });
    return fetchImpl(`${host}/v1/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_token: token, transaction_id: crypto.randomUUID(), timestamp: Date.now(), ...extra }),
    });
  }

  return {
    async query(token) {
      try {
        // Store builds use production; development builds only work with the development host.
        for (const host of HOSTS) {
          const res = await call(host, 'query_two_bits', token);
          if (res.status === 400) continue;
          if (!res.ok) return { ok: false, reason: 'unavailable' };
          const text = await res.text();
          // A device we never wrote to answers 200 with plain text ("Failed to find bit state").
          const data = (() => {
            try {
              return JSON.parse(text);
            } catch {
              return {};
            }
          })();
          return { ok: true, bit0: data.bit0 === true, bit1: data.bit1 === true, month: data.last_update_time ?? null, host };
        }
        return { ok: false, reason: 'invalid' };
      } catch {
        return { ok: false, reason: 'unavailable' };
      }
    },
  };
}
