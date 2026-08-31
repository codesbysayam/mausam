import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { CropAdvisory } from '../../types';
import {
  ChevronDown,
  ChevronUp,
  Droplet,
  Sprout,
  Bug,
  Tractor,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface CropAdvisoryAccordionProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop?: string;
  onSelectCrop?: (cropName: string) => void;
}

export const CropAdvisoryAccordion: React.FC<CropAdvisoryAccordionProps> = ({
  bulletin,
  selectedCrop,
  onSelectCrop,
}) => {
  // Store expanded crop indices (default expand first crop or active selectedCrop)
  const initialIndex = Math.max(
    0,
    bulletin.crops.findIndex(
      (c) => c.cropName.toLowerCase() === (selectedCrop || '').toLowerCase()
    )
  );

  const [expandedCrops, setExpandedCrops] = useState<Record<number, boolean>>({
    [initialIndex >= 0 ? initialIndex : 0]: true,
  });

  const toggleCrop = (idx: number, cropName: string) => {
    setExpandedCrops((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
    if (onSelectCrop) {
      onSelectCrop(cropName);
    }
  };

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
    <div className="rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#1E2E40] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2ECC71]/15 border border-[#2ECC71]/30 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#2ECC71]" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
              Crop-Specific Stage Advisory Matrix
            </h3>
          </div>
          <p className="text-xs text-[#93A4B8]">
            Detailed stage-wise agronomic recommendations issued by AMFU {bulletin.district} node.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-[#93A4B8]">
          <span>Crops Tracked:</span>
          <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-[#182635] border border-[#2A3E54]">
            {bulletin.crops.length} Priority Cultivars
          </span>
        </div>
      </div>

      {/* Expandable Crops List */}
      <div className="space-y-4">
        {bulletin.crops.map((crop, idx) => {
          const isExpanded = !!expandedCrops[idx];
          const isSelected =
            selectedCrop && crop.cropName.toLowerCase() === selectedCrop.toLowerCase();

          return (
            <div
              key={crop.cropName}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-[#121D2A] border-[#2ECC71]/50 shadow-lg'
                  : 'bg-[#111A24] border-[#1E2E40] hover:border-[#2A3E54] hover:bg-[#131E2A]'
              }`}
            >
              {/* Crop Row Trigger Header */}
              <button
                type="button"
                onClick={() => toggleCrop(idx, crop.cropName)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                      isExpanded
                        ? 'bg-[#2ECC71] text-[#0A1017]'
                        : 'bg-[#182635] text-[#2ECC71] border border-[#2A3E54]'
                    }`}
                  >
                    0{idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {crop.cropName}
                      </h4>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 font-semibold uppercase">
                          Active Target
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${getRiskBadge(
                          crop.riskLevel
                        )}`}
                      >
                        {crop.riskLevel} Risk
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#93A4B8] mt-1">
                      <span className="text-[#38BDF8] font-medium font-mono">
                        Stage: {crop.stage}
                      </span>
                      <span className="text-[#334155]">•</span>
                      <span className="truncate hidden sm:inline">{crop.riskAlert}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-[#38BDF8] font-semibold hidden md:inline">
                    {isExpanded ? 'Collapse' : 'Expand Advisory'}
                  </span>
                  <div
                    className={`p-2 rounded-lg bg-[#182635] text-[#93A4B8] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-white bg-[#2ECC71]/20' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Crop Row Expanded Advisory Details */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-[#1E2E40]/80 space-y-4">
                  {/* Grid of 4 Detailed Functional Advisory Blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Irrigation Management */}
                    <div className="p-4 rounded-xl bg-[#0F1622] border border-[#1E2E40] flex flex-col justify-between hover:border-[#38BDF8]/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                            <Droplet className="w-4 h-4 text-[#38BDF8]" />
                            Irrigation Management
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] font-mono">
                            Moisture Regime
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#F4F7FA] font-medium leading-relaxed mb-3">
                          {crop.irrigationAdvice}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-[#1E2E40] text-[11px] text-[#93A4B8] space-y-1">
                        <div>
                          <strong className="text-[#38BDF8]">Why:</strong> Avoid root zone waterlogging or water stress during key phenology phase.
                        </div>
                        <div className="flex items-center gap-1 text-[#2ECC71]">
                          <Clock className="w-3 h-3" />
                          <span>Window: Review after 48h convective precipitation</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Nutrient & Fertilizer Strategy */}
                    <div className="p-4 rounded-xl bg-[#0F1622] border border-[#1E2E40] flex flex-col justify-between hover:border-[#2ECC71]/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#2ECC71] uppercase tracking-wider flex items-center gap-1.5">
                            <Sprout className="w-4 h-4 text-[#2ECC71]" />
                            Nutrient &amp; Fertilizer
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] font-mono">
                            NPK Splits
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#F4F7FA] font-medium leading-relaxed mb-3">
                          {crop.fertilizerAdvice}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-[#1E2E40] text-[11px] text-[#93A4B8] space-y-1">
                        <div>
                          <strong className="text-[#2ECC71]">Why:</strong> Prevent nitrogen leaching and ensure maximum canopy absorption.
                        </div>
                        <div className="flex items-center gap-1 text-[#F59E0B]">
                          <Clock className="w-3 h-3" />
                          <span>Window: Clear morning hours (08:00 – 11:00 AM) on dry foliage</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Plant Protection & IPM */}
                    <div className="p-4 rounded-xl bg-[#0F1622] border border-[#1E2E40] flex flex-col justify-between hover:border-[#EF4444]/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider flex items-center gap-1.5">
                            <Bug className="w-4 h-4 text-[#EF4444]" />
                            Pest &amp; Disease IPM
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] font-mono">
                            Biosecurity
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#F4F7FA] font-medium leading-relaxed mb-3">
                          {crop.pestDiseaseAdvice}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-[#1E2E40] text-[11px] text-[#93A4B8] space-y-1">
                        <div>
                          <strong className="text-[#EF4444]">Why:</strong> High morning humidity accelerates spore germination and sucking insect spread.
                        </div>
                        <div className="flex items-center gap-1 text-[#38BDF8]">
                          <Clock className="w-3 h-3" />
                          <span>Scouting: Inspect lower leaf surface during 07:30 – 09:30 AM</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Cultural, Harvesting & Post-Harvest */}
                    <div className="p-4 rounded-xl bg-[#0F1622] border border-[#1E2E40] flex flex-col justify-between hover:border-[#A855F7]/40 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#A855F7] uppercase tracking-wider flex items-center gap-1.5">
                            <Tractor className="w-4 h-4 text-[#A855F7]" />
                            Harvesting &amp; Field Ops
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#A855F7]/15 text-[#A855F7] font-mono">
                            Post-Harvest
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#F4F7FA] font-medium leading-relaxed mb-3">
                          {crop.harvestingAdvice}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-[#1E2E40] text-[11px] text-[#93A4B8] space-y-1">
                        <div>
                          <strong className="text-[#A855F7]">Why:</strong> Prevent seed grain spoilage and maintain dry storage standards.
                        </div>
                        <div className="flex items-center gap-1 text-[#CBD5E1]">
                          <ShieldCheck className="w-3 h-3 text-[#2ECC71]" />
                          <span>Standard: Safe grain moisture threshold &lt;12–14%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Sowing / Cultural Footnote */}
                  <div className="p-3 rounded-lg bg-[#0A1017] border border-[#1E2E40] text-xs text-[#93A4B8] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#2ECC71]" />
                      <span><strong>Cultural Practice:</strong> {crop.sowingAdvice}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#38BDF8]">
                      AMFU {bulletin.district} Advisory Code: {crop.cropName.slice(0, 3).toUpperCase()}-2026
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
