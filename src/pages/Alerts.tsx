import React, { useState, useMemo, useRef, useCallback } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import {
  WarningRecord,
  WarningFilterState,
  StateWarningSummary,
  HazardCategory,
} from '../types/warningTypes';
import { NATIONAL_WARNINGS_DATABASE } from '../data/nationalWarningsData';
import { warningService } from '../services/warningService';
import { WarningHeader } from '../components/warnings/WarningHeader';
import { NationalAlertStatus } from '../components/warnings/NationalAlertStatus';
import { WarningTicker } from '../components/warnings/WarningTicker';
import { WarningFilterBar } from '../components/warnings/WarningFilterBar';
import { HazardCategoryButtons } from '../components/warnings/HazardCategoryButtons';
import { NationalWarningMap } from '../components/warnings/NationalWarningMap';
import { StateWatchlistPanel } from '../components/warnings/StateWatchlistPanel';
import { WarningStatistics } from '../components/warnings/WarningStatistics';
import { WarningList } from '../components/warnings/WarningList';
import { WarningDetailDrawer } from '../components/warnings/WarningDetailDrawer';
import { SafetyGuidanceSection } from '../components/warnings/SafetyGuidanceSection';
import { WarningTimelineSection } from '../components/warnings/WarningTimelineSection';
import { EmergencyResponseSection } from '../components/warnings/EmergencyResponseSection';
import { NationalClassificationMatrix } from '../components/warnings/NationalClassificationMatrix';

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
  // All warning records from national database
  const [warningsList, setWarningsList] = useState<WarningRecord[]>(
    NATIONAL_WARNINGS_DATABASE
  );
  const [filter, setFilter] = useState<WarningFilterState>(INITIAL_FILTER_STATE);
  const [selectedDrawerWarning, setSelectedDrawerWarning] = useState<WarningRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Section reference for quick jumping from "View Regional Warnings" button
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
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate live synoptic poll
      setWarningsList([...NATIONAL_WARNINGS_DATABASE]);
      setIsRefreshing(false);
    }, 600);
  }, []);

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
  const handleOpenStateSummary = useCallback((summary: StateWarningSummary) => {
    const matchedWarning = warningsList.find(
      (w) =>
        w.state.toLowerCase() === summary.stateName.toLowerCase() ||
        w.stateCode.toLowerCase() === summary.stateCode.toLowerCase()
    );

    if (matchedWarning) {
      handleOpenWarningDetails(matchedWarning);
    } else {
      // Set the filter to this state
      setFilter((prev) => ({
        ...prev,
        state: summary.stateName,
      }));
    }
  }, [warningsList, handleOpenWarningDetails]);

  // Handle focus state on map from a warning card
  const handleViewOnMap = useCallback((warning: WarningRecord) => {
    setFilter((prev) => ({
      ...prev,
      state: warning.state,
    }));

    // Scroll to map smoothly
    const mapElement = document.getElementById('national-weather-alert-map-card');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setFilter(INITIAL_FILTER_STATE);
  }, []);

  // Handle quick jump to regional warnings list
  const handleScrollToRegionalAlerts = useCallback(() => {
    if (regionalAlertsRef.current) {
      regionalAlertsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div
      id="mausam-national-warning-portal"
      className="flex flex-col gap-5 pb-12 transition-colors duration-200"
    >
      {/* 1. Official Header with Synoptic Status & Manual Refresh */}
      <WarningHeader
        lastUpdated={stats.lastUpdatedIst}
        onRefresh={handleRefresh}
        isLoading={isRefreshing}
      />

      {/* 2. Side-by-Side Operational Status Strip: National Alert Status & Live Warning Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 w-full flex flex-col">
          <NationalAlertStatus
            overallStatus={overallStatus}
            lastUpdated={stats.lastUpdatedIst}
            onViewRegionalAlerts={handleScrollToRegionalAlerts}
            severeCount={stats.severeRed}
          />
        </div>

        <div className="lg:col-span-5 w-full flex flex-col">
          <WarningTicker
            warnings={warningsList}
            onSelectWarning={handleOpenWarningDetails}
          />
        </div>
      </div>

      {/* 3. Real-time National Meteorological Telemetry Statistics */}
      <WarningStatistics stats={stats} />

      {/* 4. Side-by-Side Geographical Intelligence: National Warning Map & State Watchlist Panel */}
      <div
        id="section-national-warning-map-and-watchlist"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
      >
        {/* Left Column (Desktop 7 cols): Interactive All-India Severity Map */}
        <div className="lg:col-span-7 w-full flex flex-col">
          <NationalWarningMap
            selectedState={filter.state !== 'all' ? filter.state : null}
            onSelectState={handleSelectStateFromMap}
            onOpenStateDrawer={handleOpenStateSummary}
            warnings={warningsList}
          />
        </div>

        {/* Right Column (Desktop 5 cols): State Warning Watchlist & Operational Matrix */}
        <div className="lg:col-span-5 w-full flex flex-col">
          <StateWatchlistPanel
            selectedState={filter.state !== 'all' ? filter.state : null}
            onSelectState={handleSelectStateFromMap}
            onOpenStateDrawer={handleOpenStateSummary}
          />
        </div>
      </div>

      {/* 5. Comprehensive Filter Bar (Region, State, Hazard, Severity, Validity, Search) */}
      <div ref={regionalAlertsRef} className="flex flex-col gap-3">
        <WarningFilterBar
          filter={filter}
          onFilterChange={setFilter}
          onResetFilters={handleResetFilters}
          activeCount={filteredWarnings.length}
        />

        {/* Hazard Category Chips Selector */}
        <HazardCategoryButtons
          selectedHazard={filter.hazard}
          onSelectHazard={(hazard: HazardCategory | 'all') =>
            setFilter((prev) => ({ ...prev, hazard }))
          }
          warnings={warningsList}
        />
      </div>

      {/* 6. Active Weather Warning Cards — Full Width Multi-Column Side-by-Side Grid */}
      <div id="section-national-warning-bulletins" className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#4FA8E0]">
              campaign
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Active Meteorological Warning Bulletins
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8A94A6] font-mono">
              Showing {filteredWarnings.length} of {warningsList.length} active bulletins
            </span>
            {filter.state !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter((prev) => ({ ...prev, state: 'all' }))}
                className="text-[11px] text-[#4FA8E0] hover:underline flex items-center gap-1"
              >
                <span>Clear state filter ({filter.state})</span>
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
      </div>

      {/* 7. Side-by-Side Public Safety Guidance & Warning Progression Timeline */}
      <div
        id="section-safety-and-timeline-grid"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
      >
        <SafetyGuidanceSection activeHazardFilter={filter.hazard} />
        <WarningTimelineSection activeWarning={selectedDrawerWarning} />
      </div>

      {/* 8. Side-by-Side Classification Matrix & Emergency Response Directory */}
      <div
        id="section-classification-and-emergency-grid"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch"
      >
        <NationalClassificationMatrix />
        <EmergencyResponseSection selectedLocation={selectedLocation} />
      </div>

      {/* 9. Slide-out Detailed Warning Drawer / Dialog */}
      <WarningDetailDrawer
        warning={selectedDrawerWarning}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
