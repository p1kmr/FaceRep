// Turns each raw capture into a full iPhone 17 Pro Max screen (1320 × 2868): 9:41 status bar, Dynamic Island,
// the iOS 26 glass tab bar on tab screens, the round back button on pushed screens, the Coach as a sheet over
// Today, and the home bar. Output: ../public/screenshots/apple/iphone/<lang>/<screen>.png (what the editor shows
// inside its phone frames).
// Usage: node frame.js [lang …]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { LANGS } from './copy.js';
import { FONT_CSS, ICON_SVGS } from './lib.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(HERE, 'raw');
const OUT = path.join(HERE, '../public/screenshots/apple/iphone');
const APP_LOCALES = path.join(HERE, '../../app/src/i18n/locales');
const LOCAL_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined);

const BG = '#F4F5F7'; // the app's light background (constants/theme/themes/forge.ts)
const TINT = '#E5322D';
/** How each screen is presented on the iPhone. */
export const SCREENS = {
  today: { kind: 'tab', tab: 0 },
  exercises: { kind: 'tab', tab: 1 },
  'exercises-man': { kind: 'tab', tab: 1 },
  progress: { kind: 'tab', tab: 2 },
  exercise: { kind: 'push' },
  'exercise-man': { kind: 'push' },
  guide: { kind: 'full' },
  workout: { kind: 'full' },
  'workout-man': { kind: 'full' },
  'workout-mirror': { kind: 'full' },
  'workout-mirror-man': { kind: 'full' },
  coach: { kind: 'sheet', behind: 'today' },
};
const TABS = [['today', 'flame', 'flame.fill'], ['exercises', 'square.grid.2x2', 'square.grid.2x2.fill'], ['progress', 'chart.bar.fill', 'chart.bar.fill'], ['settings', 'gearshape', 'gearshape.fill']];

