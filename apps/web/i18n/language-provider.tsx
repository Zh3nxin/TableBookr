"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { Language, Messages } from "./types";
import {
  DEFAULT_LANGUAGE,
  detectBrowserLanguage,
  getSavedLanguage,
  messages,
  STORAGE_LANGUAGE_KEY
} from "./messages";

type LanguageContextValue = {
  language: Language;
  messages: Messages;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const nextLanguage = getSavedLanguage() ?? detectBrowserLanguage();

    setLanguageState(nextLanguage);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_LANGUAGE_KEY, language);
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      messages: messages[language],
      setLanguage: setLanguageState
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
