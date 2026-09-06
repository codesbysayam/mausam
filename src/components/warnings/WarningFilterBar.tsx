import React from 'react';
import {
  WarningFilterState,
  IndiaMetRegion,
  HazardCategory,
  AlertSeverity,
} from '../../types/warningTypes';

interface WarningFilterBarProps {
  filter: WarningFilterState;
  onFilterChange: (newFilter: WarningFilterState) => void;
  onResetFilters: () => void;
  activeCount: number;
  totalCount: number;
}

const REGION_OPTIONS: { id: IndiaMetRegion; label: string }[] = [
  { id: 'all', label: 'All India' },
  { id: 'north', label: 'Northwest' },
  { id: 'east', label: 'East & Northeast' },
  { id: 'central', label: 'Central' },
  { id: 'south', label: 'South Peninsular' },
  { id: 'west', label: 'Island Territories' },
];

const HAZARD_PILLS: { id: HazardCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Hazards', icon: 'apps' },
  { id: 'heavy_rain', label: 'Rainfall', icon: 'rainy' },
  { id: 'flood', label: 'Flood', icon: 'flood' },
  { id: 'thunderstorm', label: 'Thunderstorm', icon: 'thunderstorm' },
  { id: 'cyclone', label: 'Cyclone', icon: 'cyclone' },
  { id: 'heatwave', label: 'Heatwave', icon: 'local_fire_department' },
  { id: 'dense_fog', label: 'Fog', icon: 'foggy' },
  { id: 'strong_wind', label: 'Wind', icon: 'air' },
  { id: 'coastal_warning', label: 'Coastal', icon: 'tsunami' },
];

export const WarningFilterBar: React.FC<WarningFilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilters,
  activeCount,
  totalCount,
}) => {
  const isFiltered =
    filter.region !== 'all' ||
    filter.state !== 'all' ||
    filter.hazard !== 'all' ||
    filter.severity !== 'all' ||
    filter.searchQuery.trim() !== '';

  const handleUpdate = <K extends keyof WarningFilterState>(
    key: K,
    value: WarningFilterState[K]
  ) => {
    onFilterChange({
      ...filter,
      [key]: value,
    });
  };

  return (
    <div
      id="warning-filter-bar-container"
      className="bg-[#0B263D] border border-[#1D5278] rounded-md p-4 shadow-sm flex flex-col gap-3.5"
    >
      {/* 1. Top Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#AFC4D8] text-[18px] pointer-events-none">
            search
          </span>
          <input
            id="input-warning-search"
            type="text"
            value={filter.searchQuery}
            onChange={(e) => handleUpdate('searchQuery', e.target.value)}
            placeholder="Search by state, district, hazard keyword, or bulletin ID..."
            aria-label="Search weather warnings"
            className="w-full pl-9 pr-9 py-2 bg-[#081F33] border border-[#1D5278] rounded text-xs text-white placeholder-[#AFC4D8] focus:outline-none focus:border-[#1565C0] transition-colors"
          />
          {filter.searchQuery && (
            <button
              id="btn-clear-warning-search"
              type="button"
              onClick={() => handleUpdate('searchQuery', '')}
              aria-label="Clear search input"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#AFC4D8] hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="text-xs text-[#AFC4D8] font-mono px-2.5 py-1 rounded bg-[#081F33] border border-[#1D5278]">
            <span>Showing: </span>
            <strong className="text-white">{activeCount}</strong>
            <span className="text-[#AFC4D8]"> of {totalCount} Bulletins</span>
          </div>

          {isFiltered && (
            <button
              id="btn-reset-filters"
              type="button"
              onClick={onResetFilters}
              className="px-2.5 py-1 rounded bg-[#081F33] hover:bg-[#102D47] text-[#AFC4D8] hover:text-white border border-[#1D5278] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Severity Tabs & Region Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-[#1D5278]">
        {/* Severity Tabs / Pills */}
        <div
          id="severity-filter-pills"
          role="tablist"
          aria-label="Filter warnings by alert level"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
        >
          <button
            id="tab-sev-all"
            type="button"
            onClick={() => handleUpdate('severity', 'all')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border whitespace-nowrap ${
              filter.severity === 'all'
                ? 'bg-[#1565C0] text-white border-[#E3F2FD] shadow-xs'
                : 'bg-[#081F33] text-[#AFC4D8] hover:text-white border-[#1D5278]'
            }`}
          >
            All Warnings
          </button>

          <button
            id="tab-sev-red"
            type="button"
            onClick={() => handleUpdate('severity', 'red')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
              filter.severity === 'red'
                ? 'bg-[#FF0000] text-white border-white shadow-xs'
                : 'bg-[#081F33] text-[#FF4D4D] hover:bg-[#FF0000]/10 border-[#FF0000]/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF0000]" />
            <span>Red Alert</span>
          </button>

          <button
            id="tab-sev-orange"
            type="button"
            onClick={() => handleUpdate('severity', 'orange')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
              filter.severity === 'orange'
                ? 'bg-[#FFA500] text-[#0B263D] border-white shadow-xs'
                : 'bg-[#081F33] text-[#FFA500] hover:bg-[#FFA500]/10 border-[#FFA500]/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FFA500]" />
            <span>Orange Alert</span>
          </button>

          <button
            id="tab-sev-yellow"
            type="button"
            onClick={() => handleUpdate('severity', 'yellow')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
              filter.severity === 'yellow'
                ? 'bg-[#FFFF00] text-[#0B263D] border-white shadow-xs'
                : 'bg-[#081F33] text-[#FFFF00] hover:bg-[#FFFF00]/10 border-[#FFFF00]/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FFFF00]" />
            <span>Yellow Watch</span>
          </button>

          <button
            id="tab-sev-green"
            type="button"
            onClick={() => handleUpdate('severity', 'green')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap ${
              filter.severity === 'green'
                ? 'bg-[#008000] text-white border-white shadow-xs'
                : 'bg-[#081F33] text-[#00E676] hover:bg-[#008000]/10 border-[#008000]/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#008000]" />
            <span>Green / Normal</span>
          </button>
        </div>

        {/* Region Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="select-met-region"
            className="text-xs text-[#AFC4D8] font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">travel_explore</span>
            <span className="hidden sm:inline">Region:</span>
          </label>
          <select
            id="select-met-region"
            value={filter.region}
            onChange={(e) => handleUpdate('region', e.target.value as IndiaMetRegion)}
            className="bg-[#081F33] border border-[#1D5278] text-white text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#1565C0] cursor-pointer"
          >
            {REGION_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Hazard Category Pills */}
      <div
        id="hazard-category-pills-row"
        role="tablist"
        aria-label="Filter warnings by hazard category"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[#1D5278] scrollbar-thin scrollbar-thumb-[#1D5278]"
      >
        {HAZARD_PILLS.map((pill) => {
          const isActive = filter.hazard === pill.id;
          return (
            <button
              key={pill.id}
              id={`btn-hazard-pill-${pill.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleUpdate('hazard', pill.id)}
              className={`px-3 py-1 rounded text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer border whitespace-nowrap ${
                isActive
                  ? 'bg-[#102D47] text-[#E3F2FD] border-[#1565C0] shadow-xs'
                  : 'bg-[#081F33] text-[#AFC4D8] hover:text-white hover:bg-[#102D47] border-[#1D5278]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#4FA8E0]">
                {pill.icon}
              </span>
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
