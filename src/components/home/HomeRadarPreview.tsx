import React from 'react';
import { LocationRecord } from '../../types';
import { Radio, ArrowRight, Layers, Eye } from 'lucide-react';

interface HomeRadarPreviewProps {
  location: LocationRecord;
  onNavigateToRadar?: () => void;
}

export const HomeRadarPreview: React.FC<HomeRadarPreviewProps> = ({
  location,
  onNavigateToRadar,
}) => {
  return (
    <section id="homepage-radar-preview" className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
              Doppler Radar &amp; Nowcast Reflectivity
            </h2>
            <p className="text-xs text-[#93A4B8]">
              Live 10-minute volumetric scanning from India's DWR radar network
            </p>
          </div>
        </div>

        {onNavigateToRadar && (
          <button
            type="button"
            onClick={onNavigateToRadar}
            className="text-xs text-[#43C7F4] hover:text-[#1499E8] font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Interactive Radar &amp; Satellite Viewer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left 5 Cols: Radar Station Metadata */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#43C7F4]">
              Primary Doppler Radar Node
            </span>
            <h3 className="text-base font-bold text-[#F4F7FA] mt-0.5">
              DWR {location.city || 'Regional'} (S-Band Doppler)
            </h3>
            <p className="text-xs text-[#93A4B8] mt-1">
              Provides dual-polarization hydrometeor classification, precipitation intensity nowcasts, and severe convective storm tracking within 250 km radius.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Operational Band</span>
              <span className="text-xs font-bold text-[#F4F7FA]">S-Band Dual Pol</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Scan Range</span>
              <span className="text-xs font-bold text-[#22C7A0]">250 km Surveillance</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Update Interval</span>
              <span className="text-xs font-bold text-[#43C7F4]">10 Minutes</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Echo Status</span>
              <span className="text-xs font-bold text-[#FFC857]">Active Reflectivity</span>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Stylized Interactive Radar Graphic Preview */}
        <div
          onClick={onNavigateToRadar}
          className="lg:col-span-7 h-52 rounded-xl bg-[#071018] border border-[#162331] relative overflow-hidden flex items-center justify-center cursor-pointer group hover:border-[#1499E8]/50 transition-all shadow-inner"
        >
          {/* Concentric radar rings */}
          <div className="absolute w-44 h-44 rounded-full border border-[#162331]" />
          <div className="absolute w-32 h-32 rounded-full border border-[#162331]" />
          <div className="absolute w-20 h-20 rounded-full border border-[#162331]" />
          <div className="absolute w-full h-[1px] bg-[#162331]" />
          <div className="absolute h-full w-[1px] bg-[#162331]" />

          {/* Rotating radar sweep beam */}
          <div className="absolute w-48 h-48 rounded-full border-t-2 border-[#1499E8]/40 animate-spin" style={{ animationDuration: '4s' }} />

          {/* Simulated radar reflectivity echoes */}
          <div className="absolute top-12 right-20 w-12 h-8 rounded-full bg-[#22C7A0]/40 blur-md" />
          <div className="absolute top-14 right-24 w-6 h-5 rounded-full bg-[#FFC857]/60 blur-xs" />
          <div className="absolute bottom-14 left-24 w-16 h-10 rounded-full bg-[#43C7F4]/30 blur-md" />

          {/* Center station dot */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-[#1499E8] border-2 border-white shadow-lg animate-pulse" />
            <span className="text-[11px] font-bold text-[#F4F7FA] bg-[#071018]/90 px-2 py-0.5 rounded mt-2 border border-[#162331] group-hover:text-[#43C7F4] transition-colors">
              Launch Full DWR Scope →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
