// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Agromet & Agricultural Advisory Answer Component
// ====================================================================

import React from 'react';
import { AgricultureContext } from '../../types/askMausam';

interface AgricultureAnswerProps {
  agriculture?: AgricultureContext;
  locationName: string;
}

export const AgricultureAnswer: React.FC<AgricultureAnswerProps> = ({ agriculture, locationName }) => {
  if (!agriculture) return null;

  const isOptimal = agriculture.spraySuitability === 'OPTIMAL';
  const isModerate = agriculture.spraySuitability === 'MODERATE';

  const badgeColor = isOptimal
    ? 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30'
    : isModerate
    ? 'text-[#EAB308] bg-[#EAB308]/15 border-[#EAB308]/30'
    : 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30';

  const badgeLabel = isOptimal
    ? 'Optimal Spray Window'
    : isModerate
    ? 'Moderate Caution Window'
    : 'Spraying Not Recommended';

  return (
    <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl bg-[#0C1523] border border-[#1F2C3F] flex flex-col gap-3 text-[#D7DEE8]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1A2638]">
        <div>
          <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
            Agromet Farming Intelligence
          </span>
          <h3 className="text-sm font-semibold text-white mt-0.5">{locationName}</h3>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeColor}`}>
          {badgeLabel}
        </span>
      </div>

      {/* Advisory Text */}
      <p className="text-xs text-[#CBD5E1] leading-relaxed bg-[#121D2C] p-2.5 rounded-lg border border-[#1A2638]">
        {agriculture.advisoryText}
      </p>

      {/* Soil & Environmental Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {agriculture.soilMoisture0To1cm !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Soil Moisture (0–1cm)</span>
            <span className="font-semibold text-white font-mono mt-0.5">
              {Math.round(agriculture.soilMoisture0To1cm * 100)}%
            </span>
          </div>
        )}
        {agriculture.soilTemperatureC !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Soil Temperature</span>
            <span className="font-semibold text-white font-mono mt-0.5">
              {agriculture.soilTemperatureC}°C
            </span>
          </div>
        )}
        {agriculture.evapotranspirationMm !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Reference ET0</span>
            <span className="font-semibold text-white font-mono mt-0.5">
              {agriculture.evapotranspirationMm} mm/day
            </span>
          </div>
        )}
      </div>

      <div className="text-[10px] text-[#64748B] pt-1.5 border-t border-[#1A2638]">
        Source: ICAR / IMD Agromet Advisory Network & Numerical Telemetry
      </div>
    </div>
  );
};
