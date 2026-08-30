import React, { useState, useMemo, useRef } from 'react';
import { HourlyForecastItem } from '../../types';
import { NormalizedHourlyItem, normalizeHourlyForecast } from '../../services/forecastNormalizer';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import { HourlyDetailModal } from './HourlyDetailModal';
import {
  Clock,
  CloudRain,
  Wind,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
} from 'lucide-react';

interface ForecastHourlyTimelineProps {
  hourly: HourlyForecastItem[];
  modelName: string;
}

export const ForecastHourlyTimeline: React.FC<ForecastHourlyTimelineProps> = ({
  hourly,
  modelName,
}) => {
  const [selectedHour, setSelectedHour] = useState<NormalizedHourlyItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const normalizedItems = useMemo(() => normalizeHourlyForecast(hourly), [hourly]);

  // Compute temperature boundaries for vertical scaling of the curve
  const { minTemp, maxTemp, tempRange } = useMemo(() => {
    if (normalizedItems.length === 0) return { minTemp: 20, maxTemp: 35, tempRange: 15 };
    const temps = normalizedItems.map((h) => h.validTemp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    return {
      minTemp: min,
      maxTemp: max,
      tempRange: Math.max(3, max - min),
    };
  }, [normalizedItems]);

  const columnWidth = 84; // Compact column width in pixels
  const svgHeight = 70;

  // Build continuous SVG curve path for temperature line & filled gradient area
  const { linePath, areaPath, points } = useMemo(() => {
    if (normalizedItems.length === 0) return { linePath: '', areaPath: '', points: [] };

    const pts = normalizedItems.map((item, idx) => {
      const x = idx * columnWidth + columnWidth / 2;
      // Map temperature: higher temp is higher up (smaller y)
      const normalizedRatio = (item.validTemp - minTemp) / tempRange;
      const y = Math.round(svgHeight - 16 - normalizedRatio * (svgHeight - 32));
      return { x, y, temp: item.validTemp, item, idx };
    });

    // Create smooth cubic bezier curve
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const totalWidth = pts.length * columnWidth;
    const lastX = pts[pts.length - 1].x;
    const areaD = `${d} L ${lastX} ${svgHeight} L ${pts[0].x} ${svgHeight} Z`;

    return { linePath: d, areaPath: areaD, points: pts };
  }, [normalizedItems, minTemp, tempRange, columnWidth, svgHeight]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="forecast-hourly-outlook-container"
      className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 sm:p-6 shadow-xl flex flex-col gap-4"
    >
      {/* Header with Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center shrink-0 border border-[#1499E8]/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-[#F4F7FA] tracking-tight">
                Hourly Outlook
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1499E8]/20 text-[#43C7F4] border border-[#1499E8]/30">
                Next 24 Hours
              </span>
            </div>
            <p className="text-xs text-[#93A4B8] mt-0.5">
              Continuous thermal trajectory and precipitation probability simulated by{' '}
              <strong className="text-[#F4F7FA] font-medium">{modelName}</strong>
            </p>
          </div>
        </div>

        {/* Scroll Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-lg bg-[#071018] border border-[#162331] text-[#93A4B8] hover:text-[#F4F7FA] hover:bg-[#111F30] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Scroll hourly left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-lg bg-[#071018] border border-[#162331] text-[#93A4B8] hover:text-[#F4F7FA] hover:bg-[#111F30] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Scroll hourly right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Continuous Curve & Columns Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-[#162331] scrollbar-track-transparent select-none relative"
      >
        <div
          className="relative flex"
          style={{ width: `${normalizedItems.length * columnWidth}px`, minHeight: '260px' }}
        >
          {/* Continuous SVG Temperature Line in Background */}
          <svg
            className="absolute top-12 left-0 pointer-events-none z-0"
            width={normalizedItems.length * columnWidth}
            height={svgHeight}
          >
            <defs>
              <linearGradient id="hourlyTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1499E8" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1499E8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Filled area under the curve */}
            <path d={areaPath} fill="url(#hourlyTempGrad)" />

            {/* Smooth trajectory line */}
            <path
              d={linePath}
              fill="none"
              stroke="#43C7F4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Data Point Circles on Curve */}
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={i === 0 ? 5 : 3.5}
                fill={i === 0 ? '#43C7F4' : '#071018'}
                stroke="#43C7F4"
                strokeWidth={i === 0 ? 3 : 2}
              />
            ))}
          </svg>

          {/* Hourly Column Markers */}
          {normalizedItems.map((item, idx) => {
            const isNow = idx === 0;
            const visual = getWeatherVisualConfig(item.condition);
            const Icon = visual.icon;
            const rain = item.validRainProb;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedHour(item)}
                style={{ width: `${columnWidth}px` }}
                className={`relative z-10 flex flex-col items-center justify-between py-2 px-1 rounded-xl transition-all group cursor-pointer text-center ${
                  isNow
                    ? 'bg-[#1499E8]/10 border border-[#1499E8]/40 shadow-lg'
                    : 'hover:bg-[#0E1B28]/80 border border-transparent hover:border-[#162331]'
                }`}
              >
                {/* 1. Time Header */}
                <div className="flex flex-col items-center">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isNow ? 'text-[#43C7F4]' : 'text-[#F4F7FA]'
                    }`}
                  >
                    {isNow ? 'NOW' : item.time}
                  </span>
                </div>

                {/* 2. Weather Icon above curve */}
                <div className="my-1.5 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isNow
                        ? 'bg-[#1499E8]/20 text-[#43C7F4]'
                        : 'text-[#93A4B8] group-hover:text-[#F4F7FA]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* 3. Temperature readout */}
                <div className="mt-10 mb-2">
                  <span
                    className={`text-sm font-bold font-mono block ${
                      isNow ? 'text-[#43C7F4]' : 'text-[#F4F7FA]'
                    }`}
                  >
                    {item.validTemp}°
                  </span>
                  <span className="text-[9px] text-[#93A4B8] block">
                    fls {item.feelsLike}°
                  </span>
                </div>

                {/* 4. Rain Probability below curve */}
                <div className="w-full px-1 my-1">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-mono">
                    <CloudRain
                      className={`w-3 h-3 ${
                        rain >= 50 ? 'text-[#43C7F4]' : 'text-[#93A4B8]'
                      }`}
                    />
                    <span
                      className={
                        rain >= 50
                          ? 'text-[#43C7F4] font-bold'
                          : 'text-[#93A4B8]'
                      }
                    >
                      {rain}%
                    </span>
                  </div>

                  {/* Micro probability bar */}
                  <div className="w-full bg-[#162331] h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${
                        rain >= 60 ? 'bg-[#1499E8]' : 'bg-[#43C7F4]/40'
                      }`}
                      style={{ width: `${rain}%` }}
                    />
                  </div>
                </div>

                {/* 5. Wind Direction & Speed below */}
                <div className="mt-2 flex flex-col items-center text-[10px] text-[#93A4B8] border-t border-[#162331] pt-1.5 w-full">
                  <div className="flex items-center gap-0.5">
                    <Wind className="w-2.5 h-2.5 text-[#22C7A0]" />
                    <span className="font-mono font-medium text-[#F4F7FA]">
                      {item.validWindSpeed}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#93A4B8] font-mono uppercase">
                    {item.validWindDirection}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Detail Modal */}
      {selectedHour && (
        <HourlyDetailModal
          item={selectedHour}
          onClose={() => setSelectedHour(null)}
          modelName={modelName}
        />
      )}
    </div>
  );
};
