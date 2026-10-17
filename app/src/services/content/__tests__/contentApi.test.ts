const pack = { v: 1, version: '0123456789ab', texts: {}, files: [] };
const reply = (status: number, body: unknown) => Promise.resolve({ status, ok: status >= 200 && status < 300, json: () => Promise.resolve(body) } as Response);

describe('requestPack', () => {
  const load = () => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_AI_URL = 'https://api.example.com/chat';
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- the URL is read when config loads
    return require('../contentApi') as typeof import('../contentApi');
  };

  it('sends only the app ID to /content and returns the checked pack and token', async () => {
    const { requestPack, fileUrl } = load();
    const fetchImpl = jest.fn(() => reply(200, { token: 't', expires: 5, pack }));
    await expect(requestPack('id-1', fetchImpl as unknown as typeof fetch)).resolves.toEqual({ pack: { ...pack }, token: 't', expires: 5 });
    expect(fetchImpl).toHaveBeenCalledWith('https://api.example.com/content', expect.objectContaining({ method: 'POST', body: JSON.stringify({ appUserId: 'id-1' }) }));
    expect(fileUrl('man/04-mewing/clip.mp4')).toBe('https://api.example.com/content/files/man/04-mewing/clip.mp4');
  });

  it('turns refusals into errors the app can show', async () => {
    const { requestPack } = load();
    const kind = (status: number, body: unknown = {}) =>
      requestPack('id', (() => reply(status, body)) as unknown as typeof fetch).catch((e: { kind: string }) => e.kind);
    expect(await kind(402)).toBe('premium');
    expect(await kind(429)).toBe('rateLimited');
    expect(await kind(503)).toBe('server');
    expect(await kind(200, { token: 't', expires: 5, pack: { v: 2 } })).toBe('server');
    expect(await kind(200, { expires: 5, pack })).toBe('server');
    expect(await requestPack('id', (() => Promise.reject(new Error('no network'))) as unknown as typeof fetch).catch((e: { kind: string }) => e.kind)).toBe('offline');
  });
});
