// Opens the FaceRep web build so it looks and behaves like the iPhone app for a screenshot:
// fixed date and time, demo data in the app's own SQLite database, Premium on, the iPhone font and
// SF Symbol look-alikes, and the Coach and the plan answered locally (no Worker, no AI, no RevenueCat).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import ICONS from './icons.js';
import { TODAY, seedSql, planReply } from './seed.js';

const require = createRequire(import.meta.url);
const font = (file) => fs.readFileSync(require.resolve(`@fontsource-variable/inter/files/${file}`)).toString('base64');
/** Inter as the stand-in for the iPhone's SF Pro (the web build has no SF Pro), Latin + Latin Extended. */
export const FONT_CSS = `@font-face{font-family:SFLike;src:url(data:font/woff2;base64,${font('inter-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:SFLike;src:url(data:font/woff2;base64,${font('inter-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:100 900;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}`;
export const APP_URL = process.env.APP_URL || 'http://localhost:8081';
/** The web build must be started with EXPO_PUBLIC_AI_URL set to this (README.md); requests to it never leave the browser. */
export const DEMO_HOST = 'https://demo.facerep.invalid';

/** Simulator screenshots (docs/screenshots.md §4): capture/sim/<lang>/<screen>.png, used by frame.js and art.js with --sim. */
const SIM = path.join(path.dirname(fileURLToPath(import.meta.url)), 'sim');
/** The Simulator screenshot for a screen, or null. Throws if it isn't a full iPhone 6.9" screen (1320 × 2868). */
export function simShot(lang, name) {
  const file = path.join(SIM, lang, `${name}.png`);
  if (!fs.existsSync(file)) return null;
  const head = fs.readFileSync(file).subarray(16, 24);
  const [w, h] = [head.readUInt32BE(0), head.readUInt32BE(4)];
  if (w !== 1320 || h !== 2868) throw new Error(`sim/${lang}/${name}.png is ${w} × ${h}: use an iPhone 17 Pro Max (or 16 Pro Max) Simulator, 1320 × 2868`);
  return file;
}
/** Boxes of the cards lifted out of Simulator screens, in points of the full 440 × 956 screen (pixels ÷ 3). */
export const simRegions = (lang) => {
  const file = path.join(SIM, lang, 'regions.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
};

const LOCAL_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined);

function svgFor(name) {
  const d = ICONS[name];
  if (!d) return null;
  const parts = d.split('|').map((p) => {
    if (p.startsWith('S ')) return `<path d="${p.slice(2)}" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (p.startsWith('W ')) return `<path d="${p.slice(2)}" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `<path d="${p}" fill="COLOR" fill-rule="evenodd"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${parts.join('')}</svg>`;
}
export const ICON_SVGS = Object.fromEntries(Object.keys(ICONS).map((k) => [k, svgFor(k)]));

// Code changes made only in this browser, never in the app: [what, find, replace].
const PATCHES = [
  ['SF Symbols', "if (!name) {\n      return (0, _reactJsxRuntime.jsx)(_reactJsxRuntime.Fragment, {",
    "if (!name && globalThis.__sfIcon) { const __s = props.size ?? 24; const __u = globalThis.__sfIcon(props.name, props.tintColor); if (__u) return (0, _reactJsxRuntime.jsx)('img', { src: __u, style: { width: __s, height: __s, display: 'block' } }); }\n    if (!name) {\n      return (0, _reactJsxRuntime.jsx)(_reactJsxRuntime.Fragment, {"],
  ['Premium', 'if (!(0, _servicesPurchasesPurchases.hasPurchasesKey)()) return;',
    'if (!(0, _servicesPurchasesPurchases.hasPurchasesKey)()) { if (globalThis.__premium) dispatch((0, _actions.setPremium)(true)); return; }'],
  ['demo data', 'dbPromise = open().catch(',
    'dbPromise = open().then(async (db) => { if (globalThis.__seedSql) { await db.execAsync(globalThis.__seedSql); globalThis.__seedSql = null; } return db; }).catch('],
];

/**
 * A browser page with the app. `seed`: options for seedSql (guide, goal, onboarded). `chat(body)`: the
 * Coach's canned reply for a question. The page is 440 × 894 points (iPhone 17 Pro Max below the status bar) @3x.
 */
export async function openApp({ lang = 'en', seed = {}, premium = true, chat, camera, width = 440, height = 894, scale = 3 } = {}) {
  // `camera`: a .y4m file Chromium plays as the front camera (the workout mirror), camera access already allowed.
  const args = camera ? ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-video-capture=${camera}`] : [];
  const browser = await chromium.launch({ executablePath, args });
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, locale: lang, timezoneId: 'UTC', ...(camera ? { permissions: ['camera'] } : {}) });
  await ctx.clock.install({ time: new Date(`${TODAY}T09:41:00Z`) });
  await ctx.addInitScript(({ sql, premium, fontCss, svgs }) => {
    globalThis.__seedSql = sql;
    globalThis.__premium = premium;
    globalThis.__sfIcon = (name, color) => {
      const svg = svgs[name];
      if (!svg) { (globalThis.__missingIcons ||= new Set()).add(name); return null; }
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.replaceAll('COLOR', typeof color === 'string' ? color : '#E5322D'));
    };
    const style = document.createElement('style');
    style.textContent = `${fontCss}
      *:not([class*=material]){font-family:SFLike,sans-serif!important;font-feature-settings:'cv11','ss03';}
      [class*=navigationMenuRoot]{display:none!important} html,body{scrollbar-width:none} ::-webkit-scrollbar{display:none} *{caret-color:transparent}`;
    const add = () => document.head && !style.isConnected && document.head.appendChild(style);
    add(); document.addEventListener('DOMContentLoaded', add);
  }, { sql: seedSql(seed), premium, fontCss: FONT_CSS, svgs: ICON_SVGS });

  await ctx.route('**/entry.bundle*', async (route) => {
    const res = await route.fetch();
    let js = await res.text();
    for (const [what, find, replace] of PATCHES) {
      if (!js.includes(find)) throw new Error(`bundle patch "${what}" did not apply: the app code changed, update capture/lib.js`);
      js = js.replace(find, replace);
    }
    await route.fulfill({ response: res, body: js });
  });
  await ctx.route(`${DEMO_HOST}/**`, async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    if (route.request().url().endsWith('/plan')) {
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(planReply(body.goal, body.level)) });
    }
    const reply = chat ? await chat(body) : { answer: '…', actions: [] };
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(reply) });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.warn(`  page error: ${String(e).slice(0, 200)}`));
  return { browser, ctx, page, clock: ctx.clock };
}

/** Runs the fake clock (timers and animations only move when it runs). */
export async function settle(app, ms) {
  for (let t = 0; t < ms; t += 100) { await app.clock.runFor(100); await app.page.waitForTimeout(25); }
}

export async function go(app, url, ms = 3000) {
  await app.page.goto(APP_URL + url, { waitUntil: 'domcontentloaded' });
  // The first load fetches and patches the whole bundle in real time: wait until the screen has text.
  for (let i = 0; i < 300; i++) {
    if (await app.page.evaluate(() => (document.body?.innerText || '').trim().length > 20).catch(() => false)) break;
    await app.clock.runFor(100);
    await app.page.waitForTimeout(100);
  }
  await settle(app, ms);
}

export async function missingIcons(app) {
  return app.page.evaluate(() => [...(globalThis.__missingIcons || [])]);
}

export async function shot(app, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await app.page.screenshot({ path: file });
}
