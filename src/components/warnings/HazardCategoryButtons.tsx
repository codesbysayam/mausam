import React from 'react';
import { HazardCategory, WarningRecord } from '../../types/warningTypes';
import { HAZARD_DEFINITIONS } from '../../data/nationalWarningsData';

interface HazardCategoryButtonsProps {
  selectedHazard: HazardCategory | 'all';
  onSelectHazard: (hazard: HazardCategory | 'all') => void;
  warnings: WarningRecord[];
}

export const HazardCategoryButtons: React.FC<HazardCategoryButtonsProps> = ({
  selectedHazard,
  onSelectHazard,
  warnings,
}) => {
  // Compute count of warnings per hazard category
  const hazardCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    warnings.forEach((w) => {
      counts[w.hazardCategory] = (counts[w.hazardCategory] || 0) + 1;
    });
    return counts;
  }, [warnings]);

  return (
    <div
      id="hazard-category-filter-chips"
      role="tablist"
      aria-label="Filter warnings by hazard type"
      className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-[#314255]"
    >
      {/* "All Hazards" Button */}
      <button
        id="btn-hazard-all"
        type="button"
        role="tab"
        aria-selected={selectedHazard === 'all'}
        onClick={() => onSelectHazard('all')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
          selectedHazard === 'all'
            ? 'bg-[#0B72B9] text-white border-[#4FA8E0] shadow-sm'
            : 'bg-[#1E2733] text-[#DCE3EB] hover:bg-[#2A3749] border-[#314255]'
        }`}
      >
        <span className="material-symbols-outlined text-[15px]">apps</span>
        <span>All Hazards</span>
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            selectedHazard === 'all'
              ? 'bg-white/20 text-white'
              : 'bg-[#151D26] text-[#8A94A6]'
          }`}
        >
          {warnings.length}
        </span>
      </button>

      {/* Hazard Specific Chips */}
      {HAZARD_DEFINITIONS.map((hazard) => {
        const isActive = selectedHazard === hazard.id;
        const count = hazardCounts[hazard.id] || 0;

        return (
          <button
            key={hazard.id}
            id={`btn-hazard-${hazard.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectHazard(isActive ? 'all' : hazard.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
              isActive
                ? 'bg-[#0B72B9] text-white border-[#4FA8E0] shadow-sm'
                : 'bg-[#1E2733] text-[#DCE3EB] hover:bg-[#2A3749] border-[#314255]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {hazard.icon}
            </span>
            <span>{hazard.label}</span>
            {count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : count >= 2
                    ? 'bg-[#E74C3C]/30 text-[#FF7675] border border-[#E74C3C]/40'
                    : 'bg-[#151D26] text-[#8A94A6]'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
