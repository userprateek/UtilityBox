import fs from 'fs';
import path from 'path';
import { GlobalFonts } from '@napi-rs/canvas';
import { languageUsesDevanagari } from '../languages';

const FONT_DIR = path.join(process.cwd(), 'lib/ai/translation/fonts');

let registered = false;

export function registerTranslationFonts(): { latin: string; devanagari: string } {
  const latinFamily = 'NotoSans';
  const devanagariFamily = 'NotoSansDevanagari';

  if (!registered) {
    const latinPath = path.join(FONT_DIR, 'NotoSans-Regular.ttf');
    const devaPath = path.join(FONT_DIR, 'NotoSansDevanagari-Regular.ttf');
    if (fs.existsSync(latinPath)) {
      GlobalFonts.registerFromPath(latinPath, latinFamily);
    }
    if (fs.existsSync(devaPath)) {
      GlobalFonts.registerFromPath(devaPath, devanagariFamily);
    }
    registered = true;
  }

  return { latin: latinFamily, devanagari: devanagariFamily };
}

export function fontFamilyForText(text: string, targetLanguage: string): string {
  const { latin, devanagari } = registerTranslationFonts();
  if (languageUsesDevanagari(targetLanguage) || /[\u0900-\u097F]/.test(text)) {
    return GlobalFonts.has(devanagari) ? devanagari : latin;
  }
  return GlobalFonts.has(latin) ? latin : 'sans-serif';
}
