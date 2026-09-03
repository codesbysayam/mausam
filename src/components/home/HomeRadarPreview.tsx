import React, { useState, useEffect, useMemo } from 'react';
import { LocationRecord } from '../../types';
import { Radio, ArrowRight, Layers, Compass, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { findNearestRadarStation } from '../../data/radarStations';
import { fetchLiveRadarData, RadarApiResponse } from '../../services/radarService';

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

  const [radarState, setRadarState] = useState<RadarApiResponse | null>(null);

  useEffect(() => {
    fetchLiveRadarData('MAXZ')
      .then(setRadarState)
      .catch(() => {
        setRadarState({
          status: 'ERROR',
          available: false,
          message: 'Radar data temporarily unavailable',
          host: '',
          pastFrames: [],
          nowcastFrames: [],
          sourceAttribution: 'Weather radar data by RainViewer',
          originalProvider: 'Global weather radar composite network',
        });
      });
  }, []);

  const latestTime =
    radarState?.pastFrames && radarState.pastFrames.length > 0
      ? radarState.pastFrames[radarState.pastFrames.length - 1].formattedTime
      : radarState?.lastAvailableTimestamp;

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
              Geographic meteorological radar surveillance from India's DWR Radar Grid
            </p>
          </div>
        </div>

        {onNavigateToRadar && (
          <button
            type="button"
            onClick={onNavigateToRadar}
            className="text-xs text-[#43C7F4] hover:text-[#1499E8] font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Full Meteorological Radar Scope</span>
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
                Assigned Doppler Radar Node
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${nearestRadar.isWithinCoverage ? 'bg-[#22C7A0]/20 text-[#22C7A0]' : 'bg-[#FFC857]/20 text-[#FFC857]'}`}>
                {nearestRadar.isWithinCoverage ? 'In Beam Coverage' : 'Peripheral Range'}
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
              <span className="text-xs font-bold text-[#22C7A0]">{nearestRadar.rangeKm} km Scope</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Scan Cadence</span>
              <span className="text-xs font-bold text-[#43C7F4]">10 Min Volumetric</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Sweep Status</span>
              <span className="text-xs font-bold text-[#22C7A0]">OPERATIONAL</span>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Professional Geographic Radar Scope Instrument Preview */}
        <div
          onClick={onNavigateToRadar}
          className="lg:col-span-7 h-56 rounded-xl bg-[#070C14] border border-[#162331] relative overflow-hidden flex items-center justify-center cursor-pointer group hover:border-[#1499E8]/60 transition-all shadow-inner"
        >
          {/* Subtle Lat/Lng graticule grid lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#43C7F4_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Range rings (50km, 100km, 150km, 200km, 250km) */}
          <div className="absolute w-52 h-52 rounded-full border border-[#1499E8]/30" />
          <div className="absolute w-40 h-40 rounded-full border border-[#1499E8]/20 border-dashed" />
          <div className="absolute w-28 h-28 rounded-full border border-[#1499E8]/25" />
          <div className="absolute w-16 h-16 rounded-full border border-[#1499E8]/20 border-dashed" />

          {/* Azimuth crosshairs (0°, 90°, 180°, 270°) */}
          <div className="absolute w-56 h-[1px] bg-[#1499E8]/30" />
          <div className="absolute h-56 w-[1px] bg-[#1499E8]/30" />

          {/* Azimuth diagonal markers (45°, 135°, 225°, 315°) */}
          <div className="absolute w-48 h-[1px] bg-[#1499E8]/15 rotate-45" />
          <div className="absolute w-48 h-[1px] bg-[#1499E8]/15 -rotate-45" />

          {/* Range ring distance indicators */}
          <span className="absolute top-4 text-[9px] font-mono text-[#43C7F4]/80 font-bold">250 km</span>
          <span className="absolute top-10 text-[9px] font-mono text-[#43C7F4]/60">150 km</span>
          <span className="absolute top-16 text-[9px] font-mono text-[#43C7F4]/50">75 km</span>

          {/* Compass North Arrow */}
          <div className="absolute top-2.5 right-3 flex items-center gap-1 text-[9px] font-mono font-bold text-[#FF8C42] bg-[#071018]/80 px-1.5 py-0.5 rounded border border-[#162331]">
            <Compass className="w-3 h-3 text-[#43C7F4]" />
            <span>N 000°</span>
          </div>

          {/* Status Overlay: Genuine Real Data or Clearly Labeled Unavailable */}
          <div className="absolute bottom-2.5 inset-x-3 z-10 flex items-center justify-between pointer-events-none text-[10px]">
            {radarState?.available ? (
              <span className="flex items-center gap-1 text-[#22C7A0] bg-[#071018]/90 px-2 py-0.5 rounded border border-[#22C7A0]/30 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C7A0] animate-pulse" />
                Live Echo Sweep: {latestTime}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#FFC857] bg-[#071018]/90 px-2 py-0.5 rounded border border-[#FFC857]/30 font-mono">
                <Clock className="w-3 h-3 text-[#FFC857]" />
                Last Available Image: {latestTime || 'Awaiting Sweep'}
              </span>
            )}

            <span className="text-[#43C7F4] font-bold group-hover:underline flex items-center gap-1">
              Open Full Scope →
            </span>
          </div>

          {/* Center Radar Station Crosshair Marker */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#1499E8] border-2 border-white shadow-lg" />
              <div className="absolute w-8 h-8 rounded-full border border-[#43C7F4]/60 animate-ping" />
            </div>
            <span className="text-[10px] font-bold text-[#F4F7FA] font-mono bg-[#071018]/95 px-2 py-0.5 rounded mt-2 border border-[#162331] group-hover:text-[#43C7F4] transition-colors shadow-lg">
              {nearestRadar.city} [{nearestRadar.id}]
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

