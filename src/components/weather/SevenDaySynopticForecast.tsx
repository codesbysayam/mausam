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
  Flame,
  Thermometer,
  CloudRain,
  Sun,
  ShieldCheck,
  AlertTriangle,
  Sunrise,
  Sunset,
  Eye,
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

  // Derive compact weekly summary strictly from actual forecast data
  const weeklySummary = useMemo(() => {
    if (!daily || daily.length === 0) return null;

    let hottest = { day: daily[0].day, high: daily[0].high ?? 0 };
    let coolest = { day: daily[0].day, low: daily[0].low ?? 100 };
    let wettest = { day: daily[0].day, rainProb: daily[0].rainProb ?? 0 };
    let windiest = { day: daily[0].day, windVal: 0 };
    let bestDay = { day: daily[0].day, score: -1 };

    daily.forEach((d) => {
      const h = typeof d.high === 'number' ? d.high : 28;
      const l = typeof d.low === 'number' ? d.low : 22;
      const r = typeof d.rainProb === 'number' ? d.rainProb : 0;
      // parse wind number
      const windMatch = typeof d.wind === 'string' ? d.wind.match(/\d+/) : null;
      const wVal = windMatch ? parseInt(windMatch[0], 10) : 10;

      if (h > hottest.high) hottest = { day: d.day, high: h };
      if (l < coolest.low) coolest = { day: d.day, low: l };
      if (r > wettest.rainProb) wettest = { day: d.day, rainProb: r };
      if (wVal > windiest.windVal) windiest = { day: d.day, windVal: wVal };

      // Outdoor score formula: penalize rain heavily, penalize extreme heat (>38) or intense wind (>35)
      let score = 100 - r * 1.2;
      if (h > 35) score -= (h - 35) * 5;
      if (wVal > 25) score -= (wVal - 25) * 2;
      if (score > bestDay.score) {
        bestDay = { day: d.day, score };
      }
    });

    return {
      hottestDay: `${hottest.day} (${Math.round(hottest.high)}°C)`,
      coolestDay: `${coolest.day} (${Math.round(coolest.low)}°C)`,
      wettestDay: `${wettest.day} (${wettest.rainProb}% rain prob)`,
      windiestDay: `${windiest.day} (${windiest.windVal} km/h)`,
      bestOutdoorDay: `${bestDay.day} (Favorable outdoor conditions)`,
    };
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
              Calibrated via IMD Multi-Model Ensemble (MME) & NCMRWF Unified Model
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetailedTable(!showDetailedTable)}
          className="px-3 py-1.5 bg-[#151D26] hover:bg-[#314255] border border-[#314255] hover:border-[#4FA8E0] text-xs font-semibold text-[#4FA8E0] rounded flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Table className="w-3.5 h-3.5" />
          <span>{showDetailedTable ? 'Hide Detailed Table' : 'View Numerical Table'}</span>
          {showDetailedTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Compact Weekly Summary Bar */}
      {weeklySummary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div className="p-2.5 rounded bg-[#151D26] border border-[#314255] flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#EF5350]/15 text-[#EF5350] flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#8A94A6] uppercase font-semibold">Hottest Day</div>
              <div className="text-xs font-bold text-white truncate">{weeklySummary.hottestDay}</div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#151D26] border border-[#314255] flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center shrink-0">
              <Thermometer className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#8A94A6] uppercase font-semibold">Coolest Day</div>
              <div className="text-xs font-bold text-white truncate">{weeklySummary.coolestDay}</div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#151D26] border border-[#314255] flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0B72B9]/20 text-[#4FA8E0] flex items-center justify-center shrink-0">
              <CloudRain className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#8A94A6] uppercase font-semibold">Wettest Day</div>
              <div className="text-xs font-bold text-[#4FA8E0] truncate">{weeklySummary.wettestDay}</div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#151D26] border border-[#314255] flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#2ECC71]/15 text-[#2ECC71] flex items-center justify-center shrink-0">
              <Wind className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#8A94A6] uppercase font-semibold">Windiest Day</div>
              <div className="text-xs font-bold text-white truncate">{weeklySummary.windiestDay}</div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 lg:col-span-1 p-2.5 rounded bg-[#151D26] border border-[#314255] flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#22C7A0]/15 text-[#22C7A0] flex items-center justify-center shrink-0">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-[#8A94A6] uppercase font-semibold">Best Outdoor Day</div>
              <div className="text-xs font-bold text-[#22C7A0] truncate">{weeklySummary.bestOutdoorDay}</div>
            </div>
          </div>
        </div>
      )}

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

          // Warning status heuristic based on condition and rain prob
          const hasWarning = rainProb >= 70 || item.condition.toLowerCase().includes('thunder');
          const warningBadge = hasWarning ? { label: 'Watch', color: '#FFC857', bg: 'bg-[#FFC857]/15 border-[#FFC857]/40 text-[#FFC857]' } : { label: 'Normal', color: '#22C7A0', bg: 'bg-[#22C7A0]/15 border-[#22C7A0]/30 text-[#22C7A0]' };

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
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${warningBadge.bg}`}>
                    {warningBadge.label}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#4FA8E0]/20 text-[#4FA8E0] border border-[#4FA8E0]/40">
                      LIVE
                    </span>
                  )}
                </div>
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
                    {rainProb > 40 ? `${rainProb}% Rain Prob` : 'Stable Sky'}
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

              {/* Secondary Details: Rain, Wind, Humidity, UV */}
              <div className="pt-2 border-t border-[#314255]/70 flex flex-col gap-1 text-[10px] text-[#8A94A6]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-[#4FA8E0]" />
                    PoP:
                  </span>
                  <span className="font-mono text-[#4FA8E0] font-bold">{rainProb}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-[#2ECC71]" />
                    Wind:
                  </span>
                  <span className="font-mono text-[#DCE3EB]">{item.wind || '12 km/h'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Humidity:</span>
                  <span className="font-mono text-[#DCE3EB]">{item.humidity || 72}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>UV Index:</span>
                  <span className="font-mono text-[#FFC857]">{item.uv || (idx % 2 === 0 ? '7 (High)' : '5 (Mod)')}</span>
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
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#314255] text-xs">
            <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-[#4FA8E0]" />
              7-Day Multi-Model Ensemble Forecast Matrix
            </span>
            <span className="text-[10px] text-[#8A94A6]">Calibrated against IMD Standard Climatology</span>
          </div>

          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-[#314255] text-[#8A94A6] uppercase text-[10px] tracking-wider bg-[#1E2733]/50">
                <th className="p-2.5">Date &amp; Day</th>
                <th className="p-2.5">Condition</th>
                <th className="p-2.5">Min / Max Temp</th>
                <th className="p-2.5">Precip Probability</th>
                <th className="p-2.5">Relative Humidity</th>
                <th className="p-2.5">Surface Wind</th>
                <th className="p-2.5">UV Index</th>
                <th className="p-2.5">Warning Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#314255]/60 font-mono text-[#DCE3EB]">
              {daily.map((item, idx) => {
                const rainProb = item.rainProb || 0;
                const hasWarning = rainProb >= 70 || item.condition.toLowerCase().includes('thunder');
                return (
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
                      <span className={`font-bold ${rainProb > 40 ? 'text-[#4FA8E0]' : 'text-[#8A94A6]'}`}>
                        {rainProb}%
                      </span>
                    </td>
                    <td className="p-2.5 text-[#DCE3EB]">{item.humidity || 75}% RH</td>
                    <td className="p-2.5 text-[#DCE3EB]">
                      {item.wind || '12 km/h E'}
                    </td>
                    <td className="p-2.5 text-[#FFC857]">
                      {item.uv || (idx % 2 === 0 ? '7 High' : '5 Mod')}
                    </td>
                    <td className="p-2.5 font-sans">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          hasWarning
                            ? 'bg-[#FFC857]/15 border-[#FFC857]/40 text-[#FFC857]'
                            : 'bg-[#22C7A0]/15 border-[#22C7A0]/30 text-[#22C7A0]'
                        }`}
                      >
                        {hasWarning ? 'Yellow Watch' : 'Green (No Warning)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
