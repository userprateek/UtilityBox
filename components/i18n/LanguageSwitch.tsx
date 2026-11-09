'use client';

import React from 'react';
import { useWebsiteLanguage } from './WebsiteLanguageProvider';
import styles from './LanguageSwitch.module.scss';

export function LanguageSwitch() {
  const { language, setLanguage } = useWebsiteLanguage();

  return (
    <div className={styles.switch} role="group" aria-label="Website language">
      <button
        type="button"
        data-choice="en"
        className={styles.choice}
        aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}
      >
        English
      </button>
      <button
        type="button"
        data-choice="hi"
        className={styles.choice}
        aria-pressed={language === 'hi'}
        onClick={() => setLanguage('hi')}
      >
        हिंदी
      </button>
    </div>
  );
}
