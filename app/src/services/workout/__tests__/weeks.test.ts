import { EXERCISE_IDS, EXERCISES } from '@/constants/exercises';
import { WEEKS } from '@/constants/weeks';
import type { SessionSummary } from '@/services/progress/stats';

import { countsAsDay, daysDone, dosedItem, isDayWorkout, isFreeDay, isMilestone, stepOf, weekDay, weekDone, workoutDates, workoutsBefore } from '../weeks';

const session = (day: string, kind: SessionSummary['kind'] = 'routine', extra: Partial<SessionSummary> = {}): SessionSummary => ({
  id: `${day}-${kind}-${Math.random()}`,
  day,
  finishedAt: `${day}T08:00:00.000Z`,
  durationSec: 300,
  totalReps: 40,
  exerciseIds: ['02-chin-lift'],
  kind,
  ...extra,
});

describe('days done', () => {
  it('counts dates with a routine or a Coach-logged workout before today, once per date', () => {
    const sessions = [
      session('2026-10-01'),
      session('2026-10-01'),
      session('2026-10-03'),
      session('2026-10-04', 'single'),
      session('2026-10-05', 'routine', { logged: true }),
      session('2026-10-06', 'single', { logged: true }),
      session('2026-10-17'),
      session('2026-10-20'),
    ];
    expect(daysDone(sessions, '2026-10-17')).toBe(4);
    expect(daysDone([], '2026-10-17')).toBe(0);
  });

  it('lists the dates oldest first, so the n-th date is day n', () => {
    const sessions = [session('2026-10-05'), session('2026-10-01'), session('2026-10-03'), session('2026-10-03'), session('2026-10-17')];
    expect(workoutDates(sessions, '2026-10-17')).toEqual(['2026-10-01', '2026-10-03', '2026-10-05']);
  });

  it("doesn't count a single exercise from the library as the day's workout", () => {
    expect(isDayWorkout(session('2026-10-04', 'single'))).toBe(false);
    expect(isDayWorkout(session('2026-10-04', 'single', { logged: true }))).toBe(true);
  });

  it("doesn't count Today's workout ended before half of it: the day waits", () => {
    expect(isDayWorkout(session('2026-10-04', 'routine', { short: true }))).toBe(false);
    expect(daysDone([session('2026-10-01'), session('2026-10-02', 'routine', { short: true })], '2026-10-17')).toBe(1);
    // A full one the same date still makes it that date's workout.
    expect(daysDone([session('2026-10-02', 'routine', { short: true }), session('2026-10-02')], '2026-10-17')).toBe(1);
  });

  it('counts a workout as the day once at least half of its exercises are done', () => {
    expect(countsAsDay({ finished: 3, planned: 5 })).toBe(true);
    expect(countsAsDay({ finished: 2, planned: 5 })).toBe(false);
    expect(countsAsDay({ finished: 2, planned: 3 })).toBe(true);
    expect(countsAsDay({ finished: 1, planned: 3 })).toBe(false);
    expect(countsAsDay({ finished: 1, planned: 1 })).toBe(true);
    expect(countsAsDay({ finished: 0, planned: 0 })).toBe(false);
  });
});

describe('free days', () => {
  it('without Premium days 1 to 3 are open, day 4 on is locked', () => {
    expect(WEEKS.freeDays).toBe(3);
    expect([0, 1, 2, 3, 4, 30].map(isFreeDay)).toEqual([true, true, true, false, false, false]);
    expect(isFreeDay(-1)).toBe(true);
  });
});

describe('week and day', () => {
  it('starts at week 1, day 1, and day 7 is the easy day', () => {
    expect(weekDay(0)).toEqual({ week: 1, day: 1, easy: false });
    expect(weekDay(5)).toEqual({ week: 1, day: 6, easy: false });
    expect(weekDay(6)).toEqual({ week: 1, day: 7, easy: true });
    expect(weekDay(7)).toEqual({ week: 2, day: 1, easy: false });
    expect(weekDay(-3)).toEqual({ week: 1, day: 1, easy: false });
  });

  it('never ends', () => {
    expect(weekDay(69)).toEqual({ week: 10, day: 7, easy: true });
    expect(weekDay(7 * 200)).toEqual({ week: 201, day: 1, easy: false });
  });

  it('counts the workout days before one, without the easy days', () => {
    expect([0, 1, 6, 7, 13, 14, 15].map(workoutsBefore)).toEqual([0, 1, 6, 6, 12, 12, 13]);
  });
});

