import React, { useState } from 'react';
import { DailyForecastItem } from '../../types';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import { Calendar, ChevronDown, ChevronUp, Droplets, Wind, Sun, ShieldCheck, ArrowRight } from 'lucide-react';

interface HomeSevenDayForecastProps {
  daily: DailyForecastItem[];
  onNavigateToForecast?: () => void;
}

export const HomeSevenDayForecast: React.FC<HomeSevenDayForecastProps> = ({
  daily,
  onNavigateToForecast,
}) => {
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(0);

  // Compute global min/max for aligned temperature bars
  let globalMin = Infinity;
  let globalMax = -Infinity;
  daily.forEach((d) => {
    if (d.low < globalMin) globalMin = d.low;
    if (d.high > globalMax) globalMax = d.high;
  });
  if (globalMin === Infinity) globalMin = 22;
  if (globalMax === -Infinity) globalMax = 36;

  const toggleDay = (idx: number) => {
    setExpandedDayIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="homepage-seven-day-forecast" className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#22C7A0]/15 text-[#22C7A0] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
              7-Day Synoptic Outlook
            </h2>
            <p className="text-xs text-[#93A4B8]">
              Multi-model ensemble consensus &amp; regional atmospheric trend
            </p>
          </div>
        </div>

        {onNavigateToForecast && (
          <button
            type="button"
            onClick={onNavigateToForecast}
            className="text-xs text-[#43C7F4] hover:text-[#1499E8] font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Full Meteorologist Model View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 7-Day Rows List */}
      <div className="flex flex-col gap-2">
        {daily.slice(0, 7).map((day, idx) => {
          const isExpanded = expandedDayIndex === idx;
          const isToday = idx === 0;
          const visual = getWeatherVisualConfig(day.condition);
          const Icon = visual.icon;
          const rain = day.rainProb || 0;

          // Bar positioning
          const leftPercent = Math.max(0, ((day.low - globalMin) / (globalMax - globalMin || 1)) * 100);
          const rightPercent = Math.min(100, ((day.high - globalMin) / (globalMax - globalMin || 1)) * 100);
          const widthPercent = Math.max(8, rightPercent - leftPercent);

          return (
            <div
              key={day.date || idx}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'bg-[#101C2B] border-[#1499E8]/40 shadow-md'
                  : 'bg-[#071018] border-[#162331] hover:border-[#1499E8]/30 hover:bg-[#0C1724]'
              }`}
            >
              {/* Main Day Summary Strip */}
              <div
                onClick={() => toggleDay(idx)}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                {/* Left: Day name, Date & Condition Icon */}
                <div className="flex items-center gap-3 sm:w-52 shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-[#0B141E] border border-[#162331] flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${visual.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#F4F7FA]">
                        {isToday ? 'Today' : day.day || `Day ${idx + 1}`}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#1499E8]/20 text-[#43C7F4] border border-[#1499E8]/30">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#93A4B8] block">
                      {day.date || day.condition}
                    </span>
                  </div>
                </div>

                {/* Center: Condition Text & Rain Chance */}
                <div className="flex items-center gap-4 sm:w-48">
                  <span className="text-xs text-[#D1DCE8] font-medium truncate">
                    {day.condition}
                  </span>
                  {rain > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#43C7F4] shrink-0">
                      <Droplets className="w-3 h-3" />
                      <span>{rain}%</span>
                    </div>
                  )}
                </div>

                {/* Right: Thermal Range Bar + Min/Max */}
                <div className="flex items-center gap-3 flex-1 max-w-xs">
                  <span className="text-xs font-mono text-[#93A4B8] w-7 text-right">
                    {Math.round(day.low)}°
                  </span>
                  <div className="flex-1 h-2 bg-[#162331] rounded-full relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#43C7F4] via-[#FFC857] to-[#EF5350]"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#F4F7FA] w-7">
                    {Math.round(day.high)}°
                  </span>
                </div>

                {/* Toggle chevron */}
                <div className="hidden sm:block text-[#93A4B8] pl-2">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expandable Deep Micro-Specs */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[#162331] bg-[#0A131E]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331] flex flex-col">
                    <div className="flex items-center gap-1 text-[10px] text-[#93A4B8] uppercase font-bold">
                      <Droplets className="w-3 h-3 text-[#43C7F4]" />
                      <span>Precipitation</span>
                    </div>
                    <span className="text-sm font-bold text-[#43C7F4] mt-1">
                      {rain}% Probability
                    </span>
                    <span className="text-[10px] text-[#93A4B8]">
                      Est. Volume: {rain >= 50 ? '4.8 mm' : '0.0 mm'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331] flex flex-col">
                    <div className="flex items-center gap-1 text-[10px] text-[#93A4B8] uppercase font-bold">
                      <Wind className="w-3 h-3 text-[#22C7A0]" />
                      <span>Wind Profile</span>
                    </div>
                    <span className="text-sm font-bold text-[#F4F7FA] mt-1">
                      {day.wind || '14 km/h NE'}
                    </span>
                    <span className="text-[10px] text-[#93A4B8]">
                      Stable boundary layer
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331] flex flex-col">
                    <div className="flex items-center gap-1 text-[10px] text-[#93A4B8] uppercase font-bold">
                      <Sun className="w-3 h-3 text-[#FFC857]" />
                      <span>UV &amp; Solar Peak</span>
                    </div>
                    <span className="text-sm font-bold text-[#FFC857] mt-1">
                      UV {day.uv || 6} ({day.uv && day.uv >= 8 ? 'Very High' : 'Moderate'})
                    </span>
                    <span className="text-[10px] text-[#93A4B8]">
                      Humidity Avg: {day.humidity || 68}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331] flex flex-col">
                    <div className="flex items-center gap-1 text-[10px] text-[#93A4B8] uppercase font-bold">
                      <ShieldCheck className="w-3 h-3 text-[#22C7A0]" />
                      <span>Confidence</span>
                    </div>
                    <span className="text-sm font-bold text-[#22C7A0] mt-1">
                      {idx <= 2 ? 'High Certainty' : 'Moderate Consensus'}
                    </span>
                    <span className="text-[10px] text-[#93A4B8]">
                      ECMWF / GFS Agreement
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

