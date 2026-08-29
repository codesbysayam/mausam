import React from 'react';
import { WarningStats } from '../../types/warningTypes';

interface WarningStatisticsProps {
  stats: WarningStats;
}

export const WarningStatistics: React.FC<WarningStatisticsProps> = ({ stats }) => {
  return (
    <div
      id="national-warning-statistics-row"
      aria-label="National Meteorological Warning Telemetry Statistics"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5"
    >
      {/* 1. Total Active Warnings */}
      <div className="bg-[#1E2733] border border-[#314255] rounded p-3 flex flex-col justify-between shadow-sm">
        <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider">
          Active Warnings
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold font-mono text-white">
            {stats.totalActive}
          </span>
          <span className="text-[10px] text-[#4FA8E0]">bulletins</span>
        </div>
        <span className="text-[10px] text-[#8A94A6] mt-1">
          All categories
        </span>
      </div>

      {/* 2. States / UTs Under Watch */}
      <div className="bg-[#1E2733] border border-[#314255] rounded p-3 flex flex-col justify-between shadow-sm">
        <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider">
          States Affected
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold font-mono text-white">
            {stats.statesAffected}
          </span>
          <span className="text-[10px] text-[#8A94A6]">/ 36</span>
        </div>
        <span className="text-[10px] text-[#2ECC71]">
          {stats.greenNormalStates} states normal
        </span>
      </div>

      {/* 3. Severe Alerts (Red) */}
      <div className="bg-[#1E2733] border border-[#E74C3C]/40 bg-gradient-to-b from-[#1E2733] to-[#E74C3C]/10 rounded p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#FF7675] uppercase tracking-wider">
            Red Alerts
          </span>
          <span className="w-2 h-2 rounded-full bg-[#E74C3C] animate-ping" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold font-mono text-[#FF7675]">
            {stats.severeRed}
          </span>
          <span className="text-[10px] text-[#FF7675]">Emergency</span>
        </div>
        <span className="text-[10px] text-[#8A94A6] mt-1">
          Immediate action
        </span>
      </div>

      {/* 4. Moderate Alerts (Orange) */}
      <div className="bg-[#1E2733] border border-[#FF8C42]/40 bg-gradient-to-b from-[#1E2733] to-[#FF8C42]/10 rounded p-3 flex flex-col justify-between shadow-sm">
        <span className="text-[10px] font-bold text-[#FF8C42] uppercase tracking-wider">
          Orange Alerts
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold font-mono text-[#FF8C42]">
            {stats.moderateOrange}
          </span>
          <span className="text-[10px] text-[#FF8C42]">Watch</span>
        </div>
        <span className="text-[10px] text-[#8A94A6] mt-1">
          Be prepared
        </span>
      </div>

      {/* 5. Advisories (Yellow/Purple) */}
      <div className="bg-[#1E2733] border border-[#F1C40F]/40 rounded p-3 flex flex-col justify-between shadow-sm">
        <span className="text-[10px] font-bold text-[#F1C40F] uppercase tracking-wider">
          Advisories
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold font-mono text-[#F1C40F]">
            {stats.advisoryYellow + stats.infoPurple}
          </span>
          <span className="text-[10px] text-[#8A94A6]">Yellow/Purple</span>
        </div>
        <span className="text-[10px] text-[#8A94A6] mt-1">
          Stay updated
        </span>
      </div>

      {/* 6. Synoptic Telemetry Sync */}
      <div className="bg-[#1E2733] border border-[#314255] rounded p-3 flex flex-col justify-between shadow-sm">
        <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider">
          Last Synoptic Sync
        </span>
        <div className="text-xs font-mono font-bold text-[#DCE3EB] mt-1 truncate">
          {stats.lastUpdatedIst}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#4FA8E0] mt-1">
          <span className="material-symbols-outlined text-[12px]">sync</span>
          <span>IMD GTS Network</span>
        </div>
      </div>
    </div>
  );
};
