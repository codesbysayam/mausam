import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { Tractor, Clock, Check, X, ShieldAlert, Sparkles, AlertTriangle, Layers, Info } from 'lucide-react';
import { AgrometTooltip } from './AgrometTooltip';

interface FieldOperationsAndFertilizerProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
}

export const FieldOperationsAndFertilizer: React.FC<FieldOperationsAndFertilizerProps> = ({
  bulletin,
  selectedCrop,
}) => {
  const operations = bulletin.operationsTimeline;

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'EXCELLENT':
        return 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/40';
      case 'GOOD':
        return 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40';
      case 'MODERATE':
        return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40';
      case 'POOR':
      case 'AVOID':
      default:
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT (7 Cols): Best Time for Field Work (Hourly Timeline) */}
      <div className="lg:col-span-7 rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-6 shadow-xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#1E2E40] gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Tractor className="w-4 h-4 text-[#A855F7]" />
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Best Time for Field Work
                </h3>
              </div>
              <p className="text-xs text-[#93A4B8]">
                Hourly operational suitability computed from precipitation, canopy humidity, thermal comfort, and wind drift.
              </p>
            </div>

            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30 font-semibold self-start sm:self-auto">
              Prime: 08:00 – 11:30 AM
            </span>
          </div>

          {/* Horizontal Hourly Timeline Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 my-3">
            {operations.map((slot) => (
              <div
                key={slot.timeLabel}
                className="rounded-xl bg-[#121B26] border border-[#1E2E40] p-3 flex flex-col justify-between hover:border-[#A855F7]/40 transition-all text-center"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    {slot.timeLabel}
                  </span>
                  <div className="my-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getRatingBadge(slot.rating)}`}>
                      {slot.rating}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#1E2E40]/60 text-[10px] text-[#93A4B8] space-y-0.5 font-mono">
                  <div>{slot.tempC}°C • {slot.rhPct}% RH</div>
                  <div className="text-[#64748B]">{slot.windKmh} km/h wind</div>
                </div>
              </div>
            ))}
          </div>

          {/* Operational Matrix Status Chips */}
          <div className="mt-4 pt-4 border-t border-[#1E2E40] grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-[#131E2A] border border-[#1E2E40] flex items-center justify-between">
              <span className="text-[#93A4B8] text-[11px]">Spraying</span>
              <span className="text-[#2ECC71] font-bold flex items-center gap-0.5 text-[10px]">
                <Check className="w-3.5 h-3.5" /> Favorable
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#131E2A] border border-[#1E2E40] flex items-center justify-between">
              <span className="text-[#93A4B8] text-[11px]">Sowing / DSR</span>
              <span className="text-[#2ECC71] font-bold flex items-center gap-0.5 text-[10px]">
                <Check className="w-3.5 h-3.5" /> Favorable
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#131E2A] border border-[#1E2E40] flex items-center justify-between">
              <span className="text-[#93A4B8] text-[11px]">Irrigation</span>
              <span className="text-[#F59E0B] font-bold flex items-center gap-0.5 text-[10px]">
                <ShieldAlert className="w-3.5 h-3.5" /> Hold
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#131E2A] border border-[#1E2E40] flex items-center justify-between">
              <span className="text-[#93A4B8] text-[11px]">Harvesting</span>
              <span className="text-[#38BDF8] font-bold flex items-center gap-0.5 text-[10px]">
                <Check className="w-3.5 h-3.5" /> Morning Slot
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#131E2A] border border-[#1E2E40] flex items-center justify-between col-span-2 sm:col-span-1">
              <span className="text-[#93A4B8] text-[11px]">Tractor Work</span>
              <span className="text-[#2ECC71] font-bold flex items-center gap-0.5 text-[10px]">
                <Check className="w-3.5 h-3.5" /> Dry tracts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT (5 Cols): Nutrient & Fertilizer Window */}
      <div className="lg:col-span-5 rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-6 shadow-xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1E2E40]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2ECC71]" />
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Nutrient &amp; Fertilizer Window
              </h3>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-semibold">
              Suitability: MODERATE
            </span>
          </div>

          {/* Recommended Window Callout */}
          <div className="p-3.5 rounded-xl bg-[#131E2A] border border-[#1E2E40] mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#64748B] uppercase font-mono font-medium">Optimal Window</span>
              <span className="text-xs font-bold text-[#2ECC71] font-mono">Day 3 Post-Rain</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Postpone broadcast urea application until topsoil surface dries to prevent nitrogen volatilization and runoff leaching. Foliar sprays are ideal during 08:00 – 11:00 AM clear windows.
            </p>
          </div>

          {/* Primary Macro-Nutrient Split Guidance */}
          <div className="space-y-2 mb-4 text-xs">
            <div className="p-2.5 rounded-lg bg-[#111A24] border border-[#1E2E40] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#38BDF8]/20 text-[#38BDF8] font-mono font-bold flex items-center justify-center text-[10px]">
                  N
                </span>
                <span className="font-semibold text-white">Nitrogen (Urea Split)</span>
              </div>
              <span className="text-[11px] text-[#F59E0B] font-mono">Hold 48h until dry</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#111A24] border border-[#1E2E40] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#2ECC71]/20 text-[#2ECC71] font-mono font-bold flex items-center justify-center text-[10px]">
                  P
                </span>
                <span className="font-semibold text-white">Phosphorus (DAP / SSP)</span>
              </div>
              <span className="text-[11px] text-[#2ECC71] font-mono">Basal placement safe</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#111A24] border border-[#1E2E40] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#A855F7]/20 text-[#A855F7] font-mono font-bold flex items-center justify-center text-[10px]">
                  K
                </span>
                <span className="font-semibold text-white">Potassium (MOP / Foliar)</span>
              </div>
              <span className="text-[11px] text-[#38BDF8] font-mono">2% spray at flowering</span>
            </div>
          </div>

          {/* Extension Disclaimer */}
          <div className="text-[10px] text-[#64748B] flex items-start gap-1.5 p-2 rounded-lg bg-[#0A1017]">
            <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
            <span>
              Follow State Agricultural University (SAU) and local Krishi Vigyan Kendra (KVK) soil test-based nutrient dosages.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
