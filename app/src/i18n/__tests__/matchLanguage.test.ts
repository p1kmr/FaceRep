import { matchLanguage } from '../index';

describe('matchLanguage', () => {
  it('picks the first of the iPhone languages the app has', () => {
    expect(matchLanguage(['de-AT', 'en-US'])).toBe('de');
    expect(matchLanguage(['ja-JP', 'fr-CA', 'en-US'])).toBe('fr');
    expect(matchLanguage(['es-MX'])).toBe('es');
    expect(matchLanguage(['it-IT'])).toBe('it');
  });

  it('maps any Portuguese to Brazilian Portuguese', () => {
    expect(matchLanguage(['pt-BR'])).toBe('pt-BR');
    expect(matchLanguage(['pt-PT'])).toBe('pt-BR');
    expect(matchLanguage(['pt'])).toBe('pt-BR');
  });

  it('falls back to English', () => {
    expect(matchLanguage(['ja-JP', 'hi-IN'])).toBe('en');
    expect(matchLanguage([])).toBe('en');
  });
});
