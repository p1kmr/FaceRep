jest.mock('@/constants/config', () => ({ CONFIG: { planUrl: 'https://example.test/plan', planTimeoutMs: 1000 } }));

// eslint-disable-next-line import/first
import { CATALOG_VERSION } from '@/constants/exercises';
// eslint-disable-next-line import/first
import { PlanRequestError, premiumRange, requestPlanDays } from '../planApi';

const input = { appUserId: '0f8fad5b-d9cb-469f-a165-70867728950e', goal: 'jawline' as const, level: 1 };
const days = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ day: from + i, kind: 'workout', ids: ['01-jaw-clench'], repPct: 85, holdPlusSec: 0 }));
const respond = (status: number, body: unknown) => jest.fn(async () => ({ status, ok: status < 300, json: async () => body }) as Response);

describe('plan API', () => {
  it('sends only the app ID, goal, level and catalog version, and returns the checked days', async () => {
    const fetchImpl = respond(200, { goal: 'jawline', level: 1, days: days(8, 28) });
    const result = await requestPlanDays(input, fetchImpl);
    expect(result.map((d) => d.day)).toEqual(days(8, 28).map((d) => d.day));
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://example.test/plan');
    expect(JSON.parse(init.body as string)).toEqual({ ...input, catalog: CATALOG_VERSION });
  });

  it('asks rounds after Level 3 for Level 3, and checks the day range', async () => {
    const fetchImpl = respond(200, { days: days(1, 28) });
    await requestPlanDays({ ...input, level: 5 }, fetchImpl);
    expect(JSON.parse((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).level).toBe(3);
    expect(premiumRange(1)).toEqual({ from: 8, to: 28 });
    await expect(requestPlanDays(input, respond(200, { days: days(1, 28) }))).rejects.toEqual(new PlanRequestError('server'));
  });

  it.each([
    [402, 'premium'],
    [429, 'rateLimited'],
    [503, 'server'],
  ])('maps HTTP %i to %s', async (status, kind) => {
    await expect(requestPlanDays(input, respond(status, {}))).rejects.toEqual(new PlanRequestError(kind as never));
  });

  it('network failure → offline', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error('down');
    });
    await expect(requestPlanDays(input, fetchImpl)).rejects.toMatchObject({ kind: 'offline' });
  });
});
