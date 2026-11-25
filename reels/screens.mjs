// Puts the app's real screens in reels/screens/, committed, so a reel can use them on any computer, also in a
// Claude Code cloud session (the store capture's Simulator shots are git-ignored). Run on the Mac, from the facerep
// folder, with the app built into an iPhone Simulator (docs/screenshots.md §4):
//   node reels/screens.mjs --capture [--device <udid>] [--only today,progress]   takes the English screens first
//   node reels/screens.mjs                         only copies what is already in store-screenshots/capture/sim/en/
// Then commit reels/screens/. Each screen becomes a 1080-wide JPG (a few hundred KB), made by sips on the Mac (part
// of macOS, nothing to install) or by Python's Pillow elsewhere. The capture shows a free user with demo data and
// free exercises only (docs/screenshots.md §1): never put screens with real people's data here.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const capture = join(here, '..', 'store-screenshots', 'capture');
const from = join(capture, 'sim', 'en');
const to = join(here, 'screens');
const WIDTH = 1080;
const QUALITY = 85;

const args = process.argv.slice(2);
const opt = (name) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : null);
const has = (cmd) => {
  try {
    execFileSync('which', [cmd], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

if (args.includes('--capture')) {
  const pass = ['device', 'only'].flatMap((name) => (opt(name) ? [`--${name}`, opt(name)] : []));
  console.log('Taking the English screens in the Simulator (about 3 minutes)…');
  execFileSync('node', ['sim-capture.js', 'en', ...pass], { cwd: capture, stdio: 'inherit' });
}

const shots = existsSync(from) ? readdirSync(from).filter((f) => f.endsWith('.png')) : [];
if (!shots.length) {
  console.log(`FAIL No screens in ${from}. Run: node reels/screens.mjs --capture (on the Mac, Simulator open).`);
  process.exit(1);
}

const pillow = (src, out) => execFileSync('python3', ['-I', '-c', [
  'import sys; from PIL import Image',
  'im = Image.open(sys.argv[1]).convert("RGB")',
  'w = int(sys.argv[3]); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)',
  'im.save(sys.argv[2], quality=int(sys.argv[4]), optimize=True)',
].join('\n'), src, out, String(WIDTH), String(QUALITY)]);
const sips = (src, out) => execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(QUALITY),
  '--resampleWidth', String(WIDTH), src, '--out', out], { stdio: 'ignore' });
const convert = has('sips') ? sips : pillow;

mkdirSync(to, { recursive: true });
for (const file of shots) {
  const out = join(to, file.replace(/\.png$/, '.jpg'));
  convert(join(from, file), out);
  console.log(`OK   reels/screens/${file.replace(/\.png$/, '.jpg')}  ${Math.round(statSync(out).size / 1024)} KB`);
}
console.log(`\n${shots.length} screens. Now: git add reels/screens && git commit -m "reels: app screens" && git push`);
