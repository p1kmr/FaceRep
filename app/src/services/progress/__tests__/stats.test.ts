import { bestStreak, currentStreak, lastDays, totals, workoutDays, type SessionSummary } from '../stats';

const s = (day: string, durationSec = 300, totalReps = 40): SessionSummary => ({
  id: day + durationSec,
  day,
  finishedAt: `${day}T18:00:00.000Z`,
  durationSec,
  totalReps,
  exerciseIds: ['01-jaw-clench'],
  kind: 'routine',
});

describe('streaks', () => {
  it('counts back from today, or from yesterday while today is still open', () => {
    const days = workoutDays([s('2026-10-04'), s('2026-10-05'), s('2026-10-06')]);
    expect(currentStreak(days, '2026-10-06')).toBe(3);
    expect(currentStreak(days, '2026-10-07')).toBe(3);
    expect(currentStreak(days, '2026-10-08')).toBe(0);
  });

  it('works across month ends', () => {
    expect(currentStreak(workoutDays([s('2026-09-30'), s('2026-10-01')]), '2026-10-01')).toBe(2);
  });

  it('best streak over all history', () => {
    const days = workoutDays([s('2026-09-01'), s('2026-09-02'), s('2026-09-03'), s('2026-09-10'), s('2026-09-11')]);
    expect(bestStreak(days)).toBe(3);
    expect(bestStreak(new Set())).toBe(0);
  });
});

describe('lastDays and totals', () => {
  it('sums seconds per day for the last 7 days, oldest first', () => {
    const week = lastDays([s('2026-10-06', 100), s('2026-10-06', 50), s('2026-10-01', 200), s('2026-09-20', 999)], '2026-10-06');
    expect(week).toHaveLength(7);
    expect(week[0]).toEqual({ day: '2026-09-30', seconds: 0 });
    expect(week[1]).toEqual({ day: '2026-10-01', seconds: 200 });
    expect(week[6]).toEqual({ day: '2026-10-06', seconds: 150 });
  });

  it('totals', () => {
    expect(totals([s('2026-10-05', 60, 10), s('2026-10-06', 120, 20)])).toEqual({ workouts: 2, seconds: 180, reps: 30 });
  });
});
