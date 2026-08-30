import React, { useState, useMemo } from 'react';
import { HourlyForecastItem } from '../../types';
import { NormalizedHourlyItem, normalizeHourlyForecast } from '../../services/forecastNormalizer';
import {
  TrendingUp,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
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
          title: '24-Hour Temperature Trajectory',
          unit: '°C',
          color: '#FF8C42',
          strokeColor: '#FF8C42',
          fillGradient: 'from-[#FF8C42]/20 to-transparent',
          getValue: (item: NormalizedHourlyItem) => item.validTemp,
          formatValue: (val: number) => `${val}°C`,
          minThreshold: 15,
          maxThreshold: 45,
        };
      case 'precipitation':
        return {
          title: 'Precipitation Probability & Convective Risk',
          unit: '%',
          color: '#4FA8E0',
          strokeColor: '#4FA8E0',
          fillGradient: 'from-[#4FA8E0]/25 to-transparent',
          getValue: (item: NormalizedHourlyItem) => item.validRainProb,
          formatValue: (val: number) => `${val}%`,
          minThreshold: 0,
          maxThreshold: 100,
        };
      case 'wind':
        return {
          title: 'Sustained Surface Wind Velocity',
          unit: 'km/h',
          color: '#2ECC71',
          strokeColor: '#2ECC71',
          fillGradient: 'from-[#2ECC71]/20 to-transparent',
          getValue: (item: NormalizedHourlyItem) => item.validWindSpeed,
          formatValue: (val: number) => `${val} km/h`,
          minThreshold: 0,
          maxThreshold: 50,
        };
      case 'humidity':
        return {
          title: 'Boundary Layer Relative Humidity',
          unit: '%',
          color: '#1ABC9C',
          strokeColor: '#1ABC9C',
          fillGradient: 'from-[#1ABC9C]/20 to-transparent',
          getValue: (item: NormalizedHourlyItem) => item.validHumidity,
          formatValue: (val: number) => `${val}% RH`,
          minThreshold: 30,
          maxThreshold: 100,
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

    const chartHeight = 160;
    const paddingY = 25;
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

  const activeHoverItem = hoveredIdx !== null && normalizedItems[hoveredIdx] ? normalizedItems[hoveredIdx] : null;

  return (
    <div
      id="forecast-trend-chart-panel"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col gap-4"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#314255]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#FF8C42]/20 border border-[#FF8C42]/40 flex items-center justify-center text-[#FF8C42]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Forecast Parameter Trends
            </h2>
            <p className="text-xs text-[#8A94A6]">
              Temporal evolution over next 24h simulated via <strong className="text-[#D7DEE8]">{modelName}</strong>
            </p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#151D26] p-1 rounded-lg border border-[#314255] self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setActiveMetric('temperature')}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
              activeMetric === 'temperature'
                ? 'bg-[#FF8C42] text-black font-bold shadow-sm'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperature</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('precipitation')}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
              activeMetric === 'precipitation'
                ? 'bg-[#4FA8E0] text-black font-bold shadow-sm'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain Prob</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('wind')}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
              activeMetric === 'wind'
                ? 'bg-[#2ECC71] text-black font-bold shadow-sm'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('humidity')}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
              activeMetric === 'humidity'
                ? 'bg-[#1ABC9C] text-black font-bold shadow-sm'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Humidity</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255]">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Peak Maximum</span>
          <span className="text-lg font-black font-mono text-white">
            {config.formatValue(maxValue)}
          </span>
        </div>
        <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255]">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Diurnal Minimum</span>
          <span className="text-lg font-black font-mono text-[#D7DEE8]">
            {config.formatValue(minValue)}
          </span>
        </div>
        <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255]">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Timeseries Mean</span>
          <span className="text-lg font-black font-mono" style={{ color: config.color }}>
            {config.formatValue(avgValue)}
          </span>
        </div>
      </div>

      {/* Interactive SVG Trend Chart */}
      <div className="bg-[#151D26] p-4 rounded-lg border border-[#314255] flex flex-col gap-2 relative">
        <div className="flex items-center justify-between text-xs text-[#8A94A6]">
          <span className="font-semibold text-white">{config.title}</span>
          <span>Hover data points to inspect continuous timesteps</span>
        </div>

        {/* Hover Inspector Tooltip Overlay */}
        {activeHoverItem && (
          <div className="absolute top-4 right-4 bg-[#1E2733] border border-[#4FA8E0] p-2.5 rounded-md shadow-xl text-xs z-20 flex items-center gap-3 animate-fade-in">
            <div>
              <span className="text-[10px] text-[#8A94A6] uppercase block font-bold">
                {activeHoverItem.time} IST
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {config.formatValue(config.getValue(activeHoverItem))}
              </span>
            </div>
            <div className="text-[10px] text-[#D7DEE8] border-l border-[#314255] pl-2.5">
              <span>Condition: <strong>{activeHoverItem.condition}</strong></span>
              <br />
              <span>Wind: {activeHoverItem.validWindSpeed}k {activeHoverItem.validWindDirection}</span>
            </div>
          </div>
        )}

        {/* SVG Chart Canvas */}
        <div className="h-44 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={config.color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0%" y1="25" x2="100%" y2="25" stroke="#314255" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="0%" y1="85" x2="100%" y2="85" stroke="#314255" strokeDasharray="3 3" strokeWidth="1" />
            <line x1="0%" y1="135" x2="100%" y2="135" stroke="#314255" strokeDasharray="3 3" strokeWidth="1" />

            {/* Area Fill */}
            <path d={svgAreaPath} fill="url(#trendGradient)" />

            {/* Line Stroke */}
            <path d={svgPath} fill="none" stroke={config.strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {points.map((p, idx) => (
              <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
                <circle
                  cx={`${p.xPercent}%`}
                  cy={p.y}
                  r={hoveredIdx === idx ? '6' : '3.5'}
                  fill={hoveredIdx === idx ? '#FFFFFF' : config.color}
                  stroke="#151D26"
                  strokeWidth="2"
                  className="transition-all"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* X-Axis Timestep Labels */}
        <div className="flex justify-between text-[10px] text-[#8A94A6] font-mono pt-1 border-t border-[#314255]/70">
          {normalizedItems.filter((_, i) => i % 2 === 0).map((h, i) => (
            <span key={i}>{h.time}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
