/**
 * The 28-day plan (4 weeks of 7 days), built here on the server so the Premium part never ships
 * inside the app. Week 1 of Level 1 is free and is bundled in the app (works offline, and on the
 * first launch); it is exported from this file by scripts/export-free-week.js, so there is one
 * source for every day. Everything else (Weeks 2–4, Levels 2 and 3) is sent only to Premium users.
 *
 * A day is data, never code: { day, kind, ids, repPct, holdPlusSec }. The app turns it into reps
 * and holds from its own exercise catalog (repPct of each exercise's reps, holdPlusSec on top of its hold).
 */

import { GOALS } from './validate.js';

export const PLAN_DAYS = 28;
export const FREE_DAYS = 7;
export const MAX_LEVEL = 3;

/**
 * Version of the exercise catalog. When exercises are added, bump it here and in the app
 * (CATALOG_VERSION in app/src/constants/exercises.ts) and give the new entries the new version. The
 * app sends its version with POST /plan, so an older app is never planned an exercise it doesn't have.
 */
export const CATALOG_VERSION = 2;

/**
 * [id, program, loadsJaw, since] in the app's catalog order (app/src/constants/exercises.ts
 * EXERCISE_IDS, program and jawCaution); `since` is the catalog version that added the exercise.
 * A test fails when the two drift apart.
 */
export const CATALOG = [
  ['01-jaw-clench', 'jawline', true, 1],
  ['02-chin-lift', 'jawline', false, 1],
  ['03-jaw-jut', 'jawline', true, 1],
  ['04-mewing', 'jawline', false, 1],
  ['12-tongue-press', 'jawline', false, 1],
  ['11-chin-tuck', 'jawline', false, 1],
  ['05-neck-stretch', 'jawline', false, 1],
  ['06-cheek-lift', 'cheekbones', false, 1],
  ['07-fish-face', 'cheekbones', false, 1],
  ['13-smiling-fish', 'cheekbones', false, 1],
  ['08-cheek-puff', 'cheekbones', false, 1],
  ['14-o-stretch', 'cheekbones', false, 1],
  ['15-lion-face', 'cheekbones', true, 1],
  ['18-lip-press', 'lips', false, 2],
  ['19-pout', 'lips', false, 2],
  ['20-lip-corner-lift', 'lips', false, 2],
  ['21-smile-line-press', 'lips', false, 2],
  ['09-brow-lift', 'eyes', false, 1],
  ['22-forehead-press', 'eyes', false, 2],
  ['16-wide-eyes', 'eyes', false, 1],
  ['17-lower-lid-lift', 'eyes', false, 1],
  ['23-v-eyes', 'eyes', false, 2],
  ['10-eye-squeeze', 'eyes', false, 1],
  ['24-jaw-release', 'massage', false, 2],
  ['25-jawline-sweep', 'massage', false, 2],
  ['26-frown-release', 'massage', false, 2],
  ['27-temple-circles', 'massage', false, 2],
].map(([id, program, loadsJaw, since]) => ({ id, program, loadsJaw, since }));

/**
 * Each week gets harder: more exercises, more reps, longer holds. Week 1 leaves out the exercises
 * that load the jaw so people learn the movements first.
 */
export const WEEKS = [
  { name: 'learn', count: 4, repPct: 70, holdPlusSec: 0, loadsJaw: false },
  { name: 'build', count: 5, repPct: 85, holdPlusSec: 0, loadsJaw: true },
  { name: 'strengthen', count: 6, repPct: 100, holdPlusSec: 0, loadsJaw: true },
  { name: 'peak', count: 6, repPct: 100, holdPlusSec: 2, loadsJaw: true },
];

/** Days 7, 14 and 21: a short recovery session that gives the jaw a rest. */
export const LIGHT_DAY = { ids: ['05-neck-stretch', '11-chin-tuck', '16-wide-eyes'], repPct: 70, holdPlusSec: 0 };
/** Day 28: the last session, one exercise longer than week 4. */
const FINAL_EXTRA = 1;
/** Each level above 1 adds this on top of every day. */
const PER_LEVEL = { repPct: 10, holdPlusSec: 1 };

const rotate = (list, by) => {
  if (!list.length) return [];
  const n = ((by % list.length) + list.length) % list.length;
  return [...list.slice(n), ...list.slice(0, n)];
};

const order = new Map(CATALOG.map((e, i) => [e.id, i]));
const inCatalogOrder = (ids) => [...new Set(ids)].sort((a, b) => order.get(a) - order.get(b));

/**
 * The exercises of one workout. `n` counts workouts only (light days skipped), so the window moves
 * through the goal's exercises and every one comes up. A program with fewer exercises than `count`
 * is topped up from the others, rotating daily. Full face rotates through the whole catalog.
 * Only exercises the app's catalog version has.
 */
function pickIds(goal, n, count, loadsJaw, catalog) {
  const pool = CATALOG.filter((e) => e.since <= catalog && (loadsJaw || !e.loadsJaw)).map((e) => e.id);
  if (goal === 'full') return inCatalogOrder(rotate(pool, n * count).slice(0, count));
  const primary = pool.filter((id) => CATALOG[order.get(id)].program === goal);
  const others = pool.filter((id) => CATALOG[order.get(id)].program !== goal);
  const picked =
    primary.length >= count
      ? rotate(primary, n * count).slice(0, count)
      : [...primary, ...rotate(others, n).slice(0, count - primary.length)];
  return inCatalogOrder(picked);
}

/** All 28 days of a goal and level, for an app with this catalog version (pure: same input, same plan). */
export function buildPlan(goal, level, catalog = CATALOG_VERSION) {
  const bonus = level - 1;
  const days = [];
  let workouts = 0;
  for (let day = 1; day <= PLAN_DAYS; day++) {
    const week = WEEKS[Math.ceil(day / 7) - 1];
    const repPct = (kindPct) => kindPct + bonus * PER_LEVEL.repPct;
    const holdPlusSec = (kindHold) => kindHold + bonus * PER_LEVEL.holdPlusSec;
    if (day % 7 === 0 && day < PLAN_DAYS) {
      days.push({ day, kind: 'light', ids: [...LIGHT_DAY.ids], repPct: repPct(LIGHT_DAY.repPct), holdPlusSec: holdPlusSec(LIGHT_DAY.holdPlusSec) });
      continue;
    }
    const final = day === PLAN_DAYS;
    const count = week.count + (final ? FINAL_EXTRA : 0);
    // From Level 2 on, people know the movements: the jaw exercises are in from day 1.
    const ids = pickIds(goal, workouts, count, week.loadsJaw || level > 1, catalog);
    workouts++;
    days.push({ day, kind: final ? 'final' : 'workout', ids, repPct: repPct(week.repPct), holdPlusSec: holdPlusSec(week.holdPlusSec) });
  }
  return days;
}

/** The days a Premium request gets: Level 1 without its free week, every day of Levels 2 and 3. */
export function premiumDays(goal, level, catalog = CATALOG_VERSION) {
  const days = buildPlan(goal, level, catalog);
  return level === 1 ? days.filter((d) => d.day > FREE_DAYS) : days;
}

/** The free week as bundled in the app (scripts/export-free-week.js writes it). */
export function freeWeek() {
  return Object.fromEntries(GOALS.map((g) => [g, buildPlan(g, 1).slice(0, FREE_DAYS)]));
}
