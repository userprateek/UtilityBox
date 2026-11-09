'use client';

import React, { useEffect, useRef } from 'react';
import { useWebsiteLanguage } from './WebsiteLanguageProvider';
import styles from './LanguagePrompt.module.scss';

export function LanguagePrompt() {
  const { promptOpen, setLanguage } = useWebsiteLanguage();
  const englishRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!promptOpen) return;
    englishRef.current?.focus();
  }, [promptOpen]);

  if (!promptOpen) return null;

  return (
    <div
      className={styles.prompt}
      role="dialog"
      aria-labelledby="language-prompt-title"
    >
      <p id="language-prompt-title" className={styles.title}>
        <span lang="en">Choose your language</span>
        <span lang="hi">अपनी भाषा चुनें</span>
      </p>
      <div className={styles.actions}>
        <button
          ref={englishRef}
          type="button"
          className={styles.choice}
          onClick={() => setLanguage('en')}
        >
          English
        </button>
        <button type="button" className={styles.choice} onClick={() => setLanguage('hi')}>
          हिंदी
        </button>
      </div>
    </div>
  );
}
