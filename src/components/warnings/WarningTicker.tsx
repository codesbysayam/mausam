import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WarningRecord } from '../../types/warningTypes';

interface WarningTickerProps {
  warnings: WarningRecord[];
  onSelectWarning: (warning: WarningRecord) => void;
}

export const WarningTicker: React.FC<WarningTickerProps> = ({
  warnings,
  onSelectWarning,
}) => {
  const activeAlerts = warnings.filter((w) => w.severity !== 'green');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextAlert = useCallback(() => {
    if (activeAlerts.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeAlerts.length);
  }, [activeAlerts.length]);

  const prevAlert = useCallback(() => {
    if (activeAlerts.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeAlerts.length) % activeAlerts.length);
  }, [activeAlerts.length]);

  useEffect(() => {
    if (activeAlerts.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      nextAlert();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAlerts.length, isPaused, nextAlert]);

  if (activeAlerts.length === 0) {
    return (
      <div
        id="warning-ticker-stable"
        className="flex items-center justify-between gap-3 px-3.5 py-2 bg-[#071A2D] border border-[#1D4E73] rounded-md text-xs"
      >
        <div className="flex items-center gap-2 text-[#008000]">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span className="font-bold uppercase tracking-wider text-[11px]">
            National Synoptic Baseline:
          </span>
          <span className="text-[#D7DEE8]">
            No critical severe weather alerts currently in effect across sub-divisions.
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#B8C7D9]">IMD Live Feed</span>
      </div>
    );
  }

  const currentWarning = activeAlerts[currentIndex] || activeAlerts[0];

  const getTickerStyle = (severity: string) => {
    switch (severity) {
      case 'red':
        return {
          bg: 'bg-[#0B2239]',
          border: 'border-[#FF0000]/60',
          tagBg: 'bg-[#FF0000] text-white',
          textColor: 'text-[#FFD2CE]',
          btnBorder: 'border-[#FF0000]/50 hover:bg-[#FF0000] hover:text-white',
        };
      case 'orange':
        return {
          bg: 'bg-[#0B2239]',
          border: 'border-[#FFA500]/60',
          tagBg: 'bg-[#FFA500] text-[#071A2D] font-bold',
          textColor: 'text-[#FFE2D1]',
          btnBorder: 'border-[#FFA500]/50 hover:bg-[#FFA500] hover:text-[#071A2D]',
        };
      default:
        return {
          bg: 'bg-[#0B2239]',
          border: 'border-[#FFFF00]/60',
          tagBg: 'bg-[#FFFF00] text-[#071A2D] font-bold',
          textColor: 'text-[#FFF3C4]',
          btnBorder: 'border-[#FFFF00]/50 hover:bg-[#FFFF00] hover:text-[#071A2D]',
        };
    }
  };

  const style = getTickerStyle(currentWarning.severity);

  return (
    <div
      id="live-national-warning-ticker"
      role="region"
      aria-label="Live Active Warnings Ticker"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={`relative flex items-center justify-between gap-3 px-3 py-2 rounded-md border shadow-sm transition-colors ${style.bg} ${style.border}`}
    >
      {/* Left: Tag & Alert Title */}
      <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 ${style.tagBg}`}
        >
          <span className="material-symbols-outlined text-[13px]">warning</span>
          <span>
            Active Alert ({currentIndex + 1}/{activeAlerts.length})
          </span>
        </span>

        <div className="truncate text-xs text-[#D7DEE8] font-medium flex items-center gap-2">
          <span className="font-bold text-white truncate">
            {currentWarning.title}
          </span>
          <span className="text-[#B8C7D9] hidden sm:inline">—</span>
          <span className="text-[#B8C7D9] hidden sm:inline truncate">
            {currentWarning.state} ({currentWarning.affectedAreaText})
          </span>
          <span className="text-[#B8C7D9] hidden md:inline">•</span>
          <span className="text-[#E3F2FD] font-mono text-[11px] hidden md:inline">
            Valid until {currentWarning.validUntil}
          </span>
        </div>
      </div>

      {/* Right: Controls & View Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* View Details Button */}
        <button
          id={`btn-ticker-view-${currentWarning.id}`}
          type="button"
          onClick={() => onSelectWarning(currentWarning)}
          className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider text-white bg-[#071A2D] border transition-all cursor-pointer ${style.btnBorder}`}
        >
          View Bulletin
        </button>

        {/* Previous / Next Ticker Buttons */}
        {activeAlerts.length > 1 && (
          <div className="flex items-center gap-0.5 bg-[#071A2D] border border-[#1D4E73] rounded p-0.5">
            <button
              id="btn-ticker-prev"
              type="button"
              onClick={prevAlert}
              title="Previous Alert"
              aria-label="Previous Warning"
              className="w-6 h-6 rounded flex items-center justify-center text-[#B8C7D9] hover:text-white hover:bg-[#102D47] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
            </button>
            <button
              id="btn-ticker-next"
              type="button"
              onClick={nextAlert}
              title="Next Alert"
              aria-label="Next Warning"
              className="w-6 h-6 rounded flex items-center justify-center text-[#B8C7D9] hover:text-white hover:bg-[#102D47] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
