// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Air Quality Intelligence Answer Component
// ====================================================================

import React from 'react';
import { AqiContext } from '../../types/askMausam';

interface AQIAnswerProps {
  aqi?: AqiContext;
  locationName: string;
}

export const AQIAnswer: React.FC<AQIAnswerProps> = ({ aqi, locationName }) => {
  if (!aqi || aqi.status === 'UNAVAILABLE') {
    return (
      <div className="mt-2.5 p-3.5 rounded-xl bg-[#0C1523] border border-[#1F2C3F] text-[#94A3B8] text-xs">
        <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider block mb-1">
          Air Quality Telemetry
        </span>
        Official air quality continuous monitoring station data is currently unavailable for <strong className="text-white">{locationName}</strong>. Atmospheric surface weather parameters continue to stream live.
      </div>
    );
  }

  const score = aqi.index ?? 0;
  const isGood = score <= 50;
  const isSatisfactory = score > 50 && score <= 100;
  const isModerate = score > 100 && score <= 200;
  const isPoor = score > 200 && score <= 300;
  const isVeryPoor = score > 300 && score <= 400;
  const isSevere = score > 400;

  const categoryColor = isGood
    ? 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30'
    : isSatisfactory
    ? 'text-[#84CC16] bg-[#84CC16]/15 border-[#84CC16]/30'
    : isModerate
    ? 'text-[#EAB308] bg-[#EAB308]/15 border-[#EAB308]/30'
    : isPoor
    ? 'text-[#F97316] bg-[#F97316]/15 border-[#F97316]/30'
    : isVeryPoor
    ? 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30'
    : 'text-[#DC2626] bg-[#DC2626]/20 border-[#DC2626]/40';

  return (
    <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl bg-[#0C1523] border border-[#1F2C3F] flex flex-col gap-3 text-[#D7DEE8]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1A2638]">
        <div>
          <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">
            Air Quality Index (NAQI)
          </span>
          <h3 className="text-sm font-semibold text-white mt-0.5">{locationName}</h3>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${categoryColor}`}>
          {aqi.category}
        </span>
      </div>

      {/* Main Score & Pollutant */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
            {aqi.index ?? 'N/A'}
          </span>
          <span className="text-xs text-[#94A3B8]">AQI (CPCB Scale)</span>
        </div>
        {aqi.dominantPollutant && (
          <span className="text-xs text-[#94A3B8]">
            Dominant: <strong className="text-white">{aqi.dominantPollutant}</strong>
          </span>
        )}
      </div>

      {/* Pollutant Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {aqi.pm25 !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">PM2.5 Concentration</span>
            <span className="font-semibold text-white font-mono mt-0.5">{aqi.pm25} µg/m³</span>
          </div>
        )}
        {aqi.pm10 !== undefined && (
          <div className="p-2 rounded-lg bg-[#121D2C] border border-[#1A2638] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">PM10 Concentration</span>
            <span className="font-semibold text-white font-mono mt-0.5">{aqi.pm10} µg/m³</span>
          </div>
        )}
      </div>

      {/* Health Precaution */}
      <div className="p-2.5 rounded-lg bg-[#121D2C] border border-[#1A2638] text-xs text-[#94A3B8] leading-relaxed">
        {isGood && 'Air quality is considered satisfactory, and air pollution poses little or no risk.'}
        {isSatisfactory && 'Minor breathing discomfort may be experienced by hypersensitive people.'}
        {isModerate && 'Breathing discomfort possible to people with lungs, asthma, and heart diseases.'}
        {isPoor && 'Breathing discomfort to most people on prolonged exposure. Avoid strenuous outdoor activities.'}
        {isVeryPoor && 'Respiratory illness on prolonged exposure. Sensitive groups should remain indoors.'}
        {isSevere && 'Healthy people impacted. Serious impacts on those with existing diseases. Keep windows closed.'}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1.5 border-t border-[#1A2638]">
        <span>Source: {aqi.source || 'CPCB / Open-Meteo Atmospheric Chemistry'}</span>
        {aqi.observedAt && <span>Observed: {aqi.observedAt}</span>}
      </div>
    </div>
  );
};
