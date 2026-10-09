// Draws the pieces around the phones: round portraits (the app's own AI-generated hero photos), per-language
// chips and voice-cue bubbles whose words come from the app's translations, and cards lifted out of the framed
// screens (the plan grid and the Coach's reminder card, where capture.js measured them). Output: ../public/art/…
// plus art-manifest.json (sizes in canvas pixels, read by deck.js). Usage: node art.js (after capture + frame)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { LANGS } from './copy.js';
import { FONT_CSS, ICON_SVGS } from './lib.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '../public/art');
const APP = path.join(HERE, '../../app');
const LOCAL_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined);
const RED = '#E5322D', INK = '#111418';

const t = (lang, ns, key) => key.split('.').reduce((o, k) => o[k], JSON.parse(fs.readFileSync(`${APP}/src/i18n/locales/${lang}/${ns}.json`, 'utf8')));
const icon = (name, color) => ICON_SVGS[name].replaceAll('COLOR', color);
const webp = (file) => `data:image/webp;base64,${fs.readFileSync(file).toString('base64')}`;

const CSS = `* { margin: 0; box-sizing: border-box; } html, body { background: transparent; }
  body { font-family: SFLike, sans-serif; -webkit-font-smoothing: antialiased; display: inline-block; padding: 40px; }
  .chip { display: inline-flex; align-items: center; gap: 22px; padding: 30px 48px 30px 36px; border-radius: 999px; background: #fff;
          color: ${INK}; font-size: 54px; font-weight: 700; letter-spacing: -0.5px; white-space: nowrap;
          box-shadow: 0 24px 50px rgba(20, 0, 0, .35), 0 4px 10px rgba(20, 0, 0, .15); }
  .chip svg { width: 64px; height: 64px; flex: none; }
  .bubble { position: relative; display: inline-flex; align-items: center; gap: 22px; padding: 30px 46px 30px 34px; border-radius: 56px; background: #fff;
            color: ${INK}; font-size: 54px; font-weight: 700; white-space: nowrap; box-shadow: 0 24px 50px rgba(0, 0, 0, .45); }
  .bubble.red { background: ${RED}; color: #fff; }
  .bubble svg { width: 60px; height: 60px; flex: none; }
  .bubble::after { content: ''; position: absolute; left: 70px; bottom: -26px; border: 28px solid transparent; border-top-color: #fff; border-bottom: 0; border-left-width: 0; }
  .bubble.red::after { border-top-color: ${RED}; }
  .portrait { width: 640px; height: 640px; border-radius: 50%; border: 18px solid #fff; overflow: hidden; background: #111;
              box-shadow: 0 40px 80px rgba(0, 0, 0, .45); }
  .portrait img { width: 100%; height: 100%; object-fit: cover; }
  .pop { border-radius: 40px; overflow: hidden; background: #fff; box-shadow: 0 40px 80px rgba(20, 0, 0, .40), 0 8px 18px rgba(20, 0, 0, .18); }
  .pop img { display: block; width: 100%; }`;

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
const MANIFEST = path.join(HERE, 'art-manifest.json');
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}; // keeps other languages

