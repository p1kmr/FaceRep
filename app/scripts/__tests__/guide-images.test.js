const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { OUTPUT, ROOT, render, scan, webpSize } = require('../guide-images');

/** A WebP header of the given size (all the check reads). */
function fakeWebp(width, height) {
  const buf = Buffer.alloc(30);
  buf.write('RIFF', 0, 'ascii');
  buf.write('WEBP', 8, 'ascii');
  buf.write('VP8X', 12, 'ascii');
  buf.writeUIntLE(width - 1, 24, 3);
  buf.writeUIntLE(height - 1, 27, 3);
  return buf;
}

/** The start of an MP4 file (its `ftyp` box), padded to `bytes`. */
function fakeMp4(bytes = 64) {
  const buf = Buffer.alloc(bytes);
  buf.writeUInt32BE(24, 0);
  buf.write('ftypisom', 4, 'ascii');
  return buf;
}

const roots = [];
afterAll(() => roots.forEach((root) => fs.rmSync(root, { recursive: true, force: true })));

/** A tiny project: a catalog of `ids` and the given files under assets/guides. */
function project(ids, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guides-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'src/constants'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/constants/exercises.ts'), `export const EXERCISE_IDS = [${ids.map((id) => `'${id}'`).join(', ')}] as const;`);
  for (const [file, content] of Object.entries(files)) {
    const full = path.join(root, 'assets/guides', file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return root;
}

const fullSet = (guide, ids) => ({
  [`${guide}/hero/home.webp`]: fakeWebp(1200, 675),
  [`${guide}/hero/paywall.webp`]: fakeWebp(762, 1024),
  ...Object.fromEntries(
    ids.flatMap((id) => [
      [`${guide}/exercises/${id}/relaxed.webp`, fakeWebp(758, 1024)],
      [`${guide}/exercises/${id}/exercise.webp`, fakeWebp(758, 1024)],
      [`${guide}/exercises/${id}/thumb.webp`, fakeWebp(240, 240)],
    ]),
  ),
});

describe('guide images (npm run images)', () => {
  it('the app: the man is complete, nothing is misnamed or the wrong size, the list is up to date', () => {
    const result = scan();
    expect(result.problems).toEqual([]);
    expect(result.guides.man.complete).toBe(true);
    expect(fs.readFileSync(path.join(ROOT, OUTPUT), 'utf8')).toBe(render(result));
  });

  it('the app: every exercise but Chin Lift has its clip, in both guides', () => {
    const { ids, clips } = scan();
    const expected = ids.filter((id) => id !== '02-chin-lift');
    expect(clips.man).toEqual(expected);
    expect(clips.woman).toEqual(expected);
  });

  it('lists clips where they are; a clip that is not an MP4 or too big is a problem', () => {
    const ids = ['01-a', '02-b', '03-c'];
    const root = project(ids, {
      ...fullSet('man', ids),
      'man/exercises/01-a/clip.mp4': fakeMp4(),
      'man/exercises/02-b/clip.mp4': 'not a video',
      'man/exercises/03-c/clip.mp4': fakeMp4(1_300_000),
    });
    const result = scan(root);
    expect(result.clips.man).toEqual(['01-a']);
    expect(result.problems).toEqual([
      'assets/guides/man/exercises/02-b/clip.mp4: not an MP4 file',
      'assets/guides/man/exercises/03-c/clip.mp4: 1300 KB, too big for the app (make it with videos/tools/app.py)',
    ]);
    const out = render(result);
    expect(out).toContain("clip: require('@/assets/guides/man/exercises/01-a/clip.mp4')");
    expect(out).not.toContain('02-b/clip.mp4');
  });

  it('reads the size from the WebP header', () => {
    expect(webpSize(path.join(ROOT, 'assets/guides/man/exercises/01-jaw-clench/thumb.webp'))).toEqual({ width: 240, height: 240 });
    expect(webpSize(path.join(ROOT, 'assets/brand/icon.png'))).toBeNull();
  });

  it('a guide joins the app only when complete; exercises not in the catalog yet are fine', () => {
    const ids = ['01-a', '02-b'];
    const woman = fullSet('woman', ids);
    delete woman['woman/exercises/02-b/exercise.webp'];
    const root = project(ids, { ...fullSet('man', ids), ...woman, 'woman/exercises/18-new/relaxed.webp': fakeWebp(757, 1024), 'man/.DS_Store': 'x' });
    const result = scan(root);
    expect(result.problems).toEqual([]);
    expect(result.guides.woman).toEqual({ complete: false, missing: ['woman/exercises/02-b/exercise.webp'] });
    expect(result.notes).toEqual(['woman/exercises/18-new: not in the exercise catalog yet (not bundled)']);
    const out = render(result);
    expect(out).toContain("relaxed: require('@/assets/guides/man/exercises/02-b/relaxed.webp')");
    expect(out).not.toContain('woman');
  });

  it('reports wrong sizes, frames that don\'t line up, stray files and an incomplete default guide', () => {
    const ids = ['01-a'];
    const man = fullSet('man', ids);
    man['man/exercises/01-a/exercise.webp'] = fakeWebp(760, 1024);
    man['man/hero/home.webp'] = fakeWebp(1000, 600);
    delete man['man/hero/paywall.webp'];
    const root = project(ids, { ...man, 'man/exercises/01-a/relaxed.png': 'png', 'female/hero/home.webp': fakeWebp(1200, 675) });
    const { problems } = scan(root);
    expect(problems).toEqual([
      'assets/guides/female: unknown guide folder (use man or woman)',
      'assets/guides/man/hero/home.webp: 1000×600, should be 1200×675 (run npm run images)',
      'man/exercises/01-a: relaxed (758×1024) and exercise (760×1024) must be the same size to line up',
      'assets/guides/man/exercises/01-a/relaxed.png: unexpected file (expected relaxed.webp, exercise.webp, thumb.webp, clip.mp4; run npm run images to convert PNG/JPG)',
      'The default guide (man) must be complete; missing: man/hero/paywall.webp',
    ]);
  });
});
