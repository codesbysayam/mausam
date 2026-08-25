import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-xl bg-[#1E2733] card-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 card-header-divider flex justify-between items-center bg-[#0F141A]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">
              menu_book
            </span>
            <h3 className="text-xs text-[#FFFFFF] font-semibold">
              MAUSAM Operational Guide &amp; Sensor Calibration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A94A6] hover:text-[#FFFFFF] p-1.5 rounded hover:bg-[#242F3D] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 max-h-[460px] overflow-y-auto text-xs text-[#F4F7FA] leading-relaxed">
          <div className="bg-[#0F141A] p-3.5 rounded-lg card-border">
            <h4 className="text-xs text-[#4FA8E0] font-semibold mb-1">
              Particulate Matter (PM2.5) Standards
            </h4>
            <p className="text-[#8A94A6]">
              MAUSAM measures airborne particles below 2.5 micrometers. Readings above 100 µg/m³ trigger fitness profile adaptations to recommend indoor workouts or masks during outdoor transit.
            </p>
          </div>

          <div className="bg-[#0F141A] p-3.5 rounded-lg card-border">
            <h4 className="text-xs text-[#2ECC71] font-semibold mb-1">
              Physiological Fitness Engine
            </h4>
            <p className="text-[#8A94A6]">
              The fitness scoring model combines dry-bulb temperature, dew point, wet-bulb globe temperature (WBGT), solar irradiance (UV index), and PM2.5 to calculate optimal aerobic windows and precise hydration rates.
            </p>
          </div>

          <div className="bg-[#0F141A] p-3.5 rounded-lg card-border">
            <h4 className="text-xs text-[#FFB703] font-semibold mb-1">
              Doppler Radar &amp; Telemetry Playback
            </h4>
            <p className="text-[#8A94A6]">
              Use the timeline slider at the bottom of the radar view to scrub through past scans, current Doppler sweeps, and short-term atmospheric nowcasts.
            </p>
          </div>

          <div className="bg-[#0F141A] p-3.5 rounded-lg card-border">
            <h4 className="text-xs text-[#FFFFFF] font-semibold mb-1">
              AI Meteorologist (Ask MAUSAM)
            </h4>
            <p className="text-[#8A94A6]">
              Powered by Google Gemini models running server-side, Ask MAUSAM analyzes real-time multi-sensor telemetry to give customized recommendations for training, running, air quality mitigation, and daily commuting.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 card-header-divider border-t border-[rgba(225,230,235,0.12)] bg-[#0F141A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0B72B9] text-[#FFFFFF] text-xs font-semibold hover:bg-[#0A5A94] transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