/** Renders `inner` and saves the body box (transparent around it). Sizes are recorded in canvas pixels (1×). */
async function draw(rel, inner) {
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}${CSS}</style></head><body>${inner}</body></html>`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const box = await page.locator('body').boundingBox();
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file, omitBackground: true, clip: box });
  manifest[rel] = { w: Math.round(box.width), h: Math.round(box.height) };
  console.log(`  public/art/${rel}`);
}

// Portraits: the square around the face of each hero photo (762 × 1024), in a white ring.
for (const [who, [x, y, size]] of Object.entries({ woman: [150, 40, 620], man: [140, 0, 620] })) {
  const src = webp(`${APP}/assets/guides/${who}/hero/paywall.webp`);
  await draw(`portrait-${who}.png`, `<div class="portrait"><img src="${src}" style="object-fit:none;object-position:-${x}px -${y}px;width:${762}px;height:${1024}px;transform:scale(${640 / size});transform-origin:0 0"></div>`);
}

for (const lang of LANGS) {
  const streak = t(lang, 'home', 'streak_other').replace('{{count}}', '11');
  await draw(`${lang}/streak.png`, `<div class="chip">${icon('flame.fill', '#FF8A1F')}<span>${streak}</span></div>`);
  const speaker = (c) => icon('speaker.wave.2.fill', c);
  const start = t(lang, 'workout', 'voice.start').replace('{{name}}', t(lang, 'exercises', 'items.jawClench.name'));
  await draw(`${lang}/voice-start.png`, `<div class="bubble">${speaker(RED)}<span>${start}</span></div>`);
  await draw(`${lang}/voice-hold.png`, `<div class="bubble red">${speaker('#fff')}<span>${t(lang, 'workout', 'voice.hold')}</span></div>`);
  await draw(`${lang}/voice-relax.png`, `<div class="bubble">${speaker(RED)}<span>${t(lang, 'workout', 'voice.relax')}</span></div>`);
}

// Cards lifted out of the app: cut from the framed screen (3 px per point) where capture.js found them, shown a bit
// larger than inside the phone (2.3 canvas pixels per point; the camera mirror 3.6).
const SCREENS = path.join(HERE, '../public/screenshots/apple/iphone');
for (const lang of LANGS) {
  const regions = JSON.parse(fs.readFileSync(path.join(HERE, 'raw', lang, 'regions.json'), 'utf8'));
  // [file, screen, raw top in the framed screen, region, canvas pixels per point, points cut off each side]
  // (the mirror's box has a white rounded border: cut inside it, so only the camera picture is lifted out)
  for (const [name, screen, top, key, scale, inset] of [['pop-grid.png', 'today', 62, 'grid', 2.3, 0], ['pop-card.png', 'coach', 72, 'card', 2.3, 0], ['pop-mirror.png', 'workout-mirror', 62, 'mirror', 3.6, 6], ['pop-mirror-man.png', 'workout-mirror-man', 62, 'mirror-man', 3.6, 6]]) {
    if (!regions[key]) { console.warn(`  ${lang}: no "${key}" region yet (run capture.js ${lang}): ${name} skipped`); continue; }
    const [x, y, w, h] = [regions[key][0] + inset, regions[key][1] + inset, regions[key][2] - 2 * inset, regions[key][3] - 2 * inset];
    const crop = path.join(OUT, lang, `.crop-${name}`);
    execFileSync('convert', [path.join(SCREENS, lang, `${screen}.png`), '-crop', `${w * 3}x${h * 3}+${x * 3}+${(y + top) * 3}`, '+repage', crop]);
    const src = `data:image/png;base64,${fs.readFileSync(crop).toString('base64')}`;
    fs.rmSync(crop);
    await draw(`${lang}/${name}`, `<div class="pop" style="width:${Math.round(w * scale)}px"><img src="${src}"></div>`);
  }
}

await browser.close();

// The deck gives each chip one box for every language: pad each language's picture to the widest one
// (transparent on the right), so the words are the same size in every language and the chip stays left-aligned.
for (const name of ['streak.png', 'voice-start.png', 'voice-hold.png', 'voice-relax.png', 'pop-grid.png', 'pop-card.png', 'pop-mirror.png', 'pop-mirror-man.png']) {
  const have = LANGS.filter((l) => manifest[`${l}/${name}`] && fs.existsSync(path.join(OUT, l, name)));
  if (!have.length) continue;
  const w = Math.max(...have.map((l) => manifest[`${l}/${name}`].w));
  const h = Math.max(...have.map((l) => manifest[`${l}/${name}`].h));
  for (const l of have) {
    const file = path.join(OUT, l, name);
    execFileSync('convert', [file, '-background', 'none', '-gravity', 'northwest', '-extent', `${w * 2}x${h * 2}`, file]);
    manifest[`${l}/${name}`] = { w, h };
  }
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
