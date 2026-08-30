import React, { useState, useMemo } from 'react';
import { HourlyForecastItem } from '../../types';
import { NormalizedHourlyItem, normalizeHourlyForecast } from '../../services/forecastNormalizer';
import {
  TrendingUp,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface ForecastTrendChartProps {
  hourly: HourlyForecastItem[];
  modelName: string;
}

type TrendMetric = 'temperature' | 'precipitation' | 'wind' | 'humidity';

export const ForecastTrendChart: React.FC<ForecastTrendChartProps> = ({
  hourly,
  modelName,
}) => {
  const [activeMetric, setActiveMetric] = useState<TrendMetric>('temperature');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const normalizedItems = useMemo(() => normalizeHourlyForecast(hourly), [hourly]);

  // Metric configuration
  const config = useMemo(() => {
    switch (activeMetric) {
      case 'temperature':
        return {
          title: '24-Hour Thermal Trajectory & Apparent Heat',
          unit: '°C',
          color: '#FF9F43',
          strokeColor: '#FF9F43',
          gradientId: 'tempGrad',
          getValue: (item: NormalizedHourlyItem) => item.validTemp,
          formatValue: (val: number) => `${val}°C`,
        };
      case 'precipitation':
        return {
          title: 'Precipitation Probability & Convective Risk',
          unit: '%',
          color: '#43C7F4',
          strokeColor: '#1499E8',
          gradientId: 'precipGrad',
          getValue: (item: NormalizedHourlyItem) => item.validRainProb,
          formatValue: (val: number) => `${val}%`,
        };
      case 'wind':
        return {
          title: 'Surface Wind Velocity & Maximum Gusts',
          unit: 'km/h',
          color: '#22C7A0',
          strokeColor: '#22C7A0',
          gradientId: 'windGrad',
          getValue: (item: NormalizedHourlyItem) => item.validWindSpeed,
          formatValue: (val: number) => `${val} km/h`,
        };
      case 'humidity':
        return {
          title: 'Boundary Layer Relative Humidity',
          unit: '%',
          color: '#1499E8',
          strokeColor: '#1499E8',
          gradientId: 'humidGrad',
          getValue: (item: NormalizedHourlyItem) => item.validHumidity,
          formatValue: (val: number) => `${val}% RH`,
        };
    }
  }, [activeMetric]);

  // Compute scale boundaries
  const { points, minValue, maxValue, avgValue, svgPath, svgAreaPath } = useMemo(() => {
    if (normalizedItems.length === 0) {
      return {
        points: [],
        minValue: 0,
        maxValue: 100,
        avgValue: 50,
        svgPath: '',
        svgAreaPath: '',
      };
    }

    const values = normalizedItems.map(config.getValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;

    const chartHeight = 180;
    const paddingY = 28;
    const effectiveHeight = chartHeight - paddingY * 2;
    const range = Math.max(1, max - min);

    const calculatedPoints = normalizedItems.map((item, idx) => {
      const val = config.getValue(item);
      const xPercent = (idx / (normalizedItems.length - 1 || 1)) * 100;
      const y = chartHeight - paddingY - ((val - min) / range) * effectiveHeight;
      return { xPercent, y, value: val, item };
    });

    const pathCoords = calculatedPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.xPercent}% ${p.y}`)
      .join(' ');

    const areaCoords = `${pathCoords} L 100% ${chartHeight} L 0% ${chartHeight} Z`;

    return {
      points: calculatedPoints,
      minValue: min,
      maxValue: max,
      avgValue: avg,
      svgPath: pathCoords,
      svgAreaPath: areaCoords,
    };
  }, [normalizedItems, config]);

  const activeHoverItem =
    hoveredIdx !== null && normalizedItems[hoveredIdx] ? normalizedItems[hoveredIdx] : null;

  return (
    <div
      id="forecast-trend-chart-panel"
      className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 sm:p-6 shadow-xl flex flex-col gap-5"
    >
      {/* Header & Metric Selector Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF9F43]/15 text-[#FF9F43] flex items-center justify-center shrink-0 border border-[#FF9F43]/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-[#F4F7FA] tracking-tight">
                Weather Parameter Trends
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF9F43]/15 text-[#FF9F43] border border-[#FF9F43]/30">
                24h Trajectory
              </span>
            </div>
            <p className="text-xs text-[#93A4B8] mt-0.5">
              Continuous time-series telemetry modeled via{' '}
              <strong className="text-[#F4F7FA] font-medium">{modelName}</strong>
            </p>
          </div>
        </div>

        {/* 4 Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-[#071018] p-1.5 rounded-xl border border-[#162331] overflow-x-auto self-start lg:self-auto">
          {(
            [
              { key: 'temperature', label: 'Temperature', icon: Thermometer },
              { key: 'precipitation', label: 'Precipitation', icon: CloudRain },
              { key: 'wind', label: 'Wind & Gusts', icon: Wind },
              { key: 'humidity', label: 'Humidity', icon: Droplets },
            ] as const
          ).map((t) => {
            const isSelected = activeMetric === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setActiveMetric(t.key);
                  setHoveredIdx(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#1499E8] text-white font-bold shadow-md shadow-[#1499E8]/30'
                    : 'text-[#93A4B8] hover:text-[#F4F7FA] hover:bg-[#0B141E]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Title & Summary Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <span className="text-xs font-bold text-[#F4F7FA] uppercase tracking-wider">
          {config.title}
        </span>

        <div className="flex items-center gap-4 text-xs font-mono text-[#93A4B8]">
          <span>
            MIN: <strong className="text-[#43C7F4]">{config.formatValue(minValue)}</strong>
          </span>
          <span>•</span>
          <span>
            AVG: <strong className="text-[#F4F7FA]">{config.formatValue(avgValue)}</strong>
          </span>
          <span>•</span>
          <span>
            MAX: <strong className="text-[#FF9F43]">{config.formatValue(maxValue)}</strong>
          </span>
        </div>
      </div>

      {/* SVG Trend Chart Canvas */}
      <div className="relative w-full h-[200px] bg-[#071018] rounded-xl border border-[#162331] p-3 overflow-hidden select-none">
        {/* Horizontal Reference Grid Lines */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none opacity-30">
          <div className="border-b border-[#162331] w-full" />
          <div className="border-b border-[#162331] w-full" />
          <div className="border-b border-[#162331] w-full" />
        </div>

        {/* SVG Drawing Layer */}
        <svg className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.strokeColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={config.strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={svgAreaPath} fill={`url(#${config.gradientId})`} />

          {/* Line Curve */}
          <path
            d={svgPath}
            fill="none"
            stroke={config.strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx} className="cursor-pointer">
                <circle
                  cx={`${p.xPercent}%`}
                  cy={p.y}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? config.strokeColor : '#071018'}
                  stroke={config.strokeColor}
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all"
                />
              </g>
            );
          })}
        </svg>

        {/* Invisible Click/Hover Columns for Touch/Pointer Events */}
        <div className="absolute inset-0 flex justify-between">
          {normalizedItems.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 h-full cursor-pointer hover:bg-white/[0.03] transition-colors"
              onMouseEnter={() => setHoveredIdx(idx)}
              onClick={() => setHoveredIdx(idx)}
            />
          ))}
        </div>

        {/* Interactive Floating Tooltip */}
        {activeHoverItem && hoveredIdx !== null && (
          <div
            className="absolute top-3 pointer-events-none bg-[#0B141E]/95 border border-[#162331] rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs flex flex-col gap-1 z-20"
            style={{
              left: `${Math.min(
                80,
                Math.max(10, (hoveredIdx / (normalizedItems.length - 1)) * 100)
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#162331] pb-1">
              <span className="font-bold text-[#43C7F4] font-mono">{activeHoverItem.time}</span>
              <span className="text-[10px] text-[#93A4B8]">{activeHoverItem.condition}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black font-mono text-[#F4F7FA]">
                {config.formatValue(config.getValue(activeHoverItem))}
              </span>
              {activeMetric === 'temperature' && (
                <span className="text-[10px] text-[#93A4B8]">
                  Feels like {activeHoverItem.feelsLike}°C
                </span>
              )}
            </div>

            <div className="text-[9px] text-[#93A4B8] flex items-center justify-between gap-2 pt-0.5">
              <span>Rain: {activeHoverItem.validRainProb}%</span>
              <span>Wind: {activeHoverItem.validWindSpeed} km/h</span>
            </div>
          </div>
        )}
      </div>

      {/* Time Axis Markers */}
      <div className="flex justify-between text-[10px] font-mono text-[#93A4B8] px-1">
        {normalizedItems
          .filter((_, idx) => idx % 3 === 0 || idx === normalizedItems.length - 1)
          .map((item, idx) => (
            <span key={idx}>{item.time}</span>
          ))}
      </div>
    </div>
  );
};
