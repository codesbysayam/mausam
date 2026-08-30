import React, { useState, useEffect, useMemo } from 'react';
import { CurrentWeather, LocationRecord } from '../../types';
import { Sunrise, Sunset, Sun, Clock, Sparkles, Timer, Compass } from 'lucide-react';
import { calculateSolarEphemeris, SolarEphemeris } from '../../utils/solarCalculator';

interface SolarCycleCardProps {
  weather: CurrentWeather;
  location?: LocationRecord;
}

export const SolarCycleCard: React.FC<SolarCycleCardProps> = ({ weather, location }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Dynamic ticking clock every second for the countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const lat = typeof location?.lat === 'number' ? location.lat : 20.2961;
  const lng = typeof location?.lng === 'number' ? location.lng : 85.8245;

  const solarData: SolarEphemeris = useMemo(() => {
    return calculateSolarEphemeris(lat, lng, currentTime);
  }, [lat, lng, currentTime]);

  const sunriseStr = weather.sunrise || solarData.sunriseStr;
  const solarNoonStr = weather.solarNoon || solarData.solarNoonStr;
  const sunsetStr = weather.sunset || solarData.sunsetStr;
  const dayLengthStr = weather.dayLength || solarData.dayLengthStr;

  const isDay = solarData.isDaytime;

  return (
    <div
      id="solar-astronomical-cycle-card"
      className="bg-[#1E2733] border border-[#314255] rounded-lg p-4 sm:p-5 shadow-md flex flex-col justify-between gap-4 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#314255]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#F1C40F]/15 border border-[#F1C40F]/30 flex items-center justify-center text-[#F1C40F]">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight">
              Solar &amp; Ephemeris Cycle
            </h3>
            <p className="text-[11px] text-[#8A94A6]">
              {location?.city ? `${location.city} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)` : 'Astronomical Daylight Ephemeris'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#151D26] border border-[#314255] text-[11px] font-mono text-[#D7DEE8]">
          <Clock className="w-3 h-3 text-[#F1C40F]" />
          <span>Daylight: <strong className="text-white">{dayLengthStr}</strong></span>
        </div>
      </div>

      {/* LIVE COUNTDOWN TIMER BANNER */}
      <div
        id="solar-event-live-countdown"
        className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
          isDay
            ? 'bg-[#151D26] border-[#F1C40F]/40'
            : 'bg-[#151D26] border-[#0B72B9]/40'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-md ${
              isDay
                ? 'bg-[#F1C40F]/15 text-[#F1C40F]'
                : 'bg-[#4FA8E0]/15 text-[#4FA8E0]'
            }`}
          >
            <Timer className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A94A6]">
              {solarData.nextEventName} Countdown
            </span>
            <span className="text-xs text-white font-medium">
              Scheduled at <strong className="font-mono text-[#F1C40F]">{solarData.nextEventTimeStr}</strong>
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm sm:text-base font-black font-mono tracking-tight text-white block bg-[#1E2733] px-2.5 py-1 rounded border border-[#314255]">
            {solarData.countdownFormatted}
          </span>
          <span className="text-[9px] text-[#8A94A6] mt-0.5 block">
            {isDay ? 'Remaining Daylight' : 'Until Dawn Horizon'}
          </span>
        </div>
      </div>

      {/* Sun Trajectory Arc Graphic */}
      <div className="p-3 bg-[#151D26] rounded-lg border border-[#314255] flex flex-col gap-3">
        <div className="flex items-center justify-between text-[11px] text-[#8A94A6]">
          <div className="flex items-center gap-1">
            <Sunrise className="w-3.5 h-3.5 text-[#FF8C42]" />
            <span>Dawn ({solarData.civilDawnStr})</span>
          </div>
          <div className="flex items-center gap-1 text-[#F1C40F] font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Zenith ({solarNoonStr})</span>
          </div>
          <div className="flex items-center gap-1">
            <Sunset className="w-3.5 h-3.5 text-[#E74C3C]" />
            <span>Dusk ({solarData.civilDuskStr})</span>
          </div>
        </div>

        {/* Dynamic Sun Position Track */}
        <div className="relative w-full h-8 flex items-center">
          {/* Track line */}
          <div className="w-full h-1.5 bg-[#314255] rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#FF8C42] via-[#F1C40F] to-[#E74C3C] transition-all duration-700"
              style={{ width: `${solarData.progressPercent}%` }}
            />
          </div>

          {/* Sun icon marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 z-10 flex flex-col items-center"
            style={{ left: `${Math.max(4, Math.min(96, solarData.progressPercent))}%` }}
          >
            <div className="w-6 h-6 rounded-full bg-[#F1C40F] border-2 border-white shadow-lg flex items-center justify-center text-[#1E2733] animate-pulse">
              <Sun className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Status & Celestial Altitude/Azimuth */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#314255]/60">
          <span className="text-[#8A94A6] flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#4FA8E0]" />
            <span>Azimuth: <strong className="text-[#D7DEE8] font-mono">{solarData.solarAzimuthDeg}°</strong></span>
          </span>
          <span className="font-mono text-[#F1C40F] font-bold">
            Elev: {solarData.solarElevationDeg > 0 ? `+${solarData.solarElevationDeg}°` : `${solarData.solarElevationDeg}° (Below)`}
          </span>
        </div>
      </div>

      {/* 3 Key Times (Sunrise, Solar Noon, Sunset) */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded bg-[#151D26] border border-[#314255]">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#8A94A6]">
            <Sunrise className="w-3 h-3 text-[#FF8C42]" />
            <span>Sunrise</span>
          </div>
          <div className="text-xs sm:text-sm font-black font-mono text-white mt-1">
            {sunriseStr}
          </div>
          <span className="text-[9px] text-[#8A94A6]">Dawn {solarData.civilDawnStr}</span>
        </div>

        <div className="p-2 rounded bg-[#151D26] border border-[#314255]">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#F1C40F]">
            <Sun className="w-3 h-3 text-[#F1C40F]" />
            <span>Solar Noon</span>
          </div>
          <div className="text-xs sm:text-sm font-black font-mono text-[#F1C40F] mt-1">
            {solarNoonStr}
          </div>
          <span className="text-[9px] text-[#8A94A6]">Max Solar Angle</span>
        </div>

        <div className="p-2 rounded bg-[#151D26] border border-[#314255]">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#8A94A6]">
            <Sunset className="w-3 h-3 text-[#E74C3C]" />
            <span>Sunset</span>
          </div>
          <div className="text-xs sm:text-sm font-black font-mono text-white mt-1">
            {sunsetStr}
          </div>
          <span className="text-[9px] text-[#8A94A6]">Dusk {solarData.civilDuskStr}</span>
        </div>
      </div>
    </div>
  );
};
