import React, { useState, useMemo } from 'react';
import { HourlyForecastItem } from '../../types';
import { NormalizedHourlyItem, normalizeHourlyForecast } from '../../services/forecastNormalizer';
import { WeatherConditionIcon } from './WeatherConditionIcon';
import { HourlyDetailModal } from './HourlyDetailModal';
import {
  Clock,
  CloudRain,
  Wind,
  Droplets,
  TrendingUp,
  Info,
  ChevronRight,
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
  const normalizedItems = useMemo(() => normalizeHourlyForecast(hourly), [hourly]);

  // Compute min/max temp for temperature curve scaling
  const { minTemp, maxTemp, tempRange } = useMemo(() => {
    if (normalizedItems.length === 0) return { minTemp: 20, maxTemp: 35, tempRange: 15 };
    const temps = normalizedItems.map((h) => h.validTemp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    return {
      minTemp: min,
      maxTemp: max,
      tempRange: Math.max(2, max - min),
    };
  }, [normalizedItems]);

  // Build SVG path for the smooth temperature line behind cards
  const svgPoints = useMemo(() => {
    if (normalizedItems.length === 0) return '';
    const widthPerCard = 110;
    return normalizedItems
      .map((item, idx) => {
        const x = idx * widthPerCard + widthPerCard / 2;
        // Map temp to Y coordinate (height 40px, padding 8px)
        const normalizedY = 32 - ((item.validTemp - minTemp) / tempRange) * 24;
        return `${x},${normalizedY}`;
      })
      .join(' ');
  }, [normalizedItems, minTemp, tempRange]);

  return (
    <div
      id="forecast-hourly-timeline-container"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col gap-3.5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#314255]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                Hourly Forecast
              </h2>
              <span className="text-[10px] bg-[#0B72B9]/20 text-[#4FA8E0] px-2 py-0.5 rounded border border-[#0B72B9]/40 font-mono font-bold">
                NEXT 24 HOURS
              </span>
            </div>
            <p className="text-xs text-[#8A94A6]">
              Continuous point forecast simulated via <strong className="text-[#D7DEE8]">{modelName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8A94A6]">
          <span className="flex items-center gap-1 text-[#4FA8E0]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Range: {minTemp}°C – {maxTemp}°C</span>
          </span>
          <span className="text-[#314255]">•</span>
          <span className="text-[11px] text-[#8A94A6]">Click card for details</span>
        </div>
      </div>

      {/* Horizontal Scrollable Timeline Strip with Temperature Sparkline */}
      <div className="overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-[#314255] scrollbar-track-transparent">
        <div className="flex flex-col min-w-max relative">
          {/* Temperature Trend SVG Sparkline */}
          <div className="h-10 w-full relative mb-1 pointer-events-none opacity-80">
            <svg
              className="w-full h-full overflow-visible"
              style={{ width: `${normalizedItems.length * 110}px` }}
            >
              {/* Subtle grid line */}
              <line
                x1="0"
                y1="20"
                x2={normalizedItems.length * 110}
                y2="20"
                stroke="#314255"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              {/* Polyline curve */}
              <polyline
                fill="none"
                stroke="#4FA8E0"
                strokeWidth="2.5"
                points={svgPoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {normalizedItems.map((item, idx) => {
                const x = idx * 110 + 55;
                const y = 32 - ((item.validTemp - minTemp) / tempRange) * 24;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={item.isNow ? '4.5' : '3'}
                    fill={item.isNow ? '#2ECC71' : '#4FA8E0'}
                    stroke="#1E2733"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>

          {/* Cards Row */}
          <div className="flex gap-2.5">
            {normalizedItems.map((item, idx) => {
              const isNow = item.isNow;
              const isNight = (() => {
                const hour = parseInt(item.time.split(':')[0], 10);
                return hour >= 19 || hour <= 5;
              })();

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedHour(item)}
                  className={`w-[105px] p-3 rounded-lg border flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none group relative ${
                    isNow
                      ? 'bg-[#0B72B9]/15 border-[#4FA8E0] shadow-md shadow-[#0B72B9]/20 ring-1 ring-[#4FA8E0]/40'
                      : 'bg-[#151D26] border-[#314255] hover:border-[#4FA8E0]/60 hover:bg-[#1E2733]'
                  }`}
                  title={`View detailed forecast for ${item.time}`}
                >
                  {/* Time Badge */}
                  <div className="flex flex-col items-center w-full">
                    <span className="text-xs font-bold text-white font-mono">
                      {item.time}
                    </span>
                    {isNow ? (
                      <span className="text-[9px] font-black text-[#2ECC71] uppercase tracking-wider bg-[#2ECC71]/15 px-1.5 py-0.2 rounded border border-[#2ECC71]/30 mt-0.5">
                        NOW
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8A94A6]">IST</span>
                    )}
                  </div>

                  {/* Weather Icon & Condition */}
                  <div className="my-2.5 flex flex-col items-center gap-1">
                    <WeatherConditionIcon
                      condition={item.condition}
                      className="w-7 h-7 transition-transform group-hover:scale-110"
                      isNight={isNight}
                    />
                    <span className="text-base font-black font-mono text-white tracking-tight">
                      {item.validTemp}°C
                    </span>
                    <span className="text-[10px] text-[#D7DEE8] line-clamp-1 max-w-[90px] font-medium leading-tight">
                      {item.condition}
                    </span>
                  </div>

                  {/* Rain Prob & Wind Footer */}
                  <div className="w-full pt-2 border-t border-[#314255]/70 flex flex-col gap-1 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A94A6] flex items-center gap-0.5">
                        <CloudRain className="w-3 h-3 text-[#4FA8E0]" />
                        <span>Rain</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          item.validRainProb > 50 ? 'text-[#4FA8E0]' : 'text-[#8A94A6]'
                        }`}
                      >
                        {item.validRainProb}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#8A94A6] flex items-center gap-0.5">
                        <Wind className="w-3 h-3 text-[#2ECC71]" />
                        <span>Wind</span>
                      </span>
                      <span className="font-mono text-[#D7DEE8]">
                        {item.validWindSpeed}k
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hourly Detail Modal */}
      <HourlyDetailModal
        item={selectedHour}
        modelName={modelName}
        onClose={() => setSelectedHour(null)}
      />
    </div>
  );
};
