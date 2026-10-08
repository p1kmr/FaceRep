// Checks that every language has the same namespaces, keys and {{placeholders}} as English (same script as Elowa).
// `npm run i18n:check`; also run by `npm test` (scripts/__tests__/i18n-check.test.js). No dependencies.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const BASE = 'en';

/** Flattens a namespace into { "a.b.c": "text" } (arrays become a.0, a.1…). */
function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((out, [k, v]) => {
    if (v && typeof v === 'object') Object.assign(out, flatten(v, `${prefix}${k}.`));
    else out[`${prefix}${k}`] = String(v);
    return out;
  }, {});
}

function load(root, lang) {
  const dir = path.join(root, lang);
  return Object.fromEntries(
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => [f.replace('.json', ''), flatten(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))]),
  );
}

const placeholders = (text) => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort().join(',');

/** Every problem as a sentence; empty when all languages match English. */
function check(root = ROOT) {
  const reference = load(root, BASE);
  const problems = [];
  for (const lang of fs.readdirSync(root).filter((l) => l !== BASE && !l.startsWith('.'))) {
    const other = load(root, lang);
    for (const ns of Object.keys(other)) if (!reference[ns]) problems.push(`${lang}/${ns}.json has no English source`);
    for (const [ns, entries] of Object.entries(reference)) {
      const theirs = other[ns];
      if (!theirs) {
        problems.push(`${lang}/${ns}.json is missing`);
        continue;
      }
      for (const [key, text] of Object.entries(entries)) {
        if (!(key in theirs)) problems.push(`${lang}/${ns}.json is missing "${key}"`);
        else if (!theirs[key].trim()) problems.push(`${lang}/${ns}.json "${key}" is empty`);
        else if (placeholders(text) !== placeholders(theirs[key]))
          problems.push(`${lang}/${ns}.json "${key}" has different {{placeholders}} than English`);
      }
      for (const key of Object.keys(theirs)) {
        if (key in entries) continue;
        // A language may add a "_zero" form to an English plural (pt-BR says "0 treinos", not "0 treino").
        const other = key.endsWith('_zero') ? entries[`${key.slice(0, -'_zero'.length)}_other`] : undefined;
        if (other === undefined) problems.push(`${lang}/${ns}.json has an extra key "${key}"`);
        else if (!placeholders(theirs[key]).split(',').every((p) => !p || placeholders(other).split(',').includes(p)))
          problems.push(`${lang}/${ns}.json "${key}" has {{placeholders}} that English doesn't`);
      }
    }
  }
  return problems;
}

module.exports = { check, flatten, ROOT };

if (require.main === module) {
  const problems = check();
  for (const p of problems) console.error(p);
  console.log(problems.length ? `${problems.length} i18n problems` : 'i18n: all languages complete');
  process.exit(problems.length ? 1 : 0);
}
