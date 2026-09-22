// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Universal Multilingual Language Selector (English / हिन्दी / Regional)
// Dynamic Regional Option based on 36 Indian States & Union Territories
// ====================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RegionLanguageConfig,
  SupportedLanguageMode,
  getRegionLanguageConfig,
} from '../../types/regionLanguages';

export interface LanguageSelectorProps {
  selectedMode?: SupportedLanguageMode;
  onSelectMode?: (mode: SupportedLanguageMode) => void;
  regionConfig?: RegionLanguageConfig;
  stateOrRegion?: string;
  variant?: 'pill' | 'compact' | 'header';
  className?: string;
  idPrefix?: string;
}

const STORAGE_KEY = 'mausam_alert_language_mode';
const APP_STORAGE_KEY = 'mausam_language';

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedMode: controlledMode,
  onSelectMode: controlledOnSelect,
  regionConfig: providedConfig,
  stateOrRegion,
  variant = 'pill',
  className = '',
  idPrefix = '',
}) => {
  // 1. Internal state fallback for uncontrolled usage
  const [internalMode, setInternalMode] = useState<SupportedLanguageMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi' || saved === 'regional') {
        return saved;
      }
    } catch {
      // Storage unavailable
    }
    return 'en';
  });

  const activeMode = controlledMode !== undefined ? controlledMode : internalMode;

  // 2. Resolve region configuration
  const resolvedRegionConfig = useMemo(() => {
    if (providedConfig) return providedConfig;
    return getRegionLanguageConfig(stateOrRegion || 'Odisha');
  }, [providedConfig, stateOrRegion]);

  // 3. Keep in sync with cross-component and cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (e.newValue === 'en' || e.newValue === 'hi' || e.newValue === 'regional') {
          setInternalMode(e.newValue);
        }
      }
    };

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLanguageMode>;
      if (
        customEvent.detail === 'en' ||
        customEvent.detail === 'hi' ||
        customEvent.detail === 'regional'
      ) {
        setInternalMode(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mausam_language_mode_change', handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mausam_language_mode_change', handleCustomChange);
    };
  }, []);

  // 4. Handle language mode selection
  const handleSelect = useCallback(
    (mode: SupportedLanguageMode) => {
      if (controlledOnSelect) {
        controlledOnSelect(mode);
      } else {
        setInternalMode(mode);
      }

      try {
        localStorage.setItem(STORAGE_KEY, mode);
        // Also map to primary app language code for general i18n alignment
        const effectiveLang =
          mode === 'en'
            ? 'en'
            : mode === 'hi'
            ? 'hi'
            : resolvedRegionConfig.regionalLanguageCode || resolvedRegionConfig.primaryRegionalCode || 'en';
        localStorage.setItem(APP_STORAGE_KEY, effectiveLang);

        // Notify other mounted selector instances
        window.dispatchEvent(
          new CustomEvent<SupportedLanguageMode>('mausam_language_mode_change', {
            detail: mode,
          })
        );
      } catch {
        // Storage unavailable
      }
    },
    [controlledOnSelect, resolvedRegionConfig]
  );

  // 5. Regional display label and accessibility properties
  const regionalNativeName =
    resolvedRegionConfig.regionalDisplayName ||
    resolvedRegionConfig.primaryRegionalNativeName ||
    resolvedRegionConfig.regionalLanguageName ||
    resolvedRegionConfig.primaryRegionalLanguage ||
    'Regional';

  const regionalEnglishName =
    resolvedRegionConfig.regionalLanguageName ||
    resolvedRegionConfig.primaryRegionalLanguage ||
    'Regional';

  const isRegionalDistinct =
    resolvedRegionConfig.regionalLanguageCode !== 'en' &&
    resolvedRegionConfig.regionalLanguageCode !== 'hi';

  const regionalButtonLabel = isRegionalDistinct
    ? regionalNativeName
    : resolvedRegionConfig.regionName.includes('Delhi') ||
      resolvedRegionConfig.regionName.includes('Uttar') ||
      resolvedRegionConfig.regionName.includes('Bihar')
    ? 'क्षेत्रीय (हिन्दी)'
    : regionalNativeName;

  return (
    <div
      role="group"
      aria-label="Language options"
      className={`inline-flex items-center p-0.5 rounded-lg bg-[#07111C]/90 border border-[#1E2E40] shadow-inner shrink-0 ${className}`}
    >
      {/* English Option */}
      <button
        type="button"
        id={idPrefix ? `${idPrefix}-btn-lang-en` : 'btn-lang-en'}
        data-testid="btn-lang-en"
        aria-label="Switch display language to English"
        aria-pressed={activeMode === 'en'}
        onClick={() => handleSelect('en')}
        className={`px-2.5 py-1 rounded text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
          activeMode === 'en'
            ? 'bg-[#1E293B] text-white shadow-xs border border-[#38BDF8]/60 font-bold'
            : 'text-[#94A3B8] hover:text-white hover:bg-[#131E2C]'
        }`}
      >
        <span className="text-[10px] text-[#38BDF8] font-mono select-none">文A</span>
        <span>English</span>
      </button>

      {/* Hindi Option */}
      <button
        type="button"
        id={idPrefix ? `${idPrefix}-btn-lang-hi` : 'btn-lang-hi'}
        data-testid="btn-lang-hi"
        aria-label="हिंदी में आधिकारिक चेतावनी और परामर्श देखें"
        aria-pressed={activeMode === 'hi'}
        onClick={() => handleSelect('hi')}
        className={`px-2.5 py-1 rounded text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
          activeMode === 'hi'
            ? 'bg-[#1E293B] text-white shadow-xs border border-[#38BDF8]/60 font-bold'
            : 'text-[#94A3B8] hover:text-white hover:bg-[#131E2C]'
        }`}
      >
        <span>हिन्दी</span>
      </button>

      {/* Dynamic Regional Option */}
      <button
        type="button"
        id={idPrefix ? `${idPrefix}-btn-lang-regional` : 'btn-lang-regional'}
        data-testid="btn-lang-regional"
        aria-label={`Switch display language to ${regionalEnglishName} (${regionalNativeName}) for ${resolvedRegionConfig.regionName}`}
        aria-pressed={activeMode === 'regional'}
        onClick={() => handleSelect('regional')}
        title={`${resolvedRegionConfig.regionName} Official Language: ${regionalEnglishName} (${regionalNativeName})`}
        className={`px-2.5 py-1 rounded text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
          activeMode === 'regional'
            ? 'bg-[#1E293B] text-white shadow-xs border border-[#38BDF8]/60 font-bold'
            : 'text-[#94A3B8] hover:text-white hover:bg-[#131E2C]'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            activeMode === 'regional' ? 'bg-[#38BDF8]' : 'bg-[#64748B]'
          }`}
        />
        <span>{regionalButtonLabel}</span>
      </button>
    </div>
  );
};

export default LanguageSelector;
