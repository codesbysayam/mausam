import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  Language,
  TranslationDictionary,
  translations,
  translateWeatherCondition,
  formatLocalizedDate,
} from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationDictionary | string, fallback?: string) => string;
  tCondition: (condition: string) => string;
  formatDate: (date: Date) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mausam_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi' || saved === 'or') {
        return saved;
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  // Sync font family, lang attribute, and document direction
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';

    // Apply font family globally based on language
    if (language === 'or') {
      document.body.style.fontFamily =
        '"Noto Sans Oriya", "Noto Sans", Arial, sans-serif';
    } else if (language === 'hi') {
      document.body.style.fontFamily =
        '"Noto Sans Devanagari", "Noto Sans", Arial, sans-serif';
    } else {
      document.body.style.fontFamily =
        'Roboto, "Noto Sans", Arial, Helvetica, sans-serif';
    }
  }, [language]);

  const t = useCallback(
    (key: keyof TranslationDictionary | string, fallback?: string): string => {
      const currentDict = translations[language] as unknown as Record<string, string>;
      if (currentDict && currentDict[key]) {
        return currentDict[key];
      }

      // Fallback to English dictionary
      const enDict = translations.en as unknown as Record<string, string>;
      if (enDict && enDict[key]) {
        return enDict[key];
      }

      // Custom fallback or key string itself
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  const tCondition = useCallback(
    (condition: string): string => {
      return translateWeatherCondition(condition, language);
    },
    [language]
  );

  const formatDate = useCallback(
    (date: Date): string => {
      return formatLocalizedDate(date, language);
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tCondition,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
