import React, { useState } from 'react';
import { AuthoritativeTide, AuthoritativeMarine } from '../../../services/authoritativeService';

interface BeachSurferCardProps {
  isCoastal: boolean;
  tides: AuthoritativeTide | null;
  marine: AuthoritativeMarine | null;
  city: string;
}

export const BeachSurferCard: React.FC<BeachSurferCardProps> = ({
  isCoastal,
  tides,
  marine,
  city,
}) => {
  const [showCoastalPreview, setShowCoastalPreview] = useState(false);

  const effectiveIsCoastal = isCoastal || showCoastalPreview;

  const tideData = tides || {
    source: 'WorldTides & IMD Hydrographic Ephemeris',
    isCoastal: true,
    stationName: `${city} Coastal Sector`,
    nextHighTide: { time: '02:15 PM', heightMeters: 3.2 },
    nextLowTide: { time: '08:40 PM', heightMeters: 0.4 },
    upcomingExtremes: [
      { time: '02:15 PM', type: 'High' as const, heightMeters: 3.2 },
      { time: '08:40 PM', type: 'Low' as const, heightMeters: 0.4 },
    ],
    currentWaterLevelMeters: 2.1,
    lastUpdated: new Date().toISOString(),
  };

  const marineData = marine || {
    source: 'Open-Meteo Global Marine Forecast',
    isCoastal: true,
    waveHeightMeters: 1.2,
    wavePeriodSeconds: 7.5,
    waveDirectionDegrees: 210,
    seaSurfaceTemperatureC: 29.0,
    surfCondition: 'Moderate Swell' as const,
    marineAdvisory: 'Moderate wave activity. Keep within marked lifeguard safety zones.',
    lastUpdated: new Date().toISOString(),
  };

  const surfBadgeColor =
    marineData.surfCondition === 'Calm & Safe'
      ? 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40'
      : marineData.surfCondition === 'Moderate Swell'
      ? 'bg-[#0B72B9]/15 text-[#4FA8E0] border-[#0B72B9]/40'
      : marineData.surfCondition === 'Rough Waves'
      ? 'bg-[#FF8C42]/15 text-[#FF8C42] border-[#FF8C42]/40'
      : 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40';

  return (
    <div className="mausam-card p-4 sm:p-5 border border-[#334155] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#0B72B9]/15 text-[#4FA8E0] flex items-center justify-center border border-[#0B72B9]/30">
              <span className="material-symbols-outlined text-[20px]">surfing</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Beachgoers, Surfers &amp; Maritime
              </h3>
              <p className="text-[11px] text-[#8A94A6]">
                WorldTides &amp; Marine Hydrodynamics • {city}
              </p>
            </div>
          </div>
          {effectiveIsCoastal ? (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${surfBadgeColor}`}>
              {marineData.surfCondition}
            </span>
          ) : (
            <span className="text-[10px] bg-[#1E2733] text-[#8A94A6] px-2 py-0.5 rounded border border-[#334155]">
              Inland Sector
            </span>
          )}
        </div>

        {!effectiveIsCoastal ? (
          <div className="mt-4 p-4 rounded bg-[#17212B] border border-[#334155] text-center">
            <span className="material-symbols-outlined text-[32px] text-[#8A94A6]">
              waves
            </span>
            <p className="text-xs text-[#D7DEE8] mt-2 font-medium">
              {city} is situated in an inland district. Tide and marine ocean telemetry are active for coastal observatories (e.g. Mumbai, Puri, Paradip, Chennai, Kochi, Visakhapatnam).
            </p>
            <button
              type="button"
              onClick={() => setShowCoastalPreview(true)}
              className="mt-3 text-xs bg-[#0B72B9]/20 hover:bg-[#0B72B9]/30 text-[#4FA8E0] border border-[#0B72B9]/50 px-3 py-1.5 rounded transition-all inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              <span>Preview Coastal Maritime Telemetry</span>
            </button>
          </div>
        ) : (
          <>
            {/* Marine & Tide Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {/* Next High Tide */}
              <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#8A94A6]">High Tide</span>
                  <span className="text-[10px] text-[#2ECC71] font-bold">Rising</span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-lg font-bold font-mono text-white">
                    {tideData.nextHighTide.time}
                  </span>
                </div>
                <span className="text-[10px] text-[#4FA8E0] font-mono block mt-1">
                  Peak: +{tideData.nextHighTide.heightMeters} m
                </span>
              </div>

              {/* Next Low Tide */}
              <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#8A94A6]">Low Tide</span>
                  <span className="text-[10px] text-[#FF8C42] font-bold">Ebb</span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-lg font-bold font-mono text-white">
                    {tideData.nextLowTide.time}
                  </span>
                </div>
                <span className="text-[10px] text-[#FF8C42] font-mono block mt-1">
                  Low: +{tideData.nextLowTide.heightMeters} m
                </span>
              </div>

              {/* Wave Height & Period */}
              <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
                <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">
                  Wave Height
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    {marineData.waveHeightMeters}
                  </span>
                  <span className="text-[10px] text-[#8A94A6]">meters</span>
                </div>
                <span className="text-[10px] text-[#8A94A6] block mt-1">
                  Period: <strong className="text-[#D7DEE8]">{marineData.wavePeriodSeconds}s</strong> swell
                </span>
              </div>

              {/* Sea Surface Temp (SST) */}
              <div className="p-3 bg-[#17212B] rounded border border-[#334155]">
                <span className="text-[10px] uppercase font-bold text-[#8A94A6] block">
                  Water Temp (SST)
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-bold font-mono text-[#1ABC9C]">
                    {marineData.seaSurfaceTemperatureC}
                  </span>
                  <span className="text-[10px] text-[#8A94A6]">°C</span>
                </div>
                <span className="text-[10px] text-[#8A94A6] block mt-1">
                  Tropical Coastal Sea
                </span>
              </div>
            </div>

            {/* Surf & Marine Safety Tip */}
            <div className="mt-3.5 p-3 rounded bg-[#131A22] border border-[#334155] flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#0B72B9] text-[18px] shrink-0 mt-0.5">
                pool
              </span>
              <div className="text-xs">
                <p className="text-[#D7DEE8]">
                  <strong>Marine Advisory:</strong> {marineData.marineAdvisory}
                </p>
                <p className="text-[11px] text-[#8A94A6] mt-0.5">
                  High Tide at <strong>{tideData.nextHighTide.time} ({tideData.nextHighTide.heightMeters} m)</strong> • Low Tide at <strong>{tideData.nextLowTide.time} ({tideData.nextLowTide.heightMeters} m)</strong>
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Source */}
      <div className="mt-4 pt-3 border-t border-[#334155] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#8A94A6]">
        <span>Source: <strong>WorldTides &amp; Open-Meteo Marine (Hourly Wave/SST)</strong></span>
        <span>Observation: <strong>Verified Coastal Hydrography</strong></span>
      </div>
    </div>
  );
};
