export const WEBSITE_LANGUAGE_KEY = 'docswala-language';

export type WebsiteLanguage = 'en' | 'hi';

export function isWebsiteLanguage(value: string | null | undefined): value is WebsiteLanguage {
  return value === 'en' || value === 'hi';
}

/** Read the saved choice. Returns null when nothing is stored or storage cannot be read. */
export function readWebsiteLanguage(): WebsiteLanguage | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(WEBSITE_LANGUAGE_KEY);
    return isWebsiteLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

/** Persist the choice. Returns false when storage is unavailable; the caller keeps the in-memory value. */
export function writeWebsiteLanguage(language: WebsiteLanguage): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(WEBSITE_LANGUAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}

export function applyWebsiteLanguage(language: WebsiteLanguage) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = language;
  document.documentElement.setAttribute('data-lang', language);
}
