// Takes FaceRep's store screens in the iOS Simulator (docs/screenshots.md §4), in every language, without a tap: the
// demo data from sim-seed.js goes into the app's database, deep links open the screens, and two Simulator-only links
// do the rest (scan?start=1 starts the face scan, coach?q=…&send=1 sends a Coach question). The Simulator has no camera:
// camera.js's stand-in pictures go into the app's Documents/SimulatorCamera/, where only a Simulator build looks.
// Output: sim/<lang>/<screen>.png and the boxes of the lifted cards in sim/<lang>/regions.json (points).
// Usage: node sim-capture.js [lang …] [--only today,scan,…] [--device <udid>]
//        node sim-capture.js [lang …] --regions   (only measures the cards again from the saved screens)
// Before: build the app into an iPhone 17 Pro Max Simulator and open it once (§4 steps 1–2), then `node camera.js`.
// The Coach goes last: each language gets a new app ID (3 free answers), so it resets the Simulator's Keychain.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { COPY, LANGS } from './copy.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE = 'com.p1kmr.facerep';
const args = process.argv.slice(2);
const opt = (name) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : null);
const DEVICE = opt('device') ?? 'booted';
const ONLY = opt('only')?.split(',') ?? null;
const langs = args.filter((a, i) => !a.startsWith('--') && !['--only', '--device'].includes(args[i - 1]));
const LOCALES = { en: 'en_US', es: 'es_ES', 'pt-BR': 'pt_BR', de: 'de_DE', fr: 'fr_FR', it: 'it_IT' };

// Free exercises only: the Simulator shows what a free user gets (docs/screenshots.md §1).
const workout = (ids) => `facerep://workout?ids=${ids.join(',')}&kind=single`;
const CHEEKS = workout(['06-cheek-lift', '07-fish-face', '09-brow-lift', '19-pout', '02-chin-lift']);
const BROWS = workout(['09-brow-lift', '06-cheek-lift', '07-fish-face', '19-pout', '02-chin-lift']);
// Seconds after the link to the middle of the second squeeze (3 s get ready, then hold and relax; the screen takes
// about 0.7 s to open): Cheek Lift holds 5 s and relaxes 3 s, Brow Lift 3 s and 2 s.
const CHEEK_SQUEEZE = 14.2;
const BROW_SQUEEZE = 10.3;

/** The screens in capture order. `seed`: sim-seed.js options; `camera`: stand-in pictures; `at`: seconds to wait. */
const SCREENS = [
  { name: 'today', seed: ['--done', '2'] },
  { name: 'exercise-man', seed: ['--guide', 'man', '--done', '2'], url: 'facerep://exercise/02-chin-lift' },
  { name: 'workout', seed: ['--done', '2'], url: CHEEKS, at: CHEEK_SQUEEZE },
  { name: 'workout-man', seed: ['--guide', 'man', '--done', '2'], url: BROWS, at: BROW_SQUEEZE },
  { name: 'workout-mirror', seed: ['--done', '2', '--mirror'], camera: { mirror: 'mirror-woman' }, url: CHEEKS, at: CHEEK_SQUEEZE },
  { name: 'workout-mirror-man', seed: ['--guide', 'man', '--done', '2', '--mirror'], camera: { mirror: 'mirror-man' }, url: CHEEKS, at: CHEEK_SQUEEZE },
  // The relaxed face's hold, about three quarters measured, after "Photo saved on this iPhone" appeared.
  { name: 'scan', seed: ['--done', '2', '--photos'], camera: { scan: 'scan' }, url: 'facerep://scan?start=1', at: 6.9 },
  // A free user's three scans (the chart's points) and a month of workouts.
  { name: 'scan-result', seed: ['--done', '30', '--scans', '3'], url: 'facerep://scan-result?id=demo-scan-3' },
  { name: 'progress', seed: ['--done', '30', '--scans', '3'], url: 'facerep://progress' },
  { name: 'guide', seed: ['--onboarding'], url: 'facerep://onboarding/guide' },
  { name: 'coach', seed: ['--done', '11', '--new-id'], coach: true },
];

