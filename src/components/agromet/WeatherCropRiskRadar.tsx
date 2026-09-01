import React from 'react';
import {
  AlertTriangle,
  Flame,
  DropletOff,
  CloudRain,
  Gauge,
  Wind,
  Bug,
  Activity,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import {
  CropType,
  PhenologicalStage,
  evaluateWeatherCropRisks,
  RiskFactorItem,
} from '../../services/agronomicEngine';

interface WeatherCropRiskRadarProps {
  weather?: WeatherDataBundle;
  selectedCrop: CropType;
  selectedStage: PhenologicalStage;
  district: string;
}

export const WeatherCropRiskRadar: React.FC<WeatherCropRiskRadarProps> = ({
  weather,
  selectedCrop,
  selectedStage,
  district,
}) => {
  const risks = evaluateWeatherCropRisks(weather, selectedCrop, selectedStage);

  const iconMap: Record<string, React.ElementType> = {
    heat: Flame,
    water_stress: DropletOff,
    excess_rain: CloudRain,
    high_humidity: Gauge,
    wind_damage: Wind,
    pest_pressure: Bug,
    disease_pressure: Activity,
  };

  const getLevelBadge = (level: RiskFactorItem['level'], color: RiskFactorItem['color']) => {
    if (level === 'CRITICAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-xs font-mono font-bold">
          <ShieldAlert className="w-3 h-3" />
          CRITICAL
        </span>
      );
    }
    if (level === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#F97316]/20 border border-[#F97316]/40 text-[#F97316] text-xs font-mono font-bold">
          <AlertTriangle className="w-3 h-3" />
          HIGH
        </span>
      );
    }
    if (level === 'MODERATE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-mono font-bold">
          <AlertTriangle className="w-3 h-3" />
          MODERATE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] text-xs font-mono font-bold">
        <CheckCircle2 className="w-3 h-3" />
        LOW
      </span>
    );
  };

  const getProgressBarColor = (color: RiskFactorItem['color']) => {
    if (color === 'rose') return 'bg-[#EF4444]';
    if (color === 'orange') return 'bg-[#F97316]';
    if (color === 'amber') return 'bg-[#F59E0B]';
    return 'bg-[#10B981]';
  };

  return (
    <section
      id="agromet-risk-radar"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              WEATHER-CROP RISK RADAR (7-FACTOR DIAGNOSTIC)
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            Multi-hazard environmental vulnerability assessment for {selectedCrop} in {district}
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#64748B]">
          Deterministic threshold calculations
        </div>
      </div>

      {/* 7 Risk Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {risks.map((item) => {
          const Icon = iconMap[item.id] || AlertTriangle;
          const barColor = getProgressBarColor(item.color);

          return (
            <div
              key={item.id}
              id={`risk-factor-card-${item.id}`}
              className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 flex flex-col justify-between space-y-3.5 hover:border-[#334155] transition-all shadow-md"
            >
              {/* Top: Icon, Name & Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-[#1E293B] text-[#38BDF8]">
                    <Icon className="w-4 h-4" />
                  </div>
                  {getLevelBadge(item.level, item.color)}
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {item.name}
                  </h3>
                  <div className="text-[10px] font-mono text-[#94A3B8] mt-0.5 truncate">
                    Driver: {item.driver}
                  </div>
                </div>
              </div>

              {/* Progress / Severity Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                  <span>Vulnerability Index</span>
                  <span className="text-white font-bold">{item.score}/100</span>
                </div>
                <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>

              {/* Tactical Action */}
              <div className="pt-2 border-t border-[#1E293B] text-[11px] text-[#CBD5E1] leading-relaxed">
                <strong className="text-[#38BDF8] font-mono text-[10px] block uppercase">
                  Management Action:
                </strong>
                {item.managementAction}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
