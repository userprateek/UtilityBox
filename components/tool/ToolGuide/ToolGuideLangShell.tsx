'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useWebsiteLanguage } from '@/components/i18n/WebsiteLanguageProvider';
import styles from './ToolGuide.module.scss';

export function ToolGuideLangShell({
  titles,
  children,
}: {
  titles: React.ReactNode;
  children: React.ReactNode;
}) {
  const { language, setLanguage } = useWebsiteLanguage();

  return (
    <section
      className={styles.guideSection}
      aria-labelledby="how-it-works-title"
      data-lang={language}
    >
      <div className={styles.guideHeader}>
        <div className={styles.topControlRow}>
          <span className={styles.guideOverline}>
            <span className={styles.langEn}>Step-by-Step Guide</span>
            <span className={styles.langHi}>चरण-दर-चरण निर्देश</span>
          </span>

          <div className={styles.langToggleContainer}>
            <Globe size={14} className={styles.langIcon} />
            <button
              type="button"
              data-choice="en"
              className={styles.langBtn}
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              aria-label="Switch to English guide"
            >
              English
            </button>
            <span className={styles.langDivider}>|</span>
            <button
              type="button"
              data-choice="hi"
              className={styles.langBtn}
              onClick={() => setLanguage('hi')}
              aria-pressed={language === 'hi'}
              aria-label="Switch to Hindi guide"
            >
              हिंदी
            </button>
          </div>
        </div>
        {titles}
      </div>
      {children}
    </section>
  );
}
