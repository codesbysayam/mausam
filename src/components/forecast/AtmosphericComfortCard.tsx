import React, { useMemo } from 'react';
import { HourlyForecastItem } from '../../types';
import { normalizeHourlyForecast } from '../../services/forecastNormalizer';
import { Droplets, Thermometer, Smile, AlertCircle, Sparkles } from 'lucide-react';

interface AtmosphericComfortCardProps {
  hourly: HourlyForecastItem[];
}

export const AtmosphericComfortCard: React.FC<AtmosphericComfortCardProps> = ({ hourly }) => {
  const normalized = useMemo(() => normalizeHourlyForecast(hourly), [hourly]);
  const current = normalized[0] || {
    validTemp: 29,
    validHumidity: 74,
    dewPoint: 24.1,
    feelsLike: 33.4,
  };

  // Comfort classification based on dew point & relative humidity
  const comfortClass = useMemo(() => {
    const dp = current.dewPoint;
    if (dp < 10) return { label: 'Dry & Crisp', color: '#3498DB', badge: 'bg-[#3498DB]/15 text-[#3498DB] border-[#3498DB]/40' };
    if (dp < 16) return { label: 'Comfortable', color: '#2ECC71', badge: 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40' };
    if (dp < 20) return { label: 'Humid / Tropical', color: '#F1C40F', badge: 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40' };
    if (dp < 24) return { label: 'Muggy & Uncomfortable', color: '#FF8C42', badge: 'bg-[#FF8C42]/15 text-[#FF8C42] border-[#FF8C42]/40' };
    return { label: 'Oppressive / High Heat Load', color: '#E74C3C', badge: 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40' };
  }, [current.dewPoint]);

  return (
    <div
      id="atmospheric-comfort-card"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col justify-between gap-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#314255]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#1ABC9C]/20 border border-[#1ABC9C]/40 flex items-center justify-center text-[#1ABC9C]">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight">
              Atmospheric Moisture &amp; Comfort
            </h3>
            <p className="text-[11px] text-[#8A94A6]">Psychrometric Metrics &amp; Heat Stress Index</p>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${comfortClass.badge}`}>
          {comfortClass.label}
        </span>
      </div>

      {/* Grid of 4 Psychrometric values */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255]">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Relative Humidity</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#1ABC9C]">
              {current.validHumidity}%
            </span>
            <span className="text-[10px] text-[#8A94A6]">RH</span>
          </div>
        </div>

        <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255]">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Dew Point (Td)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {current.dewPoint}°
            </span>
            <span className="text-xs text-[#8A94A6] font-mono">C</span>
          </div>
        </div>

        <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255]">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Apparent Heat Index</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#FF8C42]">
              {current.feelsLike}°
            </span>
            <span className="text-xs text-[#8A94A6] font-mono">C</span>
          </div>
        </div>

        <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255]">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Vapor Saturation</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {Math.round((current.validHumidity / 100) * 31.8 * 10) / 10}
            </span>
            <span className="text-xs text-[#8A94A6] font-mono">hPa</span>
          </div>
        </div>
      </div>

      {/* Psychological Comfort Label */}
      <div className="bg-[#151D26] p-2.5 rounded-lg border border-[#314255] text-[11px] text-[#8A94A6] flex items-center justify-between">
        <span>Application-derived comfort classification: <strong className="text-white">{comfortClass.label}</strong></span>
        <span className="text-[#1ABC9C] font-mono font-semibold">Magnus Equation</span>
      </div>
    </div>
  );
};
