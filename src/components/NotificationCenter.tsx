import React from 'react';
import { WeatherAlert } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: WeatherAlert[];
  onOpenAlertsView: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  alerts,
  onOpenAlertsView,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-[#1E2733] border-l border-[rgba(225,230,235,0.12)] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 card-header-divider flex justify-between items-center bg-[#0F141A]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">
              notifications
            </span>
            <h3 className="font-h4 text-xs uppercase text-[#FFFFFF] tracking-wider font-bold">
              Atmospheric Alerts &amp; Feeds
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A94A6] hover:text-[#FFFFFF] p-1.5 rounded hover:bg-[#242F3D] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                onClose();
                onOpenAlertsView();
              }}
              className="p-3.5 rounded-lg bg-[#0F141A] card-border hover:border-[#0B72B9] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="font-metadata text-[10px] uppercase font-bold tracking-wider"
                  style={{ color: alert.severity === 'severe' ? '#E74C3C' : '#FFB703' }}
                >
                  {alert.agency}
                </span>
                <span className="font-metadata text-[10px] text-[#8A94A6]">
                  {alert.validUntil}
                </span>
              </div>
              <h4 className="font-h4 text-sm font-bold text-[#FFFFFF] group-hover:text-[#4FA8E0] transition-colors">
                {alert.title}
              </h4>
              <p className="font-body-md text-xs text-[#8A94A6] mt-1 line-clamp-2 leading-relaxed">
                {alert.description}
              </p>
            </div>
          ))}

          {/* System status notification */}
          <div className="p-3.5 rounded-lg bg-[#0F141A] card-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71]"></span>
              <span className="font-metadata text-xs font-bold text-[#FFFFFF]">
                IMD Radar Station Network
              </span>
            </div>
            <p className="font-metadata text-[11px] text-[#8A94A6] mt-1">
              Calibrated live across all telemetry sensors with continuous sub-kilometer synoptic precision.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 card-header-divider border-t border-[rgba(225,230,235,0.12)] bg-[#0F141A] flex justify-between items-center">
          <button
            onClick={() => {
              onClose();
              onOpenAlertsView();
            }}
            className="text-xs text-[#4FA8E0] hover:underline cursor-pointer font-medium"
          >
            View All Bulletins →
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#0B72B9] text-[#FFFFFF] text-xs font-semibold hover:bg-[#0A5A94] transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
