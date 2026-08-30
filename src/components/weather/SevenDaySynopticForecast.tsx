import React, { useState, useMemo } from 'react';
import { DailyForecastItem } from '../../types';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import {
  CalendarDays,
  Droplets,
  Wind,
  Table,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface SevenDaySynopticForecastProps {
  daily: DailyForecastItem[];
}

export const SevenDaySynopticForecast: React.FC<SevenDaySynopticForecastProps> = ({
  daily = [],
}) => {
  const [showDetailedTable, setShowDetailedTable] = useState(false);

  // Compute global max and min across 7 days for relative range bars
  const { globalMin, globalMax } = useMemo(() => {
    let min = 100;
    let max = -100;
    daily.forEach((d) => {
      if (typeof d.low === 'number' && d.low < min) min = d.low;
      if (typeof d.high === 'number' && d.high > max) max = d.high;
    });
    if (min === 100) min = 20;
    if (max === -100) max = 35;
    return { globalMin: min, globalMax: max };
  }, [daily]);

  return (
    <div
      id="seven-day-synoptic-forecast-section"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col gap-4"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#314255]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#0B72B9]/15 border border-[#0B72B9]/30 flex items-center justify-center text-[#4FA8E0]">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">
              7-Day Synoptic Extended Outlook
            </h3>
            <p className="text-[11px] text-[#8A94A6]">
              Calibrated via IMD Multi-Model Ensemble (MME)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetailedTable(!showDetailedTable)}
          className="px-3 py-1.5 bg-[#151D26] hover:bg-[#314255] border border-[#314255] hover:border-[#4FA8E0] text-xs font-semibold text-[#4FA8E0] rounded flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Table className="w-3.5 h-3.5" />
          <span>{showDetailedTable ? 'Hide Detailed Table' : 'View Detailed Numerical Table'}</span>
          {showDetailedTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 7-Day Forecast Cards Strip / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {daily.map((item, idx) => {
          const visual = getWeatherVisualConfig(item.condition);
          const IconComp = visual.icon;

          const highVal =
            typeof item.high === 'number' && !Number.isNaN(item.high)
              ? Math.round(item.high)
              : 29;
          const lowVal =
            typeof item.low === 'number' && !Number.isNaN(item.low)
              ? Math.round(item.low)
              : 24;

          const rainProb = item.rainProb || 0;
          const isToday = idx === 0 || item.day.toLowerCase().includes('today');

          // Calculate bar percentage
          const rangeTotal = Math.max(1, globalMax - globalMin);
          const leftPercent = Math.max(0, Math.min(80, ((lowVal - globalMin) / rangeTotal) * 100));
          const widthPercent = Math.max(20, Math.min(100 - leftPercent, ((highVal - lowVal) / rangeTotal) * 100));

          return (
            <div
              key={idx}
              id={`daily-forecast-card-${idx}`}
              className={`p-3.5 rounded-lg border flex flex-col justify-between gap-3 transition-all ${
                isToday
                  ? 'bg-[#151D26] border-[#4FA8E0] shadow-md ring-1 ring-[#4FA8E0]/40'
                  : 'bg-[#151D26] border-[#314255] hover:border-[#4FA8E0]/60'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-tight">
                    {isToday ? 'Today' : item.day}
                  </div>
                  <div className="text-[10px] text-[#8A94A6]">{item.date}</div>
                </div>
                {isToday && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#4FA8E0]/20 text-[#4FA8E0] border border-[#4FA8E0]/40">
                    TODAY
                  </span>
                )}
              </div>

              {/* Weather Condition & Icon */}
              <div className="flex items-center gap-2.5 my-1">
                <div className="p-2 rounded-lg bg-[#1E2733] border border-[#314255] shrink-0">
                  <IconComp className={`w-5 h-5 ${visual.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {item.condition || 'Partly Cloudy'}
                  </div>
                  <div className="text-[10px] text-[#8A94A6] truncate">
                    {rainProb > 50 ? `${rainProb}% Rain Prob` : 'Stable Sky'}
                  </div>
                </div>
              </div>

              {/* Visual Temperature Range Bar */}
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-[#8A94A6] font-semibold">{lowVal}°</span>
                  <span className="text-white font-bold">{highVal}°</span>
                </div>

                {/* Range Track Bar */}
                <div className="relative w-full h-1.5 bg-[#1E2733] rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-[#4FA8E0] to-[#E74C3C]"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
              </div>

              {/* Secondary Details: Rain, Wind, Humidity */}
              <div className="pt-2 border-t border-[#314255]/70 grid grid-cols-2 gap-1 text-[10px] text-[#8A94A6]">
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-[#4FA8E0]" />
                  <span>{rainProb}% PoP</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Wind className="w-3 h-3 text-[#2ECC71]" />
                  <span>{item.wind || '10 km/h'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Numerical Table (Expandable) */}
      {showDetailedTable && (
        <div
          id="detailed-synoptic-table-container"
          className="bg-[#151D26] border border-[#314255] rounded-lg p-3 overflow-x-auto"
        >
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[#314255] text-[#8A94A6] uppercase text-[10px] tracking-wider">
                <th className="p-2.5">Date &amp; Day</th>
                <th className="p-2.5">Synoptic Condition</th>
                <th className="p-2.5">Min / Max Temp</th>
                <th className="p-2.5">Rainfall Probability</th>
                <th className="p-2.5">Humidity Index</th>
                <th className="p-2.5">Wind Velocity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#314255]/60 font-mono">
              {daily.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#1E2733]/60 transition-colors">
                  <td className="p-2.5 font-sans">
                    <span className="font-bold text-white block">{item.day}</span>
                    <span className="text-[10px] text-[#8A94A6]">{item.date}</span>
                  </td>
                  <td className="p-2.5 font-sans text-white">{item.condition}</td>
                  <td className="p-2.5">
                    <span className="text-white font-bold">{item.high}°C</span> /{' '}
                    <span className="text-[#8A94A6]">{item.low}°C</span>
                  </td>
                  <td className="p-2.5">
                    <span className={`font-bold ${item.rainProb > 40 ? 'text-[#4FA8E0]' : 'text-[#8A94A6]'}`}>
                      {item.rainProb || 0}%
                    </span>
                  </td>
                  <td className="p-2.5 text-[#DCE3EB]">{item.humidity || 75}% RH</td>
                  <td className="p-2.5 text-[#DCE3EB]">
                    {item.wind || '10 km/h NE'}
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
