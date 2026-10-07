/**
 * Keeps the exercise pictures manageable (docs/images.md). One folder per guide and exercise:
 *
 *   assets/guides/<man|woman>/hero/home.webp, paywall.webp
 *   assets/guides/<man|woman>/exercises/<exercise id>/relaxed.webp, exercise.webp, thumb.webp
 *
 * npm run images        Converts new pictures (PNG/JPG, or WebP of another size) to WebP at the app's
 *                       size, cuts missing thumbnails from the exercise frame, then writes
 *                       src/constants/guideImages.generated.ts. Metro only bundles static require()
 *                       paths, so the list of files has to be written out; this script does it.
 * npm run images:check  Changes nothing. Fails when a picture is missing from the default guide, has
 *                       the wrong size or name, or the generated list is out of date. (Also a test.)
 *
 * Only complete guides go into the app, so the Woman option appears by itself once her last picture
 * is in. Folders for exercises that aren't in the catalog yet are allowed (and not bundled).
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const GUIDES_DIR = 'assets/guides';
const OUTPUT = 'src/constants/guideImages.generated.ts';
/** Same as src/constants/guides.ts. */
const GUIDE_IDS = ['man', 'woman'];
const DEFAULT_GUIDE = 'man';

/**
 * Size of every file. New pictures are made exactly this size; a frame may be a few pixels wider or
 * narrower (the first set is 756–760 wide), as long as its relaxed and exercise frames match.
 */
const SIZES = {
  frame: { width: 757, height: 1024, minWidth: 740, maxWidth: 780 },
  thumb: { width: 240, height: 240 },
  home: { width: 1200, height: 675 },
  paywall: { width: 762, height: 1024 },
};
const HEROES = ['home', 'paywall'];
const FRAMES = ['relaxed', 'exercise'];
const EXERCISE_FILES = [...FRAMES, 'thumb'];
/** The thumbnail is a full-width square of the exercise frame, this far from the top (the face). */
const THUMB_TOP = 62 / 1024;
const SOURCE_EXTS = ['.webp', '.png', '.jpg', '.jpeg'];
const WEBP = { quality: 82, effort: 6 };

const listDir = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => !n.startsWith('.')).sort() : []);
const rel = (root, file) => path.relative(root, file).split(path.sep).join('/');
const fits = (actual, size) =>
  !!actual && actual.height === size.height && actual.width >= (size.minWidth ?? size.width) && actual.width <= (size.maxWidth ?? size.width);
const sizeText = (size) => (size.minWidth ? `${size.minWidth}–${size.maxWidth}×${size.height}` : `${size.width}×${size.height}`);

