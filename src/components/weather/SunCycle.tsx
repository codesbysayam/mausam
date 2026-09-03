import React, { useState, useEffect, useMemo } from 'react';
import * as SunCalc from 'suncalc';
import { Sun, Sunrise, Sunset, Clock, Compass, Moon } from 'lucide-react';
import { LocationRecord } from '../../types';

export interface SunCycleProps {
  location?: LocationRecord;
  date?: Date;
  className?: string;
  compact?: boolean;
}

export const SunCycle: React.FC<SunCycleProps> = ({
  location,
  date,
  className = '',
  compact = false,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(date || new Date());

  useEffect(() => {
    if (date) {
      setCurrentTime(date);
      return;
    }
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [date]);

  const lat = typeof location?.lat === 'number' ? location.lat : 20.2961;
  const lng = typeof location?.lng === 'number' ? location.lng : 85.8245;

  const solarCalculations = useMemo(() => {
    // Calculate accurate solar ephemeris using SunCalc library
    const times = SunCalc.getTimes(currentTime, lat, lng);
    const position = SunCalc.getPosition(currentTime, lat, lng);

    const formatTime = (d: Date | undefined): string => {
      if (!d || isNaN(d.getTime())) return '--:--';
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    };

    const sunrise = times.sunrise;
    const sunset = times.sunset;
    const solarNoon = times.solarNoon;
    const dawn = times.dawn;
    const dusk = times.dusk;

    // Day length
    const dayLengthMs = Math.max(0, sunset.getTime() - sunrise.getTime());
    const dayHours = Math.floor(dayLengthMs / (1000 * 60 * 60));
    const dayMinutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60));
    const dayLengthStr = `${dayHours}h ${dayMinutes.toString().padStart(2, '0')}m`;

    // Is daytime
    const isDay = currentTime >= sunrise && currentTime <= sunset;

    // Progress percentage
    let progress = 0;
    if (currentTime < sunrise) {
      progress = 0;
    } else if (currentTime > sunset) {
      progress = 100;
    } else if (dayLengthMs > 0) {
      progress = Math.min(
        100,
        Math.max(0, ((currentTime.getTime() - sunrise.getTime()) / dayLengthMs) * 100)
      );
    }

    // Solar altitude in degrees (-90 to +90)
    const altitudeDeg = (position.altitude * 180) / Math.PI;
    // Solar azimuth in degrees (SunCalc azimuth: 0 = South, PI/2 = West, -PI/2 = East, PI = North)
    // Convert to navigational compass bearing (0 = North, 90 = East, 180 = South, 270 = West)
    let compassAzimuth = ((position.azimuth * 180) / Math.PI + 180) % 360;
    if (compassAzimuth < 0) compassAzimuth += 360;

    const getAzimuthCardinal = (deg: number): string => {
      const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const idx = Math.round(deg / 22.5) % 16;
      return dirs[idx];
    };

    // Countdown to next event
    let nextEventName = 'Sunset';
    let targetTime = sunset;
    if (currentTime > sunset) {
      nextEventName = 'Sunrise';
      // Next day's sunrise
      const tomorrow = new Date(currentTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTimes = SunCalc.getTimes(tomorrow, lat, lng);
      targetTime = tomorrowTimes.sunrise;
    } else if (currentTime < sunrise) {
      nextEventName = 'Sunrise';
      targetTime = sunrise;
    }

    const msDiff = Math.max(0, targetTime.getTime() - currentTime.getTime());
    const h = Math.floor(msDiff / (1000 * 60 * 60));
    const m = Math.floor((msDiff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((msDiff % (1000 * 60)) / 1000);
    const countdownStr = `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;

    return {
      sunriseStr: formatTime(sunrise),
      sunsetStr: formatTime(sunset),
      solarNoonStr: formatTime(solarNoon),
      dawnStr: formatTime(dawn),
      duskStr: formatTime(dusk),
      dayLengthStr,
      isDay,
      progress,
      altitudeDeg,
      compassAzimuth,
      azimuthCardinal: getAzimuthCardinal(compassAzimuth),
      nextEventName,
      countdownStr,
    };
  }, [currentTime, lat, lng]);

  // Coordinates on semi-circle SVG arc (width=300, height=130)
  const angleRad = Math.PI - (solarCalculations.progress / 100) * Math.PI;
  const cx = 150;
  const cy = 110;
  const rx = 120;
  const ry = 80;
  const sunX = cx + rx * Math.cos(angleRad);
  const sunY = cy - ry * Math.sin(angleRad);

  if (compact) {
    return (
      <div className={`flex items-center gap-4 text-xs ${className}`}>
        <div className="flex items-center gap-1.5 text-[#FFC857]">
          <Sunrise className="w-4 h-4" />
          <span>{solarCalculations.sunriseStr}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#FF8C42]">
          <Sunset className="w-4 h-4" />
          <span>{solarCalculations.sunsetStr}</span>
        </div>
        <div className="text-[#93A4B8] text-[11px]">
          Day: {solarCalculations.dayLengthStr}
        </div>
      </div>
    );
  }

  return (
    <section
      id="sun-cycle-component"
      className={`rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col justify-between gap-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFC857]/15 text-[#FFC857] flex items-center justify-center">
            {solarCalculations.isDay ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
              Sun Cycle &amp; Solar Ephemeris
            </h2>
            <p className="text-xs text-[#93A4B8]">
              {location?.city ? `${location.city} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)` : 'Real-time Astronomical Calculation'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#FFC857] bg-[#FFC857]/10 px-2.5 py-0.5 rounded-full border border-[#FFC857]/30 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {solarCalculations.countdownStr} to {solarCalculations.nextEventName}
        </span>
      </div>

      {/* Astronomical Arc Visualization */}
      <div className="relative flex flex-col items-center py-2">
        <svg viewBox="0 0 300 130" className="w-full max-w-sm h-32 overflow-visible">
          <defs>
            <linearGradient id="sunCycleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF8C42" />
              <stop offset="50%" stopColor="#FFC857" />
              <stop offset="100%" stopColor="#FF8C42" />
            </linearGradient>
          </defs>

          {/* Dashed trajectory arc */}
          <path
            d="M 30 110 A 120 80 0 0 1 270 110"
            fill="none"
            stroke="#162331"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Active traversed arc */}
          {solarCalculations.isDay && (
            <path
              d="M 30 110 A 120 80 0 0 1 270 110"
              fill="none"
              stroke="url(#sunCycleGrad)"
              strokeWidth="3"
              strokeDasharray={`${(solarCalculations.progress / 100) * 320} 500`}
            />
          )}

          {/* Ground Horizon */}
          <line x1="20" y1="110" x2="280" y2="110" stroke="#1F2E3E" strokeWidth="1.5" />

          {/* Sun position marker */}
          <circle
            cx={sunX}
            cy={sunY}
            r="8"
            fill="#FFC857"
            stroke="#FFFFFF"
            strokeWidth="2"
            className="filter drop-shadow-[0_0_8px_rgba(255,200,87,0.8)]"
          />

          {/* Dawn & Dusk Markers */}
          <circle cx="30" cy="110" r="3" fill="#FF8C42" />
          <circle cx="270" cy="110" r="3" fill="#FF8C42" />
        </svg>

        {/* Sunrise & Sunset text beneath arc */}
        <div className="w-full max-w-sm flex items-center justify-between px-3 text-xs -mt-1">
          <div className="flex flex-col items-start">
            <span className="text-[10px] uppercase font-bold text-[#93A4B8] flex items-center gap-1">
              <Sunrise className="w-3 h-3 text-[#FF8C42]" /> Sunrise
            </span>
            <span className="font-bold text-[#F4F7FA] font-mono text-xs">
              {solarCalculations.sunriseStr}
            </span>
            <span className="text-[9px] text-[#93A4B8]">Dawn {solarCalculations.dawnStr}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-[#43C7F4]">Solar Noon</span>
            <span className="font-bold text-[#F4F7FA] font-mono text-xs">
              {solarCalculations.solarNoonStr}
            </span>
            <span className="text-[9px] text-[#22C7A0]">Day {solarCalculations.dayLengthStr}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-[#93A4B8] flex items-center gap-1">
              <Sunset className="w-3 h-3 text-[#FF8C42]" /> Sunset
            </span>
            <span className="font-bold text-[#F4F7FA] font-mono text-xs">
              {solarCalculations.sunsetStr}
            </span>
            <span className="text-[9px] text-[#93A4B8]">Dusk {solarCalculations.duskStr}</span>
          </div>
        </div>
      </div>

      {/* Solar metrics grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#162331] text-xs">
        <div className="p-2 rounded-lg bg-[#071018] border border-[#162331]">
          <span className="text-[10px] text-[#93A4B8] uppercase block">Sun Altitude</span>
          <span className="text-xs font-bold text-[#FFC857] font-mono">
            {solarCalculations.altitudeDeg > 0 ? `+${solarCalculations.altitudeDeg.toFixed(1)}°` : `${solarCalculations.altitudeDeg.toFixed(1)}°`}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#071018] border border-[#162331]">
          <span className="text-[10px] text-[#93A4B8] uppercase block">Sun Azimuth</span>
          <span className="text-xs font-bold text-[#43C7F4] font-mono flex items-center gap-1">
            <Compass className="w-3 h-3 inline" />
            {solarCalculations.compassAzimuth.toFixed(0)}° {solarCalculations.azimuthCardinal}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[#071018] border border-[#162331]">
          <span className="text-[10px] text-[#93A4B8] uppercase block">Daylight State</span>
          <span className={`text-xs font-bold uppercase ${solarCalculations.isDay ? 'text-[#22C7A0]' : 'text-[#93A4B8]'}`}>
            {solarCalculations.isDay ? 'Sun Above Horizon' : 'Night Horizon'}
          </span>
        </div>
      </div>
    </section>
  );
};
