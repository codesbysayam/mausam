import React from 'react';
import {
  Bug,
  Activity,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  FlaskConical,
  Target,
  Thermometer,
  Gauge,
  Droplets,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import { CropType, PhenologicalStage, getCropPhenologyProfile } from '../../services/agronomicEngine';

interface BioticRiskMonitorProps {
  weather?: WeatherDataBundle;
  selectedCrop: CropType;
  selectedStage: PhenologicalStage;
  district: string;
}

export const BioticRiskMonitor: React.FC<BioticRiskMonitorProps> = ({
  weather,
  selectedCrop,
  selectedStage,
  district,
}) => {
  const current = weather?.current;
  const temp = current?.temp ?? 30;
  const humidity = current?.humidity ?? 72;
  const profile = getCropPhenologyProfile(selectedCrop, selectedStage, weather);
  const biotic = profile.pestDiseaseWatch;

  // Disease Environment Level
  const isHighRisk = humidity > 80 && temp >= 22 && temp <= 32;
  const isModRisk = humidity > 68;
  const diseaseEnvLevel = isHighRisk ? 'ELEVATED' : isModRisk ? 'MODERATE' : 'LOW';
  const diseaseEnvBg = isHighRisk
    ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
    : isModRisk
    ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]'
    : 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]';

  return (
    <section
      id="agromet-biotic-risk-monitor"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-[#F97316]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              PEST &amp; DISEASE INCUBATION RADAR (BIOTIC RISK)
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            Microclimatic pathogen modeling &amp; Integrated Pest Management (IPM) protocols for {selectedCrop}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${diseaseEnvBg}`}>
          <Activity className="w-4 h-4" />
          <span>DISEASE ENVIRONMENT: {diseaseEnvLevel}</span>
        </div>
      </div>

      {/* Target Pest / Disease Deep Dive Card */}
      <div className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-5 space-y-5">
        {/* Title row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider block">
              PRIMARY TARGET ORGANISM &amp; THREAT VECTOR
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {biotic.targetOrganism}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[#CBD5E1] bg-[#090D16] px-3 py-2 rounded-lg border border-[#1E293B]">
            <span>RH: <strong className="text-[#38BDF8]">{humidity}%</strong></span>
            <span>•</span>
            <span>Temp: <strong className="text-[#F59E0B]">{temp}°C</strong></span>
            <span>•</span>
            <span>Dew Proxy: <strong className="text-[#10B981]">{humidity > 75 ? 'Active' : 'Low'}</strong></span>
          </div>
        </div>

        {/* 4 Protocol Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Block 1: Favorable Weather Trigger */}
          <div className="bg-[#090D16] border border-[#1E293B] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F59E0B] uppercase">
              <Thermometer className="w-3.5 h-3.5" />
              <span>Incubation Trigger</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {biotic.favorableConditions}
            </p>
          </div>

          {/* Block 2: ETL Threshold */}
          <div className="bg-[#090D16] border border-[#1E293B] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#38BDF8] uppercase">
              <Target className="w-3.5 h-3.5" />
              <span>Economic Threshold (ETL)</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {biotic.etlThreshold}
            </p>
          </div>

          {/* Block 3: Bio-Control / Cultural */}
          <div className="bg-[#090D16] border border-[#1E293B] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#10B981] uppercase">
              <Leaf className="w-3.5 h-3.5" />
              <span>IPM Bio-Control</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {biotic.ipmBioControl}
            </p>
          </div>

          {/* Block 4: Chemical Intervention */}
          <div className="bg-[#090D16] border border-[#1E293B] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#EF4444] uppercase">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Chemical Intervention</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {biotic.chemicalIntervention}
            </p>
          </div>
        </div>

        {/* Note on Data Rigor */}
        <div className="text-[10px] font-mono text-[#64748B] flex items-center gap-2 pt-1">
          <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
          <span>Notice: Indicators represent meteorological risk favorability for spore incubation, not a confirmed outbreak in your specific plot. Always verify through field scouting.</span>
        </div>
      </div>
    </section>
  );
};
