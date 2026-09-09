import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import {
  WarningRecord,
  WarningFilterState,
  StateWarningSummary,
  AlertSeverity,
} from '../types/warningTypes';
import { warningService } from '../services/warningService';
import { WarningHeader } from '../components/warnings/WarningHeader';
import { NationalAlertStatus } from '../components/warnings/NationalAlertStatus';
import { WarningTicker } from '../components/warnings/WarningTicker';
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
  // Real warning records fetched from verified IMD API
  const [warningsList, setWarningsList] = useState<WarningRecord[]>([]);
  const [filter, setFilter] = useState<WarningFilterState>(INITIAL_FILTER_STATE);
  const [selectedDrawerWarning, setSelectedDrawerWarning] = useState<WarningRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch verified warnings for the current location
  const loadWarnings = useCallback(async (force = false) => {
    setIsRefreshing(true);
    try {
      const res = await warningService.fetchLocationWarning(selectedLocation, force);
      if (
        res.state === 'WATCH_ADVISORY' ||
        res.state === 'ORANGE_ALERT' ||
        res.state === 'RED_ALERT'
      ) {
        const liveRecord: WarningRecord = {
          id: 'imd-live-' + (res.metadata?.resolvedDistrict || 'warning').toLowerCase().replace(/\s+/g, '-'),
          bulletinNo: `IMD/HQ/WRN/${new Date().getFullYear()}/LIVE`,
          title: res.hazardHeadline,
          severity: res.severity as AlertSeverity,
          severityLabel: res.severityLabel || 'ACTIVE WARNING',
          hazardCategory: 'heavy_rain',
          hazardLabel: res.hazardLabel || res.hazardHeadline,
          hazardIcon: 'warning',
          region: 'east',
          state: res.metadata?.resolvedState || selectedLocation?.state || 'India',
          stateCode: (res.metadata?.resolvedState || selectedLocation?.state || 'IN').slice(0, 2).toUpperCase(),
          subdivision: res.metadata?.subdivision || res.affectedAreasHeadline,
          affectedDistricts: res.affectedDistricts.length > 0 ? res.affectedDistricts : [selectedLocation?.city || 'Local Sector'],
          affectedAreaText: res.affectedAreasHeadline,
          description: res.description,
          impacts: ['Potential localized waterlogging', 'Traffic disruption during peak spell periods'],
          recommendedActions: res.recommendedActions || [],
          expectedConditions: {},
          timeline: [],
          issuedAt: res.issuedAt,
          validFrom: res.issuedAt,
          validUntil: res.validUntil,
          validityTimestamp: Date.now() + 24 * 3600 * 1000,
          authorityAgency: res.source === 'None' ? 'IMD Warning Service' : res.source,
          source: res.source === 'None' ? 'IMD Warning Service' : res.source,
          isRedAlert: res.severity === 'red',
          emergencyContact: {
            title: res.emergencyContact?.title || 'National Disaster Response Force',
            number: res.emergencyContact?.number || '112',
            description: 'Toll-free 24/7 disaster emergency line',
          },
        };
        setWarningsList([liveRecord]);
      } else {
        // No active warning, international, or data unavailable -> empty warning list
        setWarningsList([]);
      }
    } catch {
      setWarningsList([]);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    loadWarnings(false);
  }, [loadWarnings]);

  // Section reference for quick jumping to bulletins grid
  const regionalAlertsRef = useRef<HTMLDivElement>(null);

  // Filtered list of warnings based on active user filter
  const filteredWarnings = useMemo(() => {
    return warningService.filterWarnings(warningsList, filter);
  }, [warningsList, filter]);

  // Real-time calculated national warning stats
  const stats = useMemo(() => {
    return warningService.calculateStats(warningsList);
  }, [warningsList]);

  // Overall national alert status level
  const overallStatus = useMemo(() => {
    return warningService.getNationalOverallStatus(warningsList);
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

      {/* 1. Official Header with Synoptic Status & Manual Refresh */}
      <WarningHeader
        lastUpdated={stats.lastUpdatedIst}
        onRefresh={handleRefresh}
        isLoading={isRefreshing}
      />

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
