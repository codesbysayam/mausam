import React, { useState } from 'react';
import { HOURLY_FORECAST } from '../data/weatherData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const HourlyView: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'temp' | 'aqi' | 'rainProb' | 'windSpeed'>('temp');

  const chartColor =
    selectedMetric === 'temp'
      ? '#4FA8E0'
      : selectedMetric === 'aqi'
      ? '#FFB703'
      : selectedMetric === 'rainProb'
      ? '#0B72B9'
      : '#2ECC71';

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto select-none font-sans">
      {/* Top Header Card */}
      <div className="bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">schedule</span>
            <h2 className="font-h3 text-base font-bold text-[#FFFFFF]">
              24-Hour Atmospheric Hourly Matrix
            </h2>
          </div>
          <p className="text-xs text-[#8A94A6]">
            Synoptic Station Stream • High-frequency sensor matrix at 1-hour temporal resolution
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex gap-1.5 p-1 bg-[#0F141A] rounded-lg card-border">
          {[
            { id: 'temp', label: 'Temperature (°C)' },
            { id: 'aqi', label: 'PM2.5 (µg/m³)' },
            { id: 'rainProb', label: 'Precipitation (%)' },
            { id: 'windSpeed', label: 'Wind (km/h)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedMetric(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                selectedMetric === tab.id
                  ? 'bg-[#0B72B9] text-[#FFFFFF] shadow-sm'
                  : 'text-[#8A94A6] hover:text-[#FFFFFF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly Trend Chart */}
      <div className="bg-[#1E2733] card-border rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-h4 text-sm font-semibold text-[#FFFFFF]">
            Telemetry Curve ({selectedMetric.toUpperCase()})
          </h3>
          <span className="text-xs text-[#4FA8E0] font-medium">
            {selectedMetric === 'temp'
              ? 'Peak 31.0°C at 13:00 • Minimum 21.5°C at Dawn'
              : selectedMetric === 'aqi'
              ? 'Elevated until 18:00 Local • Nighttime dispersion expected'
              : selectedMetric === 'rainProb'
              ? 'Clearing trend throughout the evening'
              : 'Moderate breeze dying down after dusk'}
          </span>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_FORECAST} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(225,230,235,0.12)" />
              <XAxis
                dataKey="time"
                stroke="#8A94A6"
                tick={{ fill: '#8A94A6', fontSize: 11 }}
              />
              <YAxis
                stroke="#8A94A6"
                tick={{ fill: '#8A94A6', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F141A',
                  borderColor: 'rgba(225,230,235,0.12)',
                  borderRadius: 8,
                  color: '#F4F7FA',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke={chartColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#metricGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Detailed Cards Scroll Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {HOURLY_FORECAST.slice(0, 7).map((item, idx) => (
          <div
            key={item.time}
            className={`bg-[#0F141A] card-border rounded-xl p-3.5 flex flex-col items-center text-center gap-2 hover:border-[#0B72B9] transition-all cursor-pointer ${
              idx === 2 ? 'ring-1 ring-[#0B72B9] bg-[#1E2733]' : ''
            }`}
          >
            <span className="text-xs text-[#8A94A6]">
              {item.time} {idx === 2 ? '(NOW)' : ''}
            </span>
            <span
              className="material-symbols-outlined text-[28px] my-1 text-[#FFFFFF]"
            >
              {item.icon}
            </span>
            <span className="text-xl font-bold text-[#FFFFFF]">
              {item.temp}°C
            </span>
            <div className="w-full h-px bg-[rgba(225,230,235,0.12)] my-0.5"></div>
            <div className="w-full flex justify-between text-[11px] text-[#8A94A6]">
              <span>AQI</span>
              <span
                className="font-bold"
                style={{ color: item.aqi > 100 ? '#FFB703' : '#2ECC71' }}
              >
                {item.aqi}
              </span>
            </div>
            <div className="w-full flex justify-between text-[11px] text-[#8A94A6]">
              <span>Rain</span>
              <span className="text-[#4FA8E0]">{item.rainProb}%</span>
            </div>
            <div className="w-full flex justify-between text-[11px] text-[#8A94A6]">
              <span>Wind</span>
              <span>{item.windSpeed}k</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
