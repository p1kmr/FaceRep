// App Review safety net: finds words and setups that get apps rejected under Apple's App Review Guidelines
// (docs/app-review.md). `npm run review:check`; also run by `npm test` (scripts/__tests__/review-check.test.js).
// A word list can't judge meaning: the checklist in docs/app-review.md §1 still applies to every change.
// No dependencies.
const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '..');
const REPO = path.join(APP, '..');
const read = (file) => fs.readFileSync(path.join(REPO, file), 'utf8');

// \b only knows ASCII letters, so "élimine" or "más" would never match it. B is the same boundary for every alphabet.
const B = '(?:(?<![\\p{L}\\p{N}])(?=[\\p{L}\\p{N}])|(?<=[\\p{L}\\p{N}])(?![\\p{L}\\p{N}]))';
const rule = (re, why) => ({ re: new RegExp(re.source.replaceAll('\\b', B), 'iu'), why });

const RESULT = 'result or look claim (2.3.1, 1.4.1)';
const MEDICAL = 'medical claim (1.4.1)';
const PROOF = 'proof claim nobody can back up (2.3.1)';
const CAP = 'Premium has a daily cap: say "up to N a day" (3.1.2(c))';
const RESULTS = 'question or promise about seeing results (2.3.1)';
const KIDS = '"for kids" is reserved for the Kids Category (2.3.8)';

