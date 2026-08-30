import React from 'react';
import { CROP_CATEGORIES, CropCategory, ExtendedAgrometBulletin } from '../../services/agrometService';
import { Sprout, Droplets, CloudRain, Bug, ShieldAlert, Sun, CheckCircle2, ChevronRight } from 'lucide-react';
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

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40';
      case 'Moderate':
        return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40';
      case 'Low':
      default:
        return 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/40';
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Category Tabs & Crop Filter Pills */}
      <div className="rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#1E2E40] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#2ECC71]" />
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Crop Selection &amp; Agronomic Classification
              </h3>
            </div>
            <p className="text-xs text-[#93A4B8]">
              Select a target crop to synchronize phenology stage, water balance, pest surveillance, and field advisories.
            </p>
          </div>

          <span className="text-[11px] text-[#38BDF8] font-mono self-start sm:self-auto">
            Selected: <strong className="text-white">{selectedCrop}</strong>
          </span>
        </div>

        {/* Category Filter Pills (Horizontal Scrolling on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
          {CROP_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'bg-[#2ECC71] text-[#0A1017] shadow-md shadow-[#2ECC71]/20 font-bold'
                    : 'bg-[#141F2D] text-[#93A4B8] hover:text-white hover:bg-[#1A293B] border border-[#1E2E40]'
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Individual Crop Selector Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {availableCrops.map((cropName) => {
            const isSelected = selectedCrop.toLowerCase() === cropName.toLowerCase();
            const hasCustomAdvisory = bulletin.crops.some(
              (c) => c.cropName.toLowerCase() === cropName.toLowerCase()
            );

            return (
              <button
                key={cropName}
                type="button"
                onClick={() => onSelectCrop(cropName)}
                className={`group px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#173024] to-[#11241C] border-2 border-[#2ECC71] text-white shadow-lg'
                    : 'bg-[#121B26] border border-[#1E2E40] text-[#CBD5E1] hover:border-[#2ECC71]/40 hover:bg-[#152230]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#2ECC71] animate-ping' : hasCustomAdvisory ? 'bg-[#38BDF8]' : 'bg-[#64748B]'}`} />
                <span>{cropName}</span>
                {hasCustomAdvisory && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#38BDF8]/20 text-[#38BDF8] font-mono font-bold">
                    GKMS
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Crop Health Overview Matrix */}
      <div className="rounded-2xl bg-gradient-to-br from-[#121C27] to-[#0E151F] border border-[#1E2E40] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#1E2E40] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/15 border border-[#2ECC71]/30 flex items-center justify-center text-[#2ECC71]">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Crop Health &amp; Phenology Overview
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getRiskBadge(activeCropAdvisory.riskLevel)}`}>
                  {activeCropAdvisory.riskLevel} Pest Risk
                </span>
              </div>
              <p className="text-xs text-[#93A4B8]">
                Target Crop: <strong className="text-white">{activeCropAdvisory.cropName}</strong> • Current Stage: <span className="text-[#38BDF8] font-semibold">{activeCropAdvisory.stage}</span>
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#141F2D] border border-[#1E2E40] text-xs text-[#93A4B8] max-w-sm">
            <span className="text-white font-semibold block text-[11px]">Active Phenology Alert:</span>
            <span className="text-[#F59E0B] text-[11px]">{activeCropAdvisory.riskAlert}</span>
          </div>
        </div>

        {/* 6 Semantic Status Indicators (Visual Gauges) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* 1. Crop Stage */}
          <div className="p-3.5 rounded-xl bg-[#0F1622] border border-[#1E2E40] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] uppercase font-bold">
              <span>Stage</span>
              <Sprout className="w-3.5 h-3.5 text-[#2ECC71]" />
            </div>
            <div className="my-2">
              <span className="text-sm font-bold text-white block truncate" title={activeCropAdvisory.stage}>
                {activeCropAdvisory.stage.split(' ')[0]}
              </span>
              <span className="text-[10px] text-[#93A4B8]">Vegetative Peak</span>
            </div>
            <div className="w-full bg-[#182635] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-[#2ECC71] rounded-full w-3/5" />
            </div>
          </div>

          {/* 2. Water Requirement */}
          <div className="p-3.5 rounded-xl bg-[#0F1622] border border-[#1E2E40] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] uppercase font-bold">
              <span>Water Demand</span>
              <Droplets className="w-3.5 h-3.5 text-[#38BDF8]" />
            </div>
            <div className="my-2">
              <span className="text-sm font-bold text-[#38BDF8] block">Moderate</span>
              <span className="text-[10px] text-[#93A4B8]">4.2 mm/day ET</span>
            </div>
            <div className="w-full bg-[#182635] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-[#38BDF8] rounded-full w-1/2" />
            </div>
          </div>

          {/* 3. Rain Sensitivity */}
          <div className="p-3.5 rounded-xl bg-[#0F1622] border border-[#1E2E40] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] uppercase font-bold">
              <span>Rain Sensitivity</span>
              <CloudRain className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
            <div className="my-2">
              <span className="text-sm font-bold text-[#F59E0B] block">High / Sensitive</span>
              <span className="text-[10px] text-[#93A4B8]">Avoid Stagnation</span>
            </div>
            <div className="w-full bg-[#182635] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-[#F59E0B] rounded-full w-4/5" />
            </div>
          </div>

          {/* 4. Pest Risk */}
          <div className="p-3.5 rounded-xl bg-[#0F1622] border border-[#1E2E40] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] uppercase font-bold">
              <span>Pest Pressure</span>
              <Bug className="w-3.5 h-3.5 text-[#EF4444]" />
            </div>
            <div className="my-2">
              <span className="text-sm font-bold text-white block">{activeCropAdvisory.riskLevel}</span>
              <span className="text-[10px] text-[#93A4B8]">Scout Border Rows</span>
            </div>
            <div className="w-full bg-[#182635] h-1.5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${activeCropAdvisory.riskLevel === 'High' ? 'bg-[#EF4444] w-4/5' : 'bg-[#F59E0B] w-1/2'}`} />
            </div>
          </div>

          {/* 5. Disease Vulnerability */}
          <div className="p-3.5 rounded-xl bg-[#0F1622] border border-[#1E2E40] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] uppercase font-bold">
              <span>Disease Risk</span>
              <ShieldAlert className="w-3.5 h-3.5 text-[#A855F7]" />
            </div>
            <div className="my-2">
              <span className="text-sm font-bold text-[#A855F7] block">Elevated Spores</span>
              <span className="text-[10px] text-[#93A4B8]">High RH Factor</span>
            </div>
            <div className="w-full bg-[#182635] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-[#A855F7] rounded-full w-3/4" />
            </div>
          </div>

          {/* 6. Heat Stress */}
          <div className="p-3.5 rounded-xl bg-[#0F1622] border border-[#1E2E40] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-[#64748B] uppercase font-bold">
              <span>Thermal Stress</span>
              <Sun className="w-3.5 h-3.5 text-[#2ECC71]" />
            </div>
            <div className="my-2">
              <span className="text-sm font-bold text-[#2ECC71] block">Low Stress</span>
              <span className="text-[10px] text-[#93A4B8]">31°C Max Optimal</span>
            </div>
            <div className="w-full bg-[#182635] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-[#2ECC71] rounded-full w-1/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
