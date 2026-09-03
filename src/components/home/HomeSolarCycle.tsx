import React, { useState, useEffect, useMemo } from 'react';
import * as SunCalc from 'suncalc';
import { Sun, Sunrise, Sunset, Clock, Sparkles, Compass } from 'lucide-react';
import { LocationRecord, CurrentWeather } from '../../types';

interface HomeSolarCycleProps {
  location?: LocationRecord;
  weather?: CurrentWeather;
  sunrise?: string;
  sunset?: string;
}

export const HomeSolarCycle: React.FC<HomeSolarCycleProps> = ({
  location,
  weather,
  sunrise,
  sunset,
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const lat = typeof location?.lat === 'number' ? location.lat : 20.2961;
  const lng = typeof location?.lng === 'number' ? location.lng : 85.8245;

  const solarData = useMemo(() => {
    // Exact calculation using standard meteorological suncalc library
    const times = SunCalc.getTimes(now, lat, lng);
    const pos = SunCalc.getPosition(now, lat, lng);

    const formatT = (d: Date) =>
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const sr = times.sunrise;
    const ss = times.sunset;
    const isDaytime = now >= sr && now <= ss;

    const dayLengthMs = Math.max(0, ss.getTime() - sr.getTime());
    const dayHours = Math.floor(dayLengthMs / 3600000);
    const dayMinutes = Math.floor((dayLengthMs % 3600000) / 60000);
    const dayLengthStr = `${dayHours}h ${dayMinutes.toString().padStart(2, '0')}m`;

    let progressPercent = 0;
    if (now < sr) progressPercent = 0;
    else if (now > ss) progressPercent = 100;
    else if (dayLengthMs > 0) {
      progressPercent = Math.min(100, Math.max(0, ((now.getTime() - sr.getTime()) / dayLengthMs) * 100));
    }

    let nextEventName = 'Sunset';
    let target = ss;
    if (now > ss) {
      nextEventName = 'Sunrise';
      const tmrw = new Date(now);
      tmrw.setDate(tmrw.getDate() + 1);
      target = SunCalc.getTimes(tmrw, lat, lng).sunrise;
    } else if (now < sr) {
      nextEventName = 'Sunrise';
      target = sr;
    }

    const msDiff = Math.max(0, target.getTime() - now.getTime());
    const h = Math.floor(msDiff / 3600000);
    const m = Math.floor((msDiff % 3600000) / 60000);
    const s = Math.floor((msDiff % 60000) / 1000);
    const countdownFormatted = `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;

    const altDeg = (pos.altitude * 180) / Math.PI;
    const azDeg = ((pos.azimuth * 180) / Math.PI + 180) % 360;

    return {
      sunriseStr: formatT(sr),
      sunsetStr: formatT(ss),
      solarNoonStr: formatT(times.solarNoon),
      dayLengthStr,
      isDaytime,
      progressPercent,
      nextEventName,
      countdownFormatted,
      solarElevationDeg: altDeg,
      solarAzimuthDeg: azDeg,
    };
  }, [lat, lng, now]);

  const displaySunrise = sunrise || weather?.sunrise || solarData.sunriseStr;
  const displaySunset = sunset || weather?.sunset || solarData.sunsetStr;
  const dayLengthStr = weather?.dayLength || solarData.dayLengthStr;
  const isDay = solarData.isDaytime;
  const progressPercent = solarData.progressPercent;

  // Position on semi-circle SVG arc (width=300, height=120)
  // Arc goes from (20, 110) through (150, 20) to (280, 110)
  const angleRad = Math.PI - (progressPercent / 100) * Math.PI;
  const cx = 150;
  const cy = 110;
  const rx = 130;
  const ry = 90;
  const sunX = cx + rx * Math.cos(angleRad);
  const sunY = cy - ry * Math.sin(angleRad);

  return (
    <section id="homepage-solar-cycle" className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col justify-between gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFC857]/15 text-[#FFC857] flex items-center justify-center">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
              Solar Trajectory &amp; Day Length
            </h2>
            <p className="text-xs text-[#93A4B8]">
              {location?.city ? `${location.city} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)` : 'Astronomical Solar Position & Ephemeris'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#FFC857] bg-[#FFC857]/10 px-2.5 py-0.5 rounded-full border border-[#FFC857]/30 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {solarData.countdownFormatted} to {solarData.nextEventName}
        </span>
      </div>

      {/* Astronomical Arc Visualization */}
      <div className="relative flex flex-col items-center py-2">
        <svg viewBox="0 0 300 130" className="w-full max-w-sm h-32 overflow-visible">
          {/* Dashed background trajectory arc */}
          <path
            d="M 20 110 A 130 90 0 0 1 280 110"
            fill="none"
            stroke="#162331"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Golden daylight traversed arc (active during day) */}
          {isDay && (
            <path
              d="M 20 110 A 130 90 0 0 1 280 110"
              fill="none"
              stroke="url(#solarGradient)"
              strokeWidth="3"
              strokeDasharray={`${(progressPercent / 100) * 380} 500`}
            />
          )}

          {/* Horizon ground line */}
          <line x1="10" y1="110" x2="290" y2="110" stroke="#1F2E3E" strokeWidth="1.5" />

          {/* Sun indicator circle */}
          <circle
            cx={sunX}
            cy={sunY}
            r="8"
            fill={isDay ? '#FFC857' : '#93A4B8'}
            className="filter drop-shadow-[0_0_8px_rgba(255,200,87,0.8)]"
          />
          <circle cx={sunX} cy={sunY} r="3" fill="#071018" />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="solarGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#43C7F4" />
              <stop offset="50%" stopColor="#FFC857" />
              <stop offset="100%" stopColor="#EF5350" />
            </linearGradient>
          </defs>
        </svg>

        {/* Sunrise, Solar Noon, and Sunset Labels */}
        <div className="w-full max-w-sm flex items-center justify-between text-xs px-2 mt-1">
          <div className="flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-[#43C7F4]" />
            <div>
              <span className="text-[10px] text-[#93A4B8] block">Sunrise</span>
              <strong className="text-[#F4F7FA] font-mono">{displaySunrise}</strong>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-[#93A4B8] block">Total Daylight</span>
            <strong className="text-[#FFC857] font-mono text-xs">{dayLengthStr}</strong>
          </div>

          <div className="flex items-center gap-1.5 text-right">
            <div>
              <span className="text-[10px] text-[#93A4B8] block">Sunset</span>
              <strong className="text-[#F4F7FA] font-mono">{displaySunset}</strong>
            </div>
            <Sunset className="w-4 h-4 text-[#FF9F43]" />
          </div>
        </div>
      </div>

      {/* Real-time Solar Angle & Azimuth Metadata */}
      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#162331] text-[#93A4B8]">
        <div className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-[#43C7F4]" />
          <span>Azimuth: <strong className="text-[#F4F7FA] font-mono">{solarData.solarAzimuthDeg}°</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#FFC857]" />
          <span>Elevation: <strong className="text-[#FFC857] font-mono">{solarData.solarElevationDeg > 0 ? `+${solarData.solarElevationDeg}°` : `${solarData.solarElevationDeg}°`}</strong></span>
        </div>
      </div>
    </section>
  );
};
