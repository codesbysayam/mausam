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
      className="bg-[#0B263D] border border-[#1D5278] rounded-md p-4 sm:p-5 shadow-sm flex flex-col gap-3.5"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1D5278] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#081F33] border border-[#1D5278] flex items-center justify-center text-[#00E676]">
            <span className="material-symbols-outlined text-[20px]">
              health_and_safety
            </span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Safety Guidance &amp; Standard Operating Procedures
            </h3>
            <p className="text-[11px] text-[#AFC4D8]">
              Citizen Preparedness Protocols by National Disaster Management Authority (NDMA)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#AFC4D8] uppercase tracking-wider bg-[#081F33] px-2.5 py-1 rounded border border-[#1D5278] self-start sm:self-auto">
          NDMA Protocol
        </span>
      </div>

      {/* Hazard Selector Tabs */}
      <div
        role="tablist"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#1D5278]"
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
              className={`px-3 py-1.5 rounded text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-[#1565C0] text-white border-[#E3F2FD] shadow-xs'
                  : 'bg-[#081F33] text-[#AFC4D8] hover:text-white hover:bg-[#102D47] border-[#1D5278]'
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
      <div className="bg-[#081F33] border border-[#1D5278] rounded p-4 space-y-4">
        {/* Title & Summary */}
        <div className="pb-3 border-b border-[#1D5278] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#4FA8E0]">
              {activeGuidance.icon}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white">
              {activeGuidance.title}
            </h4>
          </div>
          <span className="text-xs text-[#AFC4D8]">{activeGuidance.summary}</span>
        </div>

        {/* 2-Column Grid: DOs vs DONTs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DOs Card */}
          <div className="bg-[#0B263D] border border-[#008000]/60 rounded p-3.5 space-y-2">
            <div className="text-xs font-bold text-[#00E676] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Mandatory Actions (DOs)</span>
            </div>

            <ul className="space-y-2 text-xs text-[#F5F9FC]">
              {activeGuidance.dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#00E676] font-bold mt-0.5">✓</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DONTs Card */}
          <div className="bg-[#0B263D] border border-[#FF0000]/60 rounded p-3.5 space-y-2">
            <div className="text-xs font-bold text-[#FF4D4D] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              <span>Prohibited Actions (DONTs)</span>
            </div>

            <ul className="space-y-2 text-xs text-[#F5F9FC]">
              {activeGuidance.donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#FF4D4D] font-bold mt-0.5">✕</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Kit Checklist Row */}
        {activeGuidance.emergencyKitList && activeGuidance.emergencyKitList.length > 0 && (
          <div className="pt-3 border-t border-[#1D5278]">
            <div className="text-xs font-bold text-[#FFFF00] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">medical_services</span>
              <span>Essential Emergency Kit Checklist</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {activeGuidance.emergencyKitList.map((kitItem, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B263D] border border-[#1D5278] rounded px-2.5 py-1.5 text-[11px] text-[#AFC4D8] flex items-center gap-1.5"
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
