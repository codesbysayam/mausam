import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  CloudRain,
  CloudLightning,
  Wind,
  Flame,
  CloudFog,
  Waves,
  Sun,
  Snowflake,
  ChevronRight,
  Shield,
  X,
  PhoneCall,
  ExternalLink,
  Clock,
  Compass,
  Radio,
  MapPin,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';
import { WeatherAlert, LocationRecord } from '../../types';
import {
  getApplicableWarning,
  ParsedAlertCenterData,
  HazardType,
} from '../../services/alertParser';
import { warningService } from '../../services/warnings/warningService';
import { WeatherWarning, LocationWarningResult } from '../../types/warnings';
import { formatISTTime } from '../../services/warnings/warningAdapter';
import { SkeletonAlertCenter } from '../common/Skeletons';
import { WarningLanguageSelector } from '../warnings/WarningLanguageSelector';
import {
  getRegionLanguageConfig,
  getLocalizedStateName,
  RegionLanguageConfig,
  SupportedLanguageMode,
} from '../../types/regionLanguages';
import {
  getAlertLabel,
  getLocalizedHazard,
  getLocalizedSeverity,
} from '../../services/warnings/translations/warningTranslations';
import {
  getLocalizedWarningContent,
  LocalizedWarningDisplay,
} from '../../services/warnings/translations/warningTextTranslator';

function formatCountdownRemaining(validUntilIso?: string | null): string {
  if (!validUntilIso) return 'Active synoptic cycle';
  const exp = new Date(validUntilIso).getTime();
  if (isNaN(exp)) return 'Active synoptic cycle';
  const diffMs = exp - Date.now();
  if (diffMs <= 0) return 'Expired';
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours > 0) {
    return `Valid for: ${hours}h ${mins}m`;
  }
  return `Valid for: ${mins}m`;
}

export interface HomeSevereWeatherStripProps {
  alerts?: WeatherAlert[];
  selectedLocation?: LocationRecord;
  lastUpdated?: string;
  onNavigateToWarnings?: () => void;
}

/**
 * Returns dynamic meteorological hazard icon according to verified IMD hazard classification
 */
const HazardIcon: React.FC<{ hazardType: HazardType; className?: string }> = ({
  hazardType,
  className = 'w-5 h-5',
}) => {
  switch (hazardType) {
    case 'heavy_rain':
      return <CloudRain className={className} />;
    case 'thunderstorm':
      return <CloudLightning className={className} />;
    case 'cyclone':
      return <Wind className={className} />;
    case 'heatwave':
      return <Flame className={className} />;
    case 'cold_wave':
      return <Snowflake className={className} />;
    case 'dense_fog':
      return <CloudFog className={className} />;
    case 'flood':
      return <Waves className={className} />;
    case 'strong_wind':
      return <Wind className={className} />;
    case 'routine':
      return <Sun className={className} />;
    case 'coastal':
      return <Compass className={className} />;
    default:
      return <AlertTriangle className={className} />;
  }
};

