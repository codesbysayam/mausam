import React, { useMemo } from 'react';
import { HourlyForecastItem } from '../../types';
import { normalizeHourlyForecast, getBeaufortCategory } from '../../services/forecastNormalizer';
import { Wind, Navigation, Compass, Gauge, AlertTriangle } from 'lucide-react';

interface WindIntelligenceCardProps {
  hourly: HourlyForecastItem[];
}

export const WindIntelligenceCard: React.FC<WindIntelligenceCardProps> = ({ hourly }) => {
  const normalized = useMemo(() => normalizeHourlyForecast(hourly), [hourly]);
  const current = normalized[0] || {
    validWindSpeed: 14,
    validWindDirection: 'NE',
    windDegree: 45,
    gustSpeed: 22,
  };

  const beaufort = getBeaufortCategory(current.validWindSpeed);

  return (
    <div
      id="wind-intelligence-card"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col justify-between gap-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#314255]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#2ECC71]/20 border border-[#2ECC71]/40 flex items-center justify-center text-[#2ECC71]">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight">
              Wind &amp; Dynamic Vector
            </h3>
            <p className="text-[11px] text-[#8A94A6]">Surface Anemometry &amp; Beaufort Classification</p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40 font-mono">
          FORCE {beaufort.force}
        </span>
      </div>

      {/* Main Grid: Compass + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        {/* Animated Rotating Compass Graphic */}
        <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255] flex items-center justify-center gap-3">
          <div className="relative w-20 h-20 rounded-full border-2 border-[#314255] bg-[#1E2733] flex items-center justify-center shadow-inner">
            {/* Cardinal markers */}
            <span className="absolute top-1 text-[8px] font-black text-[#FF8C42]">N</span>
            <span className="absolute right-1 text-[8px] font-black text-[#8A94A6]">E</span>
            <span className="absolute bottom-1 text-[8px] font-black text-[#8A94A6]">S</span>
            <span className="absolute left-1 text-[8px] font-black text-[#8A94A6]">W</span>

            {/* Rotating Arrow Indicator based on exact wind degrees */}
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-700"
              style={{ transform: `rotate(${current.windDegree}deg)` }}
            >
              <Navigation className="w-8 h-8 text-[#2ECC71] fill-[#2ECC71]" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-[#8A94A6] uppercase font-bold">Direction</span>
            <span className="text-xl font-black font-mono text-white">
              {current.validWindDirection}
            </span>
            <span className="text-[11px] text-[#2ECC71] font-mono font-semibold">
              {current.windDegree}° Azimuth
            </span>
          </div>
        </div>

        {/* Speed & Gusts */}
        <div className="flex flex-col gap-2">
          <div className="bg-[#151D26] p-2.5 rounded-lg border border-[#314255] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Sustained Speed</span>
              <span className="text-xl font-black font-mono text-white">
                {current.validWindSpeed} <span className="text-xs font-normal text-[#8A94A6]">km/h</span>
              </span>
            </div>
            <span className="text-[10px] text-[#2ECC71] font-mono">
              {(current.validWindSpeed / 3.6).toFixed(1)} m/s
            </span>
          </div>

          <div className="bg-[#151D26] p-2.5 rounded-lg border border-[#314255] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Peak Gusts</span>
              <span className="text-xl font-black font-mono text-[#FF8C42]">
                {current.gustSpeed} <span className="text-xs font-normal text-[#8A94A6]">km/h</span>
              </span>
            </div>
            <span className="text-[10px] text-[#FF8C42] font-mono">
              +{(current.gustSpeed - current.validWindSpeed)}k surge
            </span>
          </div>
        </div>
      </div>

      {/* Beaufort Classification Bar */}
      <div className="bg-[#151D26] p-2.5 rounded-lg border border-[#314255] text-xs text-[#8A94A6] flex items-center justify-between">
        <span>Beaufort State: <strong className="text-white font-medium">{beaufort.description}</strong></span>
        <span className="text-[10px] text-[#8A94A6] font-mono">10m MSL Standard</span>
      </div>
    </div>
  );
};
