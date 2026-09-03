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
        className="bg-[#0B2239] border border-[#1D4E73] rounded-md p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 shadow-md"
      >
        <div className="w-14 h-14 rounded-full bg-[#071A2D] border border-[#1D4E73] flex items-center justify-center text-[#008000]">
          <span className="material-symbols-outlined text-[32px]">verified</span>
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight">
          No Warnings Match Current Filter Criteria
        </h3>

        <p className="text-xs sm:text-sm text-[#B8C7D9] max-w-md">
          No active severe meteorological warnings found for the selected state, region, or hazard parameters. Atmospheric conditions are stable in this sector.
        </p>

        <button
          id="btn-empty-reset-filters"
          type="button"
          onClick={onResetFilters}
          className="mt-2 px-4 py-2 rounded bg-[#1565C0] hover:bg-[#0B3D91] text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
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
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
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
