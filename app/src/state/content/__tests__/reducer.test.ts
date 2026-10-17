import { parsePack } from '@/services/content/pack';

import { contentDownloading, contentFailed, contentFile, contentLoaded, contentReady, retryContent } from '../actions';
import { contentReducer, initialContentState } from '../reducer';
import { selectPremiumImages } from '../selectors';

const text = { name: 'Mewing', cue: 'Cue', steps: ['Step'] };
const pack = (paths: string[]) => parsePack({ v: 1, version: '0123456789ab', texts: { en: { mewing: text } }, files: paths.map((path) => ({ path, hash: 'aaaaaaaaaaaa', size: 1 })) })!;
const MEWING = ['relaxed.webp', 'exercise.webp', 'thumb.webp'].map((f) => `man/04-mewing/${f}`);

describe('content reducer', () => {
  it('loads a pack, adds files as they arrive and ends ready', () => {
    let s = contentReducer(initialContentState, contentDownloading(0));
    expect(s.status).toBe('downloading');
    s = contentReducer(s, contentLoaded(pack(MEWING), { [MEWING[0]]: 'file:///a' }));
    s = contentReducer(s, contentFile(MEWING[1], 'file:///b', 0.6));
    expect(selectPremiumImages(s, 'man')).toEqual({});
    s = contentReducer(s, contentFile(MEWING[2], 'file:///c', 1.4));
    expect(s.progress).toBe(1);
    expect(selectPremiumImages(s, 'man')['04-mewing']?.thumb).toEqual({ uri: 'file:///c' });
    s = contentReducer(s, contentReady());
    expect(s).toMatchObject({ status: 'ready', progress: 1, error: null });
  });

  it('a new pack drops files it no longer lists', () => {
    let s = contentReducer(initialContentState, contentLoaded(pack(MEWING), { [MEWING[0]]: 'file:///a', [MEWING[1]]: 'file:///b' }));
    s = contentReducer(s, contentLoaded(pack([MEWING[1]]), {}));
    expect(s.sources).toEqual({ [MEWING[1]]: 'file:///b' });
  });

  it('fails with a reason, and Try again asks once more', () => {
    let s = contentReducer(initialContentState, contentFailed('offline'));
    expect(s).toMatchObject({ status: 'failed', error: 'offline' });
    s = contentReducer(s, retryContent());
    expect(s).toMatchObject({ status: 'idle', error: null, attempt: 1 });
    expect(selectPremiumImages(initialContentState, 'man')).toEqual({});
  });
});
