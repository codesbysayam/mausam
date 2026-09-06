import React, { useState } from 'react';
import { RadarStation } from '../../types/radar';

export interface RadarTechnicalSpecsProps {
  station: RadarStation | null;
  radarSourceLabel?: string;
}

export const RadarTechnicalSpecs: React.FC<RadarTechnicalSpecsProps> = ({
  station,
  radarSourceLabel = 'RainViewer precipitation radar / IMD DWR Reference',
}) => {
  // Collapsed by default as requested
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="bg-[#0B263D] border border-[#1D5278] rounded-lg overflow-hidden shadow-md">
      {/* Collapsible Header Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors hover:bg-[#102D44]/70"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#38BDF8] text-[20px]">
            settings_input_antenna
          </span>
          <span className="font-bold text-sm text-[#F5F9FC]">
            Radar Technical Information
          </span>
          {station && (
            <span className="text-xs text-[#AFC4D8] font-mono ml-2 hidden sm:inline">
              ({station.name} • {station.id})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#38BDF8] font-semibold">
          <span>{isExpanded ? 'Hide Specs' : 'Show Specs'}</span>
          <span className="material-symbols-outlined text-[18px]">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-5 border-t border-[#1D5278] bg-[#0B263D]">
          {station ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#102D44] p-3 rounded border border-[#1D5278]">
                <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
                  Station Coordinates
                </span>
                <span className="text-[#F5F9FC] font-bold text-sm font-mono block">
                  {station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E
                </span>
                <span className="text-[10px] text-[#AFC4D8] mt-1 block">WGS84 Geodetic Datum</span>
              </div>

              <div className="bg-[#102D44] p-3 rounded border border-[#1D5278]">
                <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
                  Transmitter Band &amp; Frequency
                </span>
                <span className="text-[#38BDF8] font-bold text-sm font-mono block">
                  {station.band}
                </span>
                <span className="text-[10px] text-[#AFC4D8] mt-1 block">
                  {station.frequencyGhz ? `${station.frequencyGhz} GHz Carrier` : 'Dual Polarization'}
                </span>
              </div>

              <div className="bg-[#102D44] p-3 rounded border border-[#1D5278]">
                <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
                  Antenna Elevation
                </span>
                <span className="text-[#00C897] font-bold text-sm font-mono block">
                  {station.elevationM ? `${station.elevationM}m ASL` : 'Site ASL'}
                </span>
                <span className="text-[10px] text-[#AFC4D8] mt-1 block">Tower Mast Height</span>
              </div>

              <div className="bg-[#102D44] p-3 rounded border border-[#1D5278]">
                <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
                  Coverage &amp; Range
                </span>
                <span className="text-[#F59E0B] font-bold text-sm font-mono block">
                  {station.maxRangeKm} km Surveillance
                </span>
                <span className="text-[10px] text-[#AFC4D8] mt-1 block">Radial Doppler Footprint</span>
              </div>

              <div className="bg-[#102D44] p-3 rounded border border-[#1D5278]">
                <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
                  Primary Data Source
                </span>
                <span className="text-[#F5F9FC] font-semibold text-xs block">
                  IMD Doppler Radar Network
                </span>
                <span className="text-[10px] text-[#AFC4D8] mt-1 block">National Weather Radars</span>
              </div>

              <div className="bg-[#102D44] p-3 rounded border border-[#1D5278]">
                <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
                  Active Overlay Source
                </span>
                <span className="text-[#38BDF8] font-semibold text-xs block truncate">
                  {radarSourceLabel}
                </span>
                <span className="text-[10px] text-[#AFC4D8] mt-1 block">Open Doppler Reflectivity</span>
              </div>

              <div className="bg-[#102D44] p-3 rounded border border-[#1D5278]">
                <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
                  Scan Strategy
                </span>
                <span className="text-[#F5F9FC] font-bold font-mono text-xs block">
                  10 Elevation Cuts (0.5°–19.5°)
                </span>
                <span className="text-[10px] text-[#AFC4D8] mt-1 block">10-Minute Volumetric Cycle</span>
              </div>

              <div className="bg-[#102D44] p-3 rounded border border-[#1D5278]">
                <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block mb-1">
                  Product Availability
                </span>
                <span className="text-[#00C897] font-bold text-xs block">
                  Precipitation Composite Active
                </span>
                <span className="text-[10px] text-[#8A94A6] mt-1 block">IMD Volumetric Offline/Restricted</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#8A94A6] py-2">
              Select a radar station to inspect hardware and operational frequency parameters.
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default RadarTechnicalSpecs;
