// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Multi-Location Weather Comparison Component
// ====================================================================

import React from 'react';
import { LocationWeatherComparison } from '../../types/askMausam';

interface ComparisonAnswerProps {
  comparison?: LocationWeatherComparison;
}

export const ComparisonAnswer: React.FC<ComparisonAnswerProps> = ({ comparison }) => {
  if (!comparison) return null;

  const { locationA, locationB, summary, winnerLabel } = comparison;

  return (
    <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl bg-[#0C1523] border border-[#1F2C3F] flex flex-col gap-3 text-[#D7DEE8]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1A2638]">
        <div>
          <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">
            Comparative Meteorological Analysis
          </span>
          <h3 className="text-sm font-semibold text-white mt-0.5">
            {locationA.name} vs {locationB.name}
          </h3>
        </div>
        {winnerLabel && (
          <span className="px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] text-xs font-semibold border border-[#38BDF8]/30">
            {winnerLabel}
          </span>
        )}
      </div>

      {/* Side-by-side Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Location A */}
        <div className="p-3 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col gap-1.5">
          <span className="font-bold text-white truncate">{locationA.name}</span>
          <span className="text-2xl font-extrabold text-[#38BDF8] font-mono">
            {locationA.temperatureC}°C
          </span>
          <span className="text-[11px] text-[#94A3B8]">{locationA.condition}</span>
          {locationA.aqi !== undefined && (
            <span className="text-[10px] text-[#64748B] mt-1">AQI: {locationA.aqi}</span>
          )}
        </div>

        {/* Location B */}
        <div className="p-3 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col gap-1.5">
          <span className="font-bold text-white truncate">{locationB.name}</span>
          <span className="text-2xl font-extrabold text-[#38BDF8] font-mono">
            {locationB.temperatureC}°C
          </span>
          <span className="text-[11px] text-[#94A3B8]">{locationB.condition}</span>
          {locationB.aqi !== undefined && (
            <span className="text-[10px] text-[#64748B] mt-1">AQI: {locationB.aqi}</span>
          )}
        </div>
      </div>

      {/* Summary Narrative */}
      {summary && (
        <p className="text-xs text-[#CBD5E1] bg-[#121D2C] p-2.5 rounded-lg border border-[#1A2638] leading-relaxed">
          {summary}
        </p>
      )}

      <div className="text-[10px] text-[#64748B] pt-1 border-t border-[#1A2638]">
        Telemetry synchronized from real-time surface radar & synoptic station models.
      </div>
    </div>
  );
};
