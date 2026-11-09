'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils/cn';
import { Bi } from '@/components/i18n/Bi';
import { useWebsiteLanguage } from '@/components/i18n/WebsiteLanguageProvider';
import styles from './ThemeToggle.module.scss';

export interface ThemeToggleProps {
  variant?: 'button' | 'row';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'button', className }) => {
  const { isDark, toggleTheme, mounted } = useTheme();
  const { language } = useWebsiteLanguage();
  const nextMode = isDark ? 'Light' : 'Dark';
  const themeLabel =
    language === 'hi'
      ? isDark
        ? 'लाइट मोड पर जाएँ'
        : 'डार्क मोड पर जाएँ'
      : `Switch to ${nextMode} ${variant === 'row' ? 'theme' : 'mode'}`;

  // Until mounted, render a placeholder with consistent dimensions to avoid SSR flicker
  if (!mounted) {
    if (variant === 'row') {
      return (
        <div className={cn(styles.themeToggleRow, className)}>
          <div className={styles.rowLabelGroup}>
            <div className={styles.rowIcon}>
              <Sun size={16} />
            </div>
            <div className={styles.rowText}>
              <span className={styles.rowTitle}>
                <Bi en="Appearance" hi="दिखावट" />
              </span>
              <span className={styles.rowSubtitle}>
                <Bi en="Light Mode" hi="लाइट मोड" />
              </span>
            </div>
          </div>
          <div className={styles.switchTrack}>
            <div className={styles.switchThumb} />
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        className={cn(styles.themeToggleBtn, className)}
        aria-label="Toggle theme"
        disabled
      >
        <span className={styles.iconWrapper}>
          <Sun size={17} className={styles.sunIcon} />
        </span>
      </button>
    );
  }

  if (variant === 'row') {
    return (
      <button
        type="button"
        className={cn(styles.themeToggleRow, className)}
        onClick={toggleTheme}
        aria-label={themeLabel}
      >
        <div className={styles.rowLabelGroup}>
          <div className={styles.rowIcon}>
            {isDark ? (
              <Moon size={16} className={styles.moonIcon} />
            ) : (
              <Sun size={16} className={styles.sunIcon} />
            )}
          </div>
          <div className={styles.rowText}>
            <span className={styles.rowTitle}>
              <Bi en="Appearance" hi="दिखावट" />
            </span>
            <span className={styles.rowSubtitle}>
              {isDark ? <Bi en="Dark Mode" hi="डार्क मोड" /> : <Bi en="Light Mode" hi="लाइट मोड" />}
            </span>
          </div>
        </div>
        <div className={cn(styles.switchTrack, isDark && styles.switchTrackActive)}>
          <div className={cn(styles.switchThumb, isDark && styles.switchThumbActive)} />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(styles.themeToggleBtn, className)}
      onClick={toggleTheme}
      title={themeLabel}
      aria-label={themeLabel}
    >
      <span className={styles.iconWrapper}>
        {isDark ? (
          <Sun size={17} className={styles.sunIcon} />
        ) : (
          <Moon size={17} className={styles.moonIcon} />
        )}
      </span>
    </button>
  );
};
