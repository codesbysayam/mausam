import React from 'react';
import {
  SprayCan,
  Wind,
  CloudRain,
  Thermometer,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import { CropType, PhenologicalStage } from '../../services/agronomicEngine';

interface SprayingWindowAnalyzerProps {
  weather?: WeatherDataBundle;
  selectedCrop: CropType;
  selectedStage: PhenologicalStage;
  district: string;
}

export const SprayingWindowAnalyzer: React.FC<SprayingWindowAnalyzerProps> = ({
  weather,
  selectedCrop,
  selectedStage,
  district,
}) => {
  const hourly = weather?.hourly || [];
  const sampleHours = [
    { label: '06:00 IST', index: 6, title: 'Dawn / Early Morning' },
    { label: '09:00 IST', index: 9, title: 'Mid Morning' },
    { label: '12:00 IST', index: 12, title: 'Noon' },
    { label: '15:00 IST', index: 15, title: 'Afternoon' },
    { label: '18:00 IST', index: 18, title: 'Dusk / Evening' },
    { label: '21:00 IST', index: 21, title: 'Night' },
    { label: '+24h 06:00', index: 30, title: 'Tomorrow Morning' },
    { label: '+24h 15:00', index: 39, title: 'Tomorrow Afternoon' },
  ];

  const windows = sampleHours.map(({ label, index, title }) => {
    const item = hourly[index];
    const temp = item ? Math.round(item.temp) : 28;
    const wind = item ? Math.round(item.windSpeed) : 10;
    const rainProb = item ? item.rainProb : 15;
    const humidity = item ? Math.round(item.humidity) : 70;

    let suitability: 'IDEAL' | 'ACCEPTABLE' | 'AVOID' = 'IDEAL';
    let suitabilityColor = 'emerald';
    let advice = 'Calm winds and good humidity promote optimum droplet adhesion.';

    if (rainProb > 45 || wind > 18 || temp > 36) {
      suitability = 'AVOID';
      suitabilityColor = 'rose';
      advice = rainProb > 45
        ? 'High wash-off risk from expected rain.'
        : wind > 18
        ? 'High spray drift risk (>18 km/h).'
        : 'Extreme heat causes rapid evaporation and leaf scorch.';
    } else if (wind > 12 || temp > 32 || humidity < 40) {
      suitability = 'ACCEPTABLE';
      suitabilityColor = 'amber';
      advice = 'Use coarse spray nozzles and anti-drift surfactants.';
    }

    return {
      label,
      title,
      temp,
      wind,
      rainProb,
      humidity,
      suitability,
      suitabilityColor,
      advice,
    };
  });

  return (
    <section
      id="agromet-spraying-window"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SprayCan className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              SPRAYING WINDOW &amp; DRIFT HAZARD ANALYZER
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            Hourly suitability index for pesticide, fungicide, &amp; foliar micronutrient applications in {district}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" /> IDEAL
          </span>
          <span className="flex items-center gap-1 text-[#F59E0B]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> ACCEPTABLE
          </span>
          <span className="flex items-center gap-1 text-[#EF4444]">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> AVOID
          </span>
        </div>
      </div>

      {/* Grid of Hourly Windows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {windows.map((w, idx) => {
          let badgeBg = 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]';
          let borderAccent = 'border-l-4 border-l-[#10B981]';
          if (w.suitability === 'ACCEPTABLE') {
            badgeBg = 'bg-[#F59E0B]/20 border-[#F59E0B]/40 text-[#F59E0B]';
            borderAccent = 'border-l-4 border-l-[#F59E0B]';
          } else if (w.suitability === 'AVOID') {
            badgeBg = 'bg-[#EF4444]/20 border-[#EF4444]/40 text-[#EF4444]';
            borderAccent = 'border-l-4 border-l-[#EF4444]';
          }

          return (
            <div
              key={idx}
              className={`rounded-xl bg-[#0F172A] border border-[#1E293B] ${borderAccent} p-4 flex flex-col justify-between space-y-3 hover:border-[#334155] transition-all shadow-md`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    {w.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    {w.title}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeBg}`}>
                  {w.suitability}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#CBD5E1] bg-[#090D16] p-2 rounded-lg border border-[#1E293B]">
                <div>Wind: <strong className="text-white">{w.wind} km/h</strong></div>
                <div>Rain: <strong className="text-[#38BDF8]">{w.rainProb}%</strong></div>
                <div>Temp: <strong className="text-white">{w.temp}°C</strong></div>
                <div>RH: <strong className="text-white">{w.humidity}%</strong></div>
              </div>

              {/* Advice */}
              <p className="text-[11px] text-[#94A3B8] leading-tight pt-1">
                {w.advice}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
