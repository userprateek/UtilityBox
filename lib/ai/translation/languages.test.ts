import { isSupportedLanguage, websiteLanguageToTarget } from './languages';

describe('translation languages', () => {
  it('treats website language as independent of document language', () => {
    expect(websiteLanguageToTarget('hi-IN')).toBe('hi');
    expect(websiteLanguageToTarget('en')).toBe('en');
    expect(websiteLanguageToTarget('xx-ZZ')).toBe('en');
  });

  it('accepts auto detect only as a source language code', () => {
    expect(isSupportedLanguage('auto')).toBe(true);
    expect(isSupportedLanguage('hi')).toBe(true);
    expect(isSupportedLanguage('elvish')).toBe(false);
  });
});
