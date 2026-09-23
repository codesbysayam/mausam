import React from 'react';
import {
  Compass,
  Wind,
  Gauge,
  MapPin,
  Anchor,
  Calendar,
  AlertOctagon,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { WeatherSystemEvent } from '../../types/cyclone';

interface CycloneSystemOverviewProps {
  activeSystem: WeatherSystemEvent;
}

export const CycloneSystemOverview: React.FC<CycloneSystemOverviewProps> = ({
  activeSystem,
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* 4-Stage Warning Status Pipeline */}
      <div className="bg-[#0D1826] border border-[#1E3A5F] rounded-xl p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#E2E8F0]">
              IMD 4-Stage Cyclone Warning Protocol
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#94A3B8]">
            Standard Operating Procedure (NWFC / RSMC)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Stage 1 */}
          <div className="p-2.5 rounded-lg border border-[#1E2E40] bg-[#0A1018]/60 flex flex-col">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Stage 1 (T-72h)</span>
            <span className="text-xs font-semibold text-[#94A3B8]">Pre-Cyclone Watch</span>
            <span className="text-[10px] text-[#10B981] font-mono mt-1">● Concluded</span>
          </div>

          {/* Stage 2 */}
          <div className="p-2.5 rounded-lg border border-[#1E2E40] bg-[#0A1018]/60 flex flex-col">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Stage 2 (T-48h)</span>
            <span className="text-xs font-semibold text-[#94A3B8]">Cyclone Alert</span>
            <span className="text-[10px] text-[#10B981] font-mono mt-1">● Concluded</span>
          </div>

          {/* Stage 3 - CURRENT */}
          <div className="p-2.5 rounded-lg border border-[#E74C3C]/60 bg-[#E74C3C]/10 flex flex-col shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#FF6B6B] uppercase">Stage 3 (T-24h)</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <span className="text-xs font-bold text-white">Cyclone Warning</span>
            <span className="text-[10px] text-[#FF6B6B] font-mono font-bold mt-1">● ACTIVE (Landfall Imminent)</span>
          </div>

          {/* Stage 4 */}
          <div className="p-2.5 rounded-lg border border-[#1E2E40] bg-[#0A1018]/60 flex flex-col opacity-60">
            <span className="text-[10px] font-mono font-bold text-[#64748B] uppercase">Stage 4 (T-12h)</span>
            <span className="text-xs font-semibold text-[#94A3B8]">Post-Landfall Outlook</span>
            <span className="text-[10px] text-[#64748B] font-mono mt-1">Upcoming</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Synoptic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Location & Coordinates */}
        <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
              Current Center
            </span>
            <div className="p-1.5 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8]">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-white font-mono">
              {activeSystem.latitude.toFixed(1)}°N, {activeSystem.longitude.toFixed(1)}°E
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 leading-snug">
              {activeSystem.currentLocation}
            </p>
          </div>
        </div>

        {/* Metric 2: Max Sustained Wind & Gusts */}
        <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
              Sustained Wind Speed
            </span>
            <div className="p-1.5 rounded-lg bg-[#FB923C]/10 text-[#FB923C]">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-white font-mono">
              {activeSystem.maxSustainedWind}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#94A3B8]">
              <span>Peak Gusts:</span>
              <strong className="text-amber-400 font-mono font-bold">{activeSystem.windGust}</strong>
            </div>
          </div>
        </div>

        {/* Metric 3: Movement & Speed */}
        <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
              Movement & Drift
            </span>
            <div className="p-1.5 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8]">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-white font-mono">
              {activeSystem.movementDirection} @ {activeSystem.movementSpeed}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#94A3B8]">
              <span>Central Pressure:</span>
              <strong className="text-white font-mono">{activeSystem.pressure}</strong>
            </div>
          </div>
        </div>

        {/* Metric 4: Landfall Target */}
        <div className="bg-[#0B1523] border border-[#E74C3C]/40 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md bg-gradient-to-br from-[#0B1523] to-[#E74C3C]/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FF6B6B]">
              Expected Landfall
            </span>
            <div className="p-1.5 rounded-lg bg-[#E74C3C]/20 text-[#FF6B6B]">
              <Anchor className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-snug">
              {activeSystem.expectedLandfall}
            </div>
            <p className="text-[11px] text-amber-300 font-mono mt-1">
              Window: {activeSystem.expectedLandfallWindow}
            </p>
          </div>
        </div>
      </div>

      {/* Affected States & Districts Bar */}
      <div className="bg-[#0B1523] border border-[#1E2E40] rounded-xl p-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-[#E74C3C]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#E2E8F0]">
              Officially Alerted Coastal & Interior Districts ({activeSystem.affectedDistricts.length})
            </span>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">
            States: <strong className="text-white">{activeSystem.affectedStates.join(', ')}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1">
          {activeSystem.affectedDistricts.map((district) => (
            <span
              key={district}
              className="px-2.5 py-1 rounded-md bg-[#132337] border border-[#25486F] text-xs font-medium text-[#93C5FD]"
            >
              {district}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
