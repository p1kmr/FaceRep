import { EXERCISES } from '@/constants/exercises';

import { fileInfo, filesOf, localName, packImages, parsePack, progressOf, type Pack } from '../pack';

const text = { name: 'Mewing', cue: 'Rest your tongue on the palate.', steps: ['Close your lips.', 'Breathe through your nose.'] };
const file = (path: string, size = 100, hash = 'aaaaaaaaaaaa') => ({ path, hash, size });
const raw = {
  v: 1,
  version: '0123456789ab',
  texts: { en: { mewing: text, chinLift: text, notAnExercise: text }, de: { mewing: text }, xx: { mewing: text } },
  files: [
    file('man/04-mewing/relaxed.webp'),
    file('man/04-mewing/exercise.webp'),
    file('man/04-mewing/thumb.webp', 10),
    file('man/04-mewing/clip.mp4', 300),
    file('woman/04-mewing/thumb.webp'),
    file('man/02-chin-lift/thumb.webp'),
    file('man/99-unknown/thumb.webp'),
    file('man/04-mewing/notes.txt'),
    { path: '../pack.json', hash: 'aaaaaaaaaaaa', size: 1 },
    file('man/04-mewing/relaxed.webp', 0),
  ],
};

describe('premium pack', () => {
  it('keeps only Premium exercises, the app\'s languages and real files', () => {
    const pack = parsePack(raw)!;
    expect(pack.version).toBe('0123456789ab');
    expect(Object.keys(pack.texts).sort()).toEqual(['de', 'en']);
    // A free exercise's text never comes from the pack (it's in the app), nor an unknown key.
    expect(Object.keys(pack.texts.en)).toEqual(['mewing']);
    expect(pack.files.map((f) => f.path)).toEqual([
      'man/04-mewing/relaxed.webp',
      'man/04-mewing/exercise.webp',
      'man/04-mewing/thumb.webp',
      'man/04-mewing/clip.mp4',
      'woman/04-mewing/thumb.webp',
    ]);
  });

  it('rejects a wrong shape and drops texts that are too long or empty', () => {
    for (const bad of [null, 'x', { ...raw, v: 2 }, { ...raw, version: 'abc' }, { ...raw, files: 'x' }, { ...raw, texts: null }]) expect(parsePack(bad)).toBeNull();
    const long = parsePack({ ...raw, texts: { en: { mewing: { ...text, name: 'x'.repeat(301) }, tonguePress: { ...text, steps: [] } } } })!;
    expect(long.texts.en).toEqual({});
  });

  it('names files by hash, splits them by guide and counts progress by size', () => {
    const pack = parsePack(raw)!;
    const man = filesOf(pack, 'man');
    expect(man.map((f) => f.kind)).toEqual(['relaxed', 'exercise', 'thumb', 'clip']);
    expect(localName(man[3])).toBe('clip-aaaaaaaaaaaa.mp4');
    expect(localName(fileInfo(file('woman/04-mewing/thumb.webp'))!)).toBe('thumb-aaaaaaaaaaaa.webp');
    expect(progressOf(man, {})).toBe(0);
    expect(progressOf(man, { 'man/04-mewing/clip.mp4': 'file:///clip' })).toBeCloseTo(300 / 510);
    expect(progressOf([], {})).toBe(1);
  });

  it('an exercise shows only with all its files and its texts', () => {
    const pack = parsePack(raw)!;
    const all = Object.fromEntries(pack.files.map((f) => [f.path, `file:///${f.path}`]));
    expect(packImages(pack, 'man', all)).toEqual({
      '04-mewing': {
        relaxed: { uri: 'file:///man/04-mewing/relaxed.webp' },
        exercise: { uri: 'file:///man/04-mewing/exercise.webp' },
        thumb: { uri: 'file:///man/04-mewing/thumb.webp' },
        clip: 'file:///man/04-mewing/clip.mp4',
      },
    });
    // The clip is still downloading: not yet.
    const { ['man/04-mewing/clip.mp4']: _clip, ...noClip } = all;
    expect(packImages(pack, 'man', noClip)).toEqual({});
    // The woman's set has only a thumbnail: not complete.
    expect(packImages(pack, 'woman', all)).toEqual({});
    // No English text: not shown either.
    expect(packImages({ ...pack, texts: {} } as Pack, 'man', all)).toEqual({});
    expect(EXERCISES['04-mewing'].key).toBe('mewing');
  });
});
