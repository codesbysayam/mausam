import React, { useState } from 'react';
import { formatIndianDateTime } from '../../utils/dateUtils';
import { AudioAlertToggle } from '../common/AudioAlertToggle';

interface WarningHeaderProps {
  lastUpdated?: string;
  onRefresh: () => void;
  isLoading?: boolean;
  source?: string;
}

export const WarningHeader: React.FC<WarningHeaderProps> = ({
  lastUpdated,
  onRefresh,
  isLoading = false,
  source = 'National Alert Feed (NDMA / SACHET)',
}) => {
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefreshClick = () => {
    setJustRefreshed(true);
    onRefresh();
    setTimeout(() => setJustRefreshed(false), 1000);
  };

  const displayTimestamp = lastUpdated || formatIndianDateTime(new Date());

  return (
    <header
      id="warning-page-official-header"
      className="bg-[#0B263D] border border-[#1D5278] rounded-md p-4 sm:p-5 shadow-sm"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Indian Meteorological Department Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded bg-[#081F33] border border-[#1D5278] flex items-center justify-center text-[#E3F2FD] shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[28px] text-[#4FA8E0]">
              crisis_alert
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#E3F2FD] bg-[#102D47] px-2 py-0.5 rounded border border-[#1565C0]">
                India Meteorological Department
              </span>
              <span className="text-[10px] font-mono text-[#AFC4D8]">
                IMD Synoptic Alert Division
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#AFC4D8] mt-0.5">
              Ministry of Earth Sciences • Government of India
            </p>
          </div>
        </div>

        {/* Center: Official Title */}
        <div className="text-left lg:text-center">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-white uppercase font-sans">
            National Weather Warning Bulletin
          </h1>
          <p className="text-[11px] sm:text-xs text-[#AFC4D8] mt-0.5">
            Real-Time Meteorological Warnings, Flash Flood Advisories &amp; Synoptic Watches
          </p>
        </div>

        {/* Right: Audio Alert Toggle & Last Updated IST timestamp with live status indicator & refresh */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
          <AudioAlertToggle variant="header" />

          <div className="flex items-center gap-3 bg-[#081F33] border border-[#1D5278] px-3.5 py-2 rounded shadow-xs">
            <div className="flex flex-col text-left sm:text-right">
              <div className="flex items-center gap-1.5 sm:justify-end">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008000] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008000]"></span>
                </span>
                <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider truncate max-w-[200px]">
                  {source}
                </span>
              </div>

              <div className="text-[11px] text-[#AFC4D8] font-mono mt-0.5 flex items-center gap-1">
                <span>Updated:</span>
                <span className="text-white font-semibold">{displayTimestamp}</span>
              </div>
            </div>

            <div className="h-7 w-[1px] bg-[#1D5278]" />

            <button
              id="btn-refresh-warning-telemetry"
              type="button"
              onClick={handleRefreshClick}
              disabled={isLoading || justRefreshed}
              title="Refresh National Warning Feed"
              aria-label="Refresh warning data"
              className="w-8 h-8 rounded bg-[#102D47] hover:bg-[#1565C0] text-[#AFC4D8] hover:text-white border border-[#1D5278] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isLoading || justRefreshed ? 'animate-spin text-[#E3F2FD]' : ''
                }`}
              >
                refresh
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
