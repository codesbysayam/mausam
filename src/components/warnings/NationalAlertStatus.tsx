import React from 'react';
import { AlertSeverity } from '../../types/warningTypes';

interface NationalAlertStatusProps {
  overallStatus: {
    severity: AlertSeverity;
    badgeLabel: string;
    headline: string;
    description: string;
    statusColor: string;
  };
  lastUpdated: string;
  onViewRegionalAlerts: () => void;
  severeCount: number;
}

export const NationalAlertStatus: React.FC<NationalAlertStatusProps> = ({
  overallStatus,
  lastUpdated,
  onViewRegionalAlerts,
  severeCount,
}) => {
  const getSeverityStyle = (sev: AlertSeverity) => {
    switch (sev) {
      case 'red':
        return {
          border: 'border-l-4 border-l-[#FF0000] border-t border-r border-b border-[#1D4E73]',
          badgeBg: 'bg-[#FF0000]/15 text-[#FF4D4D] border border-[#FF0000]/40',
          indicatorDot: 'bg-[#FF0000]',
          pulseDot: 'bg-[#FF0000]',
          iconColor: 'text-[#FF4D4D]',
          btnBg: 'bg-[#FF0000] hover:bg-[#CC0000] text-white',
        };
      case 'orange':
        return {
          border: 'border-l-4 border-l-[#FFA500] border-t border-r border-b border-[#1D4E73]',
          badgeBg: 'bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/40',
          indicatorDot: 'bg-[#FFA500]',
          pulseDot: 'bg-[#FFA500]',
          iconColor: 'text-[#FFA500]',
          btnBg: 'bg-[#FFA500] hover:bg-[#E69500] text-[#071A2D] font-bold',
        };
      case 'yellow':
        return {
          border: 'border-l-4 border-l-[#FFFF00] border-t border-r border-b border-[#1D4E73]',
          badgeBg: 'bg-[#FFFF00]/15 text-[#FFFF00] border border-[#FFFF00]/40',
          indicatorDot: 'bg-[#FFFF00]',
          pulseDot: 'bg-[#FFFF00]',
          iconColor: 'text-[#FFFF00]',
          btnBg: 'bg-[#1565C0] hover:bg-[#0B3D91] text-white',
        };
      default:
        return {
          border: 'border-l-4 border-l-[#008000] border-t border-r border-b border-[#1D4E73]',
          badgeBg: 'bg-[#008000]/15 text-[#008000] border border-[#008000]/40',
          indicatorDot: 'bg-[#008000]',
          pulseDot: 'bg-[#008000]',
          iconColor: 'text-[#008000]',
          btnBg: 'bg-[#1565C0] hover:bg-[#0B3D91] text-white',
        };
    }
  };

  const style = getSeverityStyle(overallStatus.severity);

  return (
    <section
      id="current-national-alert-status-panel"
      aria-label="Current National Alert Status"
      className={`bg-[#0B2239] rounded-md p-4 sm:p-5 shadow-md ${style.border} transition-all`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Indicator & Headline */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded bg-[#071A2D] border border-[#1D4E73] shrink-0 mt-0.5">
            <span className={`material-symbols-outlined text-[24px] ${style.iconColor}`}>
              {overallStatus.severity === 'red' || overallStatus.severity === 'orange'
                ? 'crisis_alert'
                : overallStatus.severity === 'yellow'
                ? 'notification_important'
                : 'verified'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${style.badgeBg}`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.pulseDot} opacity-75`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${style.indicatorDot}`}
                  ></span>
                </span>
                {overallStatus.badgeLabel}
              </span>

              <span className="text-[11px] font-mono text-[#B8C7D9]">
                National Early Warning Stage
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {overallStatus.headline}
            </h2>

            <p className="text-xs sm:text-sm text-[#D7DEE8] max-w-3xl leading-relaxed">
              {overallStatus.description}
            </p>
          </div>
        </div>

        {/* Right: Actions & Timestamp */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1D4E73]">
          <button
            id="btn-view-regional-alerts"
            type="button"
            onClick={onViewRegionalAlerts}
            className={`px-4 py-2 rounded font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${style.btnBg}`}
          >
            <span>View Regional Warnings</span>
            <span className="material-symbols-outlined text-[16px]">
              arrow_downward
            </span>
          </button>

          <div className="text-[11px] text-[#B8C7D9] font-mono">
            <span>Bulletin cycle: </span>
            <strong className="text-[#D7DEE8] font-semibold">{lastUpdated}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};
