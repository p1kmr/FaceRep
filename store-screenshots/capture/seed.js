// Demo data for the screenshots: a person with 11 days done, on Thursday 15 October 2026 at 9:41, so Today shows
// Week 2 · Day 5. Nothing here is real: no names, no health data. Each demo day lists five exercises from a window that
// moves through the catalog (only the Progress rows show them); Today's workout is the app's own.
import { CATALOG } from '../../worker/src/lib/catalog.js';

export const TODAY = '2026-10-15';
const DONE = 11; // Days 1–11 done on 4–14 October, today is the 12th day: Week 2 · Day 5
// `today` and `done` can change for Simulator captures (sim-seed.js), where the clock can't be set.
const firstDay = (today, done) => addDays(today, -done);

const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const MINUTES = [8, 12, 7, 19, 21, 18, 8, 7, 20, 13, 8];

// Face scans (docs/face-scan.md), one a week, the newest two days ago: Movement and Balance, oldest first. Small ups
// and downs like real scans; never a promise that they rise.
const SCAN_SCORES = [[74, 86], [77, 85], [78, 88], [81, 88], [83, 91]];
// Each move's score next to the scan's Movement, and each two-sided move's balance next to its Balance (each set adds
// up to 0, so the averages come out as above). The puffed cheeks are the smallest move.
const MOVE_OFFSETS = { browRaise: 3, eyeSquint: -4, smile: 5, lipPucker: -1, mouthOpen: 8, cheekPuff: -11 };
const BALANCE_OFFSETS = { browRaise: -2, eyeSquint: 2, smile: 0 };
const BIGGER_SIDE = { browRaise: 'r', eyeSquint: 'l', smile: 'r' };
/** `full` in app/src/constants/faceScan.ts: the rise above the relaxed face that scores 100. */
const FULL = { browRaise: 0.8, eyeSquint: 0.7, smile: 0.9, lipPucker: 0.9, mouthOpen: 0.6, cheekPuff: 0.7 };

/** A scan's raw readings as the app saves them (services/faceScan/score.ts), worked back from its two scores. */
export function scanReadings(movement, balance) {
  const out = {};
  for (const [id, offset] of Object.entries(MOVE_OFFSETS)) {
    const rise = ((movement + offset) / 100) * FULL[id];
    if (id in BALANCE_OFFSETS) {
      const share = (balance + BALANCE_OFFSETS[id]) / 100;
      const bigger = (2 * rise) / (1 + share);
      const sides = BIGGER_SIDE[id] === 'l' ? { l: bigger, r: bigger * share } : { l: bigger * share, r: bigger };
      out[id] = id === 'browRaise' ? { ...sides, c: rise } : sides;
    } else out[id] = { c: rise };
  }
  return JSON.parse(JSON.stringify(out, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
}

/** Settings as the app saves them (kv 'facerep.settings', envelope version 1). */
export function settingsFor({ guide = 'woman', goal = 'full', onboarded = true, mirror = false, theme = 'light', coachButton = false, today = TODAY, done = DONE, scanPhotos = null } = {}) {
  return {
    themeMode: theme,
    themeId: 'forge',
    onboardingDone: onboarded,
    onboardedOn: onboarded ? firstDay(today, done) : null,
    goal,
    guide,
    reminders: [
      { id: 'workout', kind: 'workout', title: '', enabled: true, times: ['08:00'], days: [0, 1, 2, 3, 4, 5, 6] },
      { id: 'mewing', kind: 'mewing', title: '', enabled: true, times: ['12:30'], days: [1, 2, 3, 4, 5] },
    ],
    haptics: true,
    voiceCues: true,
    mirror,
    aiConsent: true,
    scanPhotos,
    lastReviewPromptOn: today,
    askButton: { visible: coachButton, side: 'right', y: 0.97, hintShows: 99 },
  };
}

/**
 * SQL that fills a fresh database: settings, the random app ID, 11 finished workouts (one a day) and `scans` weekly
 * face scans (the newest ones of SCAN_SCORES; 0 = none, so a free scan is left for a live one).
 */
export function seedSql({ guide, goal = 'full', onboarded = true, sessions = true, mirror = false, theme = 'light', coachButton = false, today = TODAY, done = DONE, scans = 0, scanPhotos = null } = {}) {
  const kv = (key, data) => `INSERT OR REPLACE INTO kv (key, value) VALUES (${q(key)}, ${q(JSON.stringify({ version: 1, data }))});`;
  const lines = [
    kv('facerep.settings', settingsFor({ guide, goal, onboarded, mirror, theme, coachButton, today, done, scanPhotos })),
    kv('facerep.faceScans', { used: scans }),
    `INSERT OR REPLACE INTO kv (key, value) VALUES ('facerep.appUserId', '0d6f3c1e-8a52-4b7e-9c41-5f2a7e9b1c30');`,
  ];
  if (sessions && onboarded) {
    const all = CATALOG.map((e) => e.id);
    for (let n = 1; n <= done; n++) {
      const day = addDays(firstDay(today, done), n - 1);
      const id = `demo-${n}`;
      const ids = Array.from({ length: 5 }, (_, i) => all[((n - 1) * 5 + i) % all.length]);
      const minutes = MINUTES[(n - 1) % MINUTES.length];
      // The workout's reps, shared out over its exercises so they add up (History shows each exercise's reps).
      const total = 30 + n * 3;
      const reps = (i) => Math.floor(total / ids.length) + (i < total % ids.length ? 1 : 0);
      lines.push(`INSERT OR REPLACE INTO sessions (id, day, finished_at, duration_sec, total_reps, kind) VALUES (${q(id)}, ${q(day)}, ${q(`${day}T07:${String(minutes).padStart(2, '0')}:00.000Z`)}, ${300 + n * 20}, ${total}, 'routine');`);
      ids.forEach((ex, i) => lines.push(`INSERT OR REPLACE INTO session_exercises (session_id, position, exercise_id, reps) VALUES (${q(id)}, ${i}, ${q(ex)}, ${reps(i)});`));
    }
  }
  if (onboarded) {
    (scans ? SCAN_SCORES.slice(-scans) : []).forEach(([movement, balance], i, list) => {
      const day = addDays(today, -2 - 7 * (list.length - 1 - i));
      const moves = JSON.stringify(scanReadings(movement, balance));
      lines.push(`INSERT OR REPLACE INTO face_scans (id, taken_at, day, moves, photo) VALUES (${q(`demo-scan-${i + 1}`)}, ${q(`${day}T08:15:00.000Z`)}, ${q(day)}, ${q(moves)}, NULL);`);
    });
  }
  return lines.join('\n');
}
