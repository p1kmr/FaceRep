/**
 * Builds the Worker's private Premium folder (.content/, the static assets in wrangler.jsonc) before `npm run deploy`
 * and `npm run dev`: the Premium exercises' drawings and clips from the app's assets/guides/ (they are never bundled
 * into the app: app/scripts/guide-images.js lists only the free ones), their texts from
 * content/locales/<lang>/exercises.json (laid out like the app's locales, so app/scripts/i18n-check.js checks them too),
 * and pack.json, the list POST /content hands out (texts, and each file's size and hash so the app downloads only what
 * changed). Fails on anything missing, so a deploy never serves half a pack.
 *   node scripts/content.js          build .content/
 *   node scripts/content.js --check  only check (tests and the app's review check use buildPack)
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CATALOG } from '../src/lib/catalog.js';

const WORKER = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(WORKER, '..', 'app');
export const GUIDES = ['man', 'woman'];
/** The files an exercise has in assets/guides/<guide>/exercises/<id>/ (the clip is optional, like in the app). */
const PICTURES = ['relaxed.webp', 'exercise.webp', 'thumb.webp'];
const CLIP = 'clip.mp4';

const hash = (data) => createHash('sha256').update(data).digest('hex').slice(0, 12);

/** The app's languages (its locale folders); every one needs the Premium texts. */
export const languages = () => readdirSync(join(APP, 'src', 'i18n', 'locales')).sort();

const isText = (v) => typeof v === 'string' && v.trim().length > 0;

/** The Premium texts of one language, checked: exactly the Premium exercises, each with a name, a cue and steps. */
function textsOf(lang, premium, problems) {
  const file = join(WORKER, 'content', 'locales', lang, 'exercises.json');
  if (!existsSync(file)) {
    problems.push(`content/locales/${lang}/exercises.json is missing`);
    return {};
  }
  const items = JSON.parse(readFileSync(file, 'utf8')).items ?? {};
  for (const e of premium) {
    const item = items[e.key];
    if (!item || !isText(item.name) || !isText(item.cue) || !Array.isArray(item.steps) || !item.steps.length || !item.steps.every(isText)) {
      problems.push(`content/locales/${lang}/exercises.json: ${e.key} needs a name, a cue and steps`);
    }
  }
  for (const key of Object.keys(items)) if (!premium.some((e) => e.key === key)) problems.push(`content/locales/${lang}/exercises.json: ${key} is not a Premium exercise`);
  return items;
}

/** The pack and the files to copy, or throws listing every problem. */
export function buildPack() {
  const premium = CATALOG.filter((e) => !e.free);
  const problems = [];
  const texts = Object.fromEntries(languages().map((lang) => [lang, textsOf(lang, premium, problems)]));
  const files = [];
  for (const guide of GUIDES) {
    for (const e of premium) {
      const dir = join(APP, 'assets', 'guides', guide, 'exercises', e.id);
      for (const name of [...PICTURES, CLIP]) {
        const from = join(dir, name);
        if (!existsSync(from)) {
          if (name !== CLIP) problems.push(`app/assets/guides/${guide}/exercises/${e.id}/${name} is missing`);
          continue;
        }
        files.push({ from, path: `${guide}/${e.id}/${name}`, hash: hash(readFileSync(from)), size: statSync(from).size });
      }
    }
  }
  if (problems.length) throw new Error(`Premium content is incomplete:\n- ${problems.join('\n- ')}`);
  const list = files.map(({ path, hash: h, size }) => ({ path, hash: h, size }));
  const version = hash(JSON.stringify({ texts, list }));
  return { pack: { v: 1, version, texts, files: list }, files };
}

function build() {
  const { pack, files } = buildPack();
  const out = join(WORKER, '.content');
  rmSync(out, { recursive: true, force: true });
  for (const f of files) {
    mkdirSync(dirname(join(out, f.path)), { recursive: true });
    copyFileSync(f.from, join(out, f.path));
  }
  writeFileSync(join(out, 'pack.json'), JSON.stringify(pack));
  const mb = (files.reduce((sum, f) => sum + f.size, 0) / 1e6).toFixed(1);
  console.log(`.content/: ${files.length} files (${mb} MB) and pack.json ${pack.version}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) {
    const { pack } = buildPack();
    console.log(`Premium content complete: ${pack.files.length} files, pack ${pack.version}`);
  } else build();
}
