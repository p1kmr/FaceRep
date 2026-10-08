// Demo data for the screenshots: a person 11 days into the 28-day plan, on Thursday 15 October 2026 at 9:41.
// Nothing here is real: no names, no health data. The plan days come from the Worker's own plan builder,
// so the captured workouts match what the app really shows on those days.
import { buildPlan, premiumDays } from '../../worker/src/lib/plan.js';

export const TODAY = '2026-10-15';
const FIRST_DAY = '2026-10-04'; // Day 1; Days 1–11 done on 4–14 October, today is Day 12
const DONE = 11;

const addDays = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

/** Settings as the app saves them (kv 'facerep.settings', envelope version 1). */
export function settingsFor({ guide = 'woman', goal = 'full', onboarded = true } = {}) {
  return {
    themeMode: 'light',
    themeId: 'forge',
    onboardingDone: onboarded,
    onboardedOn: onboarded ? FIRST_DAY : null,
    goal,
    guide,
    reminders: [
      { id: 'workout', kind: 'workout', title: '', enabled: true, times: ['08:00'], days: [0, 1, 2, 3, 4, 5, 6] },
      { id: 'mewing', kind: 'mewing', title: '', enabled: true, times: ['12:30'], days: [1, 2, 3, 4, 5] },
    ],
    haptics: true,
    voiceCues: true,
    mirror: false,
    aiConsent: true,
    lastReviewPromptOn: TODAY,
    askButton: { visible: false, side: 'right', y: 0.97, hintShows: 99 },
    planGridTipSeen: true,
  };
}

/** SQL that fills a fresh database: settings, the random app ID and 11 finished plan workouts. */
export function seedSql({ guide, goal = 'full', onboarded = true, sessions = true } = {}) {
  const kv = (key, data) => `INSERT OR REPLACE INTO kv (key, value) VALUES (${q(key)}, ${q(JSON.stringify({ version: 1, data }))});`;
  const lines = [
    kv('facerep.settings', settingsFor({ guide, goal, onboarded })),
    `INSERT OR REPLACE INTO kv (key, value) VALUES ('facerep.appUserId', '0d6f3c1e-8a52-4b7e-9c41-5f2a7e9b1c30');`,
  ];
  if (sessions && onboarded) {
    const plan = buildPlan(goal, 1);
    for (let n = 1; n <= DONE; n++) {
      const day = addDays(FIRST_DAY, n - 1);
      const id = `demo-${n}`;
      const ids = plan[n - 1].ids;
      const minutes = [8, 12, 7, 19, 21, 18, 8, 7, 20, 13, 8][n - 1];
      lines.push(`INSERT OR REPLACE INTO sessions (id, day, finished_at, duration_sec, total_reps, kind, plan_level, plan_day) VALUES (${q(id)}, ${q(day)}, ${q(`${day}T07:${String(minutes).padStart(2, '0')}:00.000Z`)}, ${300 + n * 20}, ${30 + n * 3}, 'routine', 1, ${n});`);
      ids.forEach((ex, i) => lines.push(`INSERT OR REPLACE INTO session_exercises (session_id, position, exercise_id, reps) VALUES (${q(id)}, ${i}, ${q(ex)}, 8);`));
    }
  }
  return lines.join('\n');
}

/** The Worker's answer to POST /plan for this goal and level. */
export const planReply = (goal, level) => ({ goal, level, days: premiumDays(goal, level) });
