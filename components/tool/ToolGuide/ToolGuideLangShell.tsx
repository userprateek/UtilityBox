'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import styles from './ToolGuide.module.scss';

export function ToolGuideLangShell({
  titles,
  children,
}: {
  titles: React.ReactNode;
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  return (
    <section
      className={styles.guideSection}
      aria-labelledby="how-it-works-title"
      data-lang={lang}
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
              className={`${styles.langBtn} ${lang === 'en' ? styles.activeLang : ''}`}
              onClick={() => setLang('en')}
              aria-label="Switch to English guide"
            >
              English
            </button>
            <span className={styles.langDivider}>|</span>
            <button
              type="button"
              className={`${styles.langBtn} ${lang === 'hi' ? styles.activeLang : ''}`}
              onClick={() => setLang('hi')}
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
