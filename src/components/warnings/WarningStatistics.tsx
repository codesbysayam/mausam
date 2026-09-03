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
      <div className="bg-[#0B2239] border border-[#1D4E73] rounded p-3 flex flex-col justify-between shadow-sm">
        <span className="text-[10px] font-bold text-[#B8C7D9] uppercase tracking-wider">
          Active Warnings
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold font-mono text-white">
            {stats.totalActive}
          </span>
          <span className="text-[10px] text-[#E3F2FD]">bulletins</span>
        </div>
        <span className="text-[10px] text-[#B8C7D9] mt-1">
          All categories
        </span>
      </div>

      {/* 2. States / UTs Under Watch */}
      <div className="bg-[#0B2239] border border-[#1D4E73] rounded p-3 flex flex-col justify-between shadow-sm">
        <span className="text-[10px] font-bold text-[#B8C7D9] uppercase tracking-wider">
          States Affected
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold font-mono text-white">
            {stats.statesAffected}
          </span>
          <span className="text-[10px] text-[#B8C7D9]">/ 36</span>
        </div>
        <span className="text-[10px] text-[#008000] font-semibold">
          {stats.greenNormalStates} states normal
        </span>
      </div>

      {/* 3. Severe Alerts (Red) */}
      <div className="bg-[#0B2239] border border-[#FF0000]/40 bg-gradient-to-b from-[#0B2239] to-[#FF0000]/10 rounded p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#FF4D4D] uppercase tracking-wider">
            Red Alerts
          </span>
          <span className="w-2 h-2 rounded-full bg-[#FF0000] animate-ping" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold font-mono text-[#FF4D4D]">
            {stats.severeRed}
          </span>
          <span className="text-[10px] text-[#FF4D4D]">Emergency</span>
        </div>
        <span className="text-[10px] text-[#B8C7D9] mt-1">
          Immediate action
        </span>
      </div>

      {/* 4. Moderate Alerts (Orange) */}
      <div className="bg-[#0B2239] border border-[#FFA500]/40 bg-gradient-to-b from-[#0B2239] to-[#FFA500]/10 rounded p-3 flex flex-col justify-between shadow-sm">
        <span className="text-[10px] font-bold text-[#FFA500] uppercase tracking-wider">
          Orange Alerts
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold font-mono text-[#FFA500]">
            {stats.moderateOrange}
          </span>
          <span className="text-[10px] text-[#FFA500]">Watch</span>
        </div>
        <span className="text-[10px] text-[#B8C7D9] mt-1">
          Be prepared
        </span>
      </div>

      {/* 5. Advisories (Yellow/Purple) */}
      <div className="bg-[#0B2239] border border-[#FFFF00]/40 rounded p-3 flex flex-col justify-between shadow-sm">
        <span className="text-[10px] font-bold text-[#FFFF00] uppercase tracking-wider">
          Advisories
        </span>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold font-mono text-[#FFFF00]">
            {stats.advisoryYellow + stats.infoPurple}
          </span>
          <span className="text-[10px] text-[#B8C7D9]">Yellow/Purple</span>
        </div>
        <span className="text-[10px] text-[#B8C7D9] mt-1">
          Stay updated
        </span>
      </div>

      {/* 6. Synoptic Telemetry Sync */}
      <div className="bg-[#0B2239] border border-[#1D4E73] rounded p-3 flex flex-col justify-between shadow-sm">
        <span className="text-[10px] font-bold text-[#B8C7D9] uppercase tracking-wider">
          Last Synoptic Sync
        </span>
        <div className="text-xs font-mono font-bold text-[#D7DEE8] mt-1 truncate">
          {stats.lastUpdatedIst}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#E3F2FD] mt-1">
          <span className="material-symbols-outlined text-[12px]">sync</span>
          <span>IMD GTS Network</span>
        </div>
      </div>
    </div>
  );
};

