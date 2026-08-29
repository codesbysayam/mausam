import React, { useState, useEffect } from 'react';
import { HazardCategory } from '../../types/warningTypes';
import { SAFETY_GUIDANCE_DATABASE } from '../../data/nationalWarningsData';

interface SafetyGuidanceSectionProps {
  activeHazardFilter?: HazardCategory | 'all';
}

export const SafetyGuidanceSection: React.FC<SafetyGuidanceSectionProps> = ({
  activeHazardFilter = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<HazardCategory>('heavy_rain');

  // If user picks a specific hazard in the filter, automatically switch the safety guidance tab to match!
  useEffect(() => {
    if (activeHazardFilter !== 'all') {
      const match = SAFETY_GUIDANCE_DATABASE.find((g) => g.hazard === activeHazardFilter);
      if (match) {
        setSelectedCategory(match.hazard);
      }
    }
  }, [activeHazardFilter]);

  const activeGuidance =
    SAFETY_GUIDANCE_DATABASE.find((g) => g.hazard === selectedCategory) ||
    SAFETY_GUIDANCE_DATABASE[0];

  return (
    <section
      id="safety-guidance-protocols-section"
      aria-label="Public Safety Guidance & Protocols"
      className="bg-[#1E2733] border border-[#314255] rounded-md p-4 sm:p-6 shadow-md flex flex-col gap-4"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#314255] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#151D26] border border-[#314255] flex items-center justify-center text-[#2ECC71]">
            <span className="material-symbols-outlined text-[20px]">
              health_and_safety
            </span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Safety Guidance &amp; Standard Operating Procedures
            </h3>
            <p className="text-[11px] text-[#8A94A6]">
              Actionable survival and preparedness guidelines by National Disaster Management Authority (NDMA)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider bg-[#151D26] px-2.5 py-1 rounded border border-[#314255] self-start sm:self-auto">
          NDMA Citizen Protocol
        </span>
      </div>

      {/* Hazard Selector Tabs */}
      <div
        role="tablist"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#314255]"
      >
        {SAFETY_GUIDANCE_DATABASE.map((cat) => {
          const isSelected = selectedCategory === cat.hazard;
          return (
            <button
              key={cat.hazard}
              id={`tab-safety-${cat.hazard}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedCategory(cat.hazard)}
              className={`px-3 py-1.5 rounded text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#0B72B9] text-white border-[#4FA8E0] shadow-sm'
                  : 'bg-[#151D26] text-[#DCE3EB] hover:bg-[#2A3749] border-[#314255]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {cat.icon}
              </span>
              <span>{cat.title.split('&')[0].trim()}</span>
            </button>
          );
        })}
      </div>

      {/* Active Guidance Summary & Content Grid */}
      <div className="bg-[#151D26] border border-[#314255] rounded-md p-4 space-y-4">
        {/* Title & Summary */}
        <div className="pb-3 border-b border-[#314255]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#4FA8E0]">
              {activeGuidance.icon}
            </span>
            <h4 className="text-base font-bold text-white">
              {activeGuidance.title} — Public Precautions
            </h4>
          </div>
          <span className="text-xs text-[#8A94A6]">{activeGuidance.summary}</span>
        </div>

        {/* 2-Column Grid: DOs vs DONTs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DOs Card */}
          <div className="bg-[#1E2733] border border-[#2ECC71]/40 rounded-md p-3.5 space-y-2">
            <div className="text-xs font-bold text-[#2ECC71] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                check_circle
              </span>
              <span>Things You MUST DO</span>
            </div>

            <ul className="space-y-2 text-xs text-[#DCE3EB]">
              {activeGuidance.dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#2ECC71] font-bold mt-0.5">✓</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DONTs Card */}
          <div className="bg-[#1E2733] border border-[#E74C3C]/40 rounded-md p-3.5 space-y-2">
            <div className="text-xs font-bold text-[#FF7675] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                cancel
              </span>
              <span>Things You MUST NOT DO</span>
            </div>

            <ul className="space-y-2 text-xs text-[#DCE3EB]">
              {activeGuidance.donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#FF7675] font-bold mt-0.5">✕</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Kit Checklist Row */}
        {activeGuidance.emergencyKitList && activeGuidance.emergencyKitList.length > 0 && (
          <div className="pt-3 border-t border-[#314255]/80">
            <div className="text-xs font-bold text-[#FFB703] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                medical_services
              </span>
              <span>Recommended Emergency Kit Essentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {activeGuidance.emergencyKitList.map((kitItem, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E2733] border border-[#314255] rounded px-2.5 py-1.5 text-[11px] text-[#DCE3EB] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px] text-[#4FA8E0]">
                    backpack
                  </span>
                  <span className="truncate">{kitItem}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
