import { CONFIG } from '@/constants/config';
import type { GuideId } from '@/constants/guides';

import { ContentRequestError, type PackReply } from '../contentApi';
import { fileInfo, localName, parsePack, type Pack, type PackFileInfo } from '../pack';
import type { ContentStore, SavedPack } from '../store';
import { syncContent, type SyncDeps, type SyncEvents } from '../sync';

const text = { name: 'Mewing', cue: 'Cue', steps: ['Step'] };
const files = ['relaxed.webp', 'exercise.webp', 'thumb.webp', 'clip.mp4'];
const makePack = (hash = 'aaaaaaaaaaaa'): Pack =>
  parsePack({
    v: 1,
    version: hash.replace(/a/g, 'b'),
    texts: { en: { mewing: text } },
    files: ['man', 'woman'].flatMap((g) => files.map((f) => ({ path: `${g}/04-mewing/${f}`, hash, size: 10 }))),
  })!;

/** A device in memory: the saved pack and the files on it, by their local name. */
function fakeStore(saved: SavedPack | null = null, have: string[] = []) {
  const disk = new Set(have);
  const key = (f: PackFileInfo) => `${f.guide}/${f.id}/${localName(f)}`;
  const store: ContentStore & { saved: SavedPack | null; disk: Set<string>; downloads: string[] } = {
    saved,
    disk,
    downloads: [],
    read: () => store.saved,
    write: (s) => {
      store.saved = s;
    },
    local: (f) => (disk.has(key(f)) ? `file:///${key(f)}` : null),
    download: async (f, url, token) => {
      store.downloads.push(`${url}#${token}`);
      disk.add(key(f));
      return `file:///${key(f)}`;
    },
    prune: (pack) => {
      const keep = new Set(pack.files.map((f) => key(fileInfo(f)!)));
      for (const k of [...disk]) if (!keep.has(k)) disk.delete(k);
    },
  };
  return store;
}

function run(store: ContentStore, request: SyncDeps['request'], { now = 1_000_000, guide = 'man' }: { now?: number; guide?: GuideId } = {}) {
  const log: string[] = [];
  const texts: unknown[] = [];
  const on: SyncEvents = {
    loaded: (pack, sources) => log.push(`loaded ${pack.version} ${Object.keys(sources).length}`),
    downloading: (p) => log.push(`downloading ${p}`),
    file: (_path, _source, p) => log.push(`file ${p}`),
    ready: () => log.push('ready'),
    failed: (e) => log.push(`failed ${e}`),
    cancelled: () => false,
  };
  const deps: SyncDeps = { store, request, addTexts: (t) => texts.push(t), fileUrl: (p) => `https://w/content/files/${p}`, now: () => now };
  return syncContent({ appUserId: 'id', guide }, deps, on).then(() => ({ log, texts }));
}

const answer = (pack: Pack): SyncDeps['request'] => async (): Promise<PackReply> => ({ pack, token: 'tok', expires: 0 });

describe('premium content sync', () => {
  it('first time: asks the Worker, keeps the pack, downloads the guide\'s files with the token, then ready', async () => {
    const store = fakeStore();
    const { log, texts } = await run(store, answer(makePack()));
    expect(log).toEqual(['downloading 0', 'loaded bbbbbbbbbbbb 0', 'file 0.25', 'file 0.5', 'file 0.75', 'file 1', 'ready']);
    expect(store.downloads).toHaveLength(4);
    expect(store.downloads[0]).toBe('https://w/content/files/man/04-mewing/relaxed.webp#tok');
    expect(store.saved?.checkedAt).toBe(1_000_000);
    expect(texts).toEqual([{ en: { mewing: text } }]);
  });

  it('all on the device and checked today: shows it at once and asks nobody', async () => {
    const pack = makePack();
    const have = files.map((f) => `man/04-mewing/${f.replace('.', '-aaaaaaaaaaaa.')}`);
    const store = fakeStore({ pack, checkedAt: 1_000_000 }, have);
    const request = jest.fn(answer(pack));
    const { log } = await run(store, request, { now: 1_000_000 + CONFIG.contentRefreshMs - 1 });
    expect(log).toEqual(['loaded bbbbbbbbbbbb 4', 'ready']);
    expect(request).not.toHaveBeenCalled();
  });

  it('a day later: asks again, downloads only what changed and deletes the old file', async () => {
    const old = makePack();
    const have = files.map((f) => `man/04-mewing/${f.replace('.', '-aaaaaaaaaaaa.')}`);
    const store = fakeStore({ pack: old, checkedAt: 0 }, have);
    const updated = parsePack({ ...old, version: 'cccccccccccc', files: old.files.map((f) => (f.path.endsWith('clip.mp4') ? { ...f, hash: 'dddddddddddd' } : f)) })!;
    const { log } = await run(store, answer(updated), { now: CONFIG.contentRefreshMs + 1 });
    expect(store.downloads).toEqual(['https://w/content/files/man/04-mewing/clip.mp4#tok']);
    expect(store.disk.has('man/04-mewing/clip-aaaaaaaaaaaa.mp4')).toBe(false);
    expect(store.disk.has('man/04-mewing/clip-dddddddddddd.mp4')).toBe(true);
    expect(log.at(-1)).toBe('ready');
  });

  it('offline with everything on the device still works; with something missing it fails', async () => {
    const pack = makePack();
    const have = files.map((f) => `man/04-mewing/${f.replace('.', '-aaaaaaaaaaaa.')}`);
    const offline = async () => {
      throw new ContentRequestError('offline');
    };
    expect((await run(fakeStore({ pack, checkedAt: 0 }, have), offline, { now: CONFIG.contentRefreshMs * 2 })).log.at(-1)).toBe('ready');
    // The woman's pictures were never downloaded.
    expect((await run(fakeStore({ pack, checkedAt: 0 }, have), offline, { guide: 'woman' })).log.at(-1)).toBe('failed offline');
    const notPremium = async () => {
      throw new ContentRequestError('premium');
    };
    expect((await run(fakeStore(), notPremium)).log).toEqual(['downloading 0', 'failed premium']);
  });

  it('a file that fails stops the download: failed, and the next try picks up where it stopped', async () => {
    const store = fakeStore();
    let calls = 0;
    const flaky = { ...store, download: async (f: PackFileInfo, url: string, token: string) => (++calls === 3 ? Promise.reject(new Error('cut')) : store.download(f, url, token)) };
    const first = await run(flaky, answer(makePack()));
    expect(first.log.at(-1)).toBe('failed offline');
    const second = await run(store, answer(makePack()));
    expect(second.log.at(-1)).toBe('ready');
    expect(store.downloads.length).toBe(4);
  });
});
