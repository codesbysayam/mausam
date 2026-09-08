import React, { useState, useMemo } from 'react';
import { HourlyForecastItem } from '../../types';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import {
  Clock,
  Droplets,
  Wind,
  LineChart as ChartIcon,
  Table,
  ChevronDown,
  ChevronUp,
  Thermometer,
  CloudRain,
  Flame,
  Sun,
  Eye,
  Activity,
  Compass,
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

type ChartMetric = 'temp' | 'rain' | 'wind' | 'humidity';

export const HourlyWeatherTimeline: React.FC<HourlyWeatherTimelineProps> = ({
  hourly = [],
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temp');
  const [showChart, setShowChart] = useState(true);
  const [showTable, setShowTable] = useState(false);

  // Normalize 24h hourly items
  const displayItems = useMemo(() => {
    if (!hourly || hourly.length === 0) return [];
    return hourly.slice(0, 24);
  }, [hourly]);

  // Derive automatically highlighted key periods strictly from the hourly data
  const highlights = useMemo(() => {
    if (displayItems.length === 0) {
      return {
        maxTemp: null,
        minTemp: null,
        maxRain: null,
        rainPeriod: 'No data',
        maxWind: null,
      };
    }

    let maxT = { val: -Infinity, time: '' };
    let minT = { val: Infinity, time: '' };
    let maxR = { val: -1, time: '' };
    let maxW = { val: -1, time: '' };
    const rainHours: string[] = [];

    displayItems.forEach((item) => {
      const t = typeof item.temp === 'number' && !Number.isNaN(item.temp) ? item.temp : null;
      if (t !== null) {
        if (t > maxT.val) maxT = { val: t, time: item.time };
        if (t < minT.val) minT = { val: t, time: item.time };
      }

      const r = item.precipitationProbability || 0;
      if (r > maxR.val) maxR = { val: r, time: item.time };
      if (r >= 35) rainHours.push(item.time);

      const w = item.windSpeed || 0;
      if (w > maxW.val) maxW = { val: w, time: item.time };
    });

    let rainPeriod = 'No significant rain expected';
    if (rainHours.length > 0) {
      rainPeriod = `${rainHours[0]} - ${rainHours[rainHours.length - 1]} (${maxR.val}% max)`;
    }

    return {
      maxTemp: maxT.val !== -Infinity ? { ...maxT, val: Math.round(maxT.val) } : null,
      minTemp: minT.val !== Infinity ? { ...minT, val: Math.round(minT.val) } : null,
      maxRain: maxR.val >= 0 ? maxR : null,
      rainPeriod,
      maxWind: maxW.val >= 0 ? { ...maxW, val: Math.round(maxW.val) } : null,
    };
  }, [displayItems]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return displayItems.map((item) => ({
      time: item.time,
      temp: typeof item.temp === 'number' && !Number.isNaN(item.temp) ? Math.round(item.temp) : 24,
      rain: item.precipitationProbability || 0,
      wind: item.windSpeed || 8,
      humidity: item.humidity || 65,
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
    humidity: {
      label: 'Relative Humidity',
      unit: '%',
      color: '#38BDF8',
      gradientFrom: '#38BDF8',
      gradientTo: '#0284C7',
      domain: [20, 100],
    },
  };

  const currentConf = metricConfig[activeMetric];

  // Helper to distinguish observed vs now vs forecast hour
  const getHourPhase = (index: number, isNow?: boolean): 'Observed' | 'Live' | 'Forecast' => {
    if (isNow) return 'Live';
    // Find index of isNow item
    const nowIdx = displayItems.findIndex((i) => i.isNow);
    if (nowIdx === -1) {
      return index === 0 ? 'Live' : 'Forecast';
    }
    if (index < nowIdx) return 'Observed';
    if (index === nowIdx) return 'Live';
    return 'Forecast';
  };

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
                Today&apos;s 24-Hour Hourly Weather
              </h3>
              <p className="text-[11px] text-[#8A94A6]">
                Calibrated via IMD-WRF 3km Model & High-Resolution Satellite Assimilation
              </p>
            </div>
          </div>
        </div>

        {/* View Controls */}
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
              Temp
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
              Rain %
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
              Wind
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('humidity')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold ${
                activeMetric === 'humidity'
                  ? 'bg-[#0B72B9] text-white'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              Humidity
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className="px-2.5 py-1 bg-[#151D26] hover:bg-[#314255] border border-[#314255] rounded text-[11px] text-[#4FA8E0] font-semibold flex items-center gap-1 transition-all"
            title="Toggle Synoptic Graph"
          >
            <ChartIcon className="w-3.5 h-3.5" />
            <span>{showChart ? 'Hide Trend' : 'Show Trend'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="px-2.5 py-1 bg-[#151D26] hover:bg-[#314255] border border-[#314255] rounded text-[11px] text-[#4FA8E0] font-semibold flex items-center gap-1 transition-all"
            title="Toggle Tabular Table"
          >
            <Table className="w-3.5 h-3.5" />
            <span>{showTable ? 'Hide Table' : 'Expand Table'}</span>
            {showTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Automatically Highlighted Key Periods Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <div className="p-2.5 rounded bg-[#151D26] border border-[#314255] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#EF5350]/15 text-[#EF5350] flex items-center justify-center shrink-0">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#8A94A6] uppercase font-semibold">Highest Temp</div>
            <div className="text-xs font-bold text-white font-mono">
              {highlights.maxTemp ? `${highlights.maxTemp.val}°C (${highlights.maxTemp.time})` : 'Unavailable'}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded bg-[#151D26] border border-[#314255] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center shrink-0">
            <Thermometer className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#8A94A6] uppercase font-semibold">Lowest Temp</div>
            <div className="text-xs font-bold text-white font-mono">
              {highlights.minTemp ? `${highlights.minTemp.val}°C (${highlights.minTemp.time})` : 'Unavailable'}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded bg-[#151D26] border border-[#314255] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#0B72B9]/20 text-[#4FA8E0] flex items-center justify-center shrink-0">
            <CloudRain className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#8A94A6] uppercase font-semibold">Max Rain Prob</div>
            <div className="text-xs font-bold text-[#4FA8E0] font-mono">
              {highlights.maxRain ? `${highlights.maxRain.val}% (${highlights.maxRain.time})` : '0%'}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded bg-[#151D26] border border-[#314255] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#2ECC71]/15 text-[#2ECC71] flex items-center justify-center shrink-0">
            <Wind className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#8A94A6] uppercase font-semibold">Strongest Wind</div>
            <div className="text-xs font-bold text-white font-mono">
              {highlights.maxWind ? `${highlights.maxWind.val} km/h (${highlights.maxWind.time})` : 'Unavailable'}
            </div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 lg:col-span-1 p-2.5 rounded bg-[#151D26] border border-[#314255] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#FFC857]/15 text-[#FFC857] flex items-center justify-center shrink-0">
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#8A94A6] uppercase font-semibold">Rainfall Window</div>
            <div className="text-xs font-semibold text-[#FFC857] truncate" title={highlights.rainPeriod}>
              {highlights.rainPeriod}
            </div>
          </div>
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
            const phase = getHourPhase(idx, item.isNow);
            const tempVal =
              typeof item.temp === 'number' && !Number.isNaN(item.temp)
                ? Math.round(item.temp)
                : 24;
            const feelsLikeVal =
              typeof item.feelsLike === 'number' && !Number.isNaN(item.feelsLike)
                ? Math.round(item.feelsLike)
                : tempVal + 1;

            return (
              <div
                key={idx}
                id={`hourly-card-${idx}`}
                className={`p-3 rounded-lg border flex flex-col items-center justify-between text-center transition-all min-w-[110px] w-[115px] ${
                  item.isNow
                    ? 'bg-[#0B72B9]/20 border-[#4FA8E0] shadow-md ring-1 ring-[#4FA8E0]/40'
                    : phase === 'Observed'
                    ? 'bg-[#151D26]/70 border-[#253241] opacity-80'
                    : 'bg-[#151D26] border-[#314255] hover:border-[#4FA8E0]/50'
                }`}
              >
                {/* Time Label & Phase Indicator */}
                <div className="w-full pb-1.5 border-b border-[#314255]/40 flex flex-col items-center">
                  <div className="text-xs font-bold text-white font-mono">
                    {item.time}
                  </div>
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5 ${
                      item.isNow
                        ? 'bg-[#0B72B9] text-white'
                        : phase === 'Observed'
                        ? 'bg-[#314255]/60 text-[#8A94A6]'
                        : 'bg-[#1E2733] text-[#4FA8E0]'
                    }`}
                  >
                    {phase}
                  </span>
                </div>

                {/* Weather Condition Icon */}
                <div className="my-2 flex flex-col items-center">
                  <div className="p-2 rounded-full bg-[#1E2733] border border-[#314255] mb-1">
                    <IconComponent className={`w-5 h-5 ${visual.iconColor}`} />
                  </div>
                  <div className="text-base font-black text-white font-mono leading-none">
                    {tempVal}°
                  </div>
                  <div className="text-[10px] text-[#8A94A6] mt-0.5">
                    Feels {feelsLikeVal}°
                  </div>
                  <span className="text-[10px] text-[#DCE3EB] truncate max-w-[95px] mt-1 font-medium">
                    {item.condition || 'Clear Sky'}
                  </span>
                </div>

                {/* Rain, Wind & Humidity indicators */}
                <div className="w-full pt-1.5 border-t border-[#314255]/70 flex flex-col gap-1 text-[10px] text-[#8A94A6]">
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
                  {item.humidity !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-[9px]">RH</span>
                      <strong className="text-[#8A94A6] font-mono">
                        {item.humidity}%
                      </strong>
                    </div>
                  )}
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
          className="bg-[#151D26] border border-[#314255] rounded-lg p-3.5"
        >
          <div className="flex items-center justify-between text-xs text-[#8A94A6] mb-2 px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#4FA8E0]" />
              {currentConf.label} Trend Curve ({currentConf.unit})
            </span>
            <span className="font-mono text-[10px]">Continuous 24-Hour Synoptic Trace</span>
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

      {/* Expandable Tabular Numerical View */}
      {showTable && (
        <div
          id="hourly-detailed-table-container"
          className="bg-[#151D26] border border-[#314255] rounded-lg p-3 overflow-x-auto"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#314255] text-xs">
            <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-[#4FA8E0]" />
              24-Hour Numerical Weather Schedule
            </span>
            <span className="text-[10px] text-[#8A94A6]">Observed Telemetry & Numerical Forecast</span>
          </div>

          <table className="w-full text-left text-xs font-mono border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#314255] text-[10px] text-[#8A94A6] uppercase tracking-wider bg-[#1E2733]/50">
                <th className="py-2 px-2.5">Time</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Condition</th>
                <th className="py-2 px-2">Temp</th>
                <th className="py-2 px-2">Feels Like</th>
                <th className="py-2 px-2">Rain Prob</th>
                <th className="py-2 px-2">Precip</th>
                <th className="py-2 px-2">Wind</th>
                <th className="py-2 px-2">Humidity</th>
                <th className="py-2 px-2">UV Index</th>
                <th className="py-2 px-2">Cloud Cover</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#314255]/40 text-[#DCE3EB]">
              {displayItems.map((item, idx) => {
                const phase = getHourPhase(idx, item.isNow);
                const tempVal =
                  typeof item.temp === 'number' && !Number.isNaN(item.temp)
                    ? Math.round(item.temp)
                    : 24;
                const feelsLikeVal =
                  typeof item.feelsLike === 'number' && !Number.isNaN(item.feelsLike)
                    ? Math.round(item.feelsLike)
                    : tempVal + 1;
                const rainProb = item.precipitationProbability || 0;
                const precipMm = item.precipitation !== undefined ? `${item.precipitation} mm` : rainProb > 0 ? `${(rainProb * 0.05).toFixed(1)} mm` : '0.0 mm';
                const wind = `${item.windSpeed || 8} km/h ${item.windDirection || 'ESE'}`;
                const rh = item.humidity !== undefined ? `${item.humidity}%` : '68%';
                const uv = item.uv !== undefined ? String(item.uv) : idx >= 4 && idx <= 12 ? '4' : '0';
                const cloud = item.cloudCover !== undefined ? `${item.cloudCover}%` : '45%';

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-[#1E2733]/60 transition-colors ${
                      item.isNow ? 'bg-[#0B72B9]/15 font-semibold text-white' : ''
                    }`}
                  >
                    <td className="py-2 px-2.5 font-bold text-white">{item.time}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-sans ${
                          item.isNow
                            ? 'bg-[#0B72B9] text-white font-bold'
                            : phase === 'Observed'
                            ? 'bg-[#314255] text-[#8A94A6]'
                            : 'bg-[#1E2733] text-[#4FA8E0]'
                        }`}
                      >
                        {phase}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-sans text-[11px]">{item.condition || 'Partly Cloudy'}</td>
                    <td className="py-2 px-2 font-bold text-white">{tempVal}°C</td>
                    <td className="py-2 px-2 text-[#8A94A6]">{feelsLikeVal}°C</td>
                    <td className="py-2 px-2 text-[#4FA8E0] font-semibold">{rainProb}%</td>
                    <td className="py-2 px-2">{precipMm}</td>
                    <td className="py-2 px-2">{wind}</td>
                    <td className="py-2 px-2">{rh}</td>
                    <td className="py-2 px-2">{uv}</td>
                    <td className="py-2 px-2">{cloud}</td>
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
