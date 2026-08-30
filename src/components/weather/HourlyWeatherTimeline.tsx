import React, { useState, useMemo } from 'react';
import { HourlyForecastItem } from '../../types';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import {
  Clock,
  Droplets,
  Wind,
  LineChart as ChartIcon,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface HourlyWeatherTimelineProps {
  hourly: HourlyForecastItem[];
}

type ChartMetric = 'temp' | 'rain' | 'wind';

export const HourlyWeatherTimeline: React.FC<HourlyWeatherTimelineProps> = ({
  hourly = [],
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temp');
  const [showChart, setShowChart] = useState(true);

  // Normalize 24h hourly items
  const displayItems = useMemo(() => {
    if (!hourly || hourly.length === 0) return [];
    return hourly.slice(0, 24);
  }, [hourly]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return displayItems.map((item) => ({
      time: item.time,
      temp: typeof item.temp === 'number' && !Number.isNaN(item.temp) ? Math.round(item.temp) : 24,
      rain: item.precipitationProbability || 0,
      wind: item.windSpeed || 8,
      condition: item.condition,
    }));
  }, [displayItems]);

  const metricConfig = {
    temp: {
      label: 'Temperature',
      unit: '°C',
      color: '#4FA8E0',
      gradientFrom: '#4FA8E0',
      gradientTo: '#0B72B9',
      domain: ['auto', 'auto'],
    },
    rain: {
      label: 'Precipitation Probability',
      unit: '%',
      color: '#0B72B9',
      gradientFrom: '#0B72B9',
      gradientTo: '#1ABC9C',
      domain: [0, 100],
    },
    wind: {
      label: 'Wind Velocity',
      unit: 'km/h',
      color: '#2ECC71',
      gradientFrom: '#2ECC71',
      gradientTo: '#151D26',
      domain: [0, 'auto'],
    },
  };

  const currentConf = metricConfig[activeMetric];

  return (
    <div
      id="todays-hourly-weather-section"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col gap-4"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#314255]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#0B72B9]/15 border border-[#0B72B9]/30 flex items-center justify-center text-[#4FA8E0]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                Today&apos;s Hourly Weather
              </h3>
              <p className="text-[11px] text-[#8A94A6]">
                24-Hour Synoptic Nowcast Projection (IMD-WRF 3km Model)
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Chart View & Metric Selector */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <div className="flex items-center bg-[#151D26] p-0.5 rounded border border-[#314255] text-xs">
            <button
              type="button"
              onClick={() => setActiveMetric('temp')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold ${
                activeMetric === 'temp'
                  ? 'bg-[#0B72B9] text-white'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              Temp (°C)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('rain')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold ${
                activeMetric === 'rain'
                  ? 'bg-[#0B72B9] text-white'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              Rain (%)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('wind')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold ${
                activeMetric === 'wind'
                  ? 'bg-[#0B72B9] text-white'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              Wind (km/h)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className="px-2.5 py-1 bg-[#151D26] hover:bg-[#314255] border border-[#314255] rounded text-[11px] text-[#4FA8E0] font-semibold flex items-center gap-1 transition-all"
            title="Toggle Synoptic Graph"
          >
            <ChartIcon className="w-3.5 h-3.5" />
            <span>{showChart ? 'Hide Chart' : 'Show Chart'}</span>
          </button>
        </div>
      </div>

      {/* Hourly Cards Horizontal Scroll Strip */}
      <div
        id="hourly-forecast-cards-scroll"
        className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#314255]"
      >
        <div className="flex gap-2.5 min-w-max">
          {displayItems.map((item, idx) => {
            const visual = getWeatherVisualConfig(item.condition);
            const IconComponent = visual.icon;
            const tempVal =
              typeof item.temp === 'number' && !Number.isNaN(item.temp)
                ? Math.round(item.temp)
                : 24;

            return (
              <div
                key={idx}
                id={`hourly-card-${idx}`}
                className={`p-3 rounded-lg border flex flex-col items-center justify-between text-center transition-all min-w-[100px] w-[105px] ${
                  item.isNow
                    ? 'bg-[#0B72B9]/20 border-[#4FA8E0] shadow-md ring-1 ring-[#4FA8E0]/40'
                    : 'bg-[#151D26] border-[#314255] hover:border-[#4FA8E0]/50'
                }`}
              >
                {/* Time Label */}
                <div className="text-xs font-bold text-white font-mono">
                  {item.time}
                  {item.isNow && (
                    <span className="block text-[9px] text-[#4FA8E0] font-normal uppercase tracking-wider">
                      ● Now
                    </span>
                  )}
                </div>

                {/* Weather Condition Icon */}
                <div className="my-2.5 flex flex-col items-center">
                  <div className="p-2 rounded-full bg-[#1E2733] border border-[#314255] mb-1">
                    <IconComponent className={`w-5 h-5 ${visual.iconColor}`} />
                  </div>
                  <div className="text-base font-black text-white font-mono leading-none">
                    {tempVal}°
                  </div>
                  <span className="text-[10px] text-[#8A94A6] truncate max-w-[90px] mt-1">
                    {item.condition || 'Cloudy'}
                  </span>
                </div>

                {/* Rain & Wind indicators */}
                <div className="w-full pt-2 border-t border-[#314255]/70 flex flex-col gap-1 text-[10px] text-[#8A94A6]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-0.5">
                      <Droplets className="w-2.5 h-2.5 text-[#4FA8E0]" />
                      Rain
                    </span>
                    <strong className="text-[#4FA8E0] font-mono">
                      {item.precipitationProbability || 0}%
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-0.5">
                      <Wind className="w-2.5 h-2.5 text-[#2ECC71]" />
                      Wind
                    </span>
                    <strong className="text-[#DCE3EB] font-mono">
                      {item.windSpeed || 8}k
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Synoptic Trend Line / Area Chart */}
      {showChart && chartData.length > 0 && (
        <div
          id="hourly-trend-chart-panel"
          className="bg-[#151D26] border border-[#314255] rounded-lg p-3.5 mt-1"
        >
          <div className="flex items-center justify-between text-xs text-[#8A94A6] mb-2 px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-white">
              {currentConf.label} Trend Curve ({currentConf.unit})
            </span>
            <span className="font-mono text-[10px]">Continuous 24-Hour Simulation</span>
          </div>

          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id={`hourlyGrad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentConf.gradientFrom} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={currentConf.gradientTo} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#8A94A6"
                  fontSize={10}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  stroke="#8A94A6"
                  fontSize={10}
                  tickLine={false}
                  domain={currentConf.domain as any}
                  unit={currentConf.unit === '%' ? '%' : ''}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E2733',
                    borderColor: '#314255',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val} ${currentConf.unit}`, currentConf.label]}
                  labelFormatter={(label: any) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke={currentConf.color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#hourlyGrad-${activeMetric})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
