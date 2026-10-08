// Exports the deck from the running editor (npm run dev → http://localhost:3000) with its own "Export bundle"
// button, then writes the App Store files: ../export/<lang>/0N.jpg (1320 × 2868, iPhone 6.9", JPEG without alpha;
// copy.js `asc` says which App Store locales get each language) and ../export/strip-<lang>.jpg to look at.
// Usage: node export.js
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { COPY, LANGS } from './copy.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '../export');
const EDITOR = process.env.EDITOR_URL || 'http://localhost:3000';
const LOCAL_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined);
const SIZE = '1320x2868';

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
page.on('pageerror', (e) => console.warn(`  editor error: ${String(e).slice(0, 200)}`));
await page.goto(EDITOR, { waitUntil: 'networkidle' });
const button = page.getByRole('button', { name: /Export bundle/ });
await button.waitFor({ timeout: 120000 });
await page.waitForTimeout(3000); // fonts and screenshots preload
const [download] = await Promise.all([page.waitForEvent('download', { timeout: 40 * 60000 }), button.click()]);
const tmp = fs.mkdtempSync(path.join(HERE, '.export-'));
const zip = path.join(tmp, 'bundle.zip');
await download.saveAs(zip);
await browser.close();
execFileSync('unzip', ['-q', '-o', zip, '-d', tmp]);

fs.rmSync(OUT, { recursive: true, force: true });
for (const lang of LANGS) {
  const dir = path.join(tmp, 'ios', 'iphone', SIZE, lang);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
  if (files.length !== 7) throw new Error(`${lang}: expected 7 slides, got ${files.length}`);
  fs.mkdirSync(path.join(OUT, lang), { recursive: true });
  files.forEach((f, i) => {
    // Flatten to RGB JPEG: App Store Connect rejects images with an alpha channel.
    execFileSync('convert', [path.join(dir, f), '-background', '#000', '-alpha', 'remove', '-alpha', 'off', '-quality', '90', path.join(OUT, lang, `0${i + 1}.jpg`)]);
  });
  execFileSync('convert', [...files.map((f) => path.join(dir, f)), '+append', '-resize', 'x900', '-quality', '85', path.join(OUT, `strip-${lang}.jpg`)]);
  console.log(`  export/${lang} → App Store ${COPY[lang].asc.join(', ')}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
