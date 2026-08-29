import React, { useState } from 'react';

export const NationalClassificationMatrix: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      id="national-classification-matrix-section"
      aria-label="IMD National Early Warning Alert Matrix"
      className="bg-[#1E2733] border border-[#314255] rounded-md p-4 sm:p-5 shadow-md flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#151D26] border border-[#314255] flex items-center justify-center text-[#4FA8E0]">
            <span className="material-symbols-outlined text-[18px]">
              table_chart
            </span>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight">
              IMD 4-Stage Meteorological Warning Matrix &amp; Operational Thresholds
            </h4>
            <p className="text-[10px] text-[#8A94A6]">
              Standardized classification protocol published by the India Meteorological Department
            </p>
          </div>
        </div>

        <button
          id="btn-toggle-matrix-details"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="px-2.5 py-1 rounded bg-[#151D26] hover:bg-[#2A3749] text-[#4FA8E0] hover:text-white border border-[#314255] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
        >
          <span>{isOpen ? 'Collapse Protocol' : 'Expand Matrix'}</span>
          <span className="material-symbols-outlined text-[15px]">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="pt-3 border-t border-[#314255] space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Red Alert */}
            <div className="bg-[#151D26] border-l-4 border-l-[#E74C3C] border-t border-r border-b border-[#314255] rounded p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#FF7675] uppercase tracking-wider">
                  Red (Take Action)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E74C3C]" />
              </div>
              <div className="text-[11px] text-white font-semibold">
                Extremely Severe Weather
              </div>
              <p className="text-[11px] text-[#8A94A6] leading-relaxed">
                Extremely Heavy Rain (&gt; 204.4 mm / 24h), Super/Very Severe Cyclonic Storm (&gt; 90 km/h gusts), or Severe Heat Wave (&gt; 45°C + 6.5°C departure).
              </p>
            </div>

            {/* Orange Alert */}
            <div className="bg-[#151D26] border-l-4 border-l-[#FF8C42] border-t border-r border-b border-[#314255] rounded p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#FF8C42] uppercase tracking-wider">
                  Orange (Be Prepared)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C42]" />
              </div>
              <div className="text-[11px] text-white font-semibold">
                Very Heavy Weather
              </div>
              <p className="text-[11px] text-[#8A94A6] leading-relaxed">
                Very Heavy Rain (115.6 to 204.4 mm / 24h), Squally Wind (50 to 70 km/h), Severe Thunderstorm with squall / hail, or Heat Wave conditions.
              </p>
            </div>

            {/* Yellow Watch */}
            <div className="bg-[#151D26] border-l-4 border-l-[#F1C40F] border-t border-r border-b border-[#314255] rounded p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F1C40F] uppercase tracking-wider">
                  Yellow (Be Updated)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#F1C40F]" />
              </div>
              <div className="text-[11px] text-white font-semibold">
                Weather Watch
              </div>
              <p className="text-[11px] text-[#8A94A6] leading-relaxed">
                Heavy Rain (64.5 to 115.5 mm / 24h), isolated thunderstorm / lightning activity, Dense Fog (visibility 50-200m), or thermal variations.
              </p>
            </div>

            {/* Green Code */}
            <div className="bg-[#151D26] border-l-4 border-l-[#2ECC71] border-t border-r border-b border-[#314255] rounded p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2ECC71] uppercase tracking-wider">
                  Green (No Warning)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" />
              </div>
              <div className="text-[11px] text-white font-semibold">
                Normal Weather
              </div>
              <p className="text-[11px] text-[#8A94A6] leading-relaxed">
                No adverse synoptic conditions. Light to moderate rainfall (&lt; 64.4 mm / 24h), seasonal temperatures within standard climatological norms.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
