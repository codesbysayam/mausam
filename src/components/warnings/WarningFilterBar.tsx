import React from 'react';
import {
  WarningFilterState,
  IndiaMetRegion,
  HazardCategory,
  AlertSeverity,
  WarningValidityPeriod,
} from '../../types/warningTypes';
import { HAZARD_DEFINITIONS } from '../../data/nationalWarningsData';
import { INDIA_WEATHER_DATA } from '../../data/indiaWeatherData';

interface WarningFilterBarProps {
  filter: WarningFilterState;
  onFilterChange: (newFilter: WarningFilterState) => void;
  onResetFilters: () => void;
  activeCount: number;
}

const REGION_OPTIONS: { id: IndiaMetRegion; label: string }[] = [
  { id: 'all', label: 'All India' },
  { id: 'north', label: 'North' },
  { id: 'east', label: 'East' },
  { id: 'west', label: 'West' },
  { id: 'south', label: 'South' },
  { id: 'central', label: 'Central' },
  { id: 'northeast', label: 'North-East' },
];

const SEVERITY_OPTIONS: { id: AlertSeverity | 'all'; label: string; color?: string }[] = [
  { id: 'all', label: 'All Severity Levels' },
  { id: 'red', label: '🔴 Red Alert (Take Action)' },
  { id: 'orange', label: '🟠 Orange Alert (Be Prepared)' },
  { id: 'yellow', label: '🟡 Yellow Watch (Be Updated)' },
  { id: 'purple', label: '🟣 Advisory Bulletin (Agromet/Special)' },
  { id: 'green', label: '🟢 Green Code (Normal)' },
];

const VALIDITY_OPTIONS: { id: WarningValidityPeriod; label: string }[] = [
  { id: 'active_now', label: 'Active Now' },
  { id: 'next_24h', label: 'Next 24 Hours' },
  { id: 'next_48h', label: 'Next 48 Hours' },
  { id: 'next_5d', label: 'Next 5 Days' },
  { id: 'all', label: 'All Bulletins' },
];

export const WarningFilterBar: React.FC<WarningFilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilters,
  activeCount,
}) => {
  const isFiltered =
    filter.region !== 'all' ||
    filter.state !== 'all' ||
    filter.hazard !== 'all' ||
    filter.severity !== 'all' ||
    filter.validity !== 'all' ||
    filter.searchQuery.trim() !== '';

  const handleFieldChange = <K extends keyof WarningFilterState>(
    field: K,
    value: WarningFilterState[K]
  ) => {
    onFilterChange({
      ...filter,
      [field]: value,
    });
  };

  return (
    <div
      id="warning-filter-bar-panel"
      className="bg-[#1E2733] border border-[#314255] rounded-md p-3 sm:p-4 shadow-sm flex flex-col gap-3"
    >
      {/* Top row: Search input & quick stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Input with Clear Button */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6] text-[18px] pointer-events-none">
            search
          </span>

          <input
            id="input-warning-search"
            type="text"
            value={filter.searchQuery}
            onChange={(e) => handleFieldChange('searchQuery', e.target.value)}
            placeholder="Search state, district, city, hazard or bulletin..."
            aria-label="Search weather warnings"
            className="w-full pl-9 pr-8 py-2 bg-[#151D26] border border-[#314255] rounded text-xs text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#4FA8E0] transition-colors"
          />

          {filter.searchQuery && (
            <button
              id="btn-clear-warning-search"
              type="button"
              onClick={() => handleFieldChange('searchQuery', '')}
              aria-label="Clear search input"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Results Counter & Reset Filter Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <span className="text-xs text-[#8A94A6] whitespace-nowrap">
            Showing <strong className="text-white font-mono">{activeCount}</strong> bulletin{activeCount === 1 ? '' : 's'}
          </span>

          {isFiltered && (
            <button
              id="btn-reset-warning-filters"
              type="button"
              onClick={onResetFilters}
              className="px-2.5 py-1.5 rounded bg-[#151D26] hover:bg-[#2A3749] text-[#4FA8E0] hover:text-white border border-[#314255] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Structured Select Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-[#314255]/70">
        {/* 1. Region Dropdown */}
        <div className="flex flex-col gap-1">
          <label htmlFor="select-warning-region" className="text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider">
            Region
          </label>
          <select
            id="select-warning-region"
            value={filter.region}
            onChange={(e) => handleFieldChange('region', e.target.value as IndiaMetRegion)}
            className="w-full px-2.5 py-1.5 bg-[#151D26] border border-[#314255] rounded text-xs text-[#DCE3EB] focus:outline-none focus:border-[#4FA8E0] cursor-pointer"
          >
            {REGION_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#151D26] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. State Dropdown */}
        <div className="flex flex-col gap-1">
          <label htmlFor="select-warning-state" className="text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider">
            State / UT
          </label>
          <select
            id="select-warning-state"
            value={filter.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-[#151D26] border border-[#314255] rounded text-xs text-[#DCE3EB] focus:outline-none focus:border-[#4FA8E0] cursor-pointer"
          >
            <option value="all" className="bg-[#151D26] text-white">
              All States &amp; UTs
            </option>
            {INDIA_WEATHER_DATA.map((st) => (
              <option key={st.id} value={st.name} className="bg-[#151D26] text-white">
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Hazard Dropdown */}
        <div className="flex flex-col gap-1">
          <label htmlFor="select-warning-hazard" className="text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider">
            Hazard Type
          </label>
          <select
            id="select-warning-hazard"
            value={filter.hazard}
            onChange={(e) => handleFieldChange('hazard', e.target.value as HazardCategory | 'all')}
            className="w-full px-2.5 py-1.5 bg-[#151D26] border border-[#314255] rounded text-xs text-[#DCE3EB] focus:outline-none focus:border-[#4FA8E0] cursor-pointer"
          >
            <option value="all" className="bg-[#151D26] text-white">
              All Hazard Types
            </option>
            {HAZARD_DEFINITIONS.map((hz) => (
              <option key={hz.id} value={hz.id} className="bg-[#151D26] text-white">
                {hz.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Severity Dropdown */}
        <div className="flex flex-col gap-1">
          <label htmlFor="select-warning-severity" className="text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider">
            Severity Level
          </label>
          <select
            id="select-warning-severity"
            value={filter.severity}
            onChange={(e) => handleFieldChange('severity', e.target.value as AlertSeverity | 'all')}
            className="w-full px-2.5 py-1.5 bg-[#151D26] border border-[#314255] rounded text-xs text-[#DCE3EB] focus:outline-none focus:border-[#4FA8E0] cursor-pointer"
          >
            {SEVERITY_OPTIONS.map((sev) => (
              <option key={sev.id} value={sev.id} className="bg-[#151D26] text-white">
                {sev.label}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Validity Dropdown */}
        <div className="flex flex-col gap-1">
          <label htmlFor="select-warning-validity" className="text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider">
            Validity Horizon
          </label>
          <select
            id="select-warning-validity"
            value={filter.validity}
            onChange={(e) => handleFieldChange('validity', e.target.value as WarningValidityPeriod)}
            className="w-full px-2.5 py-1.5 bg-[#151D26] border border-[#314255] rounded text-xs text-[#DCE3EB] focus:outline-none focus:border-[#4FA8E0] cursor-pointer"
          >
            {VALIDITY_OPTIONS.map((val) => (
              <option key={val.id} value={val.id} className="bg-[#151D26] text-white">
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