/** EXERCISE_IDS from src/constants/exercises.ts (the catalog), in its order. */
function readExerciseIds(root) {
  const source = fs.readFileSync(path.join(root, 'src/constants/exercises.ts'), 'utf8');
  const block = source.match(/EXERCISE_IDS = \[([\s\S]*?)\] as const/);
  if (!block) throw new Error('EXERCISE_IDS not found in src/constants/exercises.ts');
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

/** Width and height from a WebP header (no image library needed), or null when it isn't a WebP. */
function webpSize(file) {
  const buf = Buffer.alloc(30);
  const fd = fs.openSync(file, 'r');
  const read = fs.readSync(fd, buf, 0, 30, 0);
  fs.closeSync(fd);
  if (read < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
  }
  return null;
}

/**
 * What's in assets/guides: per guide whether it's complete and what's missing; `problems` are
 * mistakes to fix (wrong size, unknown file), `notes` are fine (exercises waiting for the catalog).
 */
function scan(root = ROOT) {
  const ids = readExerciseIds(root);
  const base = path.join(root, GUIDES_DIR);
  const problems = [];
  const notes = [];
  const guides = {};

  for (const name of listDir(base)) {
    if (!GUIDE_IDS.includes(name)) problems.push(`${GUIDES_DIR}/${name}: unknown guide folder (use ${GUIDE_IDS.join(' or ')})`);
  }

  /** Checks one expected file; returns false when it's missing. */
  const expect = (file, size, missing) => {
    if (!fs.existsSync(file)) {
      missing.push(rel(base, file));
      return false;
    }
    const actual = webpSize(file);
    if (!actual) problems.push(`${rel(root, file)}: not a WebP file (run npm run images)`);
    else if (!fits(actual, size)) problems.push(`${rel(root, file)}: ${actual.width}×${actual.height}, should be ${sizeText(size)} (run npm run images)`);
    return true;
  };
  /** Anything in a folder that isn't one of the expected files (e.g. a PNG not converted yet). */
  const extras = (dir, allowed) => {
    for (const name of listDir(dir)) {
      if (!allowed.includes(name)) problems.push(`${rel(root, path.join(dir, name))}: unexpected file (expected ${allowed.join(', ')}; run npm run images to convert PNG/JPG)`);
    }
  };

  for (const guide of GUIDE_IDS) {
    const dir = path.join(base, guide);
    if (!fs.existsSync(dir)) {
      guides[guide] = { complete: false, missing: ['(no folder yet)'] };
      continue;
    }
    const missing = [];
    for (const name of listDir(dir)) {
      if (name !== 'hero' && name !== 'exercises') problems.push(`${rel(root, path.join(dir, name))}: unexpected (only hero/ and exercises/)`);
    }
    const heroDir = path.join(dir, 'hero');
    for (const hero of HEROES) expect(path.join(heroDir, `${hero}.webp`), SIZES[hero], missing);
    extras(heroDir, HEROES.map((h) => `${h}.webp`));

    const exDir = path.join(dir, 'exercises');
    for (const id of ids) {
      const file = (frame) => path.join(exDir, id, `${frame}.webp`);
      const both = FRAMES.map((frame) => expect(file(frame), SIZES.frame, missing)).every(Boolean);
      expect(file('thumb'), SIZES.thumb, missing);
      const [a, b] = both ? FRAMES.map((frame) => webpSize(file(frame))) : [];
      if (a && b && (a.width !== b.width || a.height !== b.height))
        problems.push(`${guide}/exercises/${id}: relaxed (${a.width}×${a.height}) and exercise (${b.width}×${b.height}) must be the same size to line up`);
      extras(path.join(exDir, id), EXERCISE_FILES.map((f) => `${f}.webp`));
    }
    for (const name of listDir(exDir)) {
      if (!ids.includes(name)) notes.push(`${guide}/exercises/${name}: not in the exercise catalog yet (not bundled)`);
    }
    guides[guide] = { complete: missing.length === 0, missing };
  }
  if (!guides[DEFAULT_GUIDE].complete) problems.push(`The default guide (${DEFAULT_GUIDE}) must be complete; missing: ${guides[DEFAULT_GUIDE].missing.join(', ')}`);
  return { ids, guides, problems, notes };
}

/** The generated TypeScript: static require()s for every complete guide. */
function render({ ids, guides }) {
  const req = (guide, file) => `require('@/${GUIDES_DIR}/${guide}/${file}')`;
  const lines = [
    '// Generated by `npm run images` (scripts/guide-images.js) from assets/guides/. Don\'t edit by hand.',
    '// Metro only bundles static require() paths, so every picture is listed here. Only complete guides are in it.',
    "import type { GuideId, GuideImages } from './guides';",
    '',
    'export const GUIDE_IMAGES = {',
  ];
  for (const guide of GUIDE_IDS.filter((g) => guides[g].complete)) {
    lines.push(`  ${guide}: {`, '    hero: {');
    for (const hero of HEROES) lines.push(`      ${hero}: ${req(guide, `hero/${hero}.webp`)},`);
    lines.push('    },', '    exercises: {');
    for (const id of ids) {
      lines.push(`      '${id}': {`);
      for (const frame of EXERCISE_FILES) lines.push(`        ${frame}: ${req(guide, `exercises/${id}/${frame}.webp`)},`);
      lines.push('      },');
    }
    lines.push('    },', '  },');
  }
  lines.push('} satisfies Partial<Record<GuideId, GuideImages>>;', '');
  return lines.join('\n');
}

/**
 * Turns whatever was dropped in (PNG/JPG, or a WebP of another size) into `<name>.webp` at `size`.
 * A PNG/JPG replaces the WebP and is then deleted (keep your originals elsewhere).
 */
async function normalize(sharp, root, dir, name, size, position, log) {
  const target = path.join(dir, `${name}.webp`);
  const source = listDir(dir).find((f) => path.parse(f).name === name && SOURCE_EXTS.includes(path.extname(f).toLowerCase()) && f !== `${name}.webp`);
  if (!source && fs.existsSync(target) && fits(webpSize(target), size)) return;
  const from = source ? path.join(dir, source) : target;
  if (!fs.existsSync(from)) return;
  const tmp = `${target}.tmp`;
  await sharp(from).rotate().resize(size.width, size.height, { fit: 'cover', position }).webp(WEBP).toFile(tmp);
  fs.renameSync(tmp, target);
  if (source) fs.unlinkSync(from);
  log(`converted ${rel(root, from)} → ${name}.webp (${size.width}×${size.height})`);
}

/** Converts new pictures and cuts missing thumbnails, in every guide (also exercises not in the catalog yet). */
async function prepare(root = ROOT, log = console.log) {
  const sharp = require('sharp'); // dev-only, never bundled into the app
  for (const guide of GUIDE_IDS) {
    const dir = path.join(root, GUIDES_DIR, guide);
    if (!fs.existsSync(dir)) continue;
    const heroDir = path.join(dir, 'hero');
    for (const hero of HEROES) await normalize(sharp, root, heroDir, hero, SIZES[hero], hero === 'home' ? 'centre' : 'north', log);
    const exDir = path.join(dir, 'exercises');
    for (const id of listDir(exDir)) {
      const folder = path.join(exDir, id);
      if (!fs.statSync(folder).isDirectory()) continue;
      for (const frame of FRAMES) await normalize(sharp, root, folder, frame, SIZES.frame, 'north', log);
      await normalize(sharp, root, folder, 'thumb', SIZES.thumb, 'north', log);
      const exercise = path.join(folder, 'exercise.webp');
      const thumb = path.join(folder, 'thumb.webp');
      if (!fs.existsSync(thumb) && fs.existsSync(exercise)) {
        const { width, height } = webpSize(exercise);
        await sharp(exercise)
          .extract({ left: 0, top: Math.round(THUMB_TOP * height), width, height: width })
          .resize(SIZES.thumb.width, SIZES.thumb.height)
          .webp(WEBP)
          .toFile(thumb);
        log(`cut ${rel(root, thumb)} from exercise.webp`);
      }
    }
  }
}

async function main() {
  const check = process.argv.includes('--check');
  if (!check) await prepare();
  const result = scan();
  for (const guide of GUIDE_IDS) {
    const { complete, missing } = result.guides[guide];
    console.log(complete ? `✓ ${guide}: complete, in the app` : `… ${guide}: ${missing.length} missing, not in the app yet`);
    if (!complete) for (const m of missing.slice(0, 12)) console.log(`    missing ${m}`);
    if (missing.length > 12) console.log(`    … and ${missing.length - 12} more`);
  }
  for (const note of result.notes) console.log(`  note: ${note}`);

  const output = render(result);
  const file = path.join(ROOT, OUTPUT);
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const problems = [...result.problems];
  if (current !== output) {
    if (check) problems.push(`${OUTPUT} is out of date (run npm run images)`);
    else {
      fs.writeFileSync(file, output);
      console.log(`wrote ${OUTPUT}`);
    }
  }
  for (const p of problems) console.error(`✗ ${p}`);
  if (problems.length) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = { scan, render, webpSize, readExerciseIds, prepare, SIZES, OUTPUT, GUIDES_DIR, GUIDE_IDS, DEFAULT_GUIDE, ROOT };
