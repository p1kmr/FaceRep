import { bestStreak, currentStreak, totals, workoutDays, type SessionSummary } from '../stats';

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

describe('totals', () => {
  it('adds up workouts, seconds and reps', () => {
    expect(totals([s('2026-10-05', 60, 10), s('2026-10-06', 120, 20)])).toEqual({ workouts: 2, seconds: 180, reps: 30 });
  });
});
