import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import {
  WarningRecord,
  WarningFilterState,
  StateWarningSummary,
  AlertSeverity,
} from '../types/warningTypes';
import { warningService as canonicalWarningService } from '../services/warnings/warningService';
import { warningService as warningHelperService } from '../services/warningService';
import { weatherWarningToRecord } from '../services/warnings/warningAdapter';
import { WarningFeedDiagnostics } from '../types/warnings';
import { WarningHeader } from '../components/warnings/WarningHeader';
import { NationalAlertStatus } from '../components/warnings/NationalAlertStatus';
import { WarningTicker } from '../components/warnings/WarningTicker';
import { useAlertAudio } from '../hooks/useAlertAudio';
import { Volume2, AlertTriangle, RefreshCw } from 'lucide-react';
import { WarningFilterBar } from '../components/warnings/WarningFilterBar';
import { NationalWarningMap } from '../components/warnings/NationalWarningMap';
import { StateWatchlistPanel } from '../components/warnings/StateWatchlistPanel';
import { WarningList } from '../components/warnings/WarningList';
import { WarningDetailDrawer } from '../components/warnings/WarningDetailDrawer';
import { SafetyGuidanceSection } from '../components/warnings/SafetyGuidanceSection';
import { EmergencyResponseSection } from '../components/warnings/EmergencyResponseSection';
import { NationalClassificationMatrix } from '../components/warnings/NationalClassificationMatrix';
import { LocationStatusBar } from '../components/location/LocationStatusBar';

interface AlertsPageProps {
  weatherBundle?: WeatherDataBundle;
  selectedLocation?: LocationRecord;
}

const INITIAL_FILTER_STATE: WarningFilterState = {
  region: 'all',
  state: 'all',
  hazard: 'all',
  severity: 'all',
  validity: 'all',
  searchQuery: '',
};

