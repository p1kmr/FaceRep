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
  reminders: [{ id: 'workout', title: '', kind: 'workout' as const, enabled: true, times: ['19:00'], days: [0, 1, 2, 3, 4, 5, 6] }],
};

const respond = (status: number, body: unknown) => jest.fn(async () => ({ status, ok: status < 300, json: async () => body }) as Response);

describe('AI client', () => {
  it('parses and trims answers; rejects anything else', () => {
    expect(parseChatReply({ answer: '  Hi  ' })).toEqual({ answer: 'Hi', actions: [] });
    expect(parseChatReply({ answer: '' })).toBeNull();
    expect(parseChatReply(null)).toBeNull();
    expect(parseChatReply({ answer: 'x'.repeat(5000) })?.answer).toHaveLength(1500);
  });

  it('checks proposed reminder changes again; an answer can be only a proposal', () => {
    const reply = parseChatReply({
      answer: '',
      actions: [
        { type: 'create', kind: 'mewing', title: 'Tongue up', times: ['14:00', '10:00'], days: [5, 1] },
        { type: 'create', kind: 'nap', times: ['09:00'], days: [0] },
        { type: 'create', times: ['7pm'], days: [1] },
        { type: 'update', id: 'workout', enabled: false },
        { type: 'update', id: 'workout' },
        { type: 'update', id: 'workout', times: ['bad'] },
        { type: 'delete', id: 'workout' },
        { type: 'format_disk' },
      ],
    });
    expect(reply).toEqual({
      answer: '',
      actions: [
        { type: 'create', kind: 'mewing', title: 'Tongue up', times: ['10:00', '14:00'], days: [1, 5] },
        { type: 'create', kind: 'custom', title: '', times: ['09:00'], days: [0] },
        { type: 'update', id: 'workout', enabled: false },
      ],
    });
    expect(parseChatReply({ answer: '', actions: [{ type: 'delete' }] })).toBeNull();
  });

  it('sends the DeviceCheck token with the question', async () => {
    const fetchImpl = respond(200, { answer: 'Keep your tongue flat on the palate.' });
    await expect(requestChat(input, fetchImpl)).resolves.toEqual({ answer: 'Keep your tongue flat on the palate.', actions: [] });
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
