// Draws the editor's iPhone frame (../public/mockup.png, 1022 × 2082, transparent outside): an iPhone 17 Pro Max
// in dark titanium. The screen hole keeps the editor's measurements (PHONE_SCREEN in src/lib/constants.ts:
// 52, 46, 918 × 1990, corner radius 126), so nothing else changes. The Dynamic Island is part of each screen image
// (frame.js), because the editor draws the screen above this frame.
// Usage: node mockup.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined);

const W = 1022, H = 2082;
const SCREEN = { x: 52, y: 46, w: 918, h: 1990, r: 126 };
const BODY = { x: 8, y: 2, w: W - 16, h: H - 4 }; // leaves room for the buttons on both sides
const button = (side, top, height) => `<div class="btn" style="${side}:0;top:${top}px;height:${height}px"></div>`;

const html = `<!doctype html><html><head><style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: ${W}px; height: ${H}px; background: transparent; }
  .body { position: absolute; left: ${BODY.x}px; top: ${BODY.y}px; width: ${BODY.w}px; height: ${BODY.h}px; border-radius: 178px;
          background: linear-gradient(135deg, #5B5F66 0%, #2A2D32 18%, #1B1D21 50%, #2C2F35 82%, #63676E 100%); }
  .rim { position: absolute; inset: 5px; border-radius: 173px; background: linear-gradient(160deg, #3A3D43, #121316 45%, #26292E); }
  .bezel { position: absolute; inset: 14px; border-radius: 164px; background: #050506; box-shadow: inset 0 0 0 2px #1A1B1E; }
  .screen { position: absolute; left: ${SCREEN.x}px; top: ${SCREEN.y}px; width: ${SCREEN.w}px; height: ${SCREEN.h}px; border-radius: ${SCREEN.r}px; background: #000; }
  .btn { position: absolute; width: 10px; border-radius: 5px; background: linear-gradient(90deg, #4A4E55, #2A2D32 60%, #5A5E65); }
</style></head><body>
  ${button('left', 330, 70)}${button('left', 470, 128)}${button('left', 630, 128)}${button('right', 560, 200)}${button('right', 1060, 110)}
  <div class="body"><div class="rim"></div><div class="bezel"></div></div>
  <div class="screen"></div>
</body></html>`;

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(html);
const out = path.join(HERE, '../public/mockup.png');
await page.screenshot({ path: out, omitBackground: true });
await browser.close();
console.log(path.relative(path.join(HERE, '..'), out));
