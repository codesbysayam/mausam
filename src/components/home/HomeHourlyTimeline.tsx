import React, { useState, useRef, useMemo } from 'react';
import { HourlyForecastItem } from '../../types';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface HomeHourlyTimelineProps {
  hourly: HourlyForecastItem[];
  onNavigateToHourly?: () => void;
}

export const HomeHourlyTimeline: React.FC<HomeHourlyTimelineProps> = ({
  hourly,
  onNavigateToHourly,
}) => {
  const [rangeMode, setRangeMode] = useState<'8h' | '24h'>('8h');
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const displayList = useMemo(() => {
    const count = rangeMode === '8h' ? 8 : 24;
    return hourly.slice(0, count);
  }, [hourly, rangeMode]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -280 : 280;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Compute min/max temp for temperature trend line
  const { minTemp, maxTemp } = useMemo(() => {
    if (!displayList.length) return { minTemp: 20, maxTemp: 35 };
    let min = Infinity;
    let max = -Infinity;
    displayList.forEach((h) => {
      const t = typeof h.temp === 'number' ? h.temp : 25;
      if (t < min) min = t;
      if (t > max) max = t;
    });
    return { minTemp: Math.floor(min) - 1, maxTemp: Math.ceil(max) + 1 };
  }, [displayList]);

  return (
    <section id="homepage-hourly-timeline" className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col gap-4">
      {/* Header with Title and Range Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
              Hourly Atmospheric Timeline
            </h2>
            <p className="text-xs text-[#93A4B8]">
              High-resolution diurnal temperature &amp; precipitation nowcast
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* 8h / 24h Switcher */}
          <div className="flex bg-[#071018] p-0.5 rounded-lg border border-[#162331]">
            <button
              type="button"
              onClick={() => setRangeMode('8h')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                rangeMode === '8h'
                  ? 'bg-[#1499E8] text-white shadow-xs'
                  : 'text-[#93A4B8] hover:text-[#F4F7FA]'
              }`}
            >
              Next 8 Hours
            </button>
            <button
              type="button"
              onClick={() => setRangeMode('24h')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                rangeMode === '24h'
                  ? 'bg-[#1499E8] text-white shadow-xs'
                  : 'text-[#93A4B8] hover:text-[#F4F7FA]'
              }`}
            >
              24-Hour Cycle
            </button>
          </div>

          {/* Scroll arrow buttons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-lg bg-[#071018] border border-[#162331] text-[#93A4B8] hover:text-white flex items-center justify-center cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-lg bg-[#071018] border border-[#162331] text-[#93A4B8] hover:text-white flex items-center justify-center cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Timeline Strip */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scroll-smooth select-none"
      >
        {displayList.map((item, idx) => {
          const isSelected = selectedHourIndex === idx;
          const isCurrent = idx === 0;
          const visual = getWeatherVisualConfig(item.condition);
          const Icon = visual.icon;
          const rain = item.precipitationProbability || item.rainProb || 0;
          const temp = Math.round(item.temp);
          const tempPercent = Math.max(10, Math.min(90, ((temp - minTemp) / (maxTemp - minTemp || 1)) * 100));

          return (
            <div
              key={item.time || idx}
              onClick={() => setSelectedHourIndex(idx)}
              className={`min-w-[105px] sm:min-w-[115px] p-3.5 rounded-xl border flex flex-col justify-between items-center text-center cursor-pointer transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#111F30] border-[#1499E8] shadow-md shadow-[#1499E8]/10'
                  : 'bg-[#071018]/90 border-[#162331] hover:border-[#1499E8]/40 hover:bg-[#0E1A27]'
              }`}
            >
              {/* Time header */}
              <div className="flex flex-col items-center">
                <span className={`text-xs font-bold ${isCurrent ? 'text-[#43C7F4]' : 'text-[#F4F7FA]'}`}>
                  {isCurrent ? 'Now' : item.time || `${idx}:00`}
                </span>
                <span className="text-[10px] text-[#93A4B8] font-normal mt-0.5">
                  {item.humidity || 70}% RH
                </span>
              </div>

              {/* Weather icon */}
              <div className="my-2 p-2 rounded-xl bg-[#0B141E] border border-[#162331]">
                <Icon className={`w-6 h-6 ${visual.iconColor}`} />
              </div>

              {/* Temperature display */}
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-[#F4F7FA] tracking-tight">
                  {temp}°
                </span>
                <span className="text-[10px] text-[#93A4B8] truncate max-w-[90px]">
                  {item.condition}
                </span>
              </div>

              {/* Rain Probability Mini Bar */}
              <div className="w-full mt-2.5 pt-2 border-t border-[#162331]/80 flex flex-col items-center gap-1">
                <div className="flex items-center justify-between w-full text-[9px] font-mono text-[#93A4B8]">
                  <span>Rain</span>
                  <span className={rain >= 40 ? 'text-[#43C7F4] font-bold' : 'text-[#93A4B8]'}>
                    {rain}%
                  </span>
                </div>
                <div className="w-full h-1 bg-[#162331] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1499E8] rounded-full"
                    style={{ width: `${rain}%` }}
                  />
                </div>
              </div>

              {/* Wind Speed */}
              <div className="text-[10px] text-[#93A4B8] mt-1 font-mono">
                {Math.round(item.windSpeed || 12)} km/h
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#162331] text-xs text-[#93A4B8]">
        <span>Hourly data generated via IMD Numerical Weather Prediction &amp; GFS Model Consensus</span>
        {onNavigateToHourly && (
          <button
            type="button"
            onClick={onNavigateToHourly}
            className="text-[#43C7F4] hover:text-[#1499E8] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View full 7-day hourly forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </section>
  );
};
