import React from 'react';
import { WarningRecord } from '../../types/warningTypes';
import { WarningCard } from './WarningCard';
import { LocationRecord } from '../../types';

interface WarningListProps {
  warnings: WarningRecord[];
  onViewDetails: (warning: WarningRecord) => void;
  onViewOnMap: (warning: WarningRecord) => void;
  onResetFilters: () => void;
  selectedLocation?: LocationRecord;
}

export const WarningList: React.FC<WarningListProps> = ({
  warnings,
  onViewDetails,
  onViewOnMap,
  onResetFilters,
  selectedLocation,
}) => {
  if (warnings.length === 0) {
    return (
      <div
        id="warning-list-empty-state"
        className="bg-[#0B263D] border border-[#1D5278] rounded-md p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 shadow-sm w-full"
      >
        <div className="w-12 h-12 rounded-full bg-[#081F33] border border-[#1D5278] flex items-center justify-center text-[#00E676]">
          <span className="material-symbols-outlined text-[28px]">verified</span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          No Warnings Match Current Filter Criteria
        </h3>

        <p className="text-xs text-[#AFC4D8] max-w-md leading-relaxed">
          No active meteorological warnings match the selected state, region, or hazard parameters. Meteorological conditions are normal in this sector.
        </p>

        <button
          id="btn-empty-reset-filters"
          type="button"
          onClick={onResetFilters}
          className="mt-2 px-4 py-2 rounded bg-[#1565C0] hover:bg-[#0B3D91] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="national-warning-bulletins-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch w-full min-w-0"
    >
      {warnings.map((warning) => {
        const isLocTarget =
          selectedLocation &&
          (warning.state.toLowerCase() === (selectedLocation.state || '').toLowerCase() ||
            warning.affectedDistricts.some(
              (d) =>
                d.toLowerCase() === (selectedLocation.district || '').toLowerCase() ||
                d.toLowerCase() === (selectedLocation.city || '').toLowerCase()
            ));

        return (
          <WarningCard
            key={warning.id}
            warning={warning}
            onViewDetails={onViewDetails}
            onViewOnMap={onViewOnMap}
            isLocationTarget={Boolean(isLocTarget)}
          />
        );
      })}
    </div>
  );
};