const dataUrl = (file) => `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
const icon = (name, color) => ICON_SVGS[name].replaceAll('COLOR', color);

const STATUS = `<div class="time">9:41</div>
  <svg style="left:316px" width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3.2" height="4" rx="1"/><rect x="5" y="5.5" width="3.2" height="6.5" rx="1"/><rect x="10" y="3" width="3.2" height="9" rx="1"/><rect x="15" y="0" width="3.2" height="12" rx="1"/></svg>
  <svg style="left:340px" width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.5 10.5 0 0 0 8.5.6 10.5 10.5 0 0 0 1 3.6l1.2 1.2a8.9 8.9 0 0 1 6.3-2.5Zm0 3.3c1.5 0 2.9.6 4 1.5l1.2-1.2a7.3 7.3 0 0 0-10.4 0l1.2 1.2c1.1-.9 2.5-1.5 4-1.5Zm0 3.3c.7 0 1.3.2 1.8.7L8.5 11.4 6.7 9.6c.5-.5 1.1-.7 1.8-.7Z"/></svg>
  <svg style="left:364px" width="28" height="13" viewBox="0 0 28 13"><rect x=".6" y=".6" width="23.8" height="11.8" rx="3.6" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="1.1"/><rect x="2.3" y="2.3" width="20.4" height="8.4" rx="2.1"/><path d="M26 4.3v4.4c.9-.3 1.5-1.2 1.5-2.2s-.6-1.9-1.5-2.2Z" fill-opacity=".45"/></svg>`;

const CSS = `
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 440px; height: 956px; overflow: hidden; background: ${BG}; font-family: SFLike, sans-serif; -webkit-font-smoothing: antialiased; }
  .app { position: absolute; left: 0; top: 62px; width: 440px; display: block; }
  .status { position: absolute; left: 0; top: 0; width: 440px; height: 62px; color: #000; z-index: 5; }
  .status .time { position: absolute; left: 30px; width: 110px; top: 20px; text-align: center; font-size: 17px; font-weight: 600; letter-spacing: -0.2px; }
  .status svg { position: absolute; top: 25px; fill: currentColor; }
  .island { position: absolute; left: 157px; top: 11px; width: 126px; height: 37px; border-radius: 19px; background: #000; z-index: 9; }
  .homebar { position: absolute; left: 145px; bottom: 8px; width: 150px; height: 5px; border-radius: 3px; background: #111; z-index: 9; }
  .tabbar { position: absolute; left: 21px; right: 21px; top: 873px; height: 62px; border-radius: 31px; z-index: 4;
            background: rgba(255, 255, 255, .74); backdrop-filter: blur(14px) saturate(180%);
            box-shadow: 0 10px 30px rgba(20, 20, 30, .12), inset 0 0 0 .5px rgba(255,255,255,.9), 0 0 0 .5px rgba(0,0,0,.06); }
  .tab { position: absolute; top: 0; height: 62px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-size: 10px; font-weight: 600; color: #1C1C1E; white-space: nowrap; }
  .tab.on { color: ${TINT}; }
  .tab svg { width: 25px; height: 25px; }
  .pill { position: absolute; top: 4px; height: 54px; border-radius: 27px; background: rgba(120, 120, 128, .14); }
  .back { position: absolute; left: 16px; top: 67px; width: 44px; height: 44px; border-radius: 22px; z-index: 4;
          background: rgba(255, 255, 255, .72); backdrop-filter: blur(12px) saturate(180%);
          box-shadow: 0 4px 14px rgba(0,0,0,.10), inset 0 0 0 .5px rgba(255,255,255,.9), 0 0 0 .5px rgba(0,0,0,.06);
          display: flex; align-items: center; justify-content: center; }
  .back svg { width: 22px; height: 22px; }
  .behind { position: absolute; left: 0; top: 0; width: 440px; height: 956px; background: #000; }
  .behind img { position: absolute; left: 18px; top: 50px; width: 404px; border-radius: 34px; filter: brightness(.62); }
  .sheet { position: absolute; left: 0; right: 0; top: 72px; bottom: 0; border-radius: 38px 38px 0 0; overflow: hidden; background: ${BG}; }
  .sheet img { position: absolute; left: 0; top: 0; width: 440px; }
  .sheet .grabber { position: absolute; left: 202px; top: 6px; width: 36px; height: 5px; border-radius: 3px; background: rgba(60,60,67,.3); z-index: 2; }
`;

function html(lang, name, conf, fontCss) {
  const raw = (n) => dataUrl(path.join(RAW, lang, `${n}.png`));
  const tabs = JSON.parse(fs.readFileSync(`${APP_LOCALES}/${lang}/common.json`, 'utf8')).tabs;
  let body = '';
  if (conf.kind === 'sheet') {
    body += `<div class="behind"><img src="${raw(conf.behind)}"></div><div class="sheet"><div class="grabber"></div><img src="${raw(name)}"></div>`;
  } else {
    body += `<img class="app" src="${raw(name)}">`;
  }
  if (conf.kind === 'tab') {
    const w = (398 - 8) / TABS.length;
    body += `<div class="tabbar"><div class="pill" style="left:${4 + conf.tab * w}px;width:${w}px"></div>`;
    TABS.forEach(([key, off, on], i) => {
      const sel = i === conf.tab;
      body += `<div class="tab${sel ? ' on' : ''}" style="left:${4 + i * w}px;width:${w}px">${icon(sel ? on : off, sel ? TINT : '#1C1C1E')}<span>${tabs[key]}</span></div>`;
    });
    body += '</div>';
  }
  if (conf.kind === 'push') body += `<div class="back">${icon('chevron.left', '#111418')}</div>`;
  const statusColor = conf.kind === 'sheet' ? '#fff' : '#000';
  body += `<div class="status" style="color:${statusColor}">${STATUS}</div><div class="island"></div><div class="homebar"></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}${CSS}</style></head><body>${body}</body></html>`;
}

const langs = process.argv.slice(2).length ? process.argv.slice(2) : LANGS;

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 3 });
for (const lang of langs) {
  fs.mkdirSync(path.join(OUT, lang), { recursive: true });
  for (const [name, conf] of Object.entries(SCREENS)) {
    if (!fs.existsSync(path.join(RAW, lang, `${name}.png`))) { console.warn(`  missing raw/${lang}/${name}.png (run capture.js ${lang})`); continue; }
    await page.setContent(html(lang, name, conf, FONT_CSS), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const file = path.join(OUT, lang, `${name}.png`);
    await page.screenshot({ path: file, omitBackground: false });
    console.log(`  ${path.relative(path.join(HERE, '..'), file)}`);
  }
}
await browser.close();
