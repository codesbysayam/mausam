import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { CloudRain, Sprout, Droplets, Layers, Calendar, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { AgrometTooltip } from './AgrometTooltip';

interface RainfallAndSoilSectionProps {
  bulletin: ExtendedAgrometBulletin;
}

export const RainfallAndSoilSection: React.FC<RainfallAndSoilSectionProps> = ({ bulletin }) => {
  const [activeRainDayIndex, setActiveRainDayIndex] = useState<number>(0);
  const rainList = bulletin.rainfall5DaysList;
  const soil = bulletin.soilMoisture;
  const cumulative = bulletin.cumulativeRainfallMm;

  const maxDailyRain = Math.max(...rainList.map((r) => r.amountMm), 25);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT (7 Cols): 5-Day Quantitative Rainfall Outlook */}
      <div className="lg:col-span-7 rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-6 shadow-xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#1E2E40] gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  5-Day Quantitative Rainfall Outlook
                </h3>
              </div>
              <p className="text-xs text-[#93A4B8]">
                Gramin Krishi Mausam Sewa spatial NWF ensemble projection for {bulletin.district}.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/20 self-start sm:self-auto">
              <span className="text-[10px] text-[#93A4B8] uppercase font-medium">5-Day Cumulative</span>
              <span className="text-sm font-bold font-mono text-[#38BDF8]">{cumulative} mm</span>
            </div>
          </div>

          {/* Interactive Rainfall Bar Timeline */}
          <div className="grid grid-cols-5 gap-2.5 my-4">
            {rainList.map((item, idx) => {
              const isSelected = activeRainDayIndex === idx;
              const barHeightPct = Math.max(12, (item.amountMm / maxDailyRain) * 100);

              return (
                <button
                  key={item.dayName}
                  type="button"
                  onClick={() => setActiveRainDayIndex(idx)}
                  className={`relative rounded-xl p-3 flex flex-col items-center justify-between transition-all text-center group cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'bg-[#182736] border-2 border-[#38BDF8] shadow-lg scale-[1.02]'
                      : 'bg-[#121B26] border border-[#1E2E40] hover:border-[#38BDF8]/40 hover:bg-[#15212E]'
                  }`}
                >
                  <span className="text-[11px] font-bold text-[#F4F7FA] block truncate w-full">
                    {item.dayName}
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono block mb-3">
                    {item.dateStr}
                  </span>

                  {/* Vertical Rain Column Gauge */}
                  <div className="w-full flex items-end justify-center h-24 bg-[#0A1017] rounded-lg p-1 mb-3 relative overflow-hidden">
                    {/* Background gridlines */}
                    <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-[#1E2E40]/50" />
                    
                    <div
                      className={`w-full max-w-[28px] rounded-md transition-all duration-500 flex items-center justify-center ${
                        item.amountMm > 15
                          ? 'bg-gradient-to-t from-[#2563EB] to-[#38BDF8]'
                          : item.amountMm > 0
                          ? 'bg-gradient-to-t from-[#0284C7] to-[#38BDF8]'
                          : 'bg-[#1E293B]'
                      }`}
                      style={{ height: `${barHeightPct}%` }}
                    >
                      {item.amountMm > 0 && (
                        <span className="text-[9px] font-mono font-bold text-white -rotate-90 sm:rotate-0">
                          {item.amountMm}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rain Amount / Nil Badge */}
                  <span className={`text-xs font-black font-mono ${item.amountMm > 0 ? 'text-[#38BDF8]' : 'text-[#64748B]'}`}>
                    {item.amountMm > 0 ? `${item.amountMm} mm` : '0 mm'}
                  </span>

                  <span className="text-[10px] text-[#93A4B8] font-mono mt-0.5">
                    {item.probPercent}% Prob
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Day Expanded Diagnostic */}
          {rainList[activeRainDayIndex] && (
            <div className="p-3.5 rounded-xl bg-[#131E2A] border border-[#1E2E40] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#182635] text-[#38BDF8]">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-bold text-sm">
                      {rainList[activeRainDayIndex].dayName} ({rainList[activeRainDayIndex].dateStr})
                    </strong>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      rainList[activeRainDayIndex].amountMm > 10
                        ? 'bg-[#38BDF8]/20 text-[#38BDF8]'
                        : rainList[activeRainDayIndex].amountMm > 0
                        ? 'bg-[#2ECC71]/20 text-[#2ECC71]'
                        : 'bg-[#64748B]/20 text-[#93A4B8]'
                    }`}>
                      {rainList[activeRainDayIndex].condition}
                    </span>
                  </div>
                  <p className="text-[#93A4B8] text-[11px] mt-0.5">
                    {rainList[activeRainDayIndex].amountMm > 10
                      ? 'Precipitation surplus: Irrigation withholding mandated. Clear field furrows.'
                      : rainList[activeRainDayIndex].amountMm > 0
                      ? 'Light moisture contribution: Surface wetting sufficient for shallow root activity.'
                      : 'Clear atmospheric spell: Favorable for foliar feeding and mechanical hoeing.'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-[#64748B] block uppercase font-mono">Precipitation Status</span>
                <span className="font-bold text-[#F4F7FA] font-mono">
                  {rainList[activeRainDayIndex].isWet ? 'Wet Farm Conditions' : 'Workable Dry Day'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT (5 Cols): Soil Moisture Profile & Irrigation Planner */}
      <div className="lg:col-span-5 rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-6 shadow-xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1E2E40]">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#2ECC71]" />
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Soil Moisture Profile
              </h3>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182635] text-[#2ECC71] border border-[#2ECC71]/30 font-medium">
              Model-Derived
            </span>
          </div>

          {/* Current Overall Soil Metric */}
          <div className="flex items-center justify-between bg-[#131D28] p-3.5 rounded-xl border border-[#1E2E40] mb-4">
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">
                Total Root-Zone Water
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black font-mono text-white">{soil.overallPct}%</span>
                <span className="text-xs font-semibold text-[#2ECC71] px-2 py-0.5 rounded bg-[#2ECC71]/15">
                  {soil.status}
                </span>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-[#64748B] block text-[10px]">Field Capacity: {soil.fieldCapacityPct}%</span>
              <span className="text-[#38BDF8] font-mono font-semibold">
                {soil.trend === 'increasing' ? '↑ Rising after rain' : '→ Stable buffer'}
              </span>
            </div>
          </div>

          {/* Vertical 3-Layer Soil Profile Graphic */}
          <div className="space-y-2 mb-4">
            {/* Layer 1: Topsoil (0 - 15 cm) */}
            <div className="p-2.5 rounded-lg bg-[#111A24] border border-[#1E2E40] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#38BDF8]" />
                <div>
                  <span className="font-bold text-white block text-[11px]">Topsoil (0 – 15 cm)</span>
                  <span className="text-[10px] text-[#64748B]">Seed germination &amp; shallow roots</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[#38BDF8]">{soil.topsoilPct}%</span>
                <span className="text-[9px] text-[#64748B] block">Moisture</span>
              </div>
            </div>

            {/* Layer 2: Root Zone (15 - 45 cm) */}
            <div className="p-2.5 rounded-lg bg-[#111A24] border border-[#1E2E40] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#2ECC71]" />
                <div>
                  <span className="font-bold text-white block text-[11px]">Active Root Zone (15 – 45 cm)</span>
                  <span className="text-[10px] text-[#64748B]">Transpiration &amp; nutrient uptake</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[#2ECC71]">{soil.rootZonePct}%</span>
                <span className="text-[9px] text-[#64748B] block">Optimal</span>
              </div>
            </div>

            {/* Layer 3: Subsoil (45 - 100 cm) */}
            <div className="p-2.5 rounded-lg bg-[#111A24] border border-[#1E2E40] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#D97706]" />
                <div>
                  <span className="font-bold text-white block text-[11px]">Deep Subsoil (45 – 100 cm)</span>
                  <span className="text-[10px] text-[#64748B]">Groundwater buffer zone</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[#D97706]">{soil.subsoilPct}%</span>
                <span className="text-[9px] text-[#64748B] block">Recharged</span>
              </div>
            </div>
          </div>

          {/* Irrigation Window Planner Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#142333] to-[#0F1E2E] border border-[#38BDF8]/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" />
                Irrigation Decision Window
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#38BDF8] text-[#0A1017] uppercase">
                STATUS: WAIT
              </span>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed mb-2">
              Natural rainfall ({cumulative} mm expected) meets crop water demand. Next irrigation review: <strong className="text-white">Tomorrow 08:00 AM</strong>.
            </p>

            {/* Micro Irrigation Flow Step */}
            <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-mono">
              <div className="p-1 rounded bg-[#182635] text-[#38BDF8] border border-[#2A3E54]">1. NOW: WAIT</div>
              <div className="p-1 rounded bg-[#182635] text-[#38BDF8] border border-[#2A3E54]">2. RAIN SPELL</div>
              <div className="p-1 rounded bg-[#182635] text-[#93A4B8]">3. REASSESS</div>
              <div className="p-1 rounded bg-[#182635] text-[#64748B]">4. RESUME</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
