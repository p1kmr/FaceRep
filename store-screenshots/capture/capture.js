// Films the real app screens (web build + demo data) for every language → raw/<lang>/<screen>.png @3x,
// 440 points wide, below the iPhone 17 Pro Max's 62 pt status bar: tab screens 894 pt tall (they scroll under
// the tab bar), other screens 860 pt (above the 34 pt home bar area), the Coach sheet 850 pt.
// frame.js then adds the iPhone parts.
// Usage: node capture.js [lang …]   (the web build must be running, see ../README.md)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { COPY, LANGS, CHAT_ACTION } from './copy.js';
import { openApp, go, settle, shot, missingIcons } from './lib.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(HERE, 'raw');
const APP_LOCALES = path.join(HERE, '../../app/src/i18n/locales');
const t = (lang, ns, key) => key.split('.').reduce((o, k) => o[k], JSON.parse(fs.readFileSync(`${APP_LOCALES}/${lang}/${ns}.json`, 'utf8')));

const FULL = 860; // 956 − 62 status bar − 34 home bar

const save = async (app, lang, name) => {
  const file = path.join(RAW, lang, `${name}.png`);
  await shot(app, file);
  console.log(`  ${path.relative(HERE, file)}`);
};

/**
 * The phase word in the timer ring uses adjustsFontSizeToFit (minimumFontScale 0.7) on the iPhone; the web build
 * cuts it with "…" instead. Shrink it the way iOS does, so long words (German "Anspannen") fit.
 */
async function fitText(app, text) {
  await app.page.evaluate((text) => {
    for (const el of document.querySelectorAll('div')) {
      if (el.childElementCount || el.textContent.toLowerCase() !== text.toLowerCase()) continue; // shown in capitals
      const base = parseFloat(getComputedStyle(el).fontSize);
      for (let f = 1; f >= 0.7 && el.scrollWidth > el.clientWidth; f -= 0.02) el.style.fontSize = `${base * f}px`;
    }
  }, text);
}

/** The card (white, rounded) around an element. */
const CARD_OF = `(el) => { while (el && el.parentElement) { const cs = getComputedStyle(el); if (cs.backgroundColor === 'rgb(255, 255, 255)' && parseFloat(cs.borderTopLeftRadius) >= 8) return el; el = el.parentElement; } return null; }`;

/** Weeks 1–2 of Today's 28-day grid (days 4–17 in the demo), in raw-capture points: [x, y, w, h]. */
async function gridRegion(app) {
  return app.page.evaluate((cardOf) => {
    const card = eval(cardOf);
    const days = [...document.querySelectorAll('div')].filter((e) => !e.childElementCount && /^(?:[4-9]|1[0-7])$/.test(e.textContent.trim()))
      .filter((e) => e.getBoundingClientRect().width > 0); // other tabs stay in the page, hidden
    if (days.length < 14) return null;
    const box = card(days[0]).getBoundingClientRect();
    const top = Math.min(...days.map((d) => d.getBoundingClientRect().top));
    const bottom = Math.max(...days.map((d) => d.getBoundingClientRect().bottom));
    return [box.left, top - 14, box.width, bottom - top + 44].map((v) => Math.round(v));
  }, CARD_OF);
}

/** The Coach's "New reminder" card, in raw-capture points. */
async function cardRegion(app, title) {
  return app.page.evaluate(([cardOf, title]) => {
    const card = eval(cardOf);
    const leaf = [...document.querySelectorAll('div')].find((e) => !e.childElementCount && e.textContent.trim() === title);
    const c = leaf && card(leaf);
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return [r.left, r.top, r.width, r.height].map((v) => Math.round(v));
  }, [CARD_OF, title]);
}

const saveRegions = (lang, add) => {
  const file = path.join(RAW, lang, 'regions.json');
  const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  fs.writeFileSync(file, JSON.stringify({ ...old, ...add }));
};

/** The workout player 1.3 s into the 3rd squeeze of today's first exercise (Jaw Clench): muscle red, ring part-way. */
async function workout(lang, guide, name) {
  const app = await openApp({ lang, seed: { guide }, height: FULL });
  await go(app, '/', 5000);
  await app.page.getByText(t(lang, 'home', 'plan.start').replace('{{day}}', '12'), { exact: true }).first().click();
  const squeeze = t(lang, 'workout', 'phase.hold').toLowerCase();
  const rep3 = t(lang, 'workout', 'rep').replace('{{rep}}', '3').replace('{{reps}}', '9').toLowerCase();
  let found = false;
  for (let ms = 0; ms < 40000 && !found; ms += 100) {
    await settle(app, 100);
    found = await app.page.evaluate(([a, b]) => { const s = document.body.innerText.toLowerCase(); return s.includes(a) && s.includes(b); }, [squeeze, rep3]);
  }
  if (!found) throw new Error(`${lang}: the workout never reached "${rep3}" + "${squeeze}"`);
  await settle(app, 1300);
  await fitText(app, t(lang, 'workout', 'phase.hold'));
  await save(app, lang, name);
  const missing = await missingIcons(app);
  await app.browser.close();
  return missing;
}

