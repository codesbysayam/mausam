import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  Sprout,
  Droplets,
  CloudRain,
  Bug,
  ShieldAlert,
  Sun,
  CheckCircle2,
  Clock,
  Sparkles,
  Tractor,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CropAdvisory } from '../../types';
import { CropSelector, getCropEmoji } from './CropSelector';

interface CropSelectorAndHealthProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  selectedCrop: string;
  onSelectCrop: (cropName: string) => void;
  activeCropAdvisory: CropAdvisory;
}

export const CropSelectorAndHealth: React.FC<CropSelectorAndHealthProps> = ({
  bulletin,
  selectedCategory,
  onSelectCategory,
  selectedCrop,
  onSelectCrop,
  activeCropAdvisory,
}) => {
  // Phenological Stages for visual horizontal progress
  const phenologyStages = [
    { name: 'SOWING', key: 'sowing', status: 'completed' },
    { name: 'VEGETATIVE', key: 'vegetative', status: 'completed' },
    { name: 'TILLERING', key: 'tillering', status: 'current' },
    { name: 'PANICLE INITIATION', key: 'panicle', status: 'upcoming' },
    { name: 'MATURITY', key: 'maturity', status: 'upcoming' },
    { name: 'HARVEST', key: 'harvest', status: 'upcoming' },
  ];

  return (
    <section id="your-crop-intelligence-section" className="space-y-5">
      {/* 1. Reusable Pill-Based Crop Selector */}
      <CropSelector
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        selectedCrop={selectedCrop}
        onSelectCrop={onSelectCrop}
      />

      {/* 2. ONE Single Deep Crop Profile: "YOUR CROP" */}
      <div className="rounded-3xl bg-gradient-to-br from-[#121E2C] via-[#0E1723] to-[#0A1017] border border-[#22354A] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden transition-all duration-200">
        {/* Subtle Decorative Backdrop Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2ECC71]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#1E2E40]/80 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1C3627] to-[#12241A] border border-[#2ECC71]/40 flex items-center justify-center text-3xl shadow-lg shrink-0 transition-transform duration-200">
              {getCropEmoji(activeCropAdvisory.cropName)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {activeCropAdvisory.cropName.toUpperCase()}
                </h3>
                <span className="text-xs px-3 py-1 rounded-full bg-[#2ECC71]/15 border border-[#2ECC71]/40 text-[#2ECC71] font-mono font-black uppercase">
                  CURRENT CONDITION: GOOD
                </span>
              </div>
              <p className="text-sm text-[#94A3B8] mt-1 font-medium flex items-center gap-2">
                <span>Active Stage:</span>
                <strong className="text-[#38BDF8] font-bold font-mono">
                  {activeCropAdvisory.stage} → Panicle Initiation
                </strong>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#142232] border border-[#23384E] text-xs max-w-md self-start sm:self-auto shadow-inner">
            <span className="text-[#F59E0B] font-bold block text-[11px] uppercase font-mono mb-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              Official AMFU Phenology Guidance
            </span>
            <span className="text-[#CBD5E1] leading-relaxed">
              {activeCropAdvisory.riskAlert}
            </span>
          </div>
        </div>

        {/* Visual Horizontal Growth-Stage Timeline */}
        <div className="my-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-mono">
              Phenological Growth Stage Progression
            </span>
            <span className="text-xs text-[#2ECC71] font-mono font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
              Optimal Sowing Window Verified
            </span>
          </div>

          {/* Stepped Horizontal Track */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {phenologyStages.map((stg, i) => {
              const isCurrent = stg.status === 'current';
              const isCompleted = stg.status === 'completed';

              return (
                <div
                  key={stg.name}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                    isCurrent
                      ? 'bg-gradient-to-b from-[#1C3627] to-[#12241A] border-2 border-[#2ECC71] text-white shadow-lg scale-[1.02]'
                      : isCompleted
                      ? 'bg-[#111A24] border-[#1E2E40] text-[#94A3B8]'
                      : 'bg-[#0B131C] border-[#1E2E40]/60 text-[#64748B]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                    <span className="font-bold">0{i + 1}</span>
                    <span className="text-[10px] font-bold uppercase">
                      {isCompleted ? '✓ COMPLETED' : isCurrent ? '● CURRENT' : '○ UPCOMING'}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-black tracking-tight ${
                      isCurrent ? 'text-[#2ECC71]' : isCompleted ? 'text-white' : 'text-[#64748B]'
                    }`}
                  >
                    {stg.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Visually Differentiated Information Areas (NOT identical boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#1E2E40]/80">
          {/* Area 1: WATER (Flow Gauge + Action) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#101D2C] to-[#0A121C] border border-[#38BDF8]/40 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#38BDF8] uppercase font-mono flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#38BDF8]" />
                  WATER
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] font-mono font-bold">
                  MODERATE
                </span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed mt-2">
                {activeCropAdvisory.irrigationAdvice}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1E2E40] flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
              <span>ET₀ Balance:</span>
              <span className="text-white font-bold">4.2 mm/d</span>
            </div>
          </div>

          {/* Area 2: NUTRIENTS (Progress Indicator + Advice) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#14231A] to-[#0B1510] border border-[#2ECC71]/40 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#2ECC71] uppercase font-mono flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-[#2ECC71]" />
                  NUTRIENTS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#2ECC71]/20 text-[#2ECC71] font-mono font-bold">
                  MONITOR
                </span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed mt-2">
                {activeCropAdvisory.fertilizerAdvice}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1E2E40] flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
              <span>Split Dose:</span>
              <span className="text-[#2ECC71] font-bold">Ready Post-Rain</span>
            </div>
          </div>

          {/* Area 3: PEST (Risk Callout + IPM Directive) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#241A12] to-[#140E0A] border border-[#F59E0B]/40 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#F59E0B] uppercase font-mono flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-[#F59E0B]" />
                  PEST PRESSURE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-mono font-bold">
                  MODERATE RISK
                </span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed mt-2">
                {activeCropAdvisory.pestDiseaseAdvice}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1E2E40] flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
              <span>Scout Window:</span>
              <span className="text-[#F59E0B] font-bold">Morning 08–10 AM</span>
            </div>
          </div>

          {/* Area 4: DISEASE (Surveillance Alert Box) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#241214] to-[#140A0B] border border-[#EF4444]/40 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#EF4444] uppercase font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                  DISEASE THREAT
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] font-mono font-bold">
                  WATCH
                </span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed mt-2">
                High relative humidity (85%) promotes fungal blast/blight spore germination. Inspect collar leaves.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1E2E40] flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
              <span>Inoculum Status:</span>
              <span className="text-[#EF4444] font-bold">Elevated</span>
            </div>
          </div>
        </div>

        {/* Harvest & Cultural Practices Note */}
        <div className="mt-5 p-4 rounded-2xl bg-[#0B131C] border border-[#1E2E40] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Tractor className="w-4 h-4 text-[#A855F7] shrink-0" />
            <span className="text-[#CBD5E1]">
              <strong className="text-white">Cultural Directive:</strong> {activeCropAdvisory.harvestingAdvice}
            </span>
          </div>
          <span className="text-[#38BDF8] font-mono shrink-0 font-bold">
            District AMFU Code: {bulletin.district}
          </span>
        </div>
      </div>
    </section>
  );
};
