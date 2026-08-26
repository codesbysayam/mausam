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
  LanguageInfo,
  SCHEDULED_LANGUAGES,
  TranslationDictionary,
  translations,
  translateWeatherCondition,
  formatLocalizedDate,
} from './translations';

interface LanguageContextType {
  language: Language;
  currentLanguageInfo: LanguageInfo;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationDictionary | string, fallback?: string) => string;
  tCondition: (condition: string) => string;
  formatDate: (date: Date) => string;
  availableLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mausam_language';

const VALID_LANGUAGES = new Set(SCHEDULED_LANGUAGES.map((l) => l.code));

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_LANGUAGES.has(saved as Language)) {
        return saved as Language;
      }
    } catch {
      // Ignore storage errors
    }
    return 'en';
  });

  const currentLanguageInfo =
    SCHEDULED_LANGUAGES.find((l) => l.code === language) || SCHEDULED_LANGUAGES[0];

  const setLanguage = useCallback((lang: Language) => {
    if (VALID_LANGUAGES.has(lang)) {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  // Sync font family, lang attribute, and text direction
  useEffect(() => {
    document.documentElement.lang = language;
    
    // Set text direction
    if (currentLanguageInfo.isRtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }

    // Apply font family globally based on language metadata
    document.body.style.fontFamily = currentLanguageInfo.fontFamily;
  }, [language, currentLanguageInfo]);

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
        currentLanguageInfo,
        setLanguage,
        t,
        tCondition,
        formatDate,
        availableLanguages: SCHEDULED_LANGUAGES,
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
