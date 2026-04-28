"use client";

import { useLanguage } from "@/i18n/language-provider";
import { LANGUAGES } from "@/i18n/messages";

export function LanguageSwitcher() {
  const { language, messages, setLanguage } = useLanguage();

  return (
    <div
      aria-label={messages.common.languageLabel}
      className="inline-flex items-center rounded-full border border-[var(--color-outline-soft)] bg-white p-1"
      role="group"
    >
      {LANGUAGES.map((value) => {
        const isSelected = language === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => setLanguage(value)}
            aria-pressed={isSelected}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.08em] transition-colors ${
              isSelected
                ? "bg-[var(--color-primary)] text-white"
                : "text-[#66707a] hover:text-[#1f3f31]"
            }`}
          >
            {value === "da" ? messages.common.languageDa : messages.common.languageEn}
          </button>
        );
      })}
    </div>
  );
}
