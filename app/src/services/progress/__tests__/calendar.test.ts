import { canGoBack, canGoForward, dayTotals, monthWeeks, periodOf, shiftAnchor, startOfWeek, summarize, weekDays, yearMonths } from '../calendar';
import type { SessionSummary } from '../stats';

const MON = 1;
const SUN = 0;
let seq = 0;
const s = (day: string, durationSec = 60): SessionSummary => ({
  id: `s${seq++}`,
  day,
  finishedAt: `${day}T08:00:00.000Z`,
  durationSec,
  totalReps: 10,
  exerciseIds: ['09-brow-lift'],
  kind: 'routine',
});

describe('weeks', () => {
  it('start on the first weekday from the iPhone settings', () => {
    // Thursday 2026-10-08
    expect(startOfWeek('2026-10-08', MON)).toBe('2026-10-05');
    expect(startOfWeek('2026-10-08', SUN)).toBe('2026-10-04');
    expect(startOfWeek('2026-10-05', MON)).toBe('2026-10-05');
    expect(startOfWeek('2026-10-04', MON)).toBe('2026-09-28'); // a Sunday belongs to the week before
    expect(weekDays('2026-10-08', MON)).toEqual(['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11']);
  });
});

describe('months', () => {
  it('October 2026 starts on a Thursday: 5 rows from Monday, padded with nulls', () => {
    const rows = monthWeeks('2026-10-17', MON);
    expect(rows).toHaveLength(5);
    expect(rows[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
    expect(rows[4]).toEqual(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', null]);
    expect(rows.flat().filter(Boolean)).toHaveLength(31);
  });

  it('a month can need 6 rows', () => {
    expect(monthWeeks('2026-08-01', MON)).toHaveLength(6); // Aug 1 2026 is a Saturday
    expect(periodOf('2028-02-10', 'month', MON)).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });
});

describe('paging', () => {
  it('moves a week, a month (across years) or a year, and never into the future', () => {
    expect(shiftAnchor('2026-10-08', 'week', -1)).toBe('2026-10-01');
    expect(shiftAnchor('2026-01-31', 'month', -1)).toBe('2025-12-01');
    expect(shiftAnchor('2026-12-15', 'month', 1)).toBe('2027-01-01');
    expect(shiftAnchor('2026-10-08', 'year', -1)).toBe('2025-01-01');
    expect(canGoForward('2026-10-08', 'week', MON, '2026-10-08')).toBe(false);
    expect(canGoForward('2026-09-20', 'month', MON, '2026-10-08')).toBe(true);
    expect(canGoForward('2026-01-01', 'year', MON, '2026-10-08')).toBe(false);
  });

  it('never goes back past the period of the first workout', () => {
    expect(canGoBack('2026-10-08', 'month', MON, '2026-09-20')).toBe(true);
    expect(canGoBack('2026-09-25', 'month', MON, '2026-09-20')).toBe(false);
    expect(canGoBack('2026-09-21', 'week', MON, '2026-09-20')).toBe(true); // Sep 20 is a Sunday: the week before
    expect(canGoBack('2026-10-08', 'year', MON, '2026-01-01')).toBe(false);
  });
});

describe('totals', () => {
  const totals = dayTotals([s('2026-10-06', 100), s('2026-10-06', 50), s('2026-10-01', 200), s('2026-09-20', 999), s('2025-12-31', 30)]);

  it('adds up per day and per period', () => {
    expect(totals.get('2026-10-06')).toEqual({ workouts: 2, seconds: 150 });
    expect(summarize(totals, periodOf('2026-10-08', 'week', MON))).toEqual({ days: 1, workouts: 2, seconds: 150 });
    expect(summarize(totals, periodOf('2026-10-08', 'month', MON))).toEqual({ days: 2, workouts: 3, seconds: 350 });
  });

  it('gives the 12 small months of the year view, each with its grid and totals', () => {
    const months = yearMonths('2026-10-08', MON, totals);
    expect(months).toHaveLength(12);
    expect(months[8]).toMatchObject({ month: '2026-09-01', days: 1, workouts: 1, seconds: 999 });
    expect(months[9]).toMatchObject({ month: '2026-10-01', days: 2, workouts: 3 });
    expect(months[9].weeks).toEqual(monthWeeks('2026-10-01', MON));
    expect(months.reduce((n, m) => n + m.workouts, 0)).toBe(4); // last year's workout isn't counted
  });
});
