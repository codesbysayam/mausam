import React from 'react';
import { LocationRecord } from '../../types';
import { Radio, MapPin, ArrowRight, ShieldCheck, Waves } from 'lucide-react';

interface ForecastRadarPreviewProps {
  location: LocationRecord;
  lastUpdated: string;
  onNavigateToRadar?: () => void;
}

export const ForecastRadarPreview: React.FC<ForecastRadarPreviewProps> = ({
  location,
  lastUpdated,
  onNavigateToRadar,
}) => {
  return (
    <div
      id="forecast-radar-map-preview"
      className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5"
    >
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center shrink-0 border border-[#1499E8]/30">
          <Radio className="w-6 h-6 animate-pulse" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#22C7A0]/15 text-[#22C7A0] border border-[#22C7A0]/30">
              Active Doppler Radar
            </span>
            <span className="text-xs text-[#93A4B8]">
              Station: <strong className="text-[#F4F7FA] font-medium">{location.city} DWR</strong>
            </span>
            <span className="text-xs text-[#93A4B8]">• Coverage: 250 km Radius</span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-[#F4F7FA]">
            Live S-Band Doppler Precipitation Reflectivity (dBZ)
          </h4>

          <p className="text-xs text-[#D1DCE8] leading-relaxed max-w-2xl">
            Real-time radar sweeps scan convective hydrometeor density and cloud-top divergence across {location.city} and adjoining districts.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
        {onNavigateToRadar && (
          <button
            type="button"
            onClick={onNavigateToRadar}
            className="px-4 py-2.5 rounded-xl bg-[#1499E8] hover:bg-[#0F7DC0] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#1499E8]/20 cursor-pointer"
          >
            <span>OPEN RADAR &amp; MAPS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
