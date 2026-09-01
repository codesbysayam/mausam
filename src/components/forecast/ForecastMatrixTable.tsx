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
  Cpu,
  Layers,
  Thermometer,
} from 'lucide-react';

interface ForecastMatrixTableProps {
  hourly: HourlyForecastItem[];
  modelType: string;
  modelName: string;
  cityName: string;
  onExportCSV: () => void;
  validFrom?: string;
  validUntil?: string;
}

export const ForecastMatrixTable: React.FC<ForecastMatrixTableProps> = ({
  hourly,
  modelType,
  modelName,
  cityName,
  onExportCSV,
  validFrom,
  validUntil,
}) => {
  const [expandedRowIdx, setExpandedRowIdx] = useState<number | null>(null);
  const normalizedItems = useMemo(() => normalizeHourlyForecast(hourly), [hourly]);

  return (
    <div
      id="forecast-synoptic-matrix-card"
      className="bg-[#0B141E] border border-[#162331] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4"
    >
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1499E8]/15 border border-[#1499E8]/30 flex items-center justify-center text-[#43C7F4]">
            <TableIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-[#F4F7FA] tracking-tight">
                24-Hour Synoptic Point Matrix ({modelType})
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1499E8]/15 text-[#43C7F4] border border-[#1499E8]/30">
                Hourly Grid Series
              </span>
            </div>
            <p className="text-xs text-[#93A4B8] mt-0.5">
              Point-wise meteorological parameter projections simulated directly via <strong className="text-[#F4F7FA]">{modelName}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExportCSV}
          className="px-3.5 py-1.5 bg-[#071018] hover:bg-[#111F30] text-[#43C7F4] hover:text-[#F4F7FA] rounded-xl border border-[#162331] text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
          title="Export displayed dataset to CSV"
        >
          <Download className="w-4 h-4" />
          <span>Export Matrix (CSV)</span>
        </button>
      </div>

      {/* Desktop View: Full Table with Sticky Header */}
      <div className="hidden md:block overflow-x-auto max-h-[460px] scrollbar-thin scrollbar-thumb-[#162331] scrollbar-track-transparent">
        <table className="w-full text-xs text-left border-collapse min-w-[760px]">
          <thead className="sticky top-0 z-10 bg-[#071018] border-b border-[#162331] text-[#93A4B8] shadow-sm">
            <tr>
              <th className="p-3 font-bold">Time (IST)</th>
              <th className="p-3 font-bold text-[#FF9F43]">Temp (°C)</th>
              <th className="p-3 font-bold text-[#93A4B8]">Feels Like</th>
              <th className="p-3 font-bold">Condition &amp; Hydrometeor</th>
              <th className="p-3 font-bold text-[#43C7F4]">Precip Prob</th>
              <th className="p-3 font-bold text-[#43C7F4]">QPF (mm)</th>
              <th className="p-3 font-bold text-[#22C7A0]">Wind Speed &amp; Dir</th>
              <th className="p-3 font-bold text-[#2ECC71]">Humidity</th>
              <th className="p-3 font-bold text-[#93A4B8]">Cloud Cover</th>
              <th className="p-3 font-bold text-[#93A4B8]">Dew Point</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#162331]">
            {normalizedItems.map((item, idx) => (
              <tr
                key={idx}
                className={`hover:bg-[#071018] transition-colors ${
                  item.isNow ? 'bg-[#1499E8]/10 font-medium' : ''
                }`}
              >
                <td className="p-3 font-mono font-bold text-[#F4F7FA] whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span>{item.time}</span>
                    {item.isNow && (
                      <span className="text-[9px] bg-[#1499E8]/30 text-[#43C7F4] px-1.5 py-0.2 rounded font-bold">
                        NOW
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 font-mono font-bold text-[#F4F7FA]">
                  {item.validTemp !== undefined ? `${item.validTemp}°C` : 'N/A'}
                </td>
                <td className="p-3 font-mono text-[#93A4B8]">
                  {item.feelsLike !== undefined ? `${item.feelsLike}°C` : 'N/A'}
                </td>
                <td className="p-3 text-[#D1DCE8]">
                  <div className="flex items-center gap-2">
                    <WeatherConditionIcon condition={item.condition} className="w-4 h-4 shrink-0" />
                    <span className="line-clamp-1">{item.condition || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-3 font-mono font-bold text-[#43C7F4]">
                  {item.validRainProb !== undefined ? `${item.validRainProb}%` : 'N/A'}
                </td>
                <td className="p-3 font-mono text-[#D1DCE8]">
                  {item.validPrecipMm !== undefined ? `${item.validPrecipMm} mm` : '0 mm'}
                </td>
                <td className="p-3 font-mono text-[#D1DCE8]">
                  {item.validWindSpeed !== undefined ? `${item.validWindSpeed} km/h ${item.validWindDirection}` : 'N/A'}
                </td>
                <td className="p-3 font-mono text-[#2ECC71]">
                  {item.validHumidity !== undefined ? `${item.validHumidity}% RH` : 'N/A'}
                </td>
                <td className="p-3 font-mono text-[#93A4B8]">
                  {item.validCloudCover !== undefined ? `${item.validCloudCover}%` : 'N/A'}
                </td>
                <td className="p-3 font-mono text-[#93A4B8]">
                  {item.dewPoint !== undefined ? `${item.dewPoint}°C` : 'N/A'}
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
              className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
                item.isNow
                  ? 'bg-[#071018] border-[#1499E8]'
                  : 'bg-[#071018] border-[#162331]'
              }`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedRowIdx(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold font-mono text-[#F4F7FA]">
                    {item.time} IST
                  </span>
                  <WeatherConditionIcon condition={item.condition} className="w-4 h-4" />
                  <span className="text-xs text-[#D1DCE8] line-clamp-1">
                    {item.condition}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-[#F4F7FA]">
                    {item.validTemp}°C
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#93A4B8]" /> : <ChevronDown className="w-4 h-4 text-[#93A4B8]" />}
                </div>
              </div>

              {isExpanded && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#162331] text-[11px] font-mono animate-fade-in">
                  <div className="flex justify-between text-[#93A4B8]">
                    <span>Precip Prob:</span>
                    <strong className="text-[#43C7F4]">{item.validRainProb}%</strong>
                  </div>
                  <div className="flex justify-between text-[#93A4B8]">
                    <span>QPF Rain:</span>
                    <strong className="text-[#D1DCE8]">{item.validPrecipMm} mm</strong>
                  </div>
                  <div className="flex justify-between text-[#93A4B8]">
                    <span>Wind:</span>
                    <strong className="text-[#22C7A0]">{item.validWindSpeed} km/h {item.validWindDirection}</strong>
                  </div>
                  <div className="flex justify-between text-[#93A4B8]">
                    <span>Relative Humidity:</span>
                    <strong className="text-[#2ECC71]">{item.validHumidity}%</strong>
                  </div>
                  <div className="flex justify-between text-[#93A4B8]">
                    <span>Dew Point:</span>
                    <strong className="text-[#D1DCE8]">{item.dewPoint}°C</strong>
                  </div>
                  <div className="flex justify-between text-[#93A4B8]">
                    <span>Cloud Cover:</span>
                    <strong className="text-[#D1DCE8]">{item.validCloudCover}%</strong>
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