export const HomeSevereWeatherStrip: React.FC<HomeSevereWeatherStripProps> = ({
  selectedLocation,
  lastUpdated,
  onNavigateToWarnings,
}) => {
  const [data, setData] = useState<ParsedAlertCenterData | null>(null);
  const [locationResult, setLocationResult] = useState<LocationWarningResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isWarningDetailModalOpen, setIsWarningDetailModalOpen] = useState<boolean>(false);
  const [selectedDetailWarning, setSelectedDetailWarning] = useState<WeatherWarning | null>(null);
  const [isAllWarningsModalOpen, setIsAllWarningsModalOpen] = useState<boolean>(false);
  const [selectedDistrictDetail, setSelectedDistrictDetail] = useState<string | null>(null);
  const [countdownText, setCountdownText] = useState<string>('');

  // Multilingual preference persistence
  const [languageMode, setLanguageMode] = useState<SupportedLanguageMode>(() => {
    try {
      const saved = localStorage.getItem('mausam_alert_language_mode');
      if (saved === 'en' || saved === 'hi' || saved === 'regional') {
        return saved;
      }
    } catch {}
    return 'regional';
  });

  const handleSelectLanguageMode = useCallback((mode: SupportedLanguageMode) => {
    setLanguageMode(mode);
    try {
      localStorage.setItem('mausam_alert_language_mode', mode);
      window.dispatchEvent(
        new CustomEvent<SupportedLanguageMode>('mausam_language_mode_change', {
          detail: mode,
        })
      );
    } catch {}
  }, []);

  // Listen to cross-component and storage language events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mausam_alert_language_mode' && e.newValue) {
        if (e.newValue === 'en' || e.newValue === 'hi' || e.newValue === 'regional') {
          setLanguageMode(e.newValue);
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
        setLanguageMode(customEvent.detail);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mausam_language_mode_change', handleCustomChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mausam_language_mode_change', handleCustomChange);
    };
  }, []);

  // Determine state/UT for language configuration registry
  const stateOrRegion =
    selectedLocation?.state ||
    locationResult?.primaryWarning?.state ||
    selectedLocation?.city ||
    'Odisha';

  const regionConfig: RegionLanguageConfig = useMemo(() => {
    return getRegionLanguageConfig(stateOrRegion);
  }, [stateOrRegion]);

  // Fallback language resolution (regional -> Hindi -> English)
  const effectiveLangCode = useMemo(() => {
    if (languageMode === 'en') return 'en';
    if (languageMode === 'hi') return 'hi';
    return regionConfig.regionalLanguageCode || regionConfig.primaryRegionalCode || 'en';
  }, [languageMode, regionConfig]);

  const activeWarning = selectedDetailWarning || locationResult?.primaryWarning;
  const localizedDisplay: LocalizedWarningDisplay = useMemo(() => {
    return getLocalizedWarningContent(activeWarning, effectiveLangCode, regionConfig);
  }, [activeWarning, effectiveLangCode, regionConfig]);

  const isEnglish = effectiveLangCode === 'en';
  const caseStyle = isEnglish ? 'uppercase' : '';

  // Fetch official verified warning data whenever location changes
  const fetchWarningData = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      try {
        const [parsed, locRes] = await Promise.all([
          getApplicableWarning(selectedLocation, forceRefresh),
          warningService.getWarningForLocation(selectedLocation, forceRefresh),
        ]);
        setData(parsed);
        setLocationResult(locRes);
        if (locRes.primaryWarning) {
          setSelectedDetailWarning(locRes.primaryWarning);
        }
      } catch {
        // Handled internally in alertParser and warningService - never throws unhandled
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedLocation]
  );

  useEffect(() => {
    fetchWarningData(false);
  }, [fetchWarningData]);

  // Live countdown timer updating every 30 seconds, auto-refreshing on expiry
  useEffect(() => {
    const updateCountdown = () => {
      const activeWarn = selectedDetailWarning || locationResult?.primaryWarning;
      if (activeWarn?.validUntil) {
        const remaining = formatCountdownRemaining(activeWarn.validUntil);
        setCountdownText(remaining);
        if (remaining === 'Expired') {
          fetchWarningData(true);
        }
      } else {
        setCountdownText('Active synoptic cycle');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, [selectedDetailWarning, locationResult, fetchWarningData]);

  // Status configuration for command-center indicator
  const statusTheme = useMemo(() => {
    if (!data) {
      return {
        cardBorder: 'border-[#1E2E40]',
        leftRail: 'border-l-[#64748B]',
        bg: 'bg-[#0B131E]',
        badgeBg: 'bg-[#64748B]/15 text-[#94A3B8] border-[#64748B]/30',
        dotColor: 'bg-[#64748B]',
        accentColor: 'text-[#94A3B8]',
      };
    }

    switch (data.uiState) {
      case 'RED_ALERT':
        return {
          cardBorder: 'border-[#EF4444]/40',
          leftRail: 'border-l-[#EF4444]',
          bg: 'bg-[#180A0E]',
          badgeBg: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50',
          dotColor: 'bg-[#EF4444]',
          accentColor: 'text-[#EF4444]',
        };
      case 'ORANGE_ALERT':
        return {
          cardBorder: 'border-[#F97316]/40',
          leftRail: 'border-l-[#F97316]',
          bg: 'bg-[#180F08]',
          badgeBg: 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/50',
          dotColor: 'bg-[#F97316]',
          accentColor: 'text-[#F97316]',
        };
      case 'WATCH_ADVISORY':
        return {
          cardBorder: 'border-[#EAB308]/40',
          leftRail: 'border-l-[#EAB308]',
          bg: 'bg-[#161308]',
          badgeBg: 'bg-[#EAB308]/20 text-[#EAB308] border-[#EAB308]/50',
          dotColor: 'bg-[#EAB308]',
          accentColor: 'text-[#EAB308]',
        };
      case 'NOT_APPLICABLE':
        return {
          cardBorder: 'border-[#3B82F6]/30',
          leftRail: 'border-l-[#3B82F6]',
          bg: 'bg-[#0B1522]',
          badgeBg: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/30',
          dotColor: 'bg-[#3B82F6]',
          accentColor: 'text-[#60A5FA]',
        };
      case 'DATA_UNAVAILABLE':
        return {
          cardBorder: 'border-[#1E2E40]',
          leftRail: 'border-l-[#64748B]',
          bg: 'bg-[#0D1520]',
          badgeBg: 'bg-[#64748B]/15 text-[#94A3B8] border-[#64748B]/30',
          dotColor: 'bg-[#64748B]',
          accentColor: 'text-[#94A3B8]',
        };
      case 'NO_ACTIVE_WARNING':
      default:
        return {
          cardBorder: 'border-[#10B981]/30',
          leftRail: 'border-l-[#10B981]',
          bg: 'bg-[#081510]',
          badgeBg: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30',
          dotColor: 'bg-[#10B981]',
          accentColor: 'text-[#10B981]',
        };
    }
  }, [data]);

  // Loading skeleton state
  if (isLoading && !data) {
    return <SkeletonAlertCenter />;
  }

  // Fallback safe reference
  const currentData = data || {
    uiState: 'DATA_UNAVAILABLE' as const,
    statusBadge: { label: 'DATA UNAVAILABLE' as const, color: 'neutral' as const, pulse: false },
    severity: 'neutral' as const,
    severityText: 'DATA UNAVAILABLE',
    scope: 'LOCAL' as const,
    scopeLabel: 'DATA FEED',
    hazardType: 'general' as const,
    hazardHeadline: 'WARNING DATA CURRENTLY UNAVAILABLE',
    regionSubdivision: selectedLocation?.city || 'Selected Location',
    affectedDistricts: [],
    affectedCount: 0,
    summary: 'Official real-time warning telemetry is temporarily unreachable. Surface observations and radar remain active.',
    metrics: {
      affectedText: 'Unavailable',
      severityText: 'Unavailable',
      validUntilText: 'Unavailable',
      issuedAtText: 'Unavailable',
    },
    timeline: null,
    actions: {
      canViewFullWarning: false,
      hasSafetyGuidance: false,
      recommendedActions: [],
    },
    trust: {
      source: 'IMD',
      updatedAt: 'Unavailable',
      status: 'UNAVAILABLE' as const,
      isLiveTelemetry: false,
    },
    additionalActiveCount: 0,
    isExpired: false,
    rawResponse: null,
  };

  const isActiveAlert =
    currentData.uiState === 'RED_ALERT' ||
    currentData.uiState === 'ORANGE_ALERT' ||
    currentData.uiState === 'WATCH_ADVISORY' ||
    currentData.uiState === 'OPERATIONAL' ||
    currentData.uiState === 'OPERATIONAL_WITH_FALLBACK';

  const isUnavailable =
    currentData.uiState === 'PROVIDER_UNAVAILABLE' ||
    currentData.uiState === 'DATA_UNAVAILABLE';

  // ─────────────────────────────────────────────────────────────
  // 9. NO-WARNING STATE / ALL CLEAR (Calm Green Visual Treatment)
  // Allowed ONLY when valid official feed responded with 0 warnings!
  // ─────────────────────────────────────────────────────────────
  if (!isActiveAlert && !isUnavailable && currentData.uiState !== 'NOT_APPLICABLE') {
    return (
      <section
        id="severe-weather-alert-center"
        aria-label="National Weather Alert Center"
        className={`w-full rounded-xl border ${statusTheme.cardBorder} border-l-4 ${statusTheme.leftRail} ${statusTheme.bg} p-4 sm:p-5 shadow-sm transition-all`}
      >
        <div className="flex flex-col gap-3.5">
          {/* Top Bar: Center Title + Language Selector + Badge */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-[#10B981]">
                <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                <span className={`text-xs font-bold tracking-wider ${caseStyle} text-[#E2E8F0]`}>
                  {getAlertLabel('alertCenterTitle', effectiveLangCode)}
                </span>
              </div>
              <span className="hidden sm:inline-block text-[#334155]">|</span>
              <span className={`text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] tracking-wide ${caseStyle}`}>
                {getAlertLabel('stateSubdivisionAlert', effectiveLangCode)}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <WarningLanguageSelector
                regionConfig={regionConfig}
                selectedMode={languageMode}
                onSelectMode={handleSelectLanguageMode}
              />

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-bold font-mono tracking-wider ${caseStyle} bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 shrink-0`}>
                <Check className="w-3.5 h-3.5" />
                <span>{getAlertLabel('allClear', effectiveLangCode).split('-')[0].trim()}</span>
              </span>
            </div>
          </div>

          {/* Main Status Block: ALL CLEAR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Left: Prominent Clear Headline & Description */}
            <div className="lg:col-span-8 flex flex-col gap-1.5">
              <div className={`flex items-center gap-2 text-xs font-semibold text-[#34D399] ${caseStyle} tracking-wider`}>
                <span>✓ {getAlertLabel('allClear', effectiveLangCode).split('-')[0].trim()}</span>
                <span>•</span>
                <span>{getLocalizedStateName(regionConfig.regionName, effectiveLangCode)}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {getAlertLabel('allClear', effectiveLangCode)}
              </h3>

              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-2xl">
                {getAlertLabel('allClearSub', effectiveLangCode)}
              </p>
            </div>

            {/* Right: Clean Metric Pills & Bulletin Button */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#CBD5E1]">
                <span className="px-2.5 py-1 rounded bg-[#13231B] border border-[#1E3A2F] text-[11px] font-mono">
                  {getAlertLabel('severity', effectiveLangCode)}: <strong className="text-[#34D399]">{getLocalizedSeverity('GREEN', effectiveLangCode)}</strong>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#13231B] border border-[#1E3A2F] text-[11px] font-mono">
                  {getAlertLabel('affected', effectiveLangCode)}: <strong className="text-white">0</strong>
                </span>
              </div>

              <button
                type="button"
                id="btn-view-warnings-bulletin"
                onClick={onNavigateToWarnings}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#142A22] hover:bg-[#1B382E] border border-[#10B981]/40 hover:border-[#10B981] text-[#A7F3D0] hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                <span>{getAlertLabel('viewInWarnings', effectiveLangCode)}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>

          {/* Bottom Trust Panel */}
          <div className="pt-2.5 border-t border-[#1E3A2F]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <span>Source: {currentData.trust.source}</span>
              <span>·</span>
              <span>Updated: {currentData.trust.updatedAt}</span>
              <span>·</span>
              <span className="text-[#34D399] font-medium">Status: Live Verified Feed</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchWarningData(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 text-[11px] text-[#64748B] hover:text-[#94A3B8] transition-colors cursor-pointer"
                title="Refresh warning feed"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Verify</span>
              </button>
              <span>·</span>
              <span className="text-[10px] text-[#64748B]">Monitored across 36 IMD Subdivisions</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // INTERNATIONAL: NOT COVERED BY IMD
  // ─────────────────────────────────────────────────────────────
  if (currentData.uiState === 'NOT_APPLICABLE') {
    return (
      <section
        id="severe-weather-alert-center"
        aria-label="National Weather Alert Center"
        className={`w-full rounded-xl border ${statusTheme.cardBorder} border-l-4 ${statusTheme.leftRail} ${statusTheme.bg} p-4 sm:p-5 shadow-sm transition-all`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-[#60A5FA]" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-[#E2E8F0]">
                WEATHER ALERT CENTER
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono tracking-wider uppercase bg-[#3B82F6]/15 text-[#93C5FD] border border-[#3B82F6]/30">
                IMD NOT APPLICABLE
              </span>
            </div>

            <div className="text-sm font-semibold text-white mt-0.5">
              {currentData.hazardHeadline}
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {currentData.summary}
            </p>
          </div>

          <button
            type="button"
            id="btn-view-warnings-bulletin"
            onClick={onNavigateToWarnings}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#132337] hover:bg-[#1A314D] border border-[#3B82F6]/40 text-[#93C5FD] hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            <span>View All-India Bulletins</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#1E2E40]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span>Source: IMD Synoptic Service</span>
            <span>·</span>
            <span>Updated: {currentData.trust.updatedAt}</span>
            <span>·</span>
            <span className="text-[#60A5FA] font-medium">Domain: Indian Sovereign Territory</span>
          </div>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // OFFICIAL WARNING FEED UNAVAILABLE: Offline or server error
  // (NEVER RED ALERT, NEVER GREEN ALL CLEAR)
  // ─────────────────────────────────────────────────────────────
  if (isUnavailable) {
    return (
      <section
        id="severe-weather-alert-center"
        aria-label="National Weather Alert Center"
        className={`w-full rounded-xl border ${statusTheme.cardBorder} border-l-4 ${statusTheme.leftRail} ${statusTheme.bg} p-4 sm:p-5 shadow-sm transition-all`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 text-[#94A3B8]">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-[#EAB308]" />
              <h2 className={`text-xs font-bold tracking-wider ${caseStyle} text-[#E2E8F0]`}>
                {getAlertLabel('alertCenterTitle', effectiveLangCode)}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono tracking-wider ${caseStyle} bg-[#64748B]/15 text-[#94A3B8] border border-[#64748B]/30`}>
                {getAlertLabel('feedUnavailableTitle', effectiveLangCode)}
              </span>
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              Weather telemetry remains operational.
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94A3B8] mt-0.5">
              <span>Last official warning sync: <strong className="text-[#CBD5E1] font-mono">{(!currentData.trust.updatedAt || currentData.trust.updatedAt === 'Recent' || currentData.trust.updatedAt === 'Live') ? 'Never successfully synced' : currentData.trust.updatedAt}</strong></span>
              <span>•</span>
              <span>{getAlertLabel('source', effectiveLangCode)}: <strong className="text-[#CBD5E1]">{currentData.trust.source || 'SACHET/NDMA'}</strong></span>
              <span>•</span>
              <span>{getAlertLabel('status', effectiveLangCode)}: <strong className="text-amber-400">{getAlertLabel('temporarilyUnreachable', effectiveLangCode)}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fetchWarningData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-semibold text-[#E2E8F0] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{getAlertLabel('retrySync', effectiveLangCode)}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToWarnings}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-semibold text-[#E2E8F0] transition-colors cursor-pointer"
            >
              <span>View Warning Archive</span>
              <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ACTIVE WARNING STATE: WATCH (Yellow), ALERT (Orange), SEVERE (Red)
  // Meteorological Command-Center Architecture
  // ─────────────────────────────────────────────────────────────
  const pulseClass = currentData.statusBadge.pulse ? 'animate-pulse' : '';
  const isSevere = currentData.uiState === 'RED_ALERT';
  const isAlert = currentData.uiState === 'ORANGE_ALERT';

  return (
    <>
      <section
        id="severe-weather-alert-center"
        aria-label="National Weather Alert Center"
        className={`w-full rounded-xl border ${statusTheme.cardBorder} border-l-4 ${statusTheme.leftRail} ${statusTheme.bg} p-4 sm:p-5 lg:p-6 shadow-lg transition-all`}
      >
        <div className="flex flex-col gap-4">
          {/* ──────────────── Top Row: Command Center Bar ──────────────── */}
          <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-[#1E2E40]/80">
            {/* Left: Center Title + Scope */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="p-1 rounded bg-[#0A1018] border border-[#1E2E40]">
                <AlertTriangle className={`w-4 h-4 ${statusTheme.accentColor}`} />
              </div>
              <h2 className={`text-xs font-bold tracking-wider ${caseStyle} text-[#E2E8F0]`}>
                {getAlertLabel('alertCenterTitle', effectiveLangCode)}
              </h2>
              <span className="hidden sm:inline-block text-[#334155]">|</span>
              <span className={`text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] tracking-wide ${caseStyle}`}>
                {getAlertLabel('stateSubdivisionAlert', effectiveLangCode)}
              </span>
            </div>

            {/* Right: Language Selector + Data Status & Live Pulse Indicator */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <WarningLanguageSelector
                regionConfig={regionConfig}
                selectedMode={languageMode}
                onSelectMode={handleSelectLanguageMode}
              />

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>
                  {getAlertLabel('dataStatus', effectiveLangCode)}:{' '}
                  <strong className="text-white">
                    {currentData.trust.status === 'LIVE'
                      ? getAlertLabel('live', effectiveLangCode)
                      : currentData.trust.status}
                  </strong>
                </span>
              </div>

              {/* Status Badge: [ORANGE] / [RED] / [WATCH] */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] sm:text-xs font-bold font-mono tracking-wider ${caseStyle} border shrink-0 ${statusTheme.badgeBg}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusTheme.dotColor} ${pulseClass}`} />
                <span>● {localizedDisplay.severityLabel || currentData.statusBadge.label}</span>
              </span>
            </div>
          </div>

          {/* ──────────────── Main Command Grid: Hazard & Impact ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left Col (Col 1-7): Large Live Status + Dynamic Hazard Icon + Prominent Headline */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-3">
              <div>
                {/* Status Block Header + Dynamic Hazard Visual */}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2.5 rounded-xl bg-[#0F1722] border border-[#1E2E40] ${statusTheme.accentColor} shrink-0`}>
                    <HazardIcon hazardType={currentData.hazardType} className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-mono font-bold tracking-wider ${caseStyle} ${statusTheme.accentColor}`}>
                        ● {localizedDisplay.severityLabel}
                      </span>
                      {currentData.additionalActiveCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1E2E40] text-[#94A3B8]">
                          +{currentData.additionalActiveCount} {getAlertLabel(currentData.additionalActiveCount > 1 ? 'additionalWarningPlural' : 'additionalWarningSingle', effectiveLangCode)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#CBD5E1]">
                      {localizedDisplay.stateOrRegionLabel}
                    </span>
                  </div>
                </div>

                {/* Provenance badge: Official Govt Notice vs Translated Summary */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${caseStyle} border ${
                      localizedDisplay.isOfficialQuote
                        ? 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30'
                        : 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30'
                    }`}
                  >
                    {localizedDisplay.isOfficialQuote ? '✓ ' : ''}
                    {localizedDisplay.badgeLabel}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    {localizedDisplay.hazardLabel}
                  </span>
                </div>

                {/* Big Visual Dominant Hazard Headline */}
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-snug">
                  {localizedDisplay.headline}
                </h3>

                {/* Preserved Original Official Text if user selected translated version */}
                {localizedDisplay.hasUntranslatedOriginal && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#07111C]/90 border border-[#1E2E40] text-xs text-[#94A3B8]">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${caseStyle} tracking-wider text-[#64748B] mb-1`}>
                      <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                      <span>
                        {getAlertLabel('originalNotice', effectiveLangCode)} ({localizedDisplay.officialLanguageName}):
                      </span>
                    </div>
                    <p className="italic text-[#E2E8F0] whitespace-pre-line text-xs sm:text-sm font-normal">
                      "{localizedDisplay.officialText}"
                    </p>
                  </div>
                )}

                {/* Short Official Summary (Readable, strictly no wall of text) */}
                {!localizedDisplay.hasUntranslatedOriginal && currentData.summary && currentData.summary !== localizedDisplay.headline && (
                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed mt-2 line-clamp-3">
                    {currentData.summary}
                  </p>
                )}
              </div>

              {/* 5. Affected Area Visualization: Horizontal Clickable District Pills */}
              {localizedDisplay.affectedRegions.length > 0 && (
                <div className="pt-2">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${caseStyle} tracking-wider text-[#64748B] mb-1.5`}>
                    <MapPin className="w-3 h-3 text-[#94A3B8]" />
                    <span>
                      {getAlertLabel('affectedRegionsDistricts', effectiveLangCode)} ({getAlertLabel('clickToInspect', effectiveLangCode)})
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {localizedDisplay.affectedRegions.slice(0, 6).map((district, idx) => (
                      <button
                        key={`${district}-${idx}`}
                        type="button"
                        onClick={() => setSelectedDistrictDetail(district)}
                        className="px-2.5 py-1 rounded bg-[#131E2C] hover:bg-[#1E2E40] border border-[#1E2E40] hover:border-[#38BDF8] text-xs font-medium text-[#E2E8F0] hover:text-white transition-colors cursor-pointer"
                        title={`View warning notice for ${district}`}
                      >
                        {district}
                      </button>
                    ))}
                    {localizedDisplay.affectedRegions.length > 6 && (
                      <button
                        type="button"
                        onClick={onNavigateToWarnings}
                        className="px-2 py-1 rounded bg-[#131E2C] hover:bg-[#1E2E40] border border-[#1E2E40] text-xs font-semibold text-[#38BDF8] hover:underline cursor-pointer"
                      >
                        +{localizedDisplay.affectedRegions.length - 6} more
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col (Col 8-12): 4. Impact Snapshot Metrics + 6. Timeline */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-[#0A1018]/60 p-3.5 sm:p-4 rounded-xl border border-[#1E2E40]/70">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2E40]">
                <span className={`text-[10px] font-bold tracking-wider ${caseStyle} text-[#64748B]`}>
                  {getAlertLabel('impactSnapshot', effectiveLangCode)}
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  {getAlertLabel('imdBulletin', effectiveLangCode)}
                </span>
              </div>

              {/* 4 Compact Metric Blocks */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Metric 1: Affected */}
                <div className="p-2.5 rounded-lg bg-[#0F1722] border border-[#1E2E40]">
                  <span className={`block text-[10px] font-bold tracking-wider ${caseStyle} text-[#64748B]`}>
                    {getAlertLabel('affected', effectiveLangCode)}
                  </span>
                  <span className="block text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                    {localizedDisplay.stateOrRegionLabel}
                  </span>
                </div>

                {/* Metric 2: Severity */}
                <div className="p-2.5 rounded-lg bg-[#0F1722] border border-[#1E2E40]">
                  <span className={`block text-[10px] font-bold tracking-wider ${caseStyle} text-[#64748B]`}>
                    {getAlertLabel('severity', effectiveLangCode)}
                  </span>
                  <span className={`block text-xs sm:text-sm font-bold truncate mt-0.5 ${statusTheme.accentColor}`}>
                    {localizedDisplay.severityLabel}
                  </span>
                </div>

                {/* Metric 3: Valid Until */}
                <div className="p-2.5 rounded-lg bg-[#0F1722] border border-[#1E2E40]">
                  <span className={`block text-[10px] font-bold tracking-wider ${caseStyle} text-[#64748B]`}>
                    {getAlertLabel('validUntil', effectiveLangCode)}
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-[#E2E8F0] truncate mt-0.5">
                    {currentData.metrics.validUntilText}
                  </span>
                </div>

                {/* Metric 4: Issued */}
                <div className="p-2.5 rounded-lg bg-[#0F1722] border border-[#1E2E40]">
                  <span className={`block text-[10px] font-bold tracking-wider ${caseStyle} text-[#64748B]`}>
                    {getAlertLabel('issued', effectiveLangCode)}
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-[#E2E8F0] truncate mt-0.5">
                    {currentData.metrics.issuedAtText}
                  </span>
                </div>
              </div>

              {/* 6. Warning Timeline: Progress track (shown ONLY if timestamps are valid) */}
              {currentData.timeline && currentData.timeline.isValid && (
                <div className="mt-1 pt-2 border-t border-[#1E2E40]/70 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span>{getAlertLabel('issued', effectiveLangCode)}: {currentData.timeline.issuedFormatted}</span>
                    <span>{getAlertLabel('validUntil', effectiveLangCode)}: {currentData.timeline.validUntilFormatted}</span>
                  </div>
                  {/* Progress Line */}
                  <div className="relative w-full h-1.5 bg-[#1E2E40] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusTheme.dotColor}`}
                      style={{ width: `${Math.min(100, Math.max(5, currentData.timeline.progressPercent))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#64748B] font-mono">
                    <span>{getAlertLabel('cycleStart', effectiveLangCode)}</span>
                    <span className="text-white font-semibold">{getAlertLabel('now', effectiveLangCode)} ({currentData.timeline.progressPercent}%)</span>
                    <span>{getAlertLabel('expiry', effectiveLangCode)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ──────────────── 7. Action Area & 8. Data Trust Panel ──────────────── */}
          <div className="pt-3 border-t border-[#1E2E40] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* 7. Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Button 1: VIEW FULL WARNING → (Opens interactive detailed warning panel) */}
              <button
                type="button"
                id="btn-view-full-warning"
                onClick={() => {
                  if (locationResult?.primaryWarning) {
                    setSelectedDetailWarning(locationResult.primaryWarning);
                  }
                  setIsWarningDetailModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] hover:border-[#64748B] text-xs font-bold text-white tracking-wide transition-colors cursor-pointer shadow-sm"
              >
                <span>{getAlertLabel('viewFullWarning', effectiveLangCode)}</span>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
              </button>

              {/* Button 2: SAFETY GUIDANCE (Opens interactive emergency measures) */}
              {currentData.actions.hasSafetyGuidance && (
                <button
                  type="button"
                  id="btn-open-safety-guidance"
                  onClick={() => setIsSafetyModalOpen(true)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                    isSevere
                      ? 'bg-[#271317] hover:bg-[#381B21] border border-[#EF4444]/60 text-[#FFA39E] hover:text-white'
                      : 'bg-[#23150D] hover:bg-[#351F14] border border-[#F97316]/60 text-[#FDBA74] hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>{getAlertLabel('safetyGuidance', effectiveLangCode)}</span>
                </button>
              )}

              {/* Multiple Warnings Trigger */}
              {((locationResult?.additionalCount ?? currentData.additionalActiveCount) > 0) && (
                <button
                  type="button"
                  id="btn-open-additional-warnings"
                  onClick={() => setIsAllWarningsModalOpen(true)}
                  className="text-xs font-semibold text-[#38BDF8] hover:text-[#7DD3FC] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  +{(locationResult?.additionalCount ?? currentData.additionalActiveCount)} {getAlertLabel((locationResult?.additionalCount ?? currentData.additionalActiveCount) > 1 ? 'additionalWarningPlural' : 'additionalWarningSingle', effectiveLangCode)}
                </button>
              )}
            </div>

            {/* 8. Data Trust Panel */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#94A3B8]">
              <span>{getAlertLabel('source', effectiveLangCode)}: <strong className="text-white">{currentData.trust.source}</strong></span>
              <span>·</span>
              <span>{getAlertLabel('updated', effectiveLangCode)}: <strong className="text-[#CBD5E1]">{currentData.trust.updatedAt}</strong></span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {getAlertLabel('status', effectiveLangCode)}: <strong className={currentData.trust.status === 'LIVE' ? 'text-[#10B981]' : 'text-[#38BDF8]'}>{currentData.trust.status === 'LIVE' ? getAlertLabel('live', effectiveLangCode) : currentData.trust.status}</strong>
              </span>
              <button
                type="button"
                onClick={() => fetchWarningData(true)}
                disabled={isRefreshing}
                className="p-1 rounded text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors ml-1"
                title="Verify live warning status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── Safety Guidance Dialog Modal ──────────────── */}
      {isSafetyModalOpen && (
        <div
          id="safety-guidance-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsSafetyModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-[#0F1722] border border-[#334155] shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col gap-4 text-[#E2E8F0]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#1E2E40] pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg bg-[#180A0E] border border-[#EF4444]/40 ${statusTheme.accentColor}`}>
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {getAlertLabel('safetyGuidanceModalTitle', effectiveLangCode)}
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    {localizedDisplay.headline} • {localizedDisplay.stateOrRegionLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-safety-modal"
                onClick={() => setIsSafetyModalOpen(false)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
                aria-label={getAlertLabel('close', effectiveLangCode)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1]">
                {getAlertLabel('safetyMeasuresTitle', effectiveLangCode)}
              </span>

              {localizedDisplay.safetyInstructions.length > 0 ? (
                localizedDisplay.safetyInstructions.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#141F2E] border border-[#1E2E40] text-xs text-[#CBD5E1]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))
              ) : currentData.actions.recommendedActions.length > 0 ? (
                currentData.actions.recommendedActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#141F2E] border border-[#1E2E40] text-xs text-[#CBD5E1]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-[#141F2E] text-xs text-[#94A3B8]">
                  {getAlertLabel('disasterAdvisory', effectiveLangCode)}
                </div>
              )}

              {/* Emergency Helplines */}
              <div className="mt-2 p-3 rounded-lg bg-[#1A1115] border border-[#EF4444]/30 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFA39E] flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                  {getAlertLabel('emergencyHelplines', effectiveLangCode)}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-[#0F1722] border border-[#334155]">
                    <div className="text-[10px] text-[#94A3B8] uppercase">{getAlertLabel('nationalEmergency', effectiveLangCode)}</div>
                    <div className="text-sm font-bold text-white">112 ({getAlertLabel('tollFree', effectiveLangCode)})</div>
                  </div>
                  <div className="p-2 rounded bg-[#0F1722] border border-[#334155]">
                    <div className="text-[10px] text-[#94A3B8] uppercase">
                      {currentData.actions.emergencyHelpline?.title || getAlertLabel('stateDisasterHelpline', effectiveLangCode)}
                    </div>
                    <div className="text-sm font-bold text-[#FFA39E]">
                      {currentData.actions.emergencyHelpline?.number || '1070'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1E2E40]">
              <button
                type="button"
                onClick={() => setIsSafetyModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-semibold text-[#CBD5E1] transition-colors"
              >
                {getAlertLabel('close', effectiveLangCode)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSafetyModalOpen(false);
                  onNavigateToWarnings?.();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-xs font-bold text-white transition-colors"
              >
                <span>{getAlertLabel('openFullBulletin', effectiveLangCode)}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── District Detail Quick Sheet ──────────────── */}
      {selectedDistrictDetail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedDistrictDetail(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-[#0F1722] border border-[#334155] p-5 flex flex-col gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1E2E40] pb-2">
              <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                <MapPin className="w-4 h-4 text-[#38BDF8]" />
                <span>{selectedDistrictDetail}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDistrictDetail(null)}
                className="p-1 text-[#94A3B8] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-[#CBD5E1] space-y-1.5">
              <p>
                District <strong>{selectedDistrictDetail}</strong> is identified under the current active warning notice for <strong>{currentData.hazardHeadline}</strong>.
              </p>
              <div className="p-2 rounded bg-[#141F2E] border border-[#1E2E40] text-[11px] font-mono">
                Subdivision: {currentData.regionSubdivision}
                <br />
                Severity: {currentData.severityText}
                <br />
                Validity: {currentData.metrics.validUntilText}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E2E40]">
              <button
                type="button"
                onClick={() => setSelectedDistrictDetail(null)}
                className="px-3 py-1.5 rounded bg-[#1E293B] text-xs font-semibold text-[#CBD5E1]"
              >
                {getAlertLabel('dismiss', effectiveLangCode)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrictDetail(null);
                  onNavigateToWarnings?.();
                }}
                className="px-3 py-1.5 rounded bg-[#38BDF8] hover:bg-[#0284C7] text-xs font-bold text-black"
              >
                {getAlertLabel('viewInWarnings', effectiveLangCode)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── View Full Warning Modal ──────────────── */}
      {isWarningDetailModalOpen && (
        <div
          id="warning-detail-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsWarningDetailModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[#0B131E] border border-[#334155] shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col gap-4 text-[#E2E8F0] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#1E2E40] pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-[#0F1722] border border-[#1E2E40] ${statusTheme.accentColor} shrink-0`}>
                  <HazardIcon hazardType={currentData.hazardType} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded ${statusTheme.badgeBg}`}>
                      ● {localizedDisplay.severityLabel}
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      {localizedDisplay.hazardLabel}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E293B] text-[#38BDF8]">
                      {localizedDisplay.badgeLabel}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                    {localizedDisplay.headline}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-warning-detail-modal"
                onClick={() => setIsWarningDetailModalOpen(false)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
                aria-label={getAlertLabel('close', effectiveLangCode)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-1">
              {/* Preserved Original Official Text if translated */}
              {localizedDisplay.hasUntranslatedOriginal && (
                <div className="p-3.5 rounded-xl bg-[#07111C] border border-[#1E2E40] text-xs text-[#94A3B8]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                    <span>
                      {getAlertLabel('originalNotice', effectiveLangCode)} ({localizedDisplay.officialLanguageName}):
                    </span>
                  </div>
                  <p className="italic text-[#E2E8F0] whitespace-pre-line text-xs sm:text-sm font-normal">
                    "{localizedDisplay.officialText}"
                  </p>
                </div>
              )}

              {/* Region & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-[#0F1722] border border-[#1E2E40]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    {getAlertLabel('affected', effectiveLangCode)} ({regionConfig.regionName})
                  </span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {localizedDisplay.stateOrRegionLabel}
                  </span>
                  {(selectedDetailWarning || locationResult?.primaryWarning)?.subdivision &&
                    (selectedDetailWarning || locationResult?.primaryWarning)?.subdivision !==
                      (selectedDetailWarning || locationResult?.primaryWarning)?.state && (
                      <span className="text-xs text-[#94A3B8] mt-0.5 block">
                        Subdivision: {(selectedDetailWarning || locationResult?.primaryWarning)?.subdivision}
                      </span>
                    )}
                </div>

                <div className="p-3 rounded-lg bg-[#0F1722] border border-[#1E2E40]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    {getAlertLabel('affectedRegionsDistricts', effectiveLangCode)}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {localizedDisplay.affectedRegions.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-[#141F2E] border border-[#1E2E40] text-[#E2E8F0]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time & Expiry Tracking */}
              <div className="p-3.5 rounded-xl bg-[#0F1722] border border-[#1E2E40] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#38BDF8]" />
                    {getAlertLabel('validityCountdown', effectiveLangCode)}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#F59E0B] px-2 py-0.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/30">
                    {countdownText || formatCountdownRemaining((selectedDetailWarning || locationResult?.primaryWarning)?.validUntil)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded bg-[#141F2E] border border-[#1E2E40]">
                    <span className="text-[10px] text-[#64748B] uppercase block">{getAlertLabel('issued', effectiveLangCode)}</span>
                    <span className="font-semibold text-white mt-0.5 block font-mono">
                      {formatISTTime((selectedDetailWarning || locationResult?.primaryWarning)?.issuedAt) || currentData.metrics.issuedAtText}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#141F2E] border border-[#1E2E40]">
                    <span className="text-[10px] text-[#64748B] uppercase block">EFFECTIVE</span>
                    <span className="font-semibold text-white mt-0.5 block font-mono">
                      {formatISTTime((selectedDetailWarning || locationResult?.primaryWarning)?.effectiveFrom || (selectedDetailWarning || locationResult?.primaryWarning)?.issuedAt)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#141F2E] border border-[#1E2E40]">
                    <span className="text-[10px] text-[#64748B] uppercase block">{getAlertLabel('validUntil', effectiveLangCode)}</span>
                    <span className="font-semibold text-[#FCD34D] mt-0.5 block font-mono">
                      {formatISTTime((selectedDetailWarning || locationResult?.primaryWarning)?.validUntil) || currentData.metrics.validUntilText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description / Summary */}
              <div className="p-3.5 rounded-xl bg-[#0F1722] border border-[#1E2E40] flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  {localizedDisplay.badgeLabel}
                </span>
                <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed whitespace-pre-line">
                  {localizedDisplay.headline}
                </p>
              </div>

              {/* Instructions */}
              {localizedDisplay.safetyInstructions.length > 0 ? (
                <div className="p-3.5 rounded-xl bg-[#0F1722] border border-[#1E2E40] flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    {getAlertLabel('safetyMeasuresTitle', effectiveLangCode)}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {localizedDisplay.safetyInstructions.map((inst, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#CBD5E1]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Issuing Authority & Source Verification */}
              <div className="p-3.5 rounded-xl bg-[#0F1722] border border-[#1E2E40] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    ISSUING AUTHORITY / SENDER
                  </span>
                  <span className="font-semibold text-white block mt-0.5">
                    {(selectedDetailWarning || locationResult?.primaryWarning)?.sender ||
                      ((selectedDetailWarning || locationResult?.primaryWarning)?.source === 'NDMA/SACHET'
                        ? 'National Disaster Management Authority'
                        : 'India Meteorological Department')}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] block mt-0.5">
                    Source: {(selectedDetailWarning || locationResult?.primaryWarning)?.source || currentData.trust.source}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    SOURCE IDENTIFIER &amp; VERIFICATION
                  </span>
                  <span
                    className="font-mono text-[11px] text-[#94A3B8] block mt-0.5 truncate"
                    title={(selectedDetailWarning || locationResult?.primaryWarning)?.rawSourceId || (selectedDetailWarning || locationResult?.primaryWarning)?.id || 'N/A'}
                  >
                    ID: {(selectedDetailWarning || locationResult?.primaryWarning)?.rawSourceId || (selectedDetailWarning || locationResult?.primaryWarning)?.id || 'N/A'}
                  </span>
                  <span className="text-[11px] text-[#10B981] block mt-0.5">
                    Verified Sync: {formatISTTime(locationResult?.diagnostics.lastSuccessfulFetchAt || currentData.trust.updatedAt)}
                  </span>
                  {(selectedDetailWarning || locationResult?.primaryWarning)?.sourceUrl && (
                    <a
                      href={(selectedDetailWarning || locationResult?.primaryWarning)!.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#38BDF8] hover:underline mt-1"
                    >
                      <span>Official CAP Alert Record</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#1E2E40]">
              <button
                type="button"
                onClick={() => setIsWarningDetailModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-semibold text-[#CBD5E1] transition-colors"
              >
                {getAlertLabel('close', effectiveLangCode)}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsWarningDetailModalOpen(false);
                  onNavigateToWarnings?.();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-xs font-bold text-black transition-colors"
              >
                <span>{getAlertLabel('viewInWarnings', effectiveLangCode)}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── All Warnings for Location Modal ──────────────── */}
      {isAllWarningsModalOpen && (
        <div
          id="all-warnings-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsAllWarningsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-[#0B131E] border border-[#334155] shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col gap-4 text-[#E2E8F0] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1E2E40] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Active Warnings for {selectedLocation?.city || selectedLocation?.district || selectedLocation?.state || 'Current Location'}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  {(locationResult?.allLocationWarnings?.length ?? 1)} official meteorological warning{(locationResult?.allLocationWarnings?.length ?? 1) > 1 ? 's' : ''} in effect
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAllWarningsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
              {(locationResult?.allLocationWarnings || []).map((w, idx) => (
                <div
                  key={w.id || idx}
                  className="p-3 rounded-xl bg-[#0F1722] hover:bg-[#141F2E] border border-[#1E2E40] transition-colors flex flex-col gap-2 cursor-pointer"
                  onClick={() => {
                    setSelectedDetailWarning(w);
                    setIsAllWarningsModalOpen(false);
                    setIsWarningDetailModalOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      w.severity === 'RED' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50' :
                      w.severity === 'ORANGE' ? 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/50' :
                      'bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/50'
                    }`}>
                      ● {w.severity} ALERT
                    </span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      {formatCountdownRemaining(w.validUntil)}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                    {w.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Subdivision: {w.subdivision || w.state}</span>
                    <span className="text-[#38BDF8] hover:underline flex items-center gap-0.5">
                      Inspect Notice <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[#1E2E40]">
              <button
                type="button"
                onClick={() => setIsAllWarningsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-[#1E293B] text-xs font-semibold text-[#CBD5E1]"
              >
                {getAlertLabel('close', effectiveLangCode)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeSevereWeatherStrip;
