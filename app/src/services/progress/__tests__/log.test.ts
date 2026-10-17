import type { LogAction } from '@/services/ai/types';
import { defaultItem } from '@/services/workout/items';

import { loggedWorkout } from '../log';

const log = (fields: Partial<LogAction>): LogAction => ({ type: 'log', daysAgo: 0, exercises: [], minutes: null, ...fields });

describe('loggedWorkout', () => {
  it('saves the exercises the user named with their usual reps, on the day they said', () => {
    expect(loggedWorkout(log({ exercises: ['01-jaw-clench'] }), '2026-10-15')).toEqual({
      day: '2026-10-15',
      items: [defaultItem('01-jaw-clench')],
      durationSec: expect.any(Number),
    });
  });

  it('the minutes the user said win over the estimate', () => {
    const out = loggedWorkout(log({ daysAgo: 2, exercises: ['11-chin-tuck', '06-cheek-lift'], minutes: 7 }), '2026-10-15');
    expect(out).toEqual({ day: '2026-10-13', items: [defaultItem('11-chin-tuck'), defaultItem('06-cheek-lift')], durationSec: 420 });
  });

  it('only minutes is enough; nothing at all saves nothing', () => {
    expect(loggedWorkout(log({ daysAgo: 1, minutes: 10 }), '2026-10-01')).toEqual({ day: '2026-09-30', items: [], durationSec: 600 });
    expect(loggedWorkout(log({}), '2026-10-15')).toBeNull();
  });
});
