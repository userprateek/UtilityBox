export interface TranslationLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

export const AUTO_DETECT_CODE = 'auto';

const BY_CODE = new Map(TRANSLATION_LANGUAGES.map((lang) => [lang.code, lang]));

export function isSupportedLanguage(code: string): boolean {
  return code === AUTO_DETECT_CODE || BY_CODE.has(code);
}

export function getLanguageName(code: string): string {
  if (code === AUTO_DETECT_CODE) return 'Auto detect';
  return BY_CODE.get(code)?.name ?? code;
}

export function languageUsesDevanagari(code: string): boolean {
  return code === 'hi' || code === 'mr' || code === 'ne';
}

/** Map a website/html language tag to a supported translation target. */
export function websiteLanguageToTarget(tag: string | undefined | null): string {
  if (!tag) return 'en';
  const code = tag.trim().toLowerCase().split(/[-_]/)[0];
  return code && BY_CODE.has(code) ? code : 'en';
}
