import { REMINDER } from '@/constants/reminders';

import { cleanReminder, daysPattern, planNotifications, saveProblem, scheduledCount, workoutReminder, type Reminder } from '../reminders';

const r = (over: Partial<Reminder> = {}): Reminder => ({ id: 'r1', kind: 'mewing', title: '', enabled: true, times: ['10:00'], days: [1, 2, 3, 4, 5], ...over });

describe('cleanReminder', () => {
  it('keeps valid data, sorts and dedupes times and days, trims the title', () => {
    expect(cleanReminder({ id: 'a-1', kind: 'posture', title: '  Sit tall  ', enabled: true, times: ['14:00', '09:30', '14:00'], days: [5, 1, 1] })).toEqual({
      id: 'a-1',
      kind: 'posture',
      title: 'Sit tall',
      enabled: true,
      times: ['09:30', '14:00'],
      days: [1, 5],
    });
  });

  it('unknown kind becomes custom; no valid time or day, or a bad id, is rejected', () => {
    expect(cleanReminder({ ...r(), kind: 'nap' })?.kind).toBe('custom');
    expect(cleanReminder({ ...r(), times: ['25:00'] })).toBeNull();
    expect(cleanReminder({ ...r(), days: [7] })).toBeNull();
    expect(cleanReminder({ ...r(), id: 'Robert"); DROP' })).toBeNull();
    expect(cleanReminder({ ...r(), times: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00'] })?.times).toHaveLength(REMINDER.maxTimes);
  });
});

describe('scheduling', () => {
  it('every day = one repeating notification per time; some days = one per time per day', () => {
    expect(planNotifications([workoutReminder(true, '19:30')])).toEqual([{ id: 'reminder-workout-19:30', reminderId: 'workout', hour: 19, minute: 30 }]);
    const weekdays = planNotifications([r({ times: ['10:00', '14:00'] })]);
    expect(weekdays).toHaveLength(10);
    expect(weekdays[0]).toEqual({ id: 'reminder-r1-10:00-1', reminderId: 'r1', hour: 10, minute: 0, weekday: 2 }); // iOS: 1 = Sunday
    expect(planNotifications([r({ enabled: false })])).toEqual([]);
  });

  it('stays under the iOS limit of 64 scheduled notifications', () => {
    const big = r({ times: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'], days: [0, 1, 2, 3, 4, 5] }); // 36
    expect(scheduledCount(big)).toBe(36);
    expect(saveProblem([big], { ...big, id: 'r2' })).toBe('tooManyTimes');
    expect(saveProblem([big], { ...big, id: 'r2', days: [1, 2, 3] })).toBeNull(); // 36 + 18
    expect(saveProblem([big], { ...big, times: ['08:00'] })).toBeNull(); // editing itself
    expect(planNotifications([big, { ...big, id: 'r2' }])).toHaveLength(REMINDER.maxScheduled);
    const ten = Array.from({ length: REMINDER.max }, (_, i) => r({ id: `x${i}`, enabled: false }));
    expect(saveProblem(ten, r({ id: 'new' }))).toBe('tooMany');
  });

  it('names the common day patterns', () => {
    expect([[0, 1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5], [0, 6], [1, 3]].map(daysPattern)).toEqual(['everyDay', 'weekdays', 'weekends', 'some']);
  });
});