/** Checked in every language: other platforms (2.3.10) and rank claims. */
const ANY = [
  rule(/\b(android|google play|play store)\b/, 'names another platform (2.3.10)'),
  rule(/(#1(?!\d)|\bnumber one\b|\banti[- ]?(aging|ageing|wrinkles?)\b)/, PROOF),
];

/** Per language. A new app language needs its own list (the test checks every language has one). */
const CLAIMS = {
  en: [
    rule(/\b(sharper|slimmer|thinner|younger|tighter|firmer|fuller|plumper|smoother)\b/, RESULT),
    rule(/\b(reshape[sd]?|face ?lift(ing)?|lifts? (and \w+ )?your (face|skin|jowls)|lifted (face|cheeks|skin))\b/, RESULT),
    rule(/\b(get rid of|lose|losing|eliminate|remove|reduce|burn)\b[^.?!]{0,25}\b(double chin|chin fat|face fat|wrinkles?|jowls?|fine lines|sagging)\b/, RESULT),
    rule(/\b(cures?|cured|heals?|healing|relieves?)\b/, MEDICAL),
    rule(/\b(guaranteed?|clinically|scientifically|proven|dermatologist[- ]approved|doctor[- ]approved)\b/, PROOF),
    rule(/\b(best (app|face|jawline|workout))\b/, PROOF),
    rule(/\bunlimited\b/, CAP),
    rule(/\bsee\b[^.?!]{0,20}\bresults?\b|\b(results?|difference) (in|within) (just )?\d+ (days?|weeks?)\b/, RESULTS),
    rule(/\bfor (kids|children)\b/, KIDS),
  ],
  es: [
    rule(/\b(más joven|rejuvenec\w*|antiedad|antiarrugas|adelgaz\w*|más definid[oa]s?)\b/, RESULT),
    rule(/\b(elimin\w*|quitar|perder|reduc\w*|adiós a)\b[^.?!]{0,25}\b(papada|arrugas|grasa facial|flacidez)\b/, RESULT),
    rule(/\b(curar|cura (el|la|los|las)|alivia\w*)\b/, MEDICAL),
    rule(/\b(garantiz\w*|clínicamente|científicamente|probad[oa] científicamente)\b/, PROOF),
    rule(/\bilimitad[oa]s?\b/, CAP),
    rule(/\bver resultados\b/, RESULTS),
    rule(/\bpara niños\b/, KIDS),
  ],
  'pt-BR': [
    rule(/\b(mais jovem|rejuvenesc\w*|antienvelhecimento|antirrugas|emagrec\w*|mais definid[oa]s?)\b/, RESULT),
    rule(/\b(elimin\w*|perder|reduz\w*|acabar com|adeus)\b[^.?!]{0,25}\b(papada|rugas|gordura facial|flacidez)\b/, RESULT),
    rule(/\b(curar?|alivia\w*)\b/, MEDICAL),
    rule(/\b(garant\w*|clinicamente|cientificamente|comprovad[oa]s?)\b/, PROOF),
    rule(/\bilimitad[oa]s?\b/, CAP),
    rule(/\bver resultados\b/, RESULTS),
    rule(/\bpara crianças\b/, KIDS),
  ],
  de: [
    rule(/\b(jünger\w*|straffer\w*|schlanker\w*|markanter\w*|definierter\w*|vollere lippen|faltenfrei)\b/, RESULT),
    rule(/\b(reduzier\w*|beseitig\w*|entfern\w*|loswerden|los werden)\b[^.?!]{0,25}\b(doppelkinn|falten)\b|\b(doppelkinn|falten)\b[^.?!]{0,25}\b(weg|loswerden|reduzieren|beseitigen|entfernen)\b/, RESULT),
    rule(/\b(heilt|heilen|lindert|lindern)\b/, MEDICAL),
    rule(/\b(garantiert|klinisch|wissenschaftlich (bewiesen|belegt)|nachweislich)\b/, PROOF),
    rule(/\bunbegrenzt\w*\b/, CAP),
    rule(/\bseh\w*\b[^.?!]{0,15}\bergebnisse?\b/, RESULTS),
    rule(/\bfür kinder\b/, KIDS),
  ],
  fr: [
    rule(/\b(plus jeune|rajeuni\w*|antiâge|anti-âge|antirides|amincir|plus nette|plus défini\w*|plus pulpeuses?)\b/, RESULT),
    rule(/\b(élimin\w*|perdre|réduire|supprimer|adieu)\b[^.?!]{0,25}\b(double menton|rides|gras du visage)\b/, RESULT),
    rule(/\b(guéri\w*|soulage\w*)\b/, MEDICAL),
    rule(/\b(garanti\w*|cliniquement|scientifiquement|prouvé\w*)\b/, PROOF),
    rule(/\billimité\w*\b/, CAP),
    rule(/\bvoir des résultats\b/, RESULTS),
    rule(/\bpour (les )?enfants\b/, KIDS),
  ],
  it: [
    rule(/\b(più giovane|ringiovan\w*|antietà|anti-età|antirughe|snell\w*|più definit[oa])\b/, RESULT),
    rule(/\b(elimin\w*|perdere|ridurre|addio)\b[^.?!]{0,25}\b(doppio mento|rughe|grasso del viso)\b/, RESULT),
    rule(/\b(guarisc\w*|curare|allevia\w*)\b/, MEDICAL),
    rule(/\b(garantit\w*|clinicamente|scientificamente|dimostrat\w*)\b/, PROOF),
    rule(/\billimitat[eio]\b/, CAP),
    rule(/\bvedere (i )?risultati\b/, RESULTS),
    rule(/\bper bambini\b/, KIDS),
  ],
};

/**
 * Exact sentences that trip a rule but are fine, each with a reason. Prefer rewording; add here only when the
 * sentence is honest and can't be said another way.
 */
const ALLOWED = [];

/** Problems in one text, e.g. ['"sharper": result or look claim (2.3.1, 1.4.1)']. */
function findClaims(lang, text) {
  let clean = String(text).replace(/\\n/g, ' ').replace(/\*/g, '');
  for (const ok of ALLOWED) clean = clean.split(ok).join(' ');
  return [...ANY, ...(CLAIMS[lang] ?? [])].flatMap(({ re, why }) => {
    const m = clean.match(re);
    return m ? [`"${m[0]}": ${why}`] : [];
  });
}

function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((out, [k, v]) => {
    if (v && typeof v === 'object') Object.assign(out, flatten(v, `${prefix}${k}.`));
    else out[`${prefix}${k}`] = String(v);
    return out;
  }, {});
}

/** Every user-visible text as { where, lang, text }: app strings, iOS texts, store listing, screenshot words, web pages. */
function texts() {
  const out = [];
  const locales = 'app/src/i18n/locales';
  for (const lang of fs.readdirSync(path.join(REPO, locales)).filter((l) => !l.startsWith('.'))) {
    for (const file of fs.readdirSync(path.join(REPO, locales, lang)).filter((f) => f.endsWith('.json'))) {
      const where = `${locales}/${lang}/${file}`;
      for (const [key, text] of Object.entries(flatten(JSON.parse(read(where))))) out.push({ where: `${where} "${key}"`, lang, text });
    }
    const native = `app/locales-native/${lang}.json`;
    for (const [key, text] of Object.entries(JSON.parse(read(native)))) out.push({ where: `${native} "${key}"`, lang, text });
  }
  for (const s of storeSections()) out.push({ where: `docs/store-listing.md (${s.heading})`, lang: s.lang, text: s.text });
  for (const [lang, block] of Object.entries(screenshotBlocks())) out.push({ where: `store-screenshots/capture/copy.js (${lang})`, lang, text: block });
  out.push({ where: 'worker/src/pages.js', lang: 'en', text: read('worker/src/pages.js') });
  return out;
}

const STORE_LANGS = { 'English (US)': 'en', 'Spanish (es)': 'es', 'Portuguese (Brazil)': 'pt-BR', German: 'de', French: 'fr', Italian: 'it' };

/** The per-language sections of docs/store-listing.md (the rules at the top quote bad examples, so they're skipped). */
function storeSections() {
  return read('docs/store-listing.md')
    .split(/^## /m)
    .slice(1)
    .map((part) => {
      const heading = part.split('\n')[0].trim();
      return { heading, lang: STORE_LANGS[heading], text: part };
    });
}

/** copy.js as raw text per language block (it's an ES module, so it's read, not imported). */
function screenshotBlocks() {
  const source = read('store-screenshots/capture/copy.js');
  const starts = [...source.matchAll(/^ {2}(?:'([\w-]+)'|(\w+)): \{$/gm)].map((m) => ({ lang: m[1] ?? m[2], at: m.index }));
  return Object.fromEntries(starts.map((s, i) => [s.lang, source.slice(s.at, starts[i + 1]?.at ?? source.length)]));
}

const number = (file, re) => Number(read(file).match(re)?.[1]);

/** Ad, analytics and tracking SDKs (CLAUDE.md: never; they would also change the App Privacy labels). */
const TRACKING = /(^|[@/-])(analytics|admob|google-mobile-ads|tracking-transparency|fbsdk|facebook|appsflyer|adjust|branch|amplitude|mixpanel|segment|posthog|sentry|onesignal|clevertap|braze|firebase)([/-]|$)/;
const trackingPackages = (deps) => Object.keys(deps).filter((name) => TRACKING.test(name));

/** Every problem as a sentence; empty when nothing was found. */
function check() {
  const problems = [];
  const app = 'docs/app-review.md';

  for (const { where, lang, text } of texts()) {
    if (!lang) {
      problems.push(`${where}: unknown language section; map it in STORE_LANGS (scripts/review-check.js)`);
      continue;
    }
    for (const p of findClaims(lang, text)) problems.push(`${where}: ${p}. See ${app} §1`);
  }
  for (const lang of fs.readdirSync(path.join(REPO, 'app/src/i18n/locales')).filter((l) => !l.startsWith('.'))) {
    if (!CLAIMS[lang]) problems.push(`no claim words for "${lang}" in scripts/review-check.js`);
  }

  // Screenshots: no prices (2.3.7).
  for (const [lang, block] of Object.entries(screenshotBlocks())) {
    const price = block.match(/[$€£¥₹]\s?\d|\d[.,]\d{2}(?!\d)|\d\s?(usd|eur|gbp)\b/i);
    if (price) problems.push(`store-screenshots/capture/copy.js (${lang}): price "${price[0]}" in screenshot words (2.3.7)`);
  }

  // The paywall keeps everything Apple asks for before a subscription (3.1.2, Schedule 2).
  const paywall = read('app/src/components/paywall/PaywallView.tsx');
  for (const part of ["t('renewal')", 'onRestore', 'LINKS.terms', 'LINKS.privacy', 'onClose', 'card.price']) {
    if (!paywall.includes(part)) problems.push(`PaywallView.tsx no longer uses ${part}: the paywall must show price, renewal terms, Restore, Terms, Privacy and a close button (3.1.2)`);
  }
  const renewal = JSON.parse(read('app/src/i18n/locales/en/paywall.json')).renewal ?? '';
  if (!/renews automatically/i.test(renewal) || !/24 hours/.test(renewal)) {
    problems.push('en/paywall.json "renewal" must say it renews automatically unless cancelled 24 hours before the period ends (3.1.2)');
  }

  // Numbers the app promises match what the Worker enforces (2.3.1, 3.1.2(c)).
  const free = number('app/src/constants/limits.ts', /aiPerMonth:\s*(\d+)/);
  const perDay = number('app/src/constants/limits.ts', /aiPerDay:\s*(\d+)/);
  if (free !== number('worker/src/lib/access.js', /FREE_PER_MONTH\s*=\s*(\d+)/)) {
    problems.push('FREE_LIMITS.aiPerMonth (app) differs from FREE_PER_MONTH (worker/src/lib/access.js)');
  }
  if (perDay !== number('worker/src/lib/ratelimit.js', /perUser:\s*(\d+)/)) {
    problems.push('PREMIUM_LIMITS.aiPerDay (app) differs from LIMITS.perUser (worker/src/lib/ratelimit.js)');
  }
  const english = storeSections().find((s) => s.lang === 'en')?.text ?? '';
  if (!english.includes(`${free} free answers a month`)) problems.push(`docs/store-listing.md (English) must say "${free} free answers a month"`);
  if (!english.includes(`Up to ${perDay} AI Coach answers a day`)) problems.push(`docs/store-listing.md (English) must say "Up to ${perDay} AI Coach answers a day"`);
  for (const s of storeSections()) {
    if (!new RegExp(`(?<!\\d)${perDay}(?!\\d)`).test(s.text)) problems.push(`docs/store-listing.md (${s.heading}) doesn't mention the ${perDay}-a-day Coach cap`);
  }
  if (!screenshotBlocks().en?.includes(`${free} FREE ANSWERS A MONTH`)) problems.push(`copy.js (en) slide 8 must say "${free} FREE ANSWERS A MONTH"`);

  // No tracking (5.1.2, App Privacy labels).
  const pkg = JSON.parse(read('app/package.json'));
  for (const name of trackingPackages({ ...pkg.dependencies, ...pkg.devDependencies })) {
    problems.push(`app/package.json has "${name}": no ads, analytics or tracking SDKs (CLAUDE.md, 5.1.2, App Privacy)`);
  }
  const expo = JSON.parse(read('app/app.json')).expo;
  const manifest = expo.ios?.privacyManifests ?? {};
  if (manifest.NSPrivacyTracking !== false || (manifest.NSPrivacyTrackingDomains ?? []).length) {
    problems.push('app.json privacyManifests must say NSPrivacyTracking false with no tracking domains');
  }
  if (expo.ios?.infoPlist?.NSUserTrackingUsageDescription) problems.push('app.json asks for tracking (NSUserTrackingUsageDescription): FaceRep never tracks');

  return problems;
}

module.exports = { check, findClaims, trackingPackages, CLAIMS };

if (require.main === module) {
  const problems = check();
  if (problems.length) {
    console.error(`App Review check: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
    process.exit(1);
  }
  console.log('App Review check: no problems found (docs/app-review.md §1 still applies)');
}
