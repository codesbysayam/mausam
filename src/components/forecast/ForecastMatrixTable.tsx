import React, { useState, useMemo } from 'react';
import { HourlyForecastItem } from '../../types';
import { NormalizedHourlyItem, normalizeHourlyForecast } from '../../services/forecastNormalizer';
import { WeatherConditionIcon } from './WeatherConditionIcon';
import {
  Table as TableIcon,
  Download,
  CloudRain,
  Wind,
  Droplets,
  Cloud,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ForecastMatrixTableProps {
  hourly: HourlyForecastItem[];
  modelType: string;
  modelName: string;
  cityName: string;
  onExportCSV: () => void;
}

export const ForecastMatrixTable: React.FC<ForecastMatrixTableProps> = ({
  hourly,
  modelType,
  modelName,
  cityName,
  onExportCSV,
}) => {
  const [expandedRowIdx, setExpandedRowIdx] = useState<number | null>(null);
  const normalizedItems = useMemo(() => normalizeHourlyForecast(hourly), [hourly]);

  return (
    <div
      id="forecast-synoptic-matrix-card"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col gap-4"
    >
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#314255]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#4FA8E0]/20 border border-[#4FA8E0]/40 flex items-center justify-center text-[#4FA8E0]">
            <TableIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              24-Hour Synoptic Time-Series Matrix ({modelType})
            </h2>
            <p className="text-xs text-[#8A94A6]">
              Point-wise meteorological parameter projections simulated via <strong className="text-[#D7DEE8]">{modelName}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExportCSV}
          className="px-3 py-1.5 bg-[#151D26] hover:bg-[#314255] text-[#4FA8E0] hover:text-white rounded-md border border-[#314255] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
          title="Export displayed dataset to CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Matrix (CSV)</span>
        </button>
      </div>

      {/* Desktop View: Full Table with Sticky Header */}
      <div className="hidden md:block overflow-x-auto max-h-[460px] scrollbar-thin">
        <table className="w-full text-xs text-left border-collapse min-w-[720px]">
          <thead className="sticky top-0 z-10 bg-[#151D26] border-b border-[#314255] text-[#8A94A6] shadow-sm">
            <tr>
              <th className="p-3 font-bold">Time (IST)</th>
              <th className="p-3 font-bold text-[#FF8C42]">Temp (°C)</th>
              <th className="p-3 font-bold">Weather Condition</th>
              <th className="p-3 font-bold text-[#4FA8E0]">Precip Prob</th>
              <th className="p-3 font-bold">QPF (mm)</th>
              <th className="p-3 font-bold text-[#2ECC71]">Wind Speed &amp; Dir</th>
              <th className="p-3 font-bold text-[#1ABC9C]">Humidity</th>
              <th className="p-3 font-bold">Cloud Cover</th>
              <th className="p-3 font-bold">Visibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#314255]/50">
            {normalizedItems.map((item, idx) => (
              <tr
                key={idx}
                className={`hover:bg-[#151D26] transition-colors ${
                  item.isNow ? 'bg-[#0B72B9]/10 font-medium' : ''
                }`}
              >
                <td className="p-3 font-mono font-bold text-white whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span>{item.time}</span>
                    {item.isNow && (
                      <span className="text-[9px] bg-[#0B72B9]/30 text-[#4FA8E0] px-1 rounded font-bold">
                        NOW
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 font-mono font-bold text-white">
                  {item.validTemp}°C
                </td>
                <td className="p-3 text-[#D7DEE8]">
                  <div className="flex items-center gap-2">
                    <WeatherConditionIcon condition={item.condition} className="w-4 h-4 shrink-0" />
                    <span className="line-clamp-1">{item.condition}</span>
                  </div>
                </td>
                <td className="p-3 font-mono font-bold text-[#4FA8E0]">
                  {item.validRainProb}%
                </td>
                <td className="p-3 font-mono text-[#D7DEE8]">
                  {item.validPrecipMm} mm
                </td>
                <td className="p-3 font-mono text-[#D7DEE8]">
                  {item.validWindSpeed} km/h {item.validWindDirection}
                </td>
                <td className="p-3 font-mono text-[#1ABC9C]">
                  {item.validHumidity}% RH
                </td>
                <td className="p-3 font-mono text-[#8A94A6]">
                  {item.validCloudCover}%
                </td>
                <td className="p-3 font-mono text-[#8A94A6]">
                  {item.visibilityKm} km
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Responsive Expandable Cards */}
      <div className="md:hidden flex flex-col gap-2.5">
        {normalizedItems.map((item, idx) => {
          const isExpanded = expandedRowIdx === idx;
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex flex-col gap-2 transition-all ${
                item.isNow
                  ? 'bg-[#151D26] border-[#4FA8E0]'
                  : 'bg-[#151D26] border-[#314255]'
              }`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedRowIdx(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold font-mono text-white">
                    {item.time} IST
                  </span>
                  <WeatherConditionIcon condition={item.condition} className="w-4 h-4" />
                  <span className="text-xs text-[#D7DEE8] line-clamp-1">
                    {item.condition}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-white">
                    {item.validTemp}°C
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#8A94A6]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#8A94A6]" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="pt-2 border-t border-[#314255] grid grid-cols-2 gap-2 text-[11px] text-[#8A94A6] animate-fade-in">
                  <div>
                    <span>Rain Prob:</span> <strong className="text-[#4FA8E0] font-mono">{item.validRainProb}%</strong>
                  </div>
                  <div>
                    <span>Precip QPF:</span> <strong className="text-white font-mono">{item.validPrecipMm} mm</strong>
                  </div>
                  <div>
                    <span>Wind:</span> <strong className="text-[#2ECC71] font-mono">{item.validWindSpeed}k {item.validWindDirection}</strong>
                  </div>
                  <div>
                    <span>Humidity:</span> <strong className="text-[#1ABC9C] font-mono">{item.validHumidity}% RH</strong>
                  </div>
                  <div>
                    <span>Cloud Cover:</span> <strong className="text-white font-mono">{item.validCloudCover}%</strong>
                  </div>
                  <div>
                    <span>Visibility:</span> <strong className="text-white font-mono">{item.visibilityKm} km</strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
