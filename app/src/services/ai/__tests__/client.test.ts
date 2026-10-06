import { AiRequestError } from '../types';

jest.mock('@/constants/config', () => ({ CONFIG: { aiUrl: 'https://example.test/chat', aiTimeoutMs: 1000 } }));
jest.mock('../deviceCheck', () => ({ getDeviceCheckToken: async () => 'dGVzdHRva2VuMTIzNDU2Nzg=' }));

// eslint-disable-next-line import/first
import { parseChatReply, requestChat } from '../client';

const input = {
  appUserId: '0f8fad5b-d9cb-469f-a165-70867728950e',
  locale: 'en',
  question: 'How do I mew?',
  history: [],
  context: { goal: 'jawline' as const, streak: 2, workoutsLast7Days: 3 },
};

const respond = (status: number, body: unknown) => jest.fn(async () => ({ status, ok: status < 300, json: async () => body }) as Response);

describe('AI client', () => {
  it('parses and trims answers; rejects anything else', () => {
    expect(parseChatReply({ answer: '  Hi  ' })).toEqual({ answer: 'Hi' });
    expect(parseChatReply({ answer: '' })).toBeNull();
    expect(parseChatReply(null)).toBeNull();
    expect(parseChatReply({ answer: 'x'.repeat(5000) })?.answer).toHaveLength(1500);
  });

  it('sends the DeviceCheck token with the question', async () => {
    const fetchImpl = respond(200, { answer: 'Keep your tongue flat on the palate.' });
    await expect(requestChat(input, fetchImpl)).resolves.toEqual({ answer: 'Keep your tongue flat on the palate.' });
    const body = JSON.parse((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body).toMatchObject({ ...input, deviceToken: 'dGVzdHRva2VuMTIzNDU2Nzg=' });
  });

  it.each([
    [429, 'rateLimited'],
    [402, 'freeUsed'],
    [403, 'device'],
    [500, 'server'],
  ])('maps HTTP %i to %s', async (status, kind) => {
    await expect(requestChat(input, respond(status, {}))).rejects.toEqual(new AiRequestError(kind as never));
  });

  it('network failure → offline', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error('down');
    });
    await expect(requestChat(input, fetchImpl)).rejects.toMatchObject({ kind: 'offline' });
  });
});
