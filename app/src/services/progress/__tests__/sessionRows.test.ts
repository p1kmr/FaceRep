import { toSummary, type SessionRow } from '../sessionRows';

const row = (fields: Partial<SessionRow>): SessionRow => ({
  id: 's1',
  day: '2026-10-17',
  finished_at: '2026-10-17T07:41:00.000Z',
  duration_sec: 300,
  total_reps: 18,
  kind: 'routine',
  exercises: null,
  ...fields,
});

describe('toSummary', () => {
  it('reads each exercise with the reps it did, in the order done', () => {
    expect(toSummary(row({ exercises: '06-cheek-lift:10,02-chin-lift:8' }))).toEqual({
      id: 's1',
      day: '2026-10-17',
      finishedAt: '2026-10-17T07:41:00.000Z',
      durationSec: 300,
      totalReps: 18,
      exerciseIds: ['06-cheek-lift', '02-chin-lift'],
      exerciseReps: [10, 8],
      kind: 'routine',
    });
  });

  it('leaves out an exercise no longer in the catalog together with its reps', () => {
    const s = toSummary(row({ exercises: '06-cheek-lift:10,99-gone:5,19-pout:3' }));
    expect(s.exerciseIds).toEqual(['06-cheek-lift', '19-pout']);
    expect(s.exerciseReps).toEqual([10, 3]);
  });

  it('a workout with only minutes has no exercises', () => {
    const s = toSummary(row({ exercises: null, kind: 'logged', total_reps: 0 }));
    expect(s.exerciseIds).toEqual([]);
    expect(s.exerciseReps).toEqual([]);
  });

  it('kind: single, saved through the Coach, or ended before half was done', () => {
    expect(toSummary(row({ kind: 'single', exercises: '19-pout:1' }))).toMatchObject({ kind: 'single' });
    expect(toSummary(row({ kind: 'logged' }))).toMatchObject({ kind: 'routine', logged: true });
    expect(toSummary(row({ kind: 'short' }))).toMatchObject({ kind: 'routine', short: true });
    expect(toSummary(row({ kind: 'routine' }))).not.toHaveProperty('logged');
  });
});
