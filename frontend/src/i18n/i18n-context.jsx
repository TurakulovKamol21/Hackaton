import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setActiveLanguage } from "../lib/finance-utils";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, languageOptions, translations } from "./translations";

const I18nContext = createContext(null);

function interpolate(template, variables) {
  return Object.entries(variables || {}).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, String(value));
  }, template);
}

function resolveTemplate(language, key) {
  return translations[language]?.[key] ?? translations[DEFAULT_LANGUAGE]?.[key] ?? key;
}

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return languageOptions.some((item) => item.value === savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => {
    setActiveLanguage(language);
    const localeTag = languageOptions.find((item) => item.value === language)?.locale || "uz-UZ";

    return {
      language,
      localeTag,
      languages: languageOptions,
      setLanguage,
      t(key, variables) {
        return interpolate(resolveTemplate(language, key), variables);
      }
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
