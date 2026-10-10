// Prints the demo data as SQL for the app's database in the iOS Simulator (the web capture seeds it in the browser).
// The Simulator's clock can't be set, so the demo person's days end yesterday by default: today is the next plan day.
// Usage: node sim-seed.js [--guide woman|man] [--goal full|jawline|cheekbones|lips|eyes|massage] [--done 11] [--today YYYY-MM-DD]
//        node sim-seed.js --onboarding   (a fresh start: onboarding shows, no workouts)
//        --new-id also forgets the app's random ID (run `xcrun simctl keychain booted reset` too): the next launch makes
//        a new one with 3 fresh free Coach answers.
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
if (!Number.isInteger(done) || done < 0 || done > 27) throw new Error('--done must be 0 to 27 (finished plan days)');
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error('--today must be YYYY-MM-DD');

const onboarded = !args.includes('--onboarding');
const lines = [
  "DELETE FROM session_exercises WHERE session_id LIKE 'demo-%';",
  "DELETE FROM sessions WHERE id LIKE 'demo-%';",
  'DELETE FROM chat_messages;',
  ...(args.includes('--new-id') ? ["DELETE FROM kv WHERE key = 'facerep.appUserId';"] : []),
  ...seedSql({ guide, goal, today, done, onboarded }).split('\n').filter((l) => !l.includes("'facerep.appUserId'")),
];
console.log(lines.join('\n'));
