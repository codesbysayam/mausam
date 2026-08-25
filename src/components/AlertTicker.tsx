import React, { useState, useEffect } from 'react';
import { WeatherAlert } from '../types';

interface AlertTickerProps {
  alerts: WeatherAlert[];
  onSelectAlert: (alert: WeatherAlert) => void;
}

export const AlertTicker: React.FC<AlertTickerProps> = ({ alerts, onSelectAlert }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (!alerts || alerts.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [alerts, isPaused]);

  if (!alerts || alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex] || alerts[0];
  const isSevere = currentAlert.severity === 'severe' || currentAlert.severity === 'extreme';

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? alerts.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % alerts.length);
  };

  return (
    <div
      id="dynamic-alert-ticker"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onSelectAlert(currentAlert)}
      className="w-full bg-[#170e1a] border-b border-[#ffb4ab]/30 py-1.5 px-3 sm:px-4 flex items-center justify-between gap-2.5 transition-colors cursor-pointer group hover:bg-[#201323] select-none font-sans"
    >
      <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between gap-3 overflow-hidden">
        {/* Left Alert Badge & Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Pulsing Alert Indicator */}
          <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-md bg-[#ffb4ab]/20 border border-[#ffb4ab]/50 text-[#ffb4ab] text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb4ab] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffb4ab]"></span>
            </span>
            <span className="material-symbols-outlined text-[16px]">
              {isSevere ? 'warning' : 'campaign'}
            </span>
            <span className="hidden sm:inline">
              {currentAlert.agency}
            </span>
            <span className="sm:hidden">
              Alert
            </span>
          </div>

          {/* Scrolling / Animated Content */}
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="font-h3 text-sm font-semibold text-[#ffdad6] truncate">
              {currentAlert.title}
            </span>
            <span className="hidden md:inline font-body-md text-xs text-[#bdc8d1] truncate">
              — {currentAlert.description}
            </span>
            <span className="hidden lg:inline font-body-md text-xs text-[#ffb4ab] shrink-0 font-medium">
              (Valid until {currentAlert.validUntil})
            </span>
          </div>
        </div>

        {/* Right Controls & Counter */}
        <div className="flex items-center gap-2.5 shrink-0">
          {alerts.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#87929a] hidden sm:inline font-medium">
                {currentIndex + 1} of {alerts.length}
              </span>
              <button
                type="button"
                onClick={handlePrev}
                title="Previous Advisory"
                className="w-6 h-6 rounded flex items-center justify-center text-[#bdc8d1] hover:text-white hover:bg-[#3e484f] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                title="Next Advisory"
                className="w-6 h-6 rounded flex items-center justify-center text-[#bdc8d1] hover:text-white hover:bg-[#3e484f] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          )}

          <span className="text-xs font-semibold text-[#38bdf8] group-hover:underline flex items-center gap-1">
            <span>View Advisory</span>
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </span>
        </div>
      </div>
    </div>
  );
};
