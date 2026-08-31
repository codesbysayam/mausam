import React from 'react';
import { CROP_CATEGORIES, ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  Sprout,
  Droplets,
  CloudRain,
  Bug,
  ShieldAlert,
  Sun,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Tractor,
  Layers,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { CropAdvisory } from '../../types';

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
  const currentCategoryObj = CROP_CATEGORIES.find((c) => c.id === selectedCategory) || CROP_CATEGORIES[0];
  const availableCrops = currentCategoryObj.crops;

  const getCropEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('rice') || lower.includes('paddy')) return '🌾';
    if (lower.includes('wheat')) return '🌱';
    if (lower.includes('maize') || lower.includes('corn')) return '🌽';
    if (lower.includes('cotton')) return '🧵';
    if (lower.includes('potato')) return '🥔';
    if (lower.includes('mustard')) return '🌻';
    if (lower.includes('sugarcane')) return '🎋';
    if (lower.includes('gram') || lower.includes('chickpea')) return '🫘';
    if (lower.includes('tomato')) return '🍅';
    if (lower.includes('onion')) return '🧅';
    if (lower.includes('mango')) return '🥭';
    if (lower.includes('groundnut')) return '🥜';
    return '🌿';
  };

  // Phenological Stages for visual timeline
  const phenologyStages = [
    { name: 'SOWING', key: 'sowing', done: true },
    { name: 'VEGETATIVE', key: 'vegetative', done: true },
    { name: 'TILLERING / FLOWERING', key: 'current', current: true },
    { name: 'PANICLE / GRAIN FILL', key: 'panicle', future: true },
    { name: 'MATURITY / HARVEST', key: 'harvest', future: true },
  ];

  return (
    <section className="flex flex-col gap-6">
      {/* 1. Category Tabs & Responsive Pill Selector */}
      <div className="rounded-3xl bg-[#0F1722] border border-[#1E2E40] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#1E2E40] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#2ECC71]" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                Select Your Crop
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Choose your crop to synchronize phenological stages, water requirements, and field protection advisories.
            </p>
          </div>

          <span className="text-xs text-[#38BDF8] font-mono self-start sm:self-auto px-3 py-1 rounded-lg bg-[#14202E] border border-[#23384E]">
            Targeting: <strong className="text-white font-bold">{selectedCrop}</strong>
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none mb-3">
          {CROP_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'bg-[#2ECC71] text-[#0A1017] shadow-lg shadow-[#2ECC71]/20 font-black'
                    : 'bg-[#14202E] text-[#94A3B8] hover:text-white hover:bg-[#1A2A3D] border border-[#1E2E40]'
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Crop Selector Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {availableCrops.map((cropName) => {
            const isSelected = selectedCrop.toLowerCase() === cropName.toLowerCase();
            const emoji = getCropEmoji(cropName);

            return (
              <button
                key={cropName}
                type="button"
                onClick={() => onSelectCrop(cropName)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#173827] to-[#122A1E] border-2 border-[#2ECC71] text-white shadow-xl shadow-[#2ECC71]/15 scale-[1.03]'
                    : 'bg-[#121D2A] border border-[#1E2E40] text-[#CBD5E1] hover:border-[#2ECC71]/50 hover:bg-[#162434]'
                }`}
              >
                <span className="text-base">{emoji}</span>
                <span>{cropName}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ONE Detailed Crop Profile: "YOUR CROP TODAY" */}
      <div className="rounded-3xl bg-gradient-to-br from-[#121D2B] via-[#0E1722] to-[#0A1017] border-2 border-[#22354A] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        {/* Top Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#1E2E40] gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2ECC71]/15 border border-[#2ECC71]/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {getCropEmoji(activeCropAdvisory.cropName)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {activeCropAdvisory.cropName.toUpperCase()}
                </h3>
                <span className="text-xs px-3 py-1 rounded-full bg-[#2ECC71]/15 border border-[#2ECC71]/40 text-[#2ECC71] font-mono font-bold uppercase">
                  STATUS: GOOD
                </span>
              </div>
              <p className="text-sm text-[#94A3B8] mt-0.5">
                Current Phenology: <strong className="text-[#38BDF8] font-bold">{activeCropAdvisory.stage}</strong>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#142232] border border-[#23384E] text-xs max-w-md self-start sm:self-auto">
            <span className="text-[#F59E0B] font-bold block text-[11px] uppercase font-mono mb-0.5">
              Active Stage Advisory Alert
            </span>
            <span className="text-[#CBD5E1] leading-relaxed">
              {activeCropAdvisory.riskAlert}
            </span>
          </div>
        </div>

        {/* Visual Crop-Stage Timeline */}
        <div className="my-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-mono">
              Phenological Progression Timeline
            </span>
            <span className="text-xs text-[#38BDF8] font-mono font-semibold">
              Current: {activeCropAdvisory.stage}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {phenologyStages.map((stg, i) => {
              const isCurrent = stg.current;
              const isDone = stg.done;

              return (
                <div
                  key={stg.name}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-[#182C22] border-2 border-[#2ECC71] text-white shadow-lg'
                      : isDone
                      ? 'bg-[#111A24] border-[#1E2E40] text-[#94A3B8]'
                      : 'bg-[#0B131C] border-[#1E2E40]/60 text-[#64748B]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                    <span className="font-bold">0{i + 1}</span>
                    <span>
                      {isDone ? '✓ Completed' : isCurrent ? '● CURRENT' : '○ Upcoming'}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${isCurrent ? 'text-[#2ECC71]' : isDone ? 'text-white' : 'text-[#64748B]'}`}>
                    {stg.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 High-Level Agricultural Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-4 border-t border-[#1E2E40]">
          {/* Water */}
          <div className="p-3.5 rounded-xl bg-[#0F1824] border border-[#1E2E40]">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">WATER NEED</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Droplets className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-sm font-bold text-white font-mono">Moderate</span>
            </div>
            <span className="text-[10px] text-[#38BDF8] mt-1 block">ET₀ 4.2 mm/d</span>
          </div>

          {/* Nutrients */}
          <div className="p-3.5 rounded-xl bg-[#0F1824] border border-[#1E2E40]">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">NUTRIENTS</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Sprout className="w-4 h-4 text-[#2ECC71]" />
              <span className="text-sm font-bold text-white font-mono">Monitor</span>
            </div>
            <span className="text-[10px] text-[#2ECC71] mt-1 block">NPK Split Ready</span>
          </div>

          {/* Pest */}
          <div className="p-3.5 rounded-xl bg-[#0F1824] border border-[#1E2E40]">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">PEST RISK</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Bug className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-sm font-bold text-white font-mono">Moderate</span>
            </div>
            <span className="text-[10px] text-[#F59E0B] mt-1 block">IPM Scouting</span>
          </div>

          {/* Disease */}
          <div className="p-3.5 rounded-xl bg-[#0F1824] border border-[#1E2E40]">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">DISEASE RISK</span>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
              <span className="text-sm font-bold text-white font-mono">Elevated</span>
            </div>
            <span className="text-[10px] text-[#EF4444] mt-1 block">Humidity Influx</span>
          </div>

          {/* Field Work */}
          <div className="p-3.5 rounded-xl bg-[#0F1824] border border-[#1E2E40] col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">FIELD WORK</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Tractor className="w-4 h-4 text-[#2ECC71]" />
              <span className="text-sm font-bold text-white font-mono">Good</span>
            </div>
            <span className="text-[10px] text-[#2ECC71] mt-1 block">Post-10 AM Window</span>
          </div>
        </div>

        {/* Selected Crop Specific Recommendations Box */}
        <div className="mt-6 p-5 rounded-2xl bg-[#0B131C] border border-[#1E2E40] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2E40]">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2ECC71]" />
              Agronomic Action Directives for {activeCropAdvisory.cropName}
            </span>
            <span className="text-[10px] font-mono text-[#38BDF8]">
              AMFU {bulletin.district} Node
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#121E2C] border border-[#1E2E40]">
              <strong className="text-[#38BDF8] block mb-1">💧 Irrigation &amp; Soil Water:</strong>
              <p className="text-[#CBD5E1]">{activeCropAdvisory.irrigationAdvice}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#121E2C] border border-[#1E2E40]">
              <strong className="text-[#2ECC71] block mb-1">🌱 Nutrients &amp; Fertilizer:</strong>
              <p className="text-[#CBD5E1]">{activeCropAdvisory.fertilizerAdvice}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#121E2C] border border-[#1E2E40]">
              <strong className="text-[#EF4444] block mb-1">🐛 Plant Protection &amp; IPM:</strong>
              <p className="text-[#CBD5E1]">{activeCropAdvisory.pestDiseaseAdvice}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#121E2C] border border-[#1E2E40]">
              <strong className="text-[#A855F7] block mb-1">🌾 Harvesting &amp; Cultural:</strong>
              <p className="text-[#CBD5E1]">{activeCropAdvisory.harvestingAdvice}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
