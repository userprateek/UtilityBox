'use client';

import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import {
  applyWebsiteLanguage,
  readWebsiteLanguage,
  WebsiteLanguage,
  writeWebsiteLanguage,
} from '@/lib/i18n/websiteLanguage';

interface WebsiteLanguageContextValue {
  language: WebsiteLanguage;
  setLanguage: (language: WebsiteLanguage) => void;
  promptOpen: boolean;
}

const WebsiteLanguageContext = createContext<WebsiteLanguageContextValue | null>(null);

export function WebsiteLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<WebsiteLanguage>('en');
  const [promptOpen, setPromptOpen] = useState(false);

  useLayoutEffect(() => {
    const saved = readWebsiteLanguage();
    if (saved) {
      setLanguageState(saved);
      applyWebsiteLanguage(saved);
      setPromptOpen(false);
      return;
    }
    applyWebsiteLanguage('en');
    setPromptOpen(true);
  }, []);

  const setLanguage = useCallback((next: WebsiteLanguage) => {
    setLanguageState(next);
    writeWebsiteLanguage(next);
    applyWebsiteLanguage(next);
    setPromptOpen(false);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, promptOpen }),
    [language, setLanguage, promptOpen]
  );

  return (
    <WebsiteLanguageContext.Provider value={value}>{children}</WebsiteLanguageContext.Provider>
  );
}

export function useWebsiteLanguage(): WebsiteLanguageContextValue {
  const value = useContext(WebsiteLanguageContext);
  if (!value) {
    throw new Error('useWebsiteLanguage must be used within WebsiteLanguageProvider');
  }
  return value;
}
