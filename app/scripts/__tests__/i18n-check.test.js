const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { check } = require('../i18n-check');
const { SUPPORTED_LANGUAGES } = require('../../src/constants/i18n');

const roots = [];
afterAll(() => roots.forEach((root) => fs.rmSync(root, { recursive: true, force: true })));

/** A locales folder with { lang: { namespace: json } }. */
function locales(langs) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'locales-'));
  roots.push(root);
  for (const [lang, namespaces] of Object.entries(langs)) {
    fs.mkdirSync(path.join(root, lang));
    for (const [ns, json] of Object.entries(namespaces)) fs.writeFileSync(path.join(root, lang, `${ns}.json`), JSON.stringify(json));
  }
  return root;
}

describe('i18n check', () => {
  it('every app language is complete', () => {
    expect(check()).toEqual([]);
  });

  it('every supported language has a folder and a native-texts file, and nothing else does', () => {
    const app = path.join(__dirname, '..', '..');
    expect(fs.readdirSync(path.join(app, 'src/i18n/locales')).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
    const appJson = JSON.parse(fs.readFileSync(path.join(app, 'app.json'), 'utf8'));
    expect(Object.keys(appJson.expo.locales).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
    for (const file of Object.values(appJson.expo.locales)) {
      const native = JSON.parse(fs.readFileSync(path.join(app, file), 'utf8'));
      expect(Object.keys(native).sort()).toEqual(['CFBundleDisplayName', 'NSCameraUsageDescription', 'NSMicrophoneUsageDescription']);
    }
  });

  it('reports missing, extra and empty keys and different placeholders', () => {
    const root = locales({
      en: { common: { hi: 'Hi {{name}}', steps: ['one', 'two'], gone: 'x' } },
      de: { common: { hi: 'Hallo {{nombre}}', steps: ['eins'], extra: 'y', gone: ' ' }, other: { a: 'b' } },
    });
    expect(check(root).sort()).toEqual(
      [
        'de/common.json "hi" has different {{placeholders}} than English',
        'de/common.json is missing "steps.1"',
        'de/common.json has an extra key "extra"',
        'de/common.json "gone" is empty',
        'de/other.json has no English source',
      ].sort(),
    );
  });

  it('allows a "_zero" form of an English plural, with no new placeholders', () => {
    const root = locales({
      en: { common: { days_one: '{{count}} day', days_other: '{{count}} days' } },
      'pt-BR': { common: { days_one: '{{count}} dia', days_other: '{{count}} dias', days_zero: '{{count}} dias', x_zero: 'x' } },
      it: { common: { days_one: '{{count}} giorno', days_other: '{{count}} giorni', days_zero: '{{n}} giorni' } },
    });
    expect(check(root).sort()).toEqual(['it/common.json "days_zero" has {{placeholders}} that English doesn\'t', 'pt-BR/common.json has an extra key "x_zero"']);
  });

  it('reports a missing namespace file', () => {
    const root = locales({ en: { common: { a: 'A' }, home: { b: 'B' } }, fr: { common: { a: 'A' } } });
    expect(check(root)).toEqual(['fr/home.json is missing']);
  });
});