const run = (cmd, cmdArgs, input) => execFileSync(cmd, cmdArgs, { input, encoding: 'utf8', stdio: [input ? 'pipe' : 'ignore', 'pipe', 'pipe'] });
const simctl = (...a) => run('xcrun', ['simctl', ...a]);
const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));
const container = () => simctl('get_app_container', DEVICE, BUNDLE, 'data').trim();
const database = () => path.join(container(), 'Documents/SQLite/facerep.db');
const sql = (query) => run('sqlite3', [database(), query]).trim();

function quit() {
  try {
    simctl('terminate', DEVICE, BUNDLE);
  } catch {
    // It wasn't running.
  }
}

function seed(options) {
  quit();
  run('sqlite3', [database()], run('node', [path.join(HERE, 'sim-seed.js'), ...options]));
}

function cameras(pictures = {}) {
  const dir = path.join(container(), 'Documents/SimulatorCamera');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const [as, file] of Object.entries(pictures)) fs.copyFileSync(path.join(HERE, 'raw/camera', `${file}.jpg`), path.join(dir, `${as}.jpg`));
}

async function launch(lang) {
  // A fresh app every time: one still running would keep its old data on screen.
  simctl('launch', '--terminate-running-process', DEVICE, BUNDLE, '-AppleLanguages', `(${lang})`, '-AppleLocale', LOCALES[lang]);
  await sleep(3.5);
}

const shot = (file) => simctl('io', DEVICE, 'screenshot', '--type=png', file);

/**
 * The white cards that hold the orange buttons below `fromY` (pixels), last first, in points: [x, y, width, height].
 * The buttons are a gradient from orange to red; the user's question bubbles and red links are one flat red.
 */
async function cardsWithButtons(file, fromY) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => data.subarray((y * info.width + x) * 3, (y * info.width + x) * 3 + 3);
  const white = ([r, g, b]) => r >= 252 && g >= 252 && b >= 252;
  const buttonRow = (y) => {
    let red = 0;
    let orange = 0;
    for (let x = 0; x < info.width; x++) {
      const [r, g, b] = px(x, y);
      if (r > 215 && g > 40 && g < 150 && b < 95) {
        red++;
        if (g > 85) orange++;
      }
    }
    return red >= 250 && orange >= 60;
  };
  const buttons = [];
  for (let y = info.height - 1, bottom = -1; y >= fromY; y--) {
    const isButton = buttonRow(y);
    if (isButton && bottom < 0) bottom = y;
    if (!isButton && bottom >= 0) {
      if (bottom - y > 60) buttons.push({ top: y + 1, bottom });
      bottom = -1;
    }
  }
  const pt = (v) => Math.round(v / 3);
  return buttons.map(({ top, bottom }) => {
    const probe = top - 24;
    let left = 0;
    while (left < info.width / 2 && !white(px(left, probe))) left++;
    let right = info.width - 1;
    while (right > info.width / 2 && !white(px(right, probe))) right--;
    const column = left + 24;
    let cardTop = probe;
    while (cardTop > 0 && white(px(column, cardTop - 1))) cardTop--;
    let cardBottom = bottom;
    while (cardBottom < info.height - 1 && white(px(column, cardBottom + 1))) cardBottom++;
    return { box: [pt(left), pt(cardTop), pt(right - left + 1), pt(cardBottom - cardTop + 1)], buttonTop: pt(top) };
  });
}

/**
 * The scan result's two rings with their names, what they mean and the change since the last scan (the green line),
 * in points: the rings sit in the same place in every language, but a name's meaning on two lines pushes the green line down.
 */
