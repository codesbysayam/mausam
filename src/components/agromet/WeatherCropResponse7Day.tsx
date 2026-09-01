import React, { useState } from 'react';
import {
  Calendar,
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronRight,
  Sun,
  CloudSun,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import {
  CropType,
  PhenologicalStage,
  generate7DayAgriculturalForecast,
  SevenDayAgriculturalItem,
} from '../../services/agronomicEngine';

interface WeatherCropResponse7DayProps {
  weather?: WeatherDataBundle;
  selectedCrop: CropType;
  selectedStage: PhenologicalStage;
  district: string;
}

export const WeatherCropResponse7Day: React.FC<WeatherCropResponse7DayProps> = ({
  weather,
  selectedCrop,
  selectedStage,
  district,
}) => {
  const forecastItems = generate7DayAgriculturalForecast(weather, selectedCrop, selectedStage);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const selectedDay = forecastItems[selectedDayIdx] || forecastItems[0];

  const getSuitabilityPill = (type: 'irrigation' | 'spraying' | 'harvesting', value: string, color: string) => {
    let bg = 'bg-[#1E293B] text-[#94A3B8] border-[#334155]';
    if (color === 'emerald') bg = 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30';
    else if (color === 'amber') bg = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
    else if (color === 'rose') bg = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
    else if (color === 'cyan') bg = 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${bg}`}>
        {value}
      </span>
    );
  };

  return (
    <section
      id="agromet-7day-crop-response"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#38BDF8]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              7-DAY WEATHER &amp; CROP RESPONSE OUTLOOK
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            Dynamic physiological impact matrix &amp; operational suitability for {selectedCrop}
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1.5 rounded-lg w-fit">
          Click any day to inspect field readiness
        </div>
      </div>

      {/* 7-Day Interactive Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {forecastItems.map((item, idx) => {
          const isSelected = idx === selectedDayIdx;

          return (
            <div
              key={item.dayName}
              id={`forecast-day-card-${idx}`}
              onClick={() => setSelectedDayIdx(idx)}
              className={`rounded-xl p-3.5 flex flex-col justify-between space-y-3 cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-[#1E293B] border-[#38BDF8] shadow-lg ring-1 ring-[#38BDF8]/40'
                  : 'bg-[#0F172A] border-[#1E293B] hover:border-[#334155] opacity-90'
              }`}
            >
              {/* Day & Date */}
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <span className={`text-xs font-mono font-bold ${isSelected ? 'text-[#38BDF8]' : 'text-white'}`}>
                  {item.dayName}
                </span>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  {item.dateStr}
                </span>
              </div>

              {/* Rain & Temp Highlights */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#94A3B8]">Temp:</span>
                  <span className="text-white font-bold">{item.tempMax}° / {item.tempMin}°</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#38BDF8]">Rain:</span>
                  <span className="text-[#38BDF8] font-bold">
                    {item.rainMm} mm ({item.rainProb}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                  <span>Wind:</span>
                  <span>{item.windKmh} km/h</span>
                </div>
              </div>

              {/* Suitability Pills */}
              <div className="pt-2 border-t border-[#1E293B] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#94A3B8]">Irrig:</span>
                  {getSuitabilityPill('irrigation', item.fieldSuitability.irrigation, item.fieldSuitability.irrigationColor)}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#94A3B8]">Spray:</span>
                  {getSuitabilityPill('spraying', item.fieldSuitability.spraying, item.fieldSuitability.sprayingColor)}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#94A3B8]">Harv:</span>
                  {getSuitabilityPill('harvesting', item.fieldSuitability.harvesting, item.fieldSuitability.harvestingColor)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Deep Dive Panel */}
      {selectedDay && (
        <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#10B981]" />
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Agronomic Interpretation for {selectedDay.dayName} ({selectedDay.dateStr})
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-[#CBD5E1]">
              <span>Max Temp: <strong className="text-white">{selectedDay.tempMax}°C</strong></span>
              <span>Precipitation: <strong className="text-[#38BDF8]">{selectedDay.rainMm} mm</strong></span>
              <span>Relative Humidity: <strong className="text-white">{selectedDay.humidity}%</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 bg-[#090D16] border border-[#1E293B] rounded-lg p-3.5 space-y-1">
              <span className="text-[11px] font-mono font-bold text-[#10B981] uppercase">
                {selectedCrop} Stage Impact:
              </span>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                {selectedDay.cropImpact}
              </p>
            </div>

            <div className="md:col-span-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#090D16] border border-[#1E293B] rounded-lg p-2.5 space-y-1">
                <span className="text-[10px] font-mono text-[#94A3B8] block">Irrigation</span>
                {getSuitabilityPill('irrigation', selectedDay.fieldSuitability.irrigation, selectedDay.fieldSuitability.irrigationColor)}
              </div>
              <div className="bg-[#090D16] border border-[#1E293B] rounded-lg p-2.5 space-y-1">
                <span className="text-[10px] font-mono text-[#94A3B8] block">Spraying</span>
                {getSuitabilityPill('spraying', selectedDay.fieldSuitability.spraying, selectedDay.fieldSuitability.sprayingColor)}
              </div>
              <div className="bg-[#090D16] border border-[#1E293B] rounded-lg p-2.5 space-y-1">
                <span className="text-[10px] font-mono text-[#94A3B8] block">Harvesting</span>
                {getSuitabilityPill('harvesting', selectedDay.fieldSuitability.harvesting, selectedDay.fieldSuitability.harvestingColor)}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
