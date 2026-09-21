// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Forecast Answer Card Component
// ====================================================================

import React from 'react';
import { ForecastContext } from '../../types/askMausam';

interface ForecastAnswerProps {
  forecast?: ForecastContext;
  locationName: string;
}

export const ForecastAnswer: React.FC<ForecastAnswerProps> = ({ forecast, locationName }) => {
  if (!forecast || !forecast.daily || forecast.daily.length === 0) return null;

  return (
    <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl bg-[#0C1523] border border-[#1F2C3F] flex flex-col gap-3 text-[#D7DEE8]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1A2638]">
        <div>
          <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">
            7-Day Synoptic Outlook
          </span>
          <h3 className="text-sm font-semibold text-white mt-0.5">{locationName}</h3>
        </div>
      </div>

      {/* Daily Outlook Strip */}
      <div className="flex flex-col gap-1.5">
        {forecast.daily.slice(0, 5).map((d) => (
          <div
            key={d.date}
            className="p-2 sm:p-2.5 rounded-lg bg-[#121D2C] border border-[#1A2638] flex items-center justify-between gap-2 text-xs"
          >
            <div className="w-20 shrink-0">
              <span className="font-semibold text-white">{d.dayName}</span>
              <span className="block text-[10px] text-[#94A3B8]">{d.date.slice(5)}</span>
            </div>

            <div className="flex-1 truncate">
              <span className="text-white font-medium truncate block">{d.condition}</span>
              {d.precipitationProbability > 0 && (
                <span className="text-[10px] text-[#38BDF8] font-mono">
                  {d.precipitationProbability}% rain ({d.precipitationMm} mm)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 font-mono text-right shrink-0">
              <span className="font-bold text-white">{d.maxTempC}°</span>
              <span className="text-[#64748B]">/</span>
              <span className="text-[#94A3B8]">{d.minTempC}°C</span>
            </div>
          </div>
        ))}
      </div>

      {forecast.synopsis && (
        <p className="text-xs text-[#94A3B8] bg-[#121D2C] p-2.5 rounded-lg border border-[#1A2638] leading-relaxed">
          {forecast.synopsis}
        </p>
      )}
    </div>
  );
};
