import React from 'react';
import {
  Sprout,
  Activity,
  Droplets,
  Bug,
  ListOrdered,
  AlertCircle,
  Thermometer,
  Wind,
  ShieldCheck,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import {
  CropType,
  PhenologicalStage,
  getCropPhenologyProfile,
} from '../../services/agronomicEngine';

interface CropIntelligenceCardProps {
  weather?: WeatherDataBundle;
  selectedCrop: CropType;
  selectedStage: PhenologicalStage;
  district: string;
}

export const CropIntelligenceCard: React.FC<CropIntelligenceCardProps> = ({
  weather,
  selectedCrop,
  selectedStage,
  district,
}) => {
  const profile = getCropPhenologyProfile(selectedCrop, selectedStage, weather);

  const getSensitivityBadge = (sens: 'HIGH' | 'MODERATE' | 'LOW') => {
    if (sens === 'HIGH') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-mono font-bold">
          HIGH SENSITIVITY
        </span>
      );
    }
    if (sens === 'MODERATE') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-mono font-bold">
          MODERATE SENSITIVITY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-mono font-bold">
        LOW SENSITIVITY
      </span>
    );
  };

  const getWaterBadge = (water: 'CRITICAL' | 'MODERATE' | 'LOW') => {
    if (water === 'CRITICAL') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#06B6D4] text-xs font-mono font-bold">
          CRITICAL WATER STAGE
        </span>
      );
    }
    if (water === 'MODERATE') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-mono font-bold">
          MODERATE WATER STAGE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#94A3B8]/15 border border-[#94A3B8]/30 text-[#94A3B8] text-xs font-mono font-bold">
        LOW WATER STAGE
      </span>
    );
  };

  const getDiseaseBadge = (dis: 'ELEVATED' | 'FAVORABLE' | 'LOW') => {
    if (dis === 'ELEVATED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F97316]/15 border border-[#F97316]/30 text-[#F97316] text-xs font-mono font-bold">
          ELEVATED DISEASE RISK
        </span>
      );
    }
    if (dis === 'FAVORABLE') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-mono font-bold">
          FAVORABLE PATHOGEN CLIMATE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-mono font-bold">
        LOW DISEASE PRESSURE
      </span>
    );
  };

  return (
    <section
      id="agromet-crop-intelligence"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              CROP INTELLIGENCE PROFILE • {selectedCrop.toUpperCase()}
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            Physiological thresholds and agronomic directives for <strong className="text-[#38BDF8]">{selectedStage}</strong> stage in {district}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getSensitivityBadge(profile.weatherSensitivity)}
        </div>
      </div>

      {/* 3 Metric Cards for Crop Stage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Stage Status */}
        <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span>CURRENT PHENOLOGY</span>
            <Activity className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-lg font-black text-white font-mono">
            {profile.stage}
          </div>
          <div className="text-[11px] font-mono text-[#64748B]">
            Optimum Temp: {profile.optimumTempRange[0]}°C – {profile.optimumTempRange[1]}°C
          </div>
        </div>

        {/* Card 2: Water Requirement */}
        <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span>HYDRAULIC DEMAND</span>
            <Droplets className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="text-lg font-black text-white font-mono">
            {profile.waterRequirement}
          </div>
          <div className="text-[11px] font-mono text-[#64748B]">
            Estimated ET Demand: {profile.criticalETdemandMm} mm/day
          </div>
        </div>

        {/* Card 3: Disease Environment */}
        <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span>PATHOGEN SUSCEPTIBILITY</span>
            <Bug className="w-4 h-4 text-[#F97316]" />
          </div>
          <div className="text-lg font-black text-white font-mono">
            {profile.diseaseEnvironment}
          </div>
          <div className="text-[11px] font-mono text-[#64748B]">
            Max Wind Tolerance: {profile.maxWindToleranceKmh} km/h
          </div>
        </div>
      </div>

      {/* Field Priorities (1, 2, 3) */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#10B981] uppercase tracking-wider">
          <ListOrdered className="w-4 h-4 text-[#10B981]" />
          <span>Priority Field Directives (Ranked 1 to 3)</span>
        </div>

        <div className="space-y-3 pt-1">
          {profile.priorities.map((p, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-[#090D16] border border-[#1E293B] rounded-lg p-3"
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] font-mono text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <p className="text-xs text-[#CBD5E1] leading-relaxed pt-0.5">
                {p}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
