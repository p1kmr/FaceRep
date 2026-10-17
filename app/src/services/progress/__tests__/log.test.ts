import type { LogAction } from '@/services/ai/types';
import { defaultItem } from '@/services/workout/items';

import { loggedWorkout, type PlanToday } from '../log';

const log = (fields: Partial<LogAction>): LogAction => ({ type: 'log', daysAgo: 0, plan: false, exercises: [], minutes: null, ...fields });
const planToday: PlanToday = { ref: { level: 1, day: 5 }, items: [{ id: '09-brow-lift', reps: 12, holdSec: 4, relaxSec: 2 }] };

describe('saving a workout the Coach proposed', () => {
  it("today's plan day saves that day's exercises and counts for the plan", () => {
    expect(loggedWorkout(log({ plan: true }), '2026-10-15', planToday)).toEqual({
      day: '2026-10-15',
      items: planToday.items,
      durationSec: 3 + 12 * 6 - 2,
      plan: { level: 1, day: 5 },
    });
  });

  it('a plan day that is done, locked or not loaded saves only what the user named, without counting', () => {
    expect(loggedWorkout(log({ plan: true, exercises: ['01-jaw-clench'] }), '2026-10-15', null)).toEqual({
      day: '2026-10-15',
      items: [defaultItem('01-jaw-clench')],
      durationSec: 3 + 10 * 8 - 3,
      plan: null,
    });
    expect(loggedWorkout(log({ plan: true }), '2026-10-15', null)).toBeNull();
  });

  it('an earlier day never counts for the plan; the minutes the user said win', () => {
    const out = loggedWorkout(log({ daysAgo: 2, plan: true, exercises: ['11-chin-tuck', '06-cheek-lift'], minutes: 7 }), '2026-10-15', planToday);
    expect(out).toEqual({ day: '2026-10-13', items: [defaultItem('11-chin-tuck'), defaultItem('06-cheek-lift')], durationSec: 420, plan: null });
  });

  it('minutes alone save a workout without exercises; nothing at all saves nothing', () => {
    expect(loggedWorkout(log({ daysAgo: 1, minutes: 10 }), '2026-10-01', null)).toEqual({ day: '2026-09-30', items: [], durationSec: 600, plan: null });
    expect(loggedWorkout(log({}), '2026-10-15', planToday)).toBeNull();
  });
});
