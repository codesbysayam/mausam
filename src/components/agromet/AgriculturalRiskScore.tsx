import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { ShieldAlert, ChevronDown, ChevronUp, Info, HelpCircle, CheckCircle2 } from 'lucide-react';
import { AgrometTooltip } from './AgrometTooltip';

interface AgriculturalRiskScoreProps {
  bulletin: ExtendedAgrometBulletin;
}

export const AgriculturalRiskScore: React.FC<AgriculturalRiskScoreProps> = ({ bulletin }) => {
  const [isWhyOpen, setIsWhyOpen] = useState<boolean>(false);
  const risk = bulletin.riskAnalysis;

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-[#EF4444] border-[#EF4444] stroke-[#EF4444]';
    if (score >= 55) return 'text-[#F97316] border-[#F97316] stroke-[#F97316]';
    if (score >= 35) return 'text-[#F59E0B] border-[#F59E0B] stroke-[#F59E0B]';
    return 'text-[#2ECC71] border-[#2ECC71] stroke-[#2ECC71]';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 75) return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40';
    if (score >= 55) return 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/40';
    if (score >= 35) return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40';
    return 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/40';
  };

  // SVG circular gauge math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (risk.overallScore / 100) * circumference;

  return (
    <div className="rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#1E2E40] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
              Farm Weather Risk Index • Deterministic Multi-Factor Model
            </h3>
          </div>
          <p className="text-xs text-[#93A4B8]">
            Authoritative biometeorological hazard evaluation combining 5 weighted agronomic vulnerability metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#93A4B8]">Index Weighting:</span>
          <span className="text-xs font-mono font-bold text-[#38BDF8] px-2 py-0.5 rounded bg-[#182635] border border-[#2A3E54]">
            100% Deterministic
          </span>
        </div>
      </div>

      {/* Main Grid: Radial Gauge + Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-4">
        {/* Left (4 Cols): Ring Dial */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-[#121B26] border border-[#1E2E40]">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-[#1E293B]"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`transition-all duration-700 ${getScoreColor(risk.overallScore)}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Centered Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {risk.overallScore}
              </span>
              <span className="text-[10px] text-[#64748B] font-mono uppercase">out of 100</span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className={`text-xs px-3 py-1 rounded-full border font-bold uppercase ${getScoreBadge(risk.overallScore)}`}>
              {risk.riskLevel}
            </span>
          </div>
        </div>

        {/* Right (8 Cols): 5 Weighted Risk Factors */}
        <div className="lg:col-span-8 space-y-3">
          {/* Factor 1: Precipitation Risk (25%) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🌧 Precipitation Influx</span>
                <span className="text-[10px] text-[#64748B] font-mono">(25% Weight)</span>
              </span>
              <span className="font-mono text-[#38BDF8] font-bold">
                {risk.factors.rainfallRisk.score}/100 • {risk.factors.rainfallRisk.label}
              </span>
            </div>
            <div className="w-full bg-[#182635] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#38BDF8] rounded-full"
                style={{ width: `${risk.factors.rainfallRisk.score}%` }}
              />
            </div>
          </div>

          {/* Factor 2: Thermal Stress (15%) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🌡 Thermal Stress</span>
                <span className="text-[10px] text-[#64748B] font-mono">(15% Weight)</span>
              </span>
              <span className="font-mono text-[#2ECC71] font-bold">
                {risk.factors.thermalStress.score}/100 • {risk.factors.thermalStress.label}
              </span>
            </div>
            <div className="w-full bg-[#182635] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2ECC71] rounded-full"
                style={{ width: `${risk.factors.thermalStress.score}%` }}
              />
            </div>
          </div>

          {/* Factor 3: Wind & Lodging (15%) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>💨 Wind &amp; Lodging Threat</span>
                <span className="text-[10px] text-[#64748B] font-mono">(15% Weight)</span>
              </span>
              <span className="font-mono text-[#A855F7] font-bold">
                {risk.factors.windGustRisk.score}/100 • {risk.factors.windGustRisk.label}
              </span>
            </div>
            <div className="w-full bg-[#182635] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#A855F7] rounded-full"
                style={{ width: `${risk.factors.windGustRisk.score}%` }}
              />
            </div>
          </div>

          {/* Factor 4: Fungal & Pest Conduciveness (25%) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🦠 Fungal / Pathogen Conduciveness</span>
                <span className="text-[10px] text-[#64748B] font-mono">(25% Weight)</span>
              </span>
              <span className="font-mono text-[#F59E0B] font-bold">
                {risk.factors.pestFungalRisk.score}/100 • {risk.factors.pestFungalRisk.label}
              </span>
            </div>
            <div className="w-full bg-[#182635] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F59E0B] rounded-full"
                style={{ width: `${risk.factors.pestFungalRisk.score}%` }}
              />
            </div>
          </div>

          {/* Factor 5: Waterlogging & Drainage (20%) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <span>🌊 Root-Zone Waterlogging Risk</span>
                <span className="text-[10px] text-[#64748B] font-mono">(20% Weight)</span>
              </span>
              <span className="font-mono text-[#38BDF8] font-bold">
                {risk.factors.soilWaterlogging.score}/100 • {risk.factors.soilWaterlogging.label}
              </span>
            </div>
            <div className="w-full bg-[#182635] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#38BDF8] rounded-full"
                style={{ width: `${risk.factors.soilWaterlogging.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* "Why this score?" Expandable Box */}
      <div className="border-t border-[#1E2E40] pt-3">
        <button
          type="button"
          onClick={() => setIsWhyOpen(!isWhyOpen)}
          className="flex items-center justify-between w-full text-xs font-semibold text-[#38BDF8] hover:text-[#7DD3FC] transition-colors focus:outline-none cursor-pointer py-1"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            Why this score? Click for deterministic calculation details
          </span>
          {isWhyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isWhyOpen && (
          <div className="mt-3 p-4 rounded-xl bg-[#131D28] border border-[#1E2E40] text-xs text-[#CBD5E1] space-y-2 animate-in fade-in duration-150">
            <div className="font-bold text-white mb-1">
              Agronomic Index Mathematical Breakdown:
            </div>
            {risk.whyExplanation.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71] shrink-0 mt-0.5" />
                <span>{line}</span>
              </div>
            ))}
            <div className="pt-2 text-[10px] text-[#64748B] italic">
              Formula: (Rain × 0.25) + (Heat × 0.15) + (Wind × 0.15) + (Pathogen × 0.25) + (Waterlogging × 0.20)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
