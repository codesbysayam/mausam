import React from 'react';
import { AuthoritativeAQI, AuthoritativePollen } from '../../../services/authoritativeService';

interface HealthCardProps {
  aqi: AuthoritativeAQI;
  pollen: AuthoritativePollen;
  uvIndex: number;
  uvRiskLabel: string;
  uvAdvice: string;
  humidity: number;
  city: string;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  aqi,
  pollen,
  uvIndex,
  uvRiskLabel,
  uvAdvice,
  humidity,
  city,
}) => {
  // CPCB Standard color mapping
  const aqiBadgeColor =
    aqi.category === 'Good'
      ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40'
      : aqi.category === 'Satisfactory'
      ? 'bg-[#27AE60]/15 text-[#27AE60] border-[#27AE60]/40'
      : aqi.category === 'Moderate'
      ? 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40'
      : aqi.category === 'Poor'
      ? 'bg-[#FF8C42]/15 text-[#FF8C42] border-[#FF8C42]/40'
      : aqi.category === 'Very Poor'
      ? 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40'
      : 'bg-[#8E44AD]/15 text-[#8E44AD] border-[#8E44AD]/40';

  const uvBadgeColor =
    uvIndex <= 2
      ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40'
      : uvIndex <= 5
      ? 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40'
      : uvIndex <= 7
      ? 'bg-[#FF8C42]/15 text-[#FF8C42] border-[#FF8C42]/40'
      : uvIndex <= 10
      ? 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40'
      : 'bg-[#8E44AD]/15 text-[#8E44AD] border-[#8E44AD]/40';

  const pollenBadgeColor =
    pollen.riskCategory === 'Low'
      ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40'
      : pollen.riskCategory === 'Moderate'
      ? 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40'
      : pollen.riskCategory === 'High'
      ? 'bg-[#FF8C42]/15 text-[#FF8C42] border-[#FF8C42]/40'
      : 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40';

  return (
    <div className="mausam-card p-4 sm:p-5 border border-[#334155] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#1ABC9C]/15 text-[#1ABC9C] flex items-center justify-center border border-[#1ABC9C]/30">
              <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Health &amp; Environmental Air
              </h3>
              <p className="text-[11px] text-[#8A94A6]">
                CPCB NAQI &amp; Aero-Allergen Surveillance • {city}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-[#1E2733] text-[#4FA8E0] px-2 py-0.5 rounded border border-[#334155]">
            Live Feed
          </span>
        </div>

        {/* 4-Column Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {/* AQI */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8A94A6]">CPCB AQI</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${aqiBadgeColor}`}>
                {aqi.category}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold font-mono text-white">{aqi.aqi}</span>
              <span className="text-[10px] text-[#8A94A6]">Index</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1">
              Dominant: <strong className="text-[#D7DEE8]">{aqi.dominantPollutant}</strong>
            </span>
          </div>

          {/* Pollen */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8A94A6]">Pollen Count</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${pollenBadgeColor}`}>
                {pollen.riskCategory}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold font-mono text-white">{pollen.overallIndex}</span>
              <span className="text-[10px] text-[#8A94A6]">grains/m³</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1 truncate">
              Tree: {pollen.treePollen} • Grass: {pollen.grassPollen}
            </span>
          </div>

          {/* UV Index */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8A94A6]">UV Radiation</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${uvBadgeColor}`}>
                {uvRiskLabel}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold font-mono text-white">{uvIndex}</span>
              <span className="text-[10px] text-[#8A94A6]">/ 11+</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1 truncate">
              {uvIndex >= 6 ? 'High Solar Radiation' : 'Moderate Solar Flux'}
            </span>
          </div>

          {/* Humidity */}
          <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8A94A6]">Humidity</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0B72B9]/15 text-[#4FA8E0] border border-[#0B72B9]/40">
                {humidity > 70 ? 'High' : humidity > 40 ? 'Normal' : 'Dry'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold font-mono text-white">{humidity}</span>
              <span className="text-[10px] text-[#8A94A6]">% RH</span>
            </div>
            <span className="text-[10px] text-[#8A94A6] block mt-1 truncate">
              Dew Point: {Math.round(28 - (100 - humidity) / 5)}°C
            </span>
          </div>
        </div>

        {/* Actionable Health Advisory */}
        <div className="mt-3.5 p-3 rounded bg-[#131A22] border border-[#334155] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#1ABC9C] text-[18px] shrink-0 mt-0.5">
            medical_services
          </span>
          <div className="text-xs space-y-1">
            <p className="text-[#D7DEE8]">
              <strong>Health Guidance:</strong> {aqi.healthAdvice}
            </p>
            <p className="text-[11px] text-[#8A94A6]">
              <strong>Allergy Alert:</strong> {pollen.allergyTip} • <strong>UV:</strong> {uvAdvice}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Source */}
      <div className="mt-4 pt-3 border-t border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#8A94A6]">
        <span>Source: <strong>CPCB (Central Pollution Control Board) &amp; Open-Meteo Air Quality</strong></span>
        <span>Last Updated: {new Date(aqi.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST</span>
      </div>
    </div>
  );
};