async function ringsBox(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let last = -1;
  for (let y = 300 * 3; y < 430 * 3; y++) {
    let green = 0;
    for (let x = 16 * 3; x < 424 * 3; x++) {
      const i = (y * info.width + x) * 3;
      if (data[i + 1] - data[i] > 60 && data[i + 1] - data[i + 2] > 20) green++;
    }
    if (green > 3) last = y;
  }
  // A first scan has no green line: the rings with their names and meanings.
  const bottom = last < 0 ? 348 : Math.round(last / 3) + 13;
  return [16, 163, 408, bottom - 163];
}

/** The cards lifted out of this language's screens (art.js --sim), in points of the 440 × 956 screen. */
async function measure(lang) {
  const dir = path.join(HERE, 'sim', lang);
  const regions = fs.existsSync(regionsFile(lang)) ? JSON.parse(fs.readFileSync(regionsFile(lang), 'utf8')) : {};
  const has = (name) => fs.existsSync(path.join(dir, `${name}.png`));
  if (has('coach')) {
    // The reminder card is the last one, the routine the one before.
    const [card, routine] = await cardsWithButtons(path.join(dir, 'coach.png'), 600);
    regions.card = card?.box;
    regions.routine = routine?.box;
  }
  if (has('progress')) {
    // The face scan card's numbers and chart, without its button.
    const [chart] = await cardsWithButtons(path.join(dir, 'progress.png'), 1000);
    if (chart) regions.chart = [chart.box[0], chart.box[1], chart.box[2], chart.buttonTop - chart.box[1] - 6];
  }
  if (has('scan-result')) regions.rings = await ringsBox(path.join(dir, 'scan-result.png'));
  fs.writeFileSync(regionsFile(lang), JSON.stringify(regions) + '\n');
}

async function coach(lang, out) {
  // A new app ID with 3 free answers (sim-seed.js --new-id clears the saved one; the Keychain keeps the old one).
  simctl('keychain', DEVICE, 'reset');
  await launch(lang);
  const questions = [COPY[lang].chat.routine, COPY[lang].chat.ask2];
  for (const q of questions) {
    const before = Number(sql("SELECT COUNT(*) FROM chat_messages WHERE role = 'assistant'"));
    simctl('openurl', DEVICE, `facerep://coach?q=${encodeURIComponent(q)}&send=1`);
    for (let waited = 0; Number(sql("SELECT COUNT(*) FROM chat_messages WHERE role = 'assistant'")) <= before; waited += 1) {
      if (waited > 45) throw new Error(`${lang}: the Coach didn't answer "${q}"`);
      await sleep(1);
    }
    await sleep(2);
  }
  shot(out);
  console.log(`  ${lang} coach answers (read them before keeping the screen):`);
  for (const line of sql("SELECT role || ': ' || text FROM chat_messages ORDER BY created_at, rowid").split('\n')) console.log(`    ${line}`);
}

const regionsFile = (lang) => path.join(HERE, 'sim', lang, 'regions.json');

if (args.includes('--regions')) {
  for (const lang of langs.length ? langs : LANGS) await measure(lang);
  process.exit(0);
}

// Every screen shows a free user (docs/screenshots.md §1): start from a new app ID, never one with Premium.
seed(['--new-id']);
simctl('keychain', DEVICE, 'reset');

for (const lang of langs.length ? langs : LANGS) {
  const dir = path.join(HERE, 'sim', lang);
  fs.mkdirSync(dir, { recursive: true });
  for (const screen of SCREENS) {
    if (ONLY && !ONLY.includes(screen.name)) continue;
    const out = path.join(dir, `${screen.name}.png`);
    seed(screen.seed);
    cameras(screen.camera);
    if (screen.coach) {
      await coach(lang, out);
    } else {
      await launch(lang);
      if (screen.url) {
        simctl('openurl', DEVICE, screen.url);
        await sleep(screen.at ?? 2.5);
      }
      shot(out);
    }
    console.log(`${lang}: ${screen.name}`);
  }
  await measure(lang);
}
simctl('terminate', DEVICE, BUNDLE);
