import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempUnit: 'C' | 'F';
  onToggleTempUnit: (unit: 'C' | 'F') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  tempUnit,
  onToggleTempUnit,
}) => {
  const [telemetryInterval, setTelemetryInterval] = useState('30s');
  const [aqiAlertThreshold, setAqiAlertThreshold] = useState('100');
  const [soundAlerts, setSoundAlerts] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-md bg-[#1E2733] card-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 card-header-divider flex justify-between items-center bg-[#0F141A]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">
              settings
            </span>
            <h3 className="text-xs uppercase text-[#FFFFFF] tracking-wider font-bold">
              Console Preferences &amp; Calibration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A94A6] hover:text-[#FFFFFF] p-1.5 rounded hover:bg-[#242F3D] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Settings */}
        <div className="p-6 flex flex-col gap-5">
          {/* Temperature Units */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-[#FFFFFF]">
                Temperature Unit
              </p>
              <p className="text-xs text-[#8A94A6]">
                Celsius (°C) vs Fahrenheit (°F)
              </p>
            </div>
            <div className="flex gap-1 bg-[#0F141A] p-1 rounded-lg card-border">
              <button
                onClick={() => onToggleTempUnit('C')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  tempUnit === 'C'
                    ? 'bg-[#0B72B9] text-[#FFFFFF]'
                    : 'text-[#8A94A6] hover:text-[#FFFFFF]'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => onToggleTempUnit('F')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  tempUnit === 'F'
                    ? 'bg-[#0B72B9] text-[#FFFFFF]'
                    : 'text-[#8A94A6] hover:text-[#FFFFFF]'
                }`}
              >
                °F
              </button>
            </div>
          </div>

          {/* Telemetry Refresh Rate */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-[#FFFFFF]">
                Telemetry Polling Rate
              </p>
              <p className="text-xs text-[#8A94A6]">
                Sensor stream update cadence
              </p>
            </div>
            <select
              value={telemetryInterval}
              onChange={(e) => setTelemetryInterval(e.target.value)}
              className="bg-[#0F141A] card-border rounded-lg px-2.5 py-1.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#0B72B9]"
            >
              <option value="10s">10 seconds</option>
              <option value="30s">30 seconds (Default)</option>
              <option value="60s">1 minute</option>
              <option value="5m">5 minutes</option>
            </select>
          </div>

          {/* AQI Alert Threshold */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-[#FFFFFF]">
                PM2.5 Warning Trigger
              </p>
              <p className="text-xs text-[#8A94A6]">
                Threshold for push notifications
              </p>
            </div>
            <select
              value={aqiAlertThreshold}
              onChange={(e) => setAqiAlertThreshold(e.target.value)}
              className="bg-[#0F141A] card-border rounded-lg px-2.5 py-1.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#0B72B9]"
            >
              <option value="50">50 µg/m³ (WHO)</option>
              <option value="100">100 µg/m³ (Standard)</option>
              <option value="150">150 µg/m³ (Severe)</option>
            </select>
          </div>

          {/* Audio Chimes */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-[#FFFFFF]">
                Severe Weather Audio Beep
              </p>
              <p className="text-xs text-[#8A94A6]">
                Audible chime for IMD warnings
              </p>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#0B72B9] cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 card-header-divider border-t border-[rgba(225,230,235,0.12)] bg-[#0F141A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#0B72B9] text-[#FFFFFF] text-xs font-semibold hover:bg-[#0A5A94] transition-colors cursor-pointer"
          >
            Save &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
};
