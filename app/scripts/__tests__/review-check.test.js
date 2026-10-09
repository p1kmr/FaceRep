const { check, findClaims, trackingPackages, CLAIMS } = require('../review-check');
const { SUPPORTED_LANGUAGES } = require('../../src/constants/i18n');
const { FREE_LIMITS } = require('../../src/constants/limits');

describe('App Review check (docs/app-review.md)', () => {
  it('app text, store text, screenshot words, paywall, limits and packages pass', () => {
    expect(check()).toEqual([]);
  });

  it('has claim words for every app language', () => {
    expect(Object.keys(CLAIMS).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
  });

  it('the free allowance it checks is the app constant', () => {
    expect(FREE_LIMITS.aiPerMonth).toBeGreaterThan(0);
  });

  it.each([
    ['en', 'Masseter, chin and neck work for a sharper-looking jawline.'],
    ['en', 'How long until I see jawline results?'],
    ['en', 'Get rid of your double chin in 2 weeks'],
    ['en', 'Clinically proven face yoga'],
    ['en', 'Also on Android'],
    ['en', 'The #1 face app'],
    ['es', 'Una mandíbula de aspecto más definido.'],
    ['es', '¿Cuánto tardaré en ver resultados?'],
    ['pt-BR', 'Uma mandíbula de aparência mais definida.'],
    ['de', 'Für eine markanter wirkende Kieferlinie.'],
    ['de', 'Wann sehe ich Ergebnisse?'],
    ['fr', 'Élimine ton double menton'],
    ['fr', 'Pour une mâchoire à l’allure plus nette.'],
    ['it', 'Quanto ci vuole per vedere risultati?'],
    ['it', 'Per una mascella dall’aspetto più definito.'],
  ])('catches %s: %s', (lang, text) => {
    expect(findClaims(lang, text)).not.toEqual([]);
  });

  it.each([
    ['en', "Exercises can tone muscles and improve posture. They can't change bone structure, and results differ for everyone."],
    ['en', 'Smile wide with closed lips and lift your cheeks toward your eyes.'],
    ['en', 'Can exercises help a double chin?'],
    ['en', 'A light burn in the muscle is fine; pain is not.'],
    ['en', 'Best value'],
    ['en', 'Unlimited AI Coach answers on technique and routine'],
    ['de', 'Unbegrenzte Antworten mit Premium'],
    ['es', 'Los resultados varían.'],
    ['de', 'Können Übungen bei einem Doppelkinn helfen?'],
    ['fr', 'Les exercices peuvent-ils aider pour le double menton ?'],
    ['it', 'Non perdere la serie'],
  ])('leaves honest text alone (%s): %s', (lang, text) => {
    expect(findClaims(lang, text)).toEqual([]);
  });

  it('flags ad, analytics and tracking packages only', () => {
    expect(
      trackingPackages({
        'react-native-google-mobile-ads': '1',
        '@react-native-firebase/analytics': '1',
        '@sentry/react-native': '1',
        'expo-camera': '1',
        'react-native-safe-area-context': '1',
        'react-native-purchases': '1',
      }),
    ).toEqual(['react-native-google-mobile-ads', '@react-native-firebase/analytics', '@sentry/react-native']);
  });
});
