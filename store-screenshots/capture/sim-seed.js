// Prints the demo data as SQL for the app's database in the iOS Simulator (the web capture seeds it in the browser).
// The Simulator's clock can't be set, so the demo person's days end yesterday by default: today is the next day.
// Usage: node sim-seed.js [--guide woman|man] [--goal full|jawline|cheekbones|lips|eyes|massage] [--done 11] [--today YYYY-MM-DD]
//                         [--scans 0-5] [--photos] [--mirror]
//        node sim-seed.js --onboarding   (a fresh start: onboarding shows, no workouts)
//        --scans N writes N weekly face scans (the newest two days ago); with fewer than 3 a free scan is left for a
//        live one (scan?start=1). --photos turns scan photos on, --mirror the workout mirror (grant the camera too).
//        --new-id also forgets the app's random ID and its count of free Coach answers (run `xcrun simctl keychain
//        booted reset` too): the next launch makes a new ID with 3 fresh free Coach answers.
// It clears earlier demo workouts and the Coach chat first. It never writes the web capture's fixed demo ID: in the
// Simulator the app keeps its own random ID, so no two Simulators share one with the server.
// Apply it (docs/screenshots.md §4): launch the app once, quit it, then
//   sqlite3 "$(xcrun simctl get_app_container booted com.p1kmr.facerep data)/Documents/SQLite/facerep.db" < seed.sql
import { seedSql } from './seed.js';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const guide = opt('guide', 'woman');
const goal = opt('goal', 'full');
const done = Number(opt('done', '11'));
const today = opt('today', local);
if (!['woman', 'man'].includes(guide)) throw new Error('--guide must be woman or man');
if (!Number.isInteger(done) || done < 0) throw new Error('--done must be 0 or more (days with a finished workout)');
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error('--today must be YYYY-MM-DD');

const scans = Number(opt('scans', '0'));
if (!Number.isInteger(scans) || scans < 0 || scans > 5) throw new Error('--scans must be 0 to 5');
const scanPhotos = args.includes('--photos') ? true : null;
const mirror = args.includes('--mirror');

const onboarded = !args.includes('--onboarding');
const lines = [
  "DELETE FROM session_exercises WHERE session_id LIKE 'demo-%';",
  "DELETE FROM sessions WHERE id LIKE 'demo-%';",
  'DELETE FROM chat_messages;',
  // Every scan, also the ones a live capture made (their Simulator photos stay as files, never shown).
  'DELETE FROM face_scans;',
  // A new ID has 3 free Coach answers on the server; the app's own count of them starts again too.
  ...(args.includes('--new-id') ? ["DELETE FROM kv WHERE key IN ('facerep.appUserId', 'facerep.aiUsage');"] : []),
  ...seedSql({ guide, goal, today, done, onboarded, scans, scanPhotos, mirror }).split('\n').filter((l) => !l.includes("'facerep.appUserId'")),
];
console.log(lines.join('\n'));
