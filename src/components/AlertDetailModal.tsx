import React from 'react';
import { WeatherAlert, NavigationTab } from '../types';

interface AlertDetailModalProps {
  alert: WeatherAlert | null;
  onClose: () => void;
  onNavigateTab?: (tab: NavigationTab) => void;
  onDismissAlert?: (alertId: string) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  onNavigateTab,
  onDismissAlert,
}) => {
  if (!alert) return null;

  const isSevere = alert.severity === 'severe' || alert.severity === 'extreme';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-[#1E2733] card-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col gap-5 border border-[rgba(225,230,235,0.12)]"
        style={{ borderColor: alert.color || (isSevere ? '#E74C3C' : '#FFB703') }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-3 border-b border-[rgba(225,230,235,0.12)] pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{
                backgroundColor: isSevere ? 'rgba(231,76,60,0.2)' : 'rgba(46,204,113,0.2)',
                color: alert.color || (isSevere ? '#E74C3C' : '#2ECC71'),
              }}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isSevere ? 'warning' : 'campaign'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-lg border"
                  style={{
                    color: alert.color || (isSevere ? '#E74C3C' : '#2ECC71'),
                    borderColor: `${alert.color || (isSevere ? '#E74C3C' : '#2ECC71')}55`,
                    backgroundColor: `${alert.color || (isSevere ? '#E74C3C' : '#2ECC71')}15`,
                  }}
                >
                  {alert.agency}
                </span>
                <span className="text-xs text-[#8A94A6] capitalize font-medium">
                  {alert.severity} Severity
                </span>
              </div>
              <h3 className="font-h3 text-base font-bold text-[#FFFFFF] mt-1.5">
                {alert.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0F141A] card-border flex items-center justify-center text-[#8A94A6] hover:text-white hover:border-[#0B72B9] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-3 bg-[#0F141A] p-3.5 rounded-xl card-border text-xs">
          <div>
            <span className="text-[#8A94A6] block text-xs font-medium mb-0.5">Issued Time</span>
            <span className="font-semibold text-[#FFFFFF]">{alert.issuedAt}</span>
          </div>
          <div>
            <span className="text-[#8A94A6] block text-xs font-medium mb-0.5">Valid Until</span>
            <span className="font-semibold text-[#4FA8E0]">{alert.validUntil}</span>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-[#8A94A6] font-semibold">
            Synoptic Meteorological Advisory
          </span>
          <p className="text-xs text-[#F4F7FA] leading-relaxed bg-[#0F141A] p-4 rounded-xl card-border">
            {alert.description}
          </p>
        </div>

        {/* Affected Districts */}
        {alert.affectedDistricts && alert.affectedDistricts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[#8A94A6] font-semibold">
              Affected Districts / Agro-Ecological Zones
            </span>
            <div className="flex flex-wrap gap-1.5">
              {alert.affectedDistricts.map((district, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-[#0F141A] border border-[rgba(225,230,235,0.12)] text-xs text-[#FFFFFF]"
                >
                  📍 {district}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mandatory Action Item */}
        {alert.actionItem && (
          <div className="bg-[#E74C3C]/10 border border-[#E74C3C]/30 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#E74C3C] text-[20px] shrink-0 mt-0.5">
              task_alt
            </span>
            <div>
              <span className="text-xs text-[#E74C3C] font-semibold block">
                Recommended Action Directive
              </span>
              <p className="text-xs text-[#FFFFFF] mt-1 leading-relaxed">
                {alert.actionItem}
              </p>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-[rgba(225,230,235,0.12)]">
          {onDismissAlert && (
            <button
              onClick={() => {
                onDismissAlert(alert.id);
                onClose();
              }}
              className="text-xs text-[#8A94A6] hover:text-[#FFFFFF] underline cursor-pointer"
            >
              Acknowledge &amp; Dismiss
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {alert.agency.includes('AGROMET') ? (
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab('agromet');
                }}
                className="px-4 py-2 rounded-xl bg-[#2ECC71] text-[#0F141A] text-xs font-semibold hover:bg-[#27AE60] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">agriculture</span>
                <span>Open Agromet Tab</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab('radar');
                }}
                className="px-4 py-2 rounded-xl bg-[#0B72B9] text-[#FFFFFF] text-xs font-semibold hover:bg-[#0A5A94] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">radar</span>
                <span>Track on Radar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