export const AlertsPage: React.FC<AlertsPageProps> = ({
  weatherBundle,
  selectedLocation,
}) => {
  // Real warning records fetched from verified SACHET/NDMA and IMD feed
  const [warningsList, setWarningsList] = useState<WarningRecord[]>([]);
  const [diagnostics, setDiagnostics] = useState<WarningFeedDiagnostics | null>(null);
  const [isFeedUnavailable, setIsFeedUnavailable] = useState<boolean>(false);
  const [filter, setFilter] = useState<WarningFilterState>(INITIAL_FILTER_STATE);
  const [selectedDrawerWarning, setSelectedDrawerWarning] = useState<WarningRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertSurgeNotice, setAlertSurgeNotice] = useState<string | null>(null);

  // Monitor alert warnings and trigger audio chime when a genuinely new active warning arrives
  const { isAudioAlertEnabled } = useAlertAudio({
    warnings: warningsList,
    onNewAlertTriggered: (newWarning) => {
      setAlertSurgeNotice(`New ${newWarning.severity?.toUpperCase() || 'OFFICIAL'} Alert: ${newWarning.title || 'Severe Weather Warning'}`);
      setTimeout(() => setAlertSurgeNotice(null), 8000);
    },
  });

  // Fetch verified warnings for the current location & nation
  const loadWarnings = useCallback(async (force = false) => {
    setIsRefreshing(true);
    try {
      const { activeWarnings, diagnostics: diag } = await canonicalWarningService.fetchWarnings(force);
      setDiagnostics(diag);

      if (diag.status === 'UNAVAILABLE') {
        setIsFeedUnavailable(true);
        setWarningsList([]);
      } else {
        setIsFeedUnavailable(false);
        const mappedRecords = activeWarnings.map(weatherWarningToRecord);
        setWarningsList(mappedRecords);
      }
    } catch {
      setIsFeedUnavailable(true);
      setWarningsList([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWarnings(false);
  }, [loadWarnings]);

  // Section reference for quick jumping to bulletins grid
  const regionalAlertsRef = useRef<HTMLDivElement>(null);

  // Filtered list of warnings based on active user filter
  const filteredWarnings = useMemo(() => {
    return warningHelperService.filterWarnings(warningsList, filter);
  }, [warningsList, filter]);

  // Real-time calculated national warning stats
  const stats = useMemo(() => {
    return warningHelperService.calculateStats(warningsList);
  }, [warningsList]);

  // Overall national alert status level
  const overallStatus = useMemo(() => {
    return warningHelperService.getNationalOverallStatus(warningsList);
  }, [warningsList]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    loadWarnings(true);
  }, [loadWarnings]);

  // Handle drawer open
  const handleOpenWarningDetails = useCallback((warning: WarningRecord) => {
    setSelectedDrawerWarning(warning);
    setIsDrawerOpen(true);
  }, []);

  // Handle map state click
  const handleSelectStateFromMap = useCallback((stateName: string) => {
    setFilter((prev) => ({
      ...prev,
      state: stateName,
    }));
  }, []);

  // Handle state drawer click from map or watchlist
  const handleOpenStateSummary = useCallback(
    (summary: StateWarningSummary) => {
      const matchedWarning = warningsList.find(
        (w) =>
          w.state.toLowerCase() === summary.stateName.toLowerCase() ||
          w.stateCode.toLowerCase() === summary.stateCode.toLowerCase()
      );

      if (matchedWarning) {
        handleOpenWarningDetails(matchedWarning);
      } else {
        setFilter((prev) => ({
          ...prev,
          state: summary.stateName,
        }));
      }
    },
    [warningsList, handleOpenWarningDetails]
  );

  // Handle focus state on map from a warning card
  const handleViewOnMap = useCallback((warning: WarningRecord) => {
    setFilter((prev) => ({
      ...prev,
      state: warning.state,
    }));

    const mapElement = document.getElementById('national-weather-alert-map-card');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setFilter(INITIAL_FILTER_STATE);
  }, []);

  // Handle quick jump to bulletins list
  const handleScrollToRegionalAlerts = useCallback(() => {
    if (regionalAlertsRef.current) {
      regionalAlertsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div
      id="mausam-national-warning-portal"
      className="flex flex-col gap-5 pb-12 w-full max-w-[1520px] mx-auto transition-colors duration-200"
    >
      {/* Unified Compact Location Status Bar */}
      <LocationStatusBar location={selectedLocation} />

      {/* Official Warning Feed Unavailable Banner */}
      {isFeedUnavailable && (
        <div
          id="warning-feed-unavailable-banner"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 rounded-xl bg-[#181109] border border-[#F59E0B]/50 text-white shadow-lg"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-[#F59E0B] shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                OFFICIAL WARNING FEED UNAVAILABLE
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                The real-time SACHET / NDMA disaster alert stream is temporarily unreachable. Surface telemetry and NWP numerical model forecasts remain active.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadWarnings(true)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#241A0C] hover:bg-[#362713] border border-[#F59E0B]/60 text-xs font-bold text-[#FCD34D] transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Retry Feed Sync</span>
          </button>
        </div>
      )}

      {/* 1. Official Header with Synoptic Status & Manual Refresh */}
      <WarningHeader
        lastUpdated={stats.lastUpdatedIst}
        onRefresh={handleRefresh}
        isLoading={isRefreshing}
      />

      {/* Optional Severe Audio Alert Trigger Notice Banner */}
      {alertSurgeNotice && (
        <div
          id="severe-alert-surge-banner"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[#E74C3C]/20 border border-[#E74C3C] text-white shadow-lg animate-pulse"
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <Volume2 className="w-5 h-5 text-[#FF8A80] shrink-0" />
            <span className="text-[#FF8A80] uppercase tracking-wider">Audio Notification:</span>
            <span>{alertSurgeNotice}</span>
          </div>
          <span className="text-[11px] font-mono text-[#FFCDD2] bg-[#E74C3C]/40 px-2 py-0.5 rounded">
            {isAudioAlertEnabled ? 'Chime Played' : 'Muted'}
          </span>
        </div>
      )}

      {/* 2. National Alert Status & Live Warning Ticker */}
      <div className="flex flex-col gap-3">
        <NationalAlertStatus
          overallStatus={overallStatus}
          stats={stats}
          lastUpdated={stats.lastUpdatedIst}
          onViewRegionalAlerts={handleScrollToRegionalAlerts}
        />
        <WarningTicker
          warnings={warningsList}
          onSelectWarning={handleOpenWarningDetails}
        />
      </div>

      {/* 3. Geographic Intelligence: National Warning Map & State Watchlist Panel */}
      <div
        id="section-national-warning-map-and-watchlist"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
      >
        {/* Left Column (Desktop 7 cols): Interactive All-India Severity Map */}
        <div className="lg:col-span-7 w-full flex flex-col min-w-0">
          <NationalWarningMap
            selectedState={filter.state !== 'all' ? filter.state : null}
            onSelectState={handleSelectStateFromMap}
            onOpenStateDrawer={handleOpenStateSummary}
            warnings={warningsList}
          />
        </div>

        {/* Right Column (Desktop 5 cols): State Warning Watchlist */}
        <div className="lg:col-span-5 w-full flex flex-col min-w-0">
          <StateWatchlistPanel
            selectedState={filter.state !== 'all' ? filter.state : null}
            onSelectState={handleSelectStateFromMap}
            onOpenStateDrawer={handleOpenStateSummary}
            warnings={warningsList}
          />
        </div>
      </div>

      {/* 4. Unified Filter Bar (Search, Severity Tabs, Region, Hazard Chips) */}
      <div ref={regionalAlertsRef} className="flex flex-col gap-3">
        <WarningFilterBar
          filter={filter}
          onFilterChange={setFilter}
          onResetFilters={handleResetFilters}
          activeCount={filteredWarnings.length}
          totalCount={warningsList.length}
        />
      </div>

      {/* 5. Active Warning Bulletins Responsive Grid */}
      <section id="section-national-warning-bulletins" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pb-0.5">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[22px] text-[#4FA8E0] shrink-0">
              campaign
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Active Meteorological Warning Bulletins
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <span className="text-xs text-[#AFC4D8] font-mono bg-[#081F33] border border-[#1D5278] px-2.5 py-1 rounded">
              Showing <strong className="text-white">{filteredWarnings.length}</strong> of{' '}
              <span className="text-[#AFC4D8]">{warningsList.length}</span> active bulletins
            </span>
            {filter.state !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter((prev) => ({ ...prev, state: 'all' }))}
                className="text-[11px] text-[#4FA8E0] hover:text-white hover:underline flex items-center gap-1 cursor-pointer bg-[#081F33] border border-[#1D5278] px-2 py-1 rounded transition-colors"
              >
                <span>Filtered: {filter.state}</span>
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            )}
          </div>
        </div>

        <WarningList
          warnings={filteredWarnings}
          onViewDetails={handleOpenWarningDetails}
          onViewOnMap={handleViewOnMap}
          onResetFilters={handleResetFilters}
          selectedLocation={selectedLocation}
        />
      </section>

      {/* 6. Public Safety Guidance & NDMA Protocols */}
      <SafetyGuidanceSection activeHazardFilter={filter.hazard} />

      {/* 7. National Meteorological Classification Matrix */}
      <NationalClassificationMatrix />

      {/* 8. Emergency & Disaster Response Directory */}
      <EmergencyResponseSection selectedLocation={selectedLocation} />

      {/* 9. Slide-out Detailed Warning Bulletin Drawer */}
      <WarningDetailDrawer
        warning={selectedDrawerWarning}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