async function today(app, lang) {
  await go(app, '/', 5000);
  await save(app, lang, 'today');
  const grid = await gridRegion(app);
  if (!grid) throw new Error(`${lang}: the 28-day grid wasn't found on Today`);
  saveRegions(lang, { grid });
}

/** The Coach: a technique question, then a reminder it prepares (canned answers, no AI call). */
async function coach(lang) {
  const c = COPY[lang].chat;
  const replies = [{ answer: c.reply1, actions: [] }, { answer: c.reply2, actions: [CHAT_ACTION] }];
  let n = 0;
  // Sheet height: on the iPhone the Coach is a sheet 10 pt below the status bar, above the home bar area.
  const app = await openApp({ lang, seed: { guide: 'woman' }, height: 850, chat: () => replies[Math.min(n++, 1)] });
  await go(app, '/coach', 5000);
  const input = app.page.locator('textarea').last();
  for (const ask of [c.ask1, c.ask2]) {
    await input.fill(ask);
    await app.page.getByLabel(t(lang, 'coach', 'send'), { exact: true }).click();
    await settle(app, 3000);
  }
  await app.page.evaluate(() => document.activeElement?.blur());
  await settle(app, 800);
  await save(app, lang, 'coach');
  const card = await cardRegion(app, t(lang, 'coach', 'actions.create'));
  if (!card) throw new Error(`${lang}: the Coach's reminder card wasn't found`);
  saveRegions(lang, { card });
  const missing = await missingIcons(app);
  await app.browser.close();
  return missing;
}

async function captureLang(lang) {
  console.log(lang);
  const missing = new Set();
  const note = (list) => list.forEach((m) => missing.add(m));

  // Tab screens and the exercise page (woman pictures, the "full face" goal).
  let app = await openApp({ lang, seed: { guide: 'woman' } });
  await today(app, lang);
  await go(app, '/progress', 4000);
  await save(app, lang, 'progress');
  await go(app, '/exercises', 3000);
  await save(app, lang, 'exercises');
  note(await missingIcons(app));
  await app.browser.close();

  // His Jawline list, then the exercise pages (woman and man pictures).
  app = await openApp({ lang, seed: { guide: 'man', goal: 'jawline' } });
  await go(app, '/exercises', 5000);
  await save(app, lang, 'exercises-man');
  await app.browser.close();
  app = await openApp({ lang, seed: { guide: 'man', goal: 'jawline' }, height: FULL });
  await go(app, '/exercise/01-jaw-clench', 5000);
  await save(app, lang, 'exercise-man');
  await app.browser.close();
  app = await openApp({ lang, seed: { guide: 'woman' }, height: FULL });
  await go(app, '/exercise/06-cheek-lift', 5000);
  await save(app, lang, 'exercise');
  await app.browser.close();

  // First launch: "Who should the exercises show?"
  app = await openApp({ lang, seed: { onboarded: false }, height: FULL });
  await go(app, '/onboarding/guide', 5000);
  await save(app, lang, 'guide');
  await app.browser.close();

  note(await workout(lang, 'woman', 'workout'));
  note(await workout(lang, 'man', 'workout-man'));

  note(await coach(lang));

  if (missing.size) console.warn(`  ${lang}: no look-alike for SF Symbols ${[...missing].join(', ')} (add them to icons.js)`);
}

// node capture.js [lang …] [--workout] [--pops]   (only the workout screens / only Today and the Coach)
const args = process.argv.slice(2);
const onlyWorkout = args.includes('--workout');
const onlyPops = args.includes('--pops'); // only Today and the Coach (the screens with lifted-out cards)
const langs = args.filter((a) => !a.startsWith('--'));
for (const lang of langs.length ? langs : LANGS) {
  if (!COPY[lang]) throw new Error(`unknown language ${lang}`);
  if (onlyWorkout || onlyPops) {
    console.log(lang);
    if (onlyWorkout) {
      await workout(lang, 'woman', 'workout');
      await workout(lang, 'man', 'workout-man');
    }
    if (onlyPops) {
      const app = await openApp({ lang, seed: { guide: 'woman' } });
      await today(app, lang);
      await app.browser.close();
      await coach(lang);
    }
  } else {
    await captureLang(lang);
  }
}
