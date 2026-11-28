// Gemini speech: the voice engine for the FaceRep reels (copied from Reel Studio, then changed: the friend key).
// speak() takes the voice text of a whole script and returns the sound as 16-bit samples.
// The key is sent only to Google, in a header. On the Mac, reels/voice.mjs reads it from Reel Studio's .env.
// In a Claude Code cloud session it is a network secret instead: Anthropic's proxy adds it to requests for
// generativelanguage.googleapis.com after they leave the session, so there the request goes out without a key.
// Keys, in order:
// - GEMINI_API_KEY first. GEMINI_API_KEY_2, then GEMINI_API_KEY_3, are backups on the owner's side, used only when
//   Google refuses a key (wrong, expired or blocked), never to get past a limit (Google's API terms).
// - GEMINI_API_KEY_FRIEND: a friend's key from another Google account, lent to the owner for as long as needed
//   (owner, 2026-11-28). Used only when the owner's key has run out for the day.
// A per-minute limit (3 a minute on the free tier) is waited out on the same key, so it never spends the friend's.

import { readWav } from './wav.mjs';

const URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const TRIES = 3;
const WAIT_MS = 20000;
const MINUTE_WAIT_MAX_S = 90; // a longer "retry in" means the day's limit, not the minute's
const OWN = ['GEMINI_API_KEY', 'GEMINI_API_KEY_2', 'GEMINI_API_KEY_3'];
const FRIEND = 'GEMINI_API_KEY_FRIEND';

// The reply holds the sound as one long base64 text; find it without assuming its exact place.
function findAudio(node) {
  if (!node || typeof node !== 'object') return null;
  if (typeof node.data === 'string' && node.data.length > 2000) return node.data;
  for (const v of Object.values(node)) {
    const hit = findAudio(v);
    if (hit) return hit;
  }
  return null;
}

// Google sends an error as { error } or as [{ error }].
function errorOf(json) {
  return (Array.isArray(json) ? json[0] : json)?.error ?? {};
}

// True when Google refused the key itself (wrong, expired, or not allowed to use this API), not the request.
function keyRefused(status, error) {
  if (status === 401 || status === 403) return true;
  const reasons = (error.details ?? []).map((d) => String(d?.reason ?? ''));
  return status === 400 && (reasons.some((r) => r.startsWith('API_KEY')) || /api key/i.test(String(error.message ?? '')));
}

// For a 429: seconds to wait when it is the per-minute limit, or null when it is the day's limit.
function minuteWait(error) {
  const details = error.details ?? [];
  const ids = details.flatMap((d) => (d?.violations ?? []).map((v) => String(v?.quotaId ?? '')));
  if (ids.some((id) => /PerDay/i.test(id))) return null;
  const delay = details.map((d) => parseFloat(String(d?.retryDelay ?? ''))).find((s) => s >= 0);
  if (delay !== undefined) return delay <= MINUTE_WAIT_MAX_S ? delay : null;
  return ids.some((id) => /PerMinute/i.test(id)) ? 60 : null;
}

// One key: returns { sound } or { why, refused, limited }.
async function tryKey(key, body) {
  const headers = { 'content-type': 'application/json' };
  if (key) headers['x-goog-api-key'] = key;
  let why = '';
  let waited = false;
  for (let attempt = 1; attempt <= TRIES; attempt++) {
    if (attempt > 1 && !waited) await new Promise((r) => setTimeout(r, WAIT_MS));
    waited = false;
    let res;
    try {
      res = await fetch(URL, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch (e) {
      why = `no connection (${e.message})`;
      continue;
    }
    const json = await res.json().catch(() => ({}));
    const error = errorOf(json);
    const said = String(error.message || '').slice(0, 300);
    if (res.status === 429) {
      const wait = minuteWait(error);
      if (wait === null) return { why: said, limited: true };
      why = `per-minute limit: ${said}`;
      if (attempt < TRIES) {
        console.log(`     Google's per-minute limit: waiting ${Math.ceil(wait) + 2} s on the same key.`);
        await new Promise((r) => setTimeout(r, (Math.ceil(wait) + 2) * 1000));
        waited = true;
      }
      continue;
    }
    if (!res.ok) {
      why = `HTTP ${res.status} ${said}`;
      if (res.status < 500) return { why, refused: keyRefused(res.status, error) }; // a wrong request stays wrong
      continue;
    }
    const data = findAudio(json);
    if (!data) {
      why = 'the reply had no sound in it';
      continue;
    }
    const bytes = Buffer.from(data, 'base64');
    if (bytes.toString('latin1', 0, 4) === 'RIFF') return { sound: readWav(bytes) };
    // Raw samples with no wav header: 24 kHz, 16-bit, one channel.
    return { sound: { rate: 24000, pcm: new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.length / 2)).slice() } };
  }
  return { why };
}

// text: what to say. settings: { model, voice, style }.
// Returns { rate, pcm } with one channel of 16-bit samples.
export async function speak(text, { model, voice, style }) {
  const names = OWN.filter((n) => process.env[n]);
  // A cloud session with no key of its own sends none, and the proxy adds the network secret.
  const proxy = !names.length && !process.env[FRIEND] && process.env.CLAUDE_CODE_REMOTE === 'true';
  if (!names.length && !proxy && !process.env[FRIEND]) {
    throw new Error('GEMINI_API_KEY is missing. The owner keeps it in the .env file. Stop and tell the owner.');
  }
  const body = {
    model,
    input: [{ type: 'user_input', content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style }] }] }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice }] },
  };
  let last = { limited: !names.length && !proxy }; // only the friend key is set: go straight to it
  if (proxy) last = await tryKey('', body);
  for (let k = 0; k < names.length; k++) {
    if (k > 0) console.log(`     Google refused ${names[k - 1]} (${last.why}). Trying the backup key, ${names[k]}.`);
    last = await tryKey(process.env[names[k]], body);
    if (last.sound) return last.sound;
    if (!last.refused) break; // only a refused key moves on to the owner's backup key
  }
  if (last.sound) return last.sound;
  if (last.limited && process.env[FRIEND]) {
    if (names.length) console.log(`     The owner's key ran out for today. Using ${FRIEND} (the friend's account, lent to the owner).`);
    last = await tryKey(process.env[FRIEND], body);
    if (last.sound) return last.sound;
  }
  if (last.limited) throw new Error(`Gemini's daily limit was reached on every key we may use. Try again after midnight Pacific. Google said: ${last.why}`);
  if (proxy && last.refused) {
    throw new Error(`Google refused the request (${last.why}). In a cloud session the key must be a network secret on the cloud environment: host generativelanguage.googleapis.com, header x-goog-api-key, no prefix. Stop and tell the owner.`);
  }
  throw new Error(`Gemini speech failed: ${last.why}`);
}
