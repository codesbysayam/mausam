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
          border: 'border-l-4 border-l-[#E74C3C] border-t border-r border-b border-[#314255]',
          badgeBg: 'bg-[#E74C3C]/15 text-[#FF7675] border border-[#E74C3C]/40',
          indicatorDot: 'bg-[#E74C3C]',
          pulseDot: 'bg-[#E74C3C]',
          iconColor: 'text-[#E74C3C]',
          btnBg: 'bg-[#E74C3C] hover:bg-[#C0392B] text-white',
        };
      case 'orange':
        return {
          border: 'border-l-4 border-l-[#FF8C42] border-t border-r border-b border-[#314255]',
          badgeBg: 'bg-[#FF8C42]/15 text-[#FF8C42] border border-[#FF8C42]/40',
          indicatorDot: 'bg-[#FF8C42]',
          pulseDot: 'bg-[#FF8C42]',
          iconColor: 'text-[#FF8C42]',
          btnBg: 'bg-[#FF8C42] hover:bg-[#E67E22] text-white',
        };
      case 'yellow':
        return {
          border: 'border-l-4 border-l-[#F1C40F] border-t border-r border-b border-[#314255]',
          badgeBg: 'bg-[#F1C40F]/15 text-[#F1C40F] border border-[#F1C40F]/40',
          indicatorDot: 'bg-[#F1C40F]',
          pulseDot: 'bg-[#F1C40F]',
          iconColor: 'text-[#F1C40F]',
          btnBg: 'bg-[#0B72B9] hover:bg-[#0A5A94] text-white',
        };
      default:
        return {
          border: 'border-l-4 border-l-[#2ECC71] border-t border-r border-b border-[#314255]',
          badgeBg: 'bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/40',
          indicatorDot: 'bg-[#2ECC71]',
          pulseDot: 'bg-[#2ECC71]',
          iconColor: 'text-[#2ECC71]',
          btnBg: 'bg-[#0B72B9] hover:bg-[#0A5A94] text-white',
        };
    }
  };

  const style = getSeverityStyle(overallStatus.severity);

  return (
    <section
      id="current-national-alert-status-panel"
      aria-label="Current National Alert Status"
      className={`bg-[#1E2733] rounded-md p-4 sm:p-5 shadow-md ${style.border} transition-all`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Indicator & Headline */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded bg-[#151D26] border border-[#314255] shrink-0 mt-0.5">
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

              <span className="text-[11px] font-mono text-[#8A94A6]">
                National Early Warning Stage
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {overallStatus.headline}
            </h2>

            <p className="text-xs sm:text-sm text-[#DCE3EB] max-w-3xl leading-relaxed">
              {overallStatus.description}
            </p>
          </div>
        </div>

        {/* Right: Actions & Timestamp */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#314255]">
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

          <div className="text-[11px] text-[#8A94A6] font-mono">
            <span>Bulletin cycle: </span>
            <strong className="text-[#DCE3EB] font-semibold">{lastUpdated}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};
