import React from 'react';
import { AlertSeverity, WarningStats } from '../../types/warningTypes';

interface NationalAlertStatusProps {
  overallStatus: {
    severity: AlertSeverity;
    badgeLabel: string;
    headline: string;
    description: string;
    statusColor: string;
  };
  stats: WarningStats;
  lastUpdated?: string;
  onViewRegionalAlerts?: () => void;
}

export const NationalAlertStatus: React.FC<NationalAlertStatusProps> = ({
  overallStatus,
  stats,
  lastUpdated,
  onViewRegionalAlerts,
}) => {
  return (
    <section
      id="current-national-alert-status-section"
      aria-label="Current National Alert Status"
      className="flex flex-col gap-3.5"
    >
      {/* 1. Official National Alert Banner */}
      <div
        id="national-alert-primary-banner"
        className={`bg-[#0B263D] border rounded-md p-4 sm:p-5 shadow-sm transition-all ${
          overallStatus.severity === 'red'
            ? 'border-[#FF0000]/70'
            : overallStatus.severity === 'orange'
            ? 'border-[#FFA500]/70'
            : overallStatus.severity === 'yellow'
            ? 'border-[#FFFF00]/70'
            : 'border-[#1D5278]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className="w-10 h-10 rounded flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${overallStatus.statusColor}20`,
                borderColor: overallStatus.statusColor,
                color: overallStatus.statusColor,
              }}
            >
              <span className="material-symbols-outlined text-[24px]">
                {overallStatus.severity === 'red' || overallStatus.severity === 'orange'
                  ? 'crisis_alert'
                  : overallStatus.severity === 'yellow'
                  ? 'warning'
                  : 'verified'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${overallStatus.statusColor}25`,
                    borderColor: overallStatus.statusColor,
                    color: overallStatus.severity === 'yellow' ? '#FFFF00' : overallStatus.statusColor,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: overallStatus.statusColor }}
                  />
                  {overallStatus.badgeLabel}
                </span>

                <span className="text-[11px] text-[#AFC4D8] font-mono">
                  {stats.totalActive} Active National Bulletins
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
                {overallStatus.headline}
              </h2>

              <p className="text-xs text-[#AFC4D8] leading-relaxed max-w-4xl">
                {overallStatus.description}
              </p>
            </div>
          </div>

          {onViewRegionalAlerts && (
            <button
              id="btn-scroll-to-bulletins"
              type="button"
              onClick={onViewRegionalAlerts}
              className="self-start lg:self-center px-4 py-2 rounded bg-[#081F33] hover:bg-[#102D47] text-[#E3F2FD] border border-[#1D5278] hover:border-[#1565C0] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <span>View Active Bulletins ({stats.totalActive})</span>
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Structured 4-Metric Summary Row as explicitly requested */}
      <div
        id="national-alert-metrics-row"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {/* Metric 1: Active Severe Warnings (Red) */}
        <div
          id="metric-severe-red"
          className="bg-[#0B263D] border border-[#1D5278] rounded-md p-3.5 sm:p-4 flex flex-col justify-between relative shadow-xs border-l-4 border-l-[#FF0000]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#FF4D4D] uppercase tracking-wider">
              Active Severe Warnings
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-[#FF4D4D]">
              {stats.severeRed}
            </span>
            <span className="text-xs text-[#AFC4D8] ml-2 font-mono">
              bulletin{stats.severeRed === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-[11px] text-[#AFC4D8]">
            Red Alert • Take immediate protective action
          </p>
        </div>

        {/* Metric 2: Moderate Warnings (Orange) */}
        <div
          id="metric-moderate-orange"
          className="bg-[#0B263D] border border-[#1D5278] rounded-md p-3.5 sm:p-4 flex flex-col justify-between relative shadow-xs border-l-4 border-l-[#FFA500]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#FFA500] uppercase tracking-wider">
              Moderate Warnings
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFA500]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-[#FFA500]">
              {stats.moderateOrange}
            </span>
            <span className="text-xs text-[#AFC4D8] ml-2 font-mono">
              bulletin{stats.moderateOrange === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-[11px] text-[#AFC4D8]">
            Orange Alert • Be prepared for severe weather
          </p>
        </div>

        {/* Metric 3: Advisory Warnings (Yellow) */}
        <div
          id="metric-advisory-yellow"
          className="bg-[#0B263D] border border-[#1D5278] rounded-md p-3.5 sm:p-4 flex flex-col justify-between relative shadow-xs border-l-4 border-l-[#FFFF00]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#FFFF00] uppercase tracking-wider">
              Advisory Warnings
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFFF00]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-[#FFFF00]">
              {stats.advisoryYellow}
            </span>
            <span className="text-xs text-[#AFC4D8] ml-2 font-mono">
              bulletin{stats.advisoryYellow === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-[11px] text-[#AFC4D8]">
            Yellow Watch • Stay updated on weather changes
          </p>
        </div>

        {/* Metric 4: Normal / Monitored States (Green) */}
        <div
          id="metric-monitored-green"
          className="bg-[#0B263D] border border-[#1D5278] rounded-md p-3.5 sm:p-4 flex flex-col justify-between relative shadow-xs border-l-4 border-l-[#008000]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#00E676] uppercase tracking-wider">
              Normal / Monitored States
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#008000]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-[#00E676]">
              {stats.greenNormalStates}
            </span>
            <span className="text-xs text-[#AFC4D8] ml-2 font-mono">
              / 36 States &amp; UTs
            </span>
          </div>
          <p className="text-[11px] text-[#AFC4D8]">
            Green Code • Normal seasonal synoptic conditions
          </p>
        </div>
      </div>
    </section>
  );
};
