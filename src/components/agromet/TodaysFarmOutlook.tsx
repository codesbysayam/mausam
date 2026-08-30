import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { CloudRain, Droplets, Thermometer, Wind, Sun, Sprout, ArrowUpRight, Compass } from 'lucide-react';
import { AgrometTooltip } from './AgrometTooltip';

interface TodaysFarmOutlookProps {
  bulletin: ExtendedAgrometBulletin;
}

export const TodaysFarmOutlook: React.FC<TodaysFarmOutlookProps> = ({ bulletin }) => {
  const todayRain = bulletin.rainfall5DaysList[0]?.amountMm || 0;
  const todayProb = bulletin.rainfall5DaysList[0]?.probPercent || 40;
  const soil = bulletin.soilMoisture;

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71] animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">
              Today&apos;s Farm Outlook
            </h2>
          </div>
          <p className="text-xs text-[#93A4B8]">
            Key atmospheric conditions governing crop phenology, irrigation need, and field operations today.
          </p>
        </div>
        <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 self-start sm:self-auto font-mono">
          <span>Synced: 08:30 IST</span>
          <span className="text-[#334155]">•</span>
          <span className="text-[#2ECC71]">Active Agronomic Scan</span>
        </div>
      </div>

      {/* 6 Distinct Visual Agricultural Weather Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Rainfall: Animated Bar & Quantitative Outlook */}
        <div className="relative overflow-hidden rounded-xl bg-[#111A24] border border-[#1E2E40] p-4 flex flex-col justify-between hover:border-[#38BDF8]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5" />
              Precipitation
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] font-mono">
              {todayProb}% Prob
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-white">
                {todayRain}
              </span>
              <span className="text-xs font-semibold text-[#38BDF8]">mm QPF</span>
            </div>
            <span className="text-[11px] text-[#93A4B8] block mt-0.5">
              {todayRain > 15 ? 'Heavy shower spell' : todayRain > 5 ? 'Light to moderate rain' : todayRain > 0 ? 'Passing light showers' : 'Dry / No rain'}
            </span>
          </div>

          {/* Precipitation Visual Bar */}
          <div className="w-full bg-[#182635] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#38BDF8] to-[#2563EB] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(8, (todayRain / 30) * 100))}%` }}
            />
          </div>
        </div>

        {/* 2. Soil Moisture: Multi-layer Gauge */}
        <div className="relative overflow-hidden rounded-xl bg-[#111A24] border border-[#1E2E40] p-4 flex flex-col justify-between hover:border-[#2ECC71]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#2ECC71] uppercase tracking-wider flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5" />
              Soil Moisture
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] font-semibold">
              {soil.status}
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-white">
                {soil.overallPct}%
              </span>
              <span className="text-xs text-[#93A4B8]">
                {soil.trend === 'increasing' ? '↑ Rising' : soil.trend === 'decreasing' ? '↓ Depleting' : '→ Stable'}
              </span>
            </div>
            <span className="text-[11px] text-[#93A4B8] block mt-0.5">
              Root zone: <strong className="text-white">{soil.rootZonePct}%</strong> capacity
            </span>
          </div>

          {/* Stepped Soil Layer Bars */}
          <div className="grid grid-cols-3 gap-1">
            <div title="Topsoil 0-15cm" className="h-2 rounded bg-[#2ECC71]/80" />
            <div title="Rootzone 15-45cm" className="h-2 rounded bg-[#2ECC71]" />
            <div title="Subsoil 45-100cm" className="h-2 rounded bg-[#2ECC71]/60" />
          </div>
        </div>

        {/* 3. Temperature: Min / Max Diurnal Range */}
        <div className="relative overflow-hidden rounded-xl bg-[#111A24] border border-[#1E2E40] p-4 flex flex-col justify-between hover:border-[#F59E0B]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" />
              Thermal Span
            </span>
            <span className="text-[10px] text-[#93A4B8] font-mono">GDD +14.2</span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-white">31°</span>
              <span className="text-base font-bold font-mono text-[#93A4B8]">/ 24°C</span>
            </div>
            <span className="text-[11px] text-[#93A4B8] block mt-0.5">
              Diurnal Delta: <strong className="text-[#F4F7FA]">7°C range</strong>
            </span>
          </div>

          {/* Temperature Range Gradient Bar */}
          <div className="w-full bg-[#182635] h-2 rounded-full overflow-hidden relative">
            <div
              className="absolute left-1/4 right-1/4 h-full bg-gradient-to-r from-[#38BDF8] via-[#F59E0B] to-[#EF4444] rounded-full"
            />
          </div>
        </div>

        {/* 4. Atmospheric Humidity: Circular Arc Metric */}
        <div className="relative overflow-hidden rounded-xl bg-[#111A24] border border-[#1E2E40] p-4 flex flex-col justify-between hover:border-[#06B6D4]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#06B6D4] uppercase tracking-wider flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" />
              Canopy Humidity
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] font-semibold">
              High Spore Risk
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-white">82%</span>
              <span className="text-xs text-[#93A4B8]">Morning</span>
            </div>
            <span className="text-[11px] text-[#93A4B8] block mt-0.5">
              Leaf wetness: <strong className="text-white">~7.5 hrs/day</strong>
            </span>
          </div>

          <div className="w-full bg-[#182635] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] rounded-full"
              style={{ width: '82%' }}
            />
          </div>
        </div>

        {/* 5. Wind: Compass Direction & Spray Drift Safety */}
        <div className="relative overflow-hidden rounded-xl bg-[#111A24] border border-[#1E2E40] p-4 flex flex-col justify-between hover:border-[#A855F7]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#A855F7] uppercase tracking-wider flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" />
              Surface Wind
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] font-semibold">
              Safe Spray
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-white">12</span>
              <span className="text-xs font-semibold text-[#A855F7]">km/h</span>
              <span className="text-xs font-mono text-[#93A4B8]">SE</span>
            </div>
            <span className="text-[11px] text-[#93A4B8] block mt-0.5">
              Gusts up to <strong className="text-white">18 km/h</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#93A4B8]">
            <Compass className="w-3 h-3 text-[#A855F7]" />
            <span>Low chemical spray drift</span>
          </div>
        </div>

        {/* 6. Solar Radiation / Evapotranspiration */}
        <div className="relative overflow-hidden rounded-xl bg-[#111A24] border border-[#1E2E40] p-4 flex flex-col justify-between hover:border-[#EAB308]/50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#EAB308] uppercase tracking-wider flex items-center gap-1">
              <Sun className="w-3.5 h-3.5" />
              <AgrometTooltip term="ET Rate" explanation="Reference Evapotranspiration (ET0) is the rate at which water is lost from soil evaporation and plant transpiration in mm/day.">
                ET Rate
              </AgrometTooltip>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAB308]/15 text-[#EAB308] font-semibold">
              Moderate
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-white">4.8</span>
              <span className="text-xs font-semibold text-[#EAB308]">mm/day</span>
            </div>
            <span className="text-[11px] text-[#93A4B8] block mt-0.5">
              Solar UV: <strong className="text-white">6.5 (Moderate)</strong>
            </span>
          </div>

          <div className="w-full bg-[#182635] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#EAB308] to-[#F97316] rounded-full"
              style={{ width: '48%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
