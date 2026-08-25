import React, { useState, useEffect } from 'react';

interface IstClockProps {
  showDate?: boolean;
  showSeconds?: boolean;
  compact?: boolean;
  className?: string;
  allowAnalogToggle?: boolean;
}

export const IstClock: React.FC<IstClockProps> = ({
  showDate = true,
  showSeconds = true,
  compact = false,
  className = '',
  allowAnalogToggle = true,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [clockMode, setClockMode] = useState<'digital' | 'analog'>('digital');

  useEffect(() => {
    // 1-second ticker using native request/interval
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time in Asia/Kolkata timezone
  const istTimeString = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: true,
  }).format(now);

  const istDateString = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(now);

  // Compute IST hours, minutes, seconds for analog clock
  // Derive IST parts safely using Intl parts
  const istFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = istFormatter.formatToParts(now);
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  for (const p of parts) {
    if (p.type === 'hour') hours = parseInt(p.value, 10);
    if (p.type === 'minute') minutes = parseInt(p.value, 10);
    if (p.type === 'second') seconds = parseInt(p.value, 10);
  }

  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 font-mono text-xs text-[#dae2fd] ${className}`}>
        <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">schedule</span>
        <span className="font-bold">{istTimeString}</span>
        <span className="px-1.5 py-0.5 text-[10px] bg-[#38bdf8]/15 text-[#38bdf8] font-bold rounded border border-[#38bdf8]/30">
          IST
        </span>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#0b1326]/90 card-border rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Analog / Digital Mini Toggle Visual */}
        {clockMode === 'analog' ? (
          <div className="relative w-12 h-12 rounded-full border-2 border-[#38bdf8]/40 bg-[#131b2e] flex items-center justify-center shrink-0 shadow-inner">
            {/* Hour tick markers */}
            <div className="absolute top-1 w-0.5 h-1.5 bg-[#87929a] rounded"></div>
            <div className="absolute bottom-1 w-0.5 h-1.5 bg-[#87929a] rounded"></div>
            <div className="absolute left-1 h-0.5 w-1.5 bg-[#87929a] rounded"></div>
            <div className="absolute right-1 h-0.5 w-1.5 bg-[#87929a] rounded"></div>

            {/* Hour hand */}
            <div
              className="absolute w-1 bg-[#dae2fd] rounded-full origin-bottom"
              style={{
                height: '14px',
                bottom: '24px',
                transform: `rotate(${hourDeg}deg)`,
                transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
              }}
            ></div>

            {/* Minute hand */}
            <div
              className="absolute w-0.5 bg-[#38bdf8] rounded-full origin-bottom"
              style={{
                height: '18px',
                bottom: '24px',
                transform: `rotate(${minuteDeg}deg)`,
                transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
              }}
            ></div>

            {/* Second hand */}
            <div
              className="absolute w-0.5 bg-[#f59e0b] origin-bottom"
              style={{
                height: '20px',
                bottom: '24px',
                transform: `rotate(${secondDeg}deg)`,
              }}
            ></div>

            {/* Center dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] z-10"></div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] shrink-0">
            <span className="material-symbols-outlined text-[22px]">schedule</span>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-[#dae2fd] tracking-tight font-mono">
              {istTimeString}
            </span>
            <span className="px-1.5 py-0.5 text-[10px] bg-[#38bdf8]/20 text-[#38bdf8] font-bold rounded border border-[#38bdf8]/40">
              IST (UTC+05:30)
            </span>
          </div>
          {showDate && (
            <p className="text-xs text-[#bdc8d1] font-medium mt-0.5">
              {istDateString} • Indian Standard Time
            </p>
          )}
        </div>
      </div>

      {allowAnalogToggle && (
        <div className="flex items-center gap-1 bg-[#131b2e] p-1 rounded-lg border border-[#3e484f]">
          <button
            type="button"
            onClick={() => setClockMode('digital')}
            title="Digital Clock View"
            className={`px-2 py-1 text-xs rounded transition-all cursor-pointer ${
              clockMode === 'digital'
                ? 'bg-[#38bdf8] text-[#00354a] font-bold shadow'
                : 'text-[#bdc8d1] hover:text-[#dae2fd]'
            }`}
          >
            Digital
          </button>
          <button
            type="button"
            onClick={() => setClockMode('analog')}
            title="Analog Clock View"
            className={`px-2 py-1 text-xs rounded transition-all cursor-pointer ${
              clockMode === 'analog'
                ? 'bg-[#38bdf8] text-[#00354a] font-bold shadow'
                : 'text-[#bdc8d1] hover:text-[#dae2fd]'
            }`}
          >
            Analog
          </button>
        </div>
      )}
    </div>
  );
};
