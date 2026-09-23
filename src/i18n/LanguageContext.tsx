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
import { getRegionLanguageConfig, SupportedLanguageMode } from '../types/regionLanguages';

interface LanguageContextType {
  language: Language;
  languageMode: SupportedLanguageMode;
  currentLanguageInfo: LanguageInfo;
  setLanguage: (lang: Language) => void;
  setLanguageMode: (mode: SupportedLanguageMode, stateOrRegion?: string) => void;
  t: (key: keyof TranslationDictionary | string, fallback?: string) => string;
  tCondition: (condition: string) => string;
  formatDate: (date: Date) => string;
  availableLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mausam_language';
const MODE_STORAGE_KEY = 'mausam_alert_language_mode';

const VALID_LANGUAGES = new Set(SCHEDULED_LANGUAGES.map((l) => l.code));

function resolveRegionalLanguageForState(stateName?: string): Language {
  const config = getRegionLanguageConfig(stateName || 'Odisha');
  const code = (config.regionalLanguageCode || config.primaryRegionalCode || 'or') as Language;
  return VALID_LANGUAGES.has(code) ? code : 'or';
}

function getInitialState(): { language: Language; mode: SupportedLanguageMode } {
  try {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as SupportedLanguageMode | null;
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language | null;

    // Check detected location state to prevent regional language desync
    let detectedState = 'Odisha';
    try {
      const locStr = localStorage.getItem('mausam_detected_location');
      if (locStr) {
        const parsed = JSON.parse(locStr);
        if (parsed?.record?.state) detectedState = parsed.record.state;
      }
    } catch {}

    const regionalLang = resolveRegionalLanguageForState(detectedState);

    // If explicit mode is regional, or if user was in regional mode
    if (savedMode === 'regional') {
      return { language: regionalLang, mode: 'regional' };
    }

    if (savedMode === 'hi' || savedLang === 'hi') {
      return { language: 'hi', mode: 'hi' };
    }

    if (savedMode === 'en' || savedLang === 'en') {
      return { language: 'en', mode: 'en' };
    }

    // If savedLang is a valid regional language
    if (savedLang && VALID_LANGUAGES.has(savedLang)) {
      return { language: savedLang, mode: 'regional' };
    }
  } catch {
    // Storage access fallback
  }

  return { language: 'en', mode: 'en' };
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [{ language, mode: languageMode }, setState] = useState<{
    language: Language;
    mode: SupportedLanguageMode;
  }>(getInitialState);

  const currentLanguageInfo =
    SCHEDULED_LANGUAGES.find((l) => l.code === language) || SCHEDULED_LANGUAGES[0];

  const setLanguage = useCallback((lang: Language) => {
    if (VALID_LANGUAGES.has(lang)) {
      const newMode: SupportedLanguageMode =
        lang === 'en' ? 'en' : lang === 'hi' ? 'hi' : 'regional';

      setState({ language: lang, mode: newMode });
      try {
        localStorage.setItem(STORAGE_KEY, lang);
        localStorage.setItem(MODE_STORAGE_KEY, newMode);
      } catch {}
    }
  }, []);

  const setLanguageMode = useCallback((newMode: SupportedLanguageMode, stateOrRegion?: string) => {
    let targetLang: Language = 'en';
    if (newMode === 'en') {
      targetLang = 'en';
    } else if (newMode === 'hi') {
      targetLang = 'hi';
    } else {
      targetLang = resolveRegionalLanguageForState(stateOrRegion);
    }

    setState({ language: targetLang, mode: newMode });
    try {
      localStorage.setItem(STORAGE_KEY, targetLang);
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
    } catch {}
  }, []);

  // Listen to cross-component and storage language events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === MODE_STORAGE_KEY && e.newValue) {
        const val = e.newValue as SupportedLanguageMode;
        if (val === 'en' || val === 'hi' || val === 'regional') {
          setLanguageMode(val);
        }
      } else if (e.key === STORAGE_KEY && e.newValue) {
        const langVal = e.newValue as Language;
        if (VALID_LANGUAGES.has(langVal)) {
          setLanguage(langVal);
        }
      }
    };

    const handleCustomModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLanguageMode>;
      const val = customEvent.detail;
      if (val === 'en' || val === 'hi' || val === 'regional') {
        let stateName = 'Odisha';
        try {
          const locStr = localStorage.getItem('mausam_detected_location');
          if (locStr) {
            const parsed = JSON.parse(locStr);
            if (parsed?.record?.state) stateName = parsed.record.state;
          }
        } catch {}
        setLanguageMode(val, stateName);
      }
    };

    const handleCustomLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ language: Language; mode?: SupportedLanguageMode }>;
      if (customEvent.detail?.language && VALID_LANGUAGES.has(customEvent.detail.language)) {
        const newLang = customEvent.detail.language;
        const newMode = customEvent.detail.mode || (newLang === 'en' ? 'en' : newLang === 'hi' ? 'hi' : 'regional');
        setState({ language: newLang, mode: newMode });
      }
    };

    const handleLocationChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ state?: string }>;
      const newState = customEvent.detail?.state;
      if (newState && languageMode === 'regional') {
        const newLang = resolveRegionalLanguageForState(newState);
        setLanguage(newLang);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mausam_language_mode_change', handleCustomModeChange);
    window.addEventListener('mausam_language_change', handleCustomLangChange);
    window.addEventListener('mausam_location_changed', handleLocationChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mausam_language_mode_change', handleCustomModeChange);
      window.removeEventListener('mausam_language_change', handleCustomLangChange);
      window.removeEventListener('mausam_location_changed', handleLocationChange);
    };
  }, [setLanguage, setLanguageMode, languageMode]);

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
        languageMode,
        currentLanguageInfo,
        setLanguage,
        setLanguageMode,
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
