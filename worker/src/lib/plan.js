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
 * [id, program, loadsJaw] in the app's catalog order (app/src/constants/exercises.ts EXERCISE_IDS,
 * program and jawCaution). A test fails when the two drift apart.
 */
export const CATALOG = [
  ['01-jaw-clench', 'jawline', true],
  ['02-chin-lift', 'jawline', false],
  ['03-jaw-jut', 'jawline', true],
  ['04-mewing', 'jawline', false],
  ['12-tongue-press', 'jawline', false],
  ['11-chin-tuck', 'jawline', false],
  ['05-neck-stretch', 'jawline', false],
  ['06-cheek-lift', 'cheekbones', false],
  ['07-fish-face', 'cheekbones', false],
  ['13-smiling-fish', 'cheekbones', false],
  ['08-cheek-puff', 'cheekbones', false],
  ['14-o-stretch', 'cheekbones', false],
  ['15-lion-face', 'cheekbones', true],
  ['09-brow-lift', 'eyes', false],
  ['16-wide-eyes', 'eyes', false],
  ['17-lower-lid-lift', 'eyes', false],
  ['10-eye-squeeze', 'eyes', false],
].map(([id, program, loadsJaw]) => ({ id, program, loadsJaw }));

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
 */
function pickIds(goal, n, count, loadsJaw) {
  const pool = CATALOG.filter((e) => loadsJaw || !e.loadsJaw).map((e) => e.id);
  if (goal === 'full') return inCatalogOrder(rotate(pool, n * count).slice(0, count));
  const primary = pool.filter((id) => CATALOG[order.get(id)].program === goal);
  const others = pool.filter((id) => CATALOG[order.get(id)].program !== goal);
  const picked =
    primary.length >= count
      ? rotate(primary, n * count).slice(0, count)
      : [...primary, ...rotate(others, n).slice(0, count - primary.length)];
  return inCatalogOrder(picked);
}

/** All 28 days of a goal and level (pure: same input, same plan). */
export function buildPlan(goal, level) {
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
    const ids = pickIds(goal, workouts, count, week.loadsJaw || level > 1);
    workouts++;
    days.push({ day, kind: final ? 'final' : 'workout', ids, repPct: repPct(week.repPct), holdPlusSec: holdPlusSec(week.holdPlusSec) });
  }
  return days;
}

/** The days a Premium request gets: Level 1 without its free week, every day of Levels 2 and 3. */
export function premiumDays(goal, level) {
  const days = buildPlan(goal, level);
  return level === 1 ? days.filter((d) => d.day > FREE_DAYS) : days;
}

/** The free week as bundled in the app (scripts/export-free-week.js writes it). */
export function freeWeek() {
  return Object.fromEntries(GOALS.map((g) => [g, buildPlan(g, 1).slice(0, FREE_DAYS)]));
}
