import React, { useState, useMemo } from 'react';
import { DailyForecastItem } from '../../types';
import { NormalizedDailyItem, normalizeDailyForecast } from '../../services/forecastNormalizer';
import { WeatherConditionIcon } from './WeatherConditionIcon';
import {
  Calendar,
  LayoutGrid,
  Table as TableIcon,
  CloudRain,
  Wind,
  Droplets,
  Sun,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ForecastSevenDaySectionProps {
  daily: DailyForecastItem[];
  modelName: string;
}

export const ForecastSevenDaySection: React.FC<ForecastSevenDaySectionProps> = ({
  daily,
  modelName,
}) => {
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [expandedDayIdx, setExpandedDayIdx] = useState<number | null>(null);

  const normalizedDaily = useMemo(() => normalizeDailyForecast(daily), [daily]);

  return (
    <div
      id="forecast-7day-section"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col gap-4"
    >
      {/* Section Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#314255]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#2ECC71]/20 border border-[#2ECC71]/40 flex items-center justify-center text-[#2ECC71]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              7-Day Medium-Range Outlook
            </h2>
            <p className="text-xs text-[#8A94A6]">
              Synoptic multi-day trajectories simulated via <strong className="text-[#D7DEE8]">{modelName}</strong>
            </p>
          </div>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1 bg-[#151D26] p-1 rounded-lg border border-[#314255] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('compact')}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
              viewMode === 'compact'
                ? 'bg-[#0B72B9] text-white shadow-sm font-bold'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Compact Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
              viewMode === 'detailed'
                ? 'bg-[#0B72B9] text-white shadow-sm font-bold'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Detailed Table</span>
          </button>
        </div>
      </div>

      {/* COMPACT CARDS VIEW */}
      {viewMode === 'compact' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {normalizedDaily.map((item, idx) => {
            const isToday = idx === 0 || item.day.toLowerCase().includes('today');
            const isExpanded = expandedDayIdx === idx;

            return (
              <div
                key={idx}
                className={`rounded-lg border p-3.5 flex flex-col justify-between transition-all ${
                  isToday
                    ? 'bg-[#151D26] border-[#4FA8E0] shadow-md shadow-[#0B72B9]/15 ring-1 ring-[#4FA8E0]/40'
                    : 'bg-[#151D26] border-[#314255] hover:border-[#4FA8E0]/50'
                }`}
              >
                {/* Day & Date */}
                <div className="flex items-center justify-between border-b border-[#314255]/70 pb-2">
                  <div>
                    <span className="text-xs font-black text-white uppercase block">
                      {item.day}
                    </span>
                    <span className="text-[10px] text-[#8A94A6] font-mono">{item.date}</span>
                  </div>
                  {isToday && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#0B72B9]/20 text-[#4FA8E0] border border-[#0B72B9]/40">
                      TODAY
                    </span>
                  )}
                </div>

                {/* Weather Icon & Condition */}
                <div className="my-3 flex flex-col items-center text-center gap-1.5">
                  <WeatherConditionIcon condition={item.condition} className="w-8 h-8" />
                  <span className="text-xs font-medium text-[#D7DEE8] line-clamp-1">
                    {item.condition}
                  </span>
                </div>

                {/* Max & Min Temperature */}
                <div className="bg-[#1E2733] p-2 rounded border border-[#314255] flex items-center justify-around mb-2.5">
                  <div className="text-center">
                    <span className="text-[9px] uppercase font-bold text-[#8A94A6] block">High</span>
                    <span className="text-base font-black font-mono text-[#FF8C42]">
                      {item.validHigh}°
                    </span>
                  </div>
                  <div className="h-6 w-px bg-[#314255]" />
                  <div className="text-center">
                    <span className="text-[9px] uppercase font-bold text-[#8A94A6] block">Low</span>
                    <span className="text-base font-black font-mono text-[#4FA8E0]">
                      {item.validLow}°
                    </span>
                  </div>
                </div>

                {/* Rain & Wind Key Stats */}
                <div className="space-y-1.5 text-[11px] text-[#8A94A6] pt-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5 text-[#4FA8E0]" />
                      <span>Rain:</span>
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        item.validRainProb > 40 ? 'text-[#4FA8E0]' : 'text-[#8A94A6]'
                      }`}
                    >
                      {item.validRainProb}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-[#2ECC71]" />
                      <span>Wind:</span>
                    </span>
                    <span className="font-mono text-[#D7DEE8]">
                      {item.validWindSpeed}k {item.validWindDirection}
                    </span>
                  </div>
                </div>

                {/* Expand Toggle */}
                <button
                  type="button"
                  onClick={() => setExpandedDayIdx(isExpanded ? null : idx)}
                  className="mt-2.5 pt-2 border-t border-[#314255]/70 text-[10px] text-[#4FA8E0] hover:underline flex items-center justify-center gap-1 w-full font-semibold"
                >
                  <span>{isExpanded ? 'Less Info' : 'More Specs'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {/* Expanded Micro-details */}
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-[#314255] space-y-1 text-[10px] text-[#8A94A6] animate-fade-in">
                    <div className="flex justify-between">
                      <span>RH Humidity:</span>
                      <strong className="text-[#D7DEE8] font-mono">{item.validHumidity}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>QPF Precip:</span>
                      <strong className="text-[#4FA8E0] font-mono">{item.validPrecipMm} mm</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>UV Radiation:</span>
                      <strong className="text-[#F1C40F] font-mono">{item.validUv}</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED TABLE VIEW */}
      {viewMode === 'detailed' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#151D26] border-b border-[#314255] text-[#8A94A6]">
                <th className="p-3 font-bold">Date &amp; Day</th>
                <th className="p-3 font-bold">Weather Condition</th>
                <th className="p-3 font-bold text-[#FF8C42]">Max Temp</th>
                <th className="p-3 font-bold text-[#4FA8E0]">Min Temp</th>
                <th className="p-3 font-bold text-[#4FA8E0]">Rain Prob</th>
                <th className="p-3 font-bold">Precip (QPF)</th>
                <th className="p-3 font-bold">Relative Humidity</th>
                <th className="p-3 font-bold">Wind &amp; Dir</th>
                <th className="p-3 font-bold text-[#F1C40F]">Solar UV</th>
                <th className="p-3 font-bold">Meteorological Outlook</th>
              </tr>
            </thead>
            <tbody>
              {normalizedDaily.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#314255]/50 hover:bg-[#151D26] transition-colors"
                >
                  <td className="p-3 font-medium text-white">
                    <div className="font-bold">{item.day}</div>
                    <div className="text-[10px] text-[#8A94A6] font-mono">{item.date}</div>
                  </td>
                  <td className="p-3 text-[#D7DEE8]">
                    <div className="flex items-center gap-2">
                      <WeatherConditionIcon condition={item.condition} className="w-4 h-4 shrink-0" />
                      <span>{item.condition}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">
                    {item.validHigh}°C
                  </td>
                  <td className="p-3 font-mono font-bold text-[#8A94A6]">
                    {item.validLow}°C
                  </td>
                  <td className="p-3 font-mono font-bold text-[#4FA8E0]">
                    {item.validRainProb}%
                  </td>
                  <td className="p-3 font-mono text-[#D7DEE8]">
                    {item.validPrecipMm} mm
                  </td>
                  <td className="p-3 font-mono text-[#D7DEE8]">
                    {item.validHumidity}% RH
                  </td>
                  <td className="p-3 font-mono text-[#D7DEE8]">
                    {item.validWindSpeed} km/h {item.validWindDirection}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#F1C40F]">
                    {item.validUv}
                  </td>
                  <td className="p-3 text-[#8A94A6] text-[11px]">
                    {item.validRainProb > 60
                      ? 'Convective thunderstorm and shower regime'
                      : item.validRainProb > 30
                      ? 'Partly cloudy with isolated light precipitation'
                      : 'Predominantly dry with clear synoptic visibility'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
