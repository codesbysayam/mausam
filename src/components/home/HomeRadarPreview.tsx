import React, { useMemo } from 'react';
import { LocationRecord } from '../../types';
import { Radio, ArrowRight, Layers, Eye, ShieldCheck } from 'lucide-react';
import { findNearestRadarStation } from '../../data/radarStations';

interface HomeRadarPreviewProps {
  location: LocationRecord;
  onNavigateToRadar?: () => void;
}

export const HomeRadarPreview: React.FC<HomeRadarPreviewProps> = ({
  location,
  onNavigateToRadar,
}) => {
  const lat = typeof location.lat === 'number' ? location.lat : 20.2961;
  const lng = typeof location.lng === 'number' ? location.lng : 85.8245;

  const nearestRadarInfo = useMemo(() => {
    return findNearestRadarStation(lat, lng);
  }, [lat, lng]);

  const nearestRadar = {
    ...nearestRadarInfo.station,
    distanceKm: nearestRadarInfo.distanceKm,
    isWithinCoverage: nearestRadarInfo.isWithinCoverage,
  };

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
              Live volumetric hydrometeor surveillance from India's DWR Radar Grid
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
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#43C7F4]">
                Nearest Active Doppler Radar Node
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${nearestRadar.isWithinCoverage ? 'bg-[#22C7A0]/20 text-[#22C7A0]' : 'bg-[#FFC857]/20 text-[#FFC857]'}`}>
                {nearestRadar.isWithinCoverage ? 'In Beam Coverage' : 'Outer Peripheral'}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#F4F7FA] mt-0.5">
              DWR {nearestRadar.city} ({nearestRadar.distanceKm} km away)
            </h3>
            <p className="text-xs text-[#93A4B8] mt-1">
              Provides dual-polarization hydrometeor classification, precipitation reflectivity nowcasts, and convective storm tracking within {nearestRadar.rangeKm} km radar footprint.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Operational Band</span>
              <span className="text-xs font-bold text-[#F4F7FA] truncate block">{nearestRadar.band}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Surveillance Radius</span>
              <span className="text-xs font-bold text-[#22C7A0]">{nearestRadar.rangeKm} km Range</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Scan Frequency</span>
              <span className="text-xs font-bold text-[#43C7F4]">10 Min Volumetric</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Operating Status</span>
              <span className="text-xs font-bold text-[#22C7A0]">OPERATIONAL</span>
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
            <span className="text-[11px] font-bold text-[#F4F7FA] bg-[#071018]/90 px-2.5 py-1 rounded mt-2 border border-[#162331] group-hover:text-[#43C7F4] transition-colors shadow-lg">
              Launch DWR {nearestRadar.city} Scope ({nearestRadar.distanceKm} km) →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
