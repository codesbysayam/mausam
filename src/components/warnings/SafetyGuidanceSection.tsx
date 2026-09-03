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
      className="bg-[#0B2239] border border-[#1D4E73] rounded-md p-4 sm:p-6 shadow-md flex flex-col gap-4"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1D4E73] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#071A2D] border border-[#1D4E73] flex items-center justify-center text-[#008000]">
            <span className="material-symbols-outlined text-[20px]">
              health_and_safety
            </span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Safety Guidance &amp; Standard Operating Procedures
            </h3>
            <p className="text-[11px] text-[#B8C7D9]">
              Actionable survival and preparedness guidelines by National Disaster Management Authority (NDMA)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#B8C7D9] uppercase tracking-wider bg-[#071A2D] px-2.5 py-1 rounded border border-[#1D4E73] self-start sm:self-auto">
          NDMA Citizen Protocol
        </span>
      </div>

      {/* Hazard Selector Tabs */}
      <div
        role="tablist"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#1D4E73]"
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
                  ? 'bg-[#1565C0] text-white border-[#E3F2FD] shadow-sm'
                  : 'bg-[#071A2D] text-[#D7DEE8] hover:bg-[#102D47] border-[#1D4E73]'
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
      <div className="bg-[#071A2D] border border-[#1D4E73] rounded-md p-4 space-y-4">
        {/* Title & Summary */}
        <div className="pb-3 border-b border-[#1D4E73]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#E3F2FD]">
              {activeGuidance.icon}
            </span>
            <h4 className="text-base font-bold text-white">
              {activeGuidance.title} — Public Precautions
            </h4>
          </div>
          <span className="text-xs text-[#B8C7D9]">{activeGuidance.summary}</span>
        </div>

        {/* 2-Column Grid: DOs vs DONTs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DOs Card */}
          <div className="bg-[#0B2239] border border-[#008000]/40 rounded-md p-3.5 space-y-2">
            <div className="text-xs font-bold text-[#008000] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                check_circle
              </span>
              <span>Things You MUST DO</span>
            </div>

            <ul className="space-y-2 text-xs text-[#D7DEE8]">
              {activeGuidance.dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#008000] font-bold mt-0.5">✓</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DONTs Card */}
          <div className="bg-[#0B2239] border border-[#FF0000]/40 rounded-md p-3.5 space-y-2">
            <div className="text-xs font-bold text-[#FF0000] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                cancel
              </span>
              <span>Things You MUST NOT DO</span>
            </div>

            <ul className="space-y-2 text-xs text-[#D7DEE8]">
              {activeGuidance.donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#FF0000] font-bold mt-0.5">✕</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Kit Checklist Row */}
        {activeGuidance.emergencyKitList && activeGuidance.emergencyKitList.length > 0 && (
          <div className="pt-3 border-t border-[#1D4E73]/80">
            <div className="text-xs font-bold text-[#FFFF00] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                medical_services
              </span>
              <span>Recommended Emergency Kit Essentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {activeGuidance.emergencyKitList.map((kitItem, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B2239] border border-[#1D4E73] rounded px-2.5 py-1.5 text-[11px] text-[#D7DEE8] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px] text-[#E3F2FD]">
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
