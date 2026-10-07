import { EXERCISES, GOALS } from '@/constants/exercises';
import { PLAN, type PlanDay } from '@/constants/plan';
import type { SessionSummary } from '@/services/progress/stats';

import { contentLevel, freeWeek, isFreeDay, nextPlanRef, parsePlanDays, planDates, planGrid, planItems, planProgress, weekOf } from '../plan';

const day = (n: number, over: Partial<PlanDay> = {}): PlanDay => ({ day: n, kind: 'workout', ids: ['09-brow-lift'], repPct: 100, holdPlusSec: 0, ...over });
let seq = 0;
const session = (date: string, plan?: { level: number; day: number }): SessionSummary => ({
  id: `s${seq++}`,
  day: date,
  finishedAt: `${date}T08:00:00.000Z`,
  durationSec: 300,
  totalReps: 40,
  exerciseIds: ['09-brow-lift'],
  kind: plan ? 'routine' : 'single',
  ...(plan ? { plan } : {}),
});

describe('free week (bundled)', () => {
  it('has days 1–7 for every goal, a light day 7, and no exercise that loads the jaw', () => {
    for (const goal of GOALS) {
      const week = freeWeek(goal);
      expect(week.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(week[6].kind).toBe('light');
      expect(week.flatMap((d) => d.ids).some((id) => EXERCISES[id].jawCaution)).toBe(false);
    }
  });
});

describe('parsePlanDays', () => {
  it('accepts exactly the expected days and drops unknown exercise IDs', () => {
    const days = parsePlanDays([day(8), day(9, { ids: ['09-brow-lift', '99-new-from-a-later-app'] as never })], 8, 9);
    expect(days?.[1].ids).toEqual(['09-brow-lift']);
  });

  it.each([
    ['not an array', { days: [] }],
    ['a missing day', [day(8)]],
    ['days out of order', [day(9), day(8)]],
    ['an odd kind', [day(8, { kind: 'rest' as never }), day(9)]],
    ['huge reps', [day(8, { repPct: 5000 }), day(9)]],
    ['no known exercises', [day(8, { ids: ['nope'] as never }), day(9)]],
  ])('rejects %s', (_, value) => {
    expect(parsePlanDays(value, 8, 9)).toBeNull();
  });
});

describe('planItems', () => {
  it('scales reps (at least 3) and adds hold time from the catalog values', () => {
    const e = EXERCISES['01-jaw-clench'];
    expect(planItems(day(1, { ids: ['01-jaw-clench'], repPct: 70, holdPlusSec: 2 }))).toEqual([
      { id: '01-jaw-clench', reps: Math.round(e.reps * 0.7), holdSec: e.holdSec + 2, relaxSec: e.relaxSec },
    ]);
    expect(planItems(day(1, { repPct: 30 }))[0].reps).toBeGreaterThanOrEqual(3);
  });
});

describe('planProgress', () => {
  it('starts at Level 1, Day 1', () => {
    expect(planProgress([], '2026-10-07')).toEqual({ level: 1, day: 1, completed: 0, doneToday: false, finished: false });
  });

  it('moves on only when a plan day is finished, and at most one day per calendar day', () => {
    const sessions = [session('2026-10-01', { level: 1, day: 1 }), session('2026-10-04', { level: 1, day: 2 }), session('2026-10-05')];
    // A missed day just waits; a single exercise doesn't count.
    expect(planProgress(sessions, '2026-10-07')).toMatchObject({ day: 3, completed: 2, doneToday: false });
    const today = [...sessions, session('2026-10-07', { level: 1, day: 3 })];
    const p = planProgress(today, '2026-10-07');
    expect(p).toMatchObject({ day: 3, completed: 3, doneToday: true });
    expect(nextPlanRef(p)).toBeNull();
    expect(nextPlanRef(planProgress(today, '2026-10-08'))).toEqual({ level: 1, day: 4 });
  });

  it('after day 28 the next workout starts the next level; later rounds reuse the last level', () => {
    const done = Array.from({ length: PLAN.days }, (_, i) => session(`2026-11-${String(i + 1).padStart(2, '0')}`, { level: 1, day: i + 1 }));
    const p = planProgress(done, '2026-12-10');
    expect(p).toMatchObject({ level: 1, finished: true, day: 28 });
    expect(nextPlanRef(p)).toEqual({ level: 2, day: 1 });
    expect(planProgress([...done, session('2026-12-10', { level: 2, day: 1 })], '2026-12-11')).toMatchObject({ level: 2, day: 2 });
    expect(contentLevel(5)).toBe(PLAN.contentLevels);
  });
});

describe('free days and the grid', () => {
  it('only Level 1, days 1–7 are free', () => {
    expect(isFreeDay({ level: 1, day: 7 })).toBe(true);
    expect(isFreeDay({ level: 1, day: 8 })).toBe(false);
    expect(isFreeDay({ level: 2, day: 1 })).toBe(false);
    expect([1, 7, 8, 28].map(weekOf)).toEqual([1, 1, 2, 4]);
  });

  it('shows done, today, upcoming, and locks Premium days for free users only', () => {
    const sessions = [session('2026-10-01', { level: 1, day: 1 })];
    const p = planProgress(sessions, '2026-10-02');
    const dates = planDates(sessions, p, '2026-10-02');
    const free = planGrid(p, false, dates);
    expect(free.slice(0, 3)).toEqual([
      { day: 1, status: 'done', date: '2026-10-01' },
      { day: 2, status: 'today', date: '2026-10-02' },
      { day: 3, status: 'upcoming', date: '2026-10-03' },
    ]);
    expect(free.slice(7).every((c) => c.status === 'locked')).toBe(true);
    expect(planGrid(p, true, dates).some((c) => c.status === 'locked')).toBe(false);
  });
});

describe('planDates', () => {
  it('done days keep the date they were done; days ahead fall one per day from the next free day', () => {
    // Day 1 on Thu Oct 1, day 2 on Sat Oct 3 (Friday missed), nothing yet today (Tue Oct 6).
    const sessions = [session('2026-10-01', { level: 1, day: 1 }), session('2026-10-03', { level: 1, day: 2 }), session('2026-10-05')];
    const today = '2026-10-06';
    const dates = planDates(sessions, planProgress(sessions, today), today);
    expect(dates.slice(0, 4)).toEqual(['2026-10-01', '2026-10-03', '2026-10-06', '2026-10-07']);
    expect(dates).toHaveLength(PLAN.days);
    expect(dates[PLAN.days - 1]).toBe('2026-10-31'); // day 3 today, so day 28 is 25 days later
  });

  it('when today is done, the next day falls tomorrow; other levels are ignored', () => {
    const sessions = [session('2026-10-06', { level: 2, day: 1 }), session('2026-09-02', { level: 1, day: 2 })];
    const today = '2026-10-06';
    const dates = planDates(sessions, planProgress(sessions, today), today);
    expect(dates.slice(0, 2)).toEqual(['2026-10-06', '2026-10-07']);
  });
});
