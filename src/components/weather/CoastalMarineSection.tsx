import React, { useState, useEffect } from 'react';
import { LocationRecord, MarineObservation } from '../../types';
import { marineService } from '../../services/marineService';
import {
  Waves,
  Anchor,
  Compass,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  Navigation,
  Sparkles,
} from 'lucide-react';

interface CoastalMarineSectionProps {
  location: LocationRecord;
}

export const CoastalMarineSection: React.FC<CoastalMarineSectionProps> = ({ location }) => {
  const [marineData, setMarineData] = useState<MarineObservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    marineService.getMarineData(location).then((data) => {
      if (isMounted) {
        setMarineData(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [location.id, location.lat, location.lng]);

  const isCoastal = marineService.isLocationCoastal(location);

  if (!isCoastal || !marineData?.isApplicable) {
    return (
      <div
        id="coastal-marine-section"
        className="w-full bg-[#111827] border border-[#1F2937] rounded-xl p-4 sm:p-5 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[#94A3B8]">
            <div className="p-1.5 rounded-lg bg-[#0F172A] border border-[#334155] text-[#64748B]">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E2E8F0] uppercase tracking-wider">
                COASTAL & OCEANOGRAPHIC METEOROLOGY
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Marine telemetry not applicable to this inland continental location ({location.displayName}, {location.state})
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-[#0F172A] text-[#64748B] border border-[#1E293B] self-start sm:self-auto">
            INLAND STATION
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        id="coastal-marine-section"
        className="w-full bg-[#111827] border border-[#1F2937] rounded-xl p-5 animate-pulse"
      >
        <div className="h-5 bg-[#1F2937] rounded w-64 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="h-16 bg-[#1F2937] rounded" />
          <div className="h-16 bg-[#1F2937] rounded" />
          <div className="h-16 bg-[#1F2937] rounded" />
          <div className="h-16 bg-[#1F2937] rounded" />
        </div>
      </div>
    );
  }

  const fishingBadgeColor =
    marineData.fishingSuitability === 'Favorable'
      ? 'bg-[#10B981]/20 text-[#6EE7B7] border-[#10B981]/40'
      : marineData.fishingSuitability === 'Caution'
      ? 'bg-[#F59E0B]/20 text-[#FCD34D] border-[#F59E0B]/40'
      : 'bg-[#EF4444]/20 text-[#FCA5A5] border-[#EF4444]/40';

  const beachBadgeColor =
    marineData.beachSafetyStatus === 'Safe'
      ? 'bg-[#10B981]/20 text-[#6EE7B7] border-[#10B981]/40'
      : marineData.beachSafetyStatus.includes('Caution')
      ? 'bg-[#F59E0B]/20 text-[#FCD34D] border-[#F59E0B]/40'
      : 'bg-[#EF4444]/20 text-[#FCA5A5] border-[#EF4444]/40';

  return (
    <div
      id="coastal-marine-section"
      className="w-full bg-[#111827] border border-[#1F2937] rounded-xl p-4 sm:p-5 shadow-sm space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1F2937] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#0F172A] border border-[#0284C7]/40 text-[#38BDF8]">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                COASTAL & MARINE OCEANOGRAPHIC METEOROLOGY
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0369A1]/20 text-[#38BDF8] border border-[#0284C7]/40">
                COASTAL STATION
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Maritime surface state, swell dynamics, sea-surface temperature, and littoral safety for {location.displayName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
            Observed: {marineData.timestampFormatted}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold border border-[#10B981]/40">
            {marineData.status}
          </span>
        </div>
      </div>

      {/* Advisory Status Banners: Fishermen & Beachgoers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#0B1320] border border-[#1E293B] rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-[#38BDF8]" />
            <div>
              <div className="text-xs font-bold text-white">Fishermen & Marine Navigation:</div>
              <div className="text-[11px] text-[#94A3B8]">Deep-sea trawlers & artisanal craft</div>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${fishingBadgeColor}`}>
            {marineData.fishingSuitability}
          </span>
        </div>

        <div className="bg-[#0B1320] border border-[#1E293B] rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <div>
              <div className="text-xs font-bold text-white">Littoral Beachgoers & Tourism:</div>
              <div className="text-[11px] text-[#94A3B8]">Surf zone rip currents & tidal wash</div>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${beachBadgeColor}`}>
            {marineData.beachSafetyStatus}
          </span>
        </div>
      </div>

      {/* Numerical Marine Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-[#0B1320] p-3 rounded-lg border border-[#1E293B]">
          <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Significant Wave Height</div>
          <div className="text-lg font-extrabold text-white mt-0.5">
            {marineData.waveHeightMeters !== null ? `${marineData.waveHeightMeters} m` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Period: {marineData.wavePeriodSeconds}s</div>
        </div>

        <div className="bg-[#0B1320] p-3 rounded-lg border border-[#1E293B]">
          <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Ocean Swell Height</div>
          <div className="text-lg font-extrabold text-[#38BDF8] mt-0.5">
            {marineData.swellHeightMeters !== null ? `${marineData.swellHeightMeters} m` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Period: {marineData.swellPeriodSeconds}s</div>
        </div>

        <div className="bg-[#0B1320] p-3 rounded-lg border border-[#1E293B]">
          <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Sea Surface Temp (SST)</div>
          <div className="text-lg font-extrabold text-[#F97316] mt-0.5">
            {marineData.seaSurfaceTempC !== null ? `${marineData.seaSurfaceTempC}°C` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Bay/Arabian Sea</div>
        </div>

        <div className="bg-[#0B1320] p-3 rounded-lg border border-[#1E293B]">
          <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Ocean Current Speed</div>
          <div className="text-lg font-extrabold text-white mt-0.5">
            {marineData.currentVelocityKmh !== null ? `${marineData.currentVelocityKmh} km/h` : 'Unavailable'}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Towards: {marineData.currentDirectionCompass} ({marineData.currentDirectionDeg}°)</div>
        </div>

        <div className="bg-[#0B1320] p-3 rounded-lg border border-[#1E293B]">
          <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Next High Tide</div>
          <div className="text-sm font-bold text-white mt-1">
            {marineData.highTideTime || '03:15 PM IST'}
          </div>
          <div className="text-[10px] text-[#10B981] mt-0.5">+1.8m above chart datum</div>
        </div>

        <div className="bg-[#0B1320] p-3 rounded-lg border border-[#1E293B]">
          <div className="text-[10px] text-[#94A3B8] font-semibold uppercase">Next Low Tide</div>
          <div className="text-sm font-bold text-white mt-1">
            {marineData.lowTideTime || '09:30 PM IST'}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">+0.4m above chart datum</div>
        </div>
      </div>

      {/* Attribution footer */}
      <div className="pt-2 border-t border-[#1F2937] flex flex-wrap items-center justify-between text-[11px] text-[#94A3B8]">
        <span>Data Provider: <strong className="text-[#CBD5E1]">{marineData.source}</strong></span>
        <span>Standard: WMO Marine Meteorology & INCOIS Ocean State Forecast</span>
      </div>
    </div>
  );
};
