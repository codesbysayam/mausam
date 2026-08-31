import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  Droplets,
  Clock,
  CloudRain,
  Gauge,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Info,
  Waves,
  Zap,
} from 'lucide-react';

interface IrrigationIntelligenceProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
}

export const IrrigationIntelligence: React.FC<IrrigationIntelligenceProps> = ({
  bulletin,
  selectedCrop,
}) => {
  const topsoil = bulletin.soilMoisture?.topsoilPct ?? 68;
  const rootZone = bulletin.soilMoisture?.rootZonePct ?? 72;
  const subsoil = bulletin.soilMoisture?.subsoilPct ?? 78;
  const overall = bulletin.soilMoisture?.overallPct ?? 68;
  const rainToday = bulletin.rainfall5DaysList?.[0]?.amountMm ?? 15;

  const irrigationStatus = overall > 65 || rainToday > 8 ? 'POSTPONE / LOW' : 'RECOMMENDED';
  const statusColor = irrigationStatus === 'POSTPONE / LOW' ? '#38BDF8' : '#10B981';

  return (
    <section id="irrigation-intelligence-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E2E40]">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
              Soil Hydrology &amp; Water Balance
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Irrigation Intelligence Window
          </h2>
        </div>
        <span className="text-xs font-mono text-[#94A3B8]">
          Crop evapotranspiration (ET₀) &amp; root-zone moisture tracking
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Status & Decision Matrix (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0B131D] border border-[#1E2E40] p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2E40]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                Current Advisory Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xl sm:text-2xl font-black tracking-tight"
                  style={{ color: statusColor }}
                >
                  {irrigationStatus === 'POSTPONE / LOW' ? 'Delay Irrigation 24–48 Hours' : 'Light Morning Irrigation'}
                </span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#080E16] border border-[#1E2E40] text-right font-mono">
              <span className="text-[10px] text-[#64748B] block">Next Window</span>
              <span className="text-xs font-bold text-white">02 Sep Evening</span>
            </div>
          </div>

          {/* 4 Quantitative Hydrology Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#080E16] border border-[#1E2E40] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                Soil Moisture
              </span>
              <span className="text-xl font-black text-[#10B981]">{overall}%</span>
              <span className="text-[10px] font-mono text-[#94A3B8] block">Field Capacity</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080E16] border border-[#1E2E40] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                Expected Rain
              </span>
              <span className="text-xl font-black text-[#38BDF8]">{rainToday} mm</span>
              <span className="text-[10px] font-mono text-[#94A3B8] block">Next 24 Hours</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080E16] border border-[#1E2E40] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                Daily ET₀ Loss
              </span>
              <span className="text-xl font-black text-[#F59E0B]">4.2 mm</span>
              <span className="text-[10px] font-mono text-[#94A3B8] block">Evapotranspiration</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080E16] border border-[#1E2E40] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                Pump Savings
              </span>
              <span className="text-xl font-black text-[#A78BFA]">3.5 Hrs</span>
              <span className="text-[10px] font-mono text-[#94A3B8] block">Energy Conserved</span>
            </div>
          </div>

          {/* Practical Field Guidance */}
          <div className="p-4 rounded-2xl bg-[#080E16] border border-[#1E2E40] flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">
                Agronomic Rationale for {selectedCrop}:
              </span>
              <p className="text-[#94A3B8] leading-relaxed">
                Atmospheric boundary conditions combined with 15mm incoming showers maintain sufficient capillary water in the top 30cm of soil. Pumping water now increases standing pool depth, causing root asphyxiation and nitrogen fertilizer wash-off.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Visual Soil Moisture Layer Gauge (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0B131D] border border-[#1E2E40] p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2E40]">
              <span className="text-xs font-mono font-bold text-white">
                Multi-Depth Hydrology Gauge
              </span>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                Optimal Moisture
              </span>
            </div>

            {/* Layer Bars */}
            <div className="space-y-3.5 mt-4">
              {/* Topsoil */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white font-bold">Topsoil (0–15 cm)</span>
                  <span className="text-[#10B981] font-bold">{topsoil}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#1E2E40] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2ECC71] to-[#10B981] rounded-full transition-all duration-500"
                    style={{ width: `${topsoil}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-mono text-[#64748B]">
                  Surface evaporation zone • Adequate
                </span>
              </div>

              {/* Root-Zone */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white font-bold">Root-Zone (15–45 cm)</span>
                  <span className="text-[#38BDF8] font-bold">{rootZone}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#1E2E40] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#38BDF8] to-[#0284C7] rounded-full transition-all duration-500"
                    style={{ width: `${rootZone}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-mono text-[#64748B]">
                  Active plant uptake layer • Optimum
                </span>
              </div>

              {/* Deep Subsoil */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-white font-bold">Deep Subsoil (45–100 cm)</span>
                  <span className="text-[#A78BFA] font-bold">{subsoil}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#1E2E40] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] rounded-full transition-all duration-500"
                    style={{ width: `${subsoil}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-mono text-[#64748B]">
                  Perched water reservoir • High
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E2E40] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
            <span>Model: IMD-NCMRWF Soil Moisture Assimilation</span>
            <span className="text-[#38BDF8]">Calibrated</span>
          </div>
        </div>
      </div>
    </section>
  );
};
