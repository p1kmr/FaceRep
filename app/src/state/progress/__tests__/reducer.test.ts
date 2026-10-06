import type { SessionSummary } from '@/services/progress/stats';

import { hydrateProgress, resetProgress, sessionAdded } from '../actions';
import { initialProgressState, progressReducer } from '../reducer';

const s = (id: string, finishedAt: string): SessionSummary => ({
  id,
  day: finishedAt.slice(0, 10),
  finishedAt,
  durationSec: 60,
  totalReps: 10,
  exerciseIds: [],
  kind: 'routine',
});

describe('progressReducer', () => {
  it('hydrates newest first and adds without duplicates', () => {
    let st = progressReducer(initialProgressState, hydrateProgress([s('a', '2026-10-01T10:00:00Z'), s('b', '2026-10-03T10:00:00Z')]));
    expect(st.sessions.map((x) => x.id)).toEqual(['b', 'a']);
    st = progressReducer(st, sessionAdded(s('c', '2026-10-06T10:00:00Z')));
    expect(progressReducer(st, sessionAdded(s('c', '2026-10-06T10:00:00Z')))).toBe(st);
    expect(st.sessions.map((x) => x.id)).toEqual(['c', 'b', 'a']);
    expect(progressReducer(st, resetProgress())).toEqual({ hydrated: true, sessions: [] });
  });
});