describe('steps', () => {
  it('starts gentle, without the jaw, and stops at a top that stays', () => {
    expect(stepOf(1)).toMatchObject({ note: 'learn', repPct: 70, holdPlusSec: 0, jaw: false });
    expect(stepOf(2)).toMatchObject({ note: 'build', repPct: 85, jaw: true });
    expect(stepOf(3)).toMatchObject({ note: 'full', repPct: 100, holdPlusSec: 0 });
    expect([4, 5, 7].map((w) => stepOf(w).note)).toEqual(['hold1', 'hold1', 'hold1']);
    expect([8, 9, 52, 500].map((w) => stepOf(w).note)).toEqual(['hold2', 'hold2', 'hold2', 'hold2']);
    expect(stepOf(0).note).toBe('learn');
  });

  it('never gets lighter from one week to the next', () => {
    for (let w = 1; w < 60; w++) {
      expect(stepOf(w + 1).repPct).toBeGreaterThanOrEqual(stepOf(w).repPct);
      expect(stepOf(w + 1).holdPlusSec).toBeGreaterThanOrEqual(stepOf(w).holdPlusSec);
    }
  });

  it('marks the milestone weeks', () => {
    expect(WEEKS.milestones.every(isMilestone)).toBe(true);
    expect([1, 5, 53].some(isMilestone)).toBe(false);
  });
});

describe('dosed exercises', () => {
  it('takes a share of the reps, at least the minimum, and adds to the hold', () => {
    expect(dosedItem('09-brow-lift', 70, 2)).toEqual({ id: '09-brow-lift', reps: 7, holdSec: 5, relaxSec: 2 });
    expect(dosedItem('04-mewing', 70, 0).reps).toBe(WEEKS.minReps);
    expect(dosedItem('09-brow-lift', 100, 0)).toEqual({ id: '09-brow-lift', reps: 10, holdSec: 3, relaxSec: 2 });
  });

  it('never gives a jaw-caution exercise more than its usual reps or hold', () => {
    for (const id of EXERCISE_IDS.filter((x) => EXERCISES[x].jawCaution)) {
      for (const [pct, plus] of [[100, 2], [150, 5]]) {
        const item = dosedItem(id, pct, plus);
        expect(item.reps).toBeLessThanOrEqual(EXERCISES[id].reps);
        expect(item.holdSec).toBe(EXERCISES[id].holdSec);
      }
    }
  });
});

describe('this week done', () => {
  const dates = (n: number) => Array.from({ length: n }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`);

  it("is this week's dates only, day 1 first, with today once it has a workout", () => {
    const nine = dates(9).map((d) => session(d));
    expect(weekDone(nine, '2026-10-17').map((d) => d.date)).toEqual(['2026-09-08', '2026-09-09']);
    expect(weekDone([...nine, session('2026-10-17')], '2026-10-17').map((d) => d.date)).toEqual(['2026-09-08', '2026-09-09', '2026-10-17']);
    expect(weekDone([...nine, session('2026-10-17', 'single')], '2026-10-17')).toHaveLength(2);
    expect(weekDone([...nine, session('2026-10-17', 'routine', { short: true })], '2026-10-17')).toHaveLength(2);
    expect(weekDone(dates(7).map((d) => session(d)), '2026-10-17')).toEqual([]);
    expect(weekDone([], '2026-10-17')).toEqual([]);
  });

  it("is what was done that date: each exercise once in the order done and the minutes, not a library exercise's", () => {
    const [day] = weekDone(
      [
        session('2026-10-01', 'routine', { finishedAt: '2026-10-01T19:00:00.000Z', exerciseIds: ['01-jaw-clench', '02-chin-lift'], durationSec: 120 }),
        session('2026-10-01', 'routine', { finishedAt: '2026-10-01T08:00:00.000Z', exerciseIds: ['02-chin-lift', '19-pout'], durationSec: 200 }),
        session('2026-10-01', 'single', { exerciseIds: ['10-eye-squeeze'], durationSec: 60 }),
      ],
      '2026-10-17',
    );
    expect(day).toEqual({ date: '2026-10-01', ids: ['02-chin-lift', '19-pout', '01-jaw-clench'], seconds: 320 });
  });

  it('keeps a workout saved through the Coach with only minutes as done, with no exercises', () => {
    const [day] = weekDone([session('2026-10-01', 'routine', { logged: true, exerciseIds: [], durationSec: 300 })], '2026-10-17');
    expect(day).toEqual({ date: '2026-10-01', ids: [], seconds: 300 });
  });
});
