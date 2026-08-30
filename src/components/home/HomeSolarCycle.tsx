import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Sunrise, Sunset, Clock } from 'lucide-react';

interface HomeSolarCycleProps {
  sunrise?: string;
  sunset?: string;
}

export const HomeSolarCycle: React.FC<HomeSolarCycleProps> = ({
  sunrise = '05:42 AM',
  sunset = '06:24 PM',
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse sunrise & sunset to minutes from midnight
  const { sunriseMins, sunsetMins, currentMins, progressPercent, isDay, timeUntilNext } = useMemo(() => {
    // Current IST minutes
    const istTimeStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    }).format(now);

    const [hrs, mins] = istTimeStr.split(':').map(Number);
    const curr = hrs * 60 + mins;

    // Approximate sunrise (5:42 -> 342) and sunset (18:24 -> 1104)
    const sr = 5 * 60 + 42;
    const ss = 18 * 60 + 24;

    const day = curr >= sr && curr <= ss;

    let prog = 0;
    if (day) {
      prog = Math.min(100, Math.max(0, ((curr - sr) / (ss - sr)) * 100));
    } else if (curr > ss) {
      prog = 100;
    } else {
      prog = 0;
    }

    // Calculate time until next event
    let diffMins = 0;
    let nextEvent = '';
    if (curr < sr) {
      diffMins = sr - curr;
      nextEvent = 'Sunrise';
    } else if (curr <= ss) {
      diffMins = ss - curr;
      nextEvent = 'Sunset';
    } else {
      diffMins = 24 * 60 - curr + sr;
      nextEvent = 'Sunrise';
    }

    const hRemain = Math.floor(diffMins / 60);
    const mRemain = diffMins % 60;

    return {
      sunriseMins: sr,
      sunsetMins: ss,
      currentMins: curr,
      progressPercent: prog,
      isDay: day,
      timeUntilNext: `${hRemain}h ${mRemain}m until ${nextEvent}`,
    };
  }, [now]);

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
    <section id="homepage-solar-cycle" className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col gap-4">
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
              Astronomical solar position and daylight ephemeris
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#FFC857] bg-[#FFC857]/10 px-2.5 py-0.5 rounded-full border border-[#FFC857]/30 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeUntilNext}
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

        {/* Sunrise and Sunset Labels */}
        <div className="w-full max-w-sm flex items-center justify-between text-xs px-2 mt-1">
          <div className="flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-[#43C7F4]" />
            <div>
              <span className="text-[10px] text-[#93A4B8] block">Sunrise</span>
              <strong className="text-[#F4F7FA] font-mono">{sunrise}</strong>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-[#93A4B8] block">Total Daylight</span>
            <strong className="text-[#FFC857] font-mono text-xs">12h 42m</strong>
          </div>

          <div className="flex items-center gap-1.5 text-right">
            <div>
              <span className="text-[10px] text-[#93A4B8] block">Sunset</span>
              <strong className="text-[#F4F7FA] font-mono">{sunset}</strong>
            </div>
            <Sunset className="w-4 h-4 text-[#FF9F43]" />
          </div>
        </div>
      </div>
    </section>
  );
};
