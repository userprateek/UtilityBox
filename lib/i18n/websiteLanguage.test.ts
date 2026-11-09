import {
  applyWebsiteLanguage,
  readWebsiteLanguage,
  WEBSITE_LANGUAGE_KEY,
  writeWebsiteLanguage,
} from './websiteLanguage';

describe('website language storage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
    document.documentElement.removeAttribute('data-lang');
  });

  it('returns null when no preference is stored', () => {
    expect(readWebsiteLanguage()).toBeNull();
  });

  it('persists and restores english and hindi', () => {
    expect(writeWebsiteLanguage('hi')).toBe(true);
    expect(localStorage.getItem(WEBSITE_LANGUAGE_KEY)).toBe('hi');
    expect(readWebsiteLanguage()).toBe('hi');

    writeWebsiteLanguage('en');
    expect(readWebsiteLanguage()).toBe('en');
  });

  it('ignores an unknown stored value', () => {
    localStorage.setItem(WEBSITE_LANGUAGE_KEY, 'fr');
    expect(readWebsiteLanguage()).toBeNull();
  });

  it('falls back in memory when storage throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(writeWebsiteLanguage('hi')).toBe(false);
    expect(readWebsiteLanguage()).toBeNull();
    applyWebsiteLanguage('hi');
    expect(document.documentElement.lang).toBe('hi');
    expect(document.documentElement.getAttribute('data-lang')).toBe('hi');
  });
});
