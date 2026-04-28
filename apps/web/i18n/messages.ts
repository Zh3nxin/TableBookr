import { da } from "./da";
import { en } from "./en";
import { Language, Messages } from "./types";

export const LANGUAGES = ["da", "en"] as const;
export const DEFAULT_LANGUAGE: Language = "en";
export const STORAGE_LANGUAGE_KEY = "tablebookr-language";

export const messages: Record<Language, Messages> = {
  da,
  en
};

export function isLanguage(value: string | null): value is Language {
  return value === "da" || value === "en";
}

export function detectBrowserLanguage() {
  if (typeof navigator === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  return navigator.language.toLowerCase().startsWith("da") ? "da" : "en";
}

export function getSavedLanguage() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_LANGUAGE_KEY);

  return isLanguage(value) ? value : null;
}
