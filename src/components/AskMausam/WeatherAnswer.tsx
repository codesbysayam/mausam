// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Weather Answer Card Component
// ====================================================================

import React from 'react';
import { CurrentWeatherContext, DataSourceContext } from '../../types/askMausam';

interface WeatherAnswerProps {
  weather?: CurrentWeatherContext;
  locationName: string;
  source?: DataSourceContext;
}

export const WeatherAnswer: React.FC<WeatherAnswerProps> = ({ weather, locationName, source }) => {
  if (!weather) return null;

  return (
    <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl bg-[#0C1523] border border-[#1F2C3F] flex flex-col gap-3 text-[#D7DEE8]">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1A2638]">
        <div>
          <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">
            Current Atmospheric Telemetry
          </span>
          <h3 className="text-sm font-semibold text-white mt-0.5">{locationName}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[10px] font-mono font-medium text-[#10B981] uppercase tracking-wide">
            {source?.status || 'LIVE'}
          </span>
        </div>
      </div>

      {/* Main Temperature & Condition Display */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
            {weather.temperatureC}°C
          </span>
          {weather.feelsLikeC !== undefined && (
            <span className="text-xs text-[#94A3B8]">
              Feels {weather.feelsLikeC}°C
            </span>
          )}
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-[#142030] text-[#38BDF8] text-xs font-semibold border border-[#1F2C3F]">
          {weather.condition}
        </span>
      </div>

      {/* Atmospheric Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {weather.humidity !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Relative Humidity</span>
            <span className="font-semibold text-white font-mono mt-0.5">{weather.humidity}%</span>
          </div>
        )}
        {weather.windSpeedKmh !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Wind Velocity</span>
            <span className="font-semibold text-white font-mono mt-0.5">
              {weather.windSpeedKmh} km/h {weather.windDirection ? `(${weather.windDirection})` : ''}
            </span>
          </div>
        )}
        {weather.precipitationProbability !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Rain Probability</span>
            <span className="font-semibold text-[#38BDF8] font-mono mt-0.5">
              {weather.precipitationProbability}%
            </span>
          </div>
        )}
        {weather.pressureHpa !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Barometric Pressure</span>
            <span className="font-semibold text-white font-mono mt-0.5">{weather.pressureHpa} hPa</span>
          </div>
        )}
        {weather.visibilityKm !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Horizontal Visibility</span>
            <span className="font-semibold text-white font-mono mt-0.5">{weather.visibilityKm} km</span>
          </div>
        )}
        {weather.uvIndex !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">UV Radiation Index</span>
            <span className="font-semibold text-white font-mono mt-0.5">{weather.uvIndex}</span>
          </div>
        )}
      </div>

      {/* Footer Attribution */}
      <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-2 border-t border-[#1A2638]">
        <span>Source: {source?.provider || 'Open-Meteo Telemetry'}</span>
        {weather.observedAt && (
          <span>Observed: {weather.observedAt}</span>
        )}
      </div>
    </div>
  );
};
