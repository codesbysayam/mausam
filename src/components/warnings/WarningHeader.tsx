import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface WarningHeaderProps {
  lastUpdated: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const WarningHeader: React.FC<WarningHeaderProps> = ({
  lastUpdated,
  onRefresh,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefreshClick = () => {
    setJustRefreshed(true);
    onRefresh();
    setTimeout(() => setJustRefreshed(false), 1200);
  };

  return (
    <header
      id="warning-page-official-header"
      className="relative bg-[#071A2D] border-b border-[#1D4E73] px-4 py-4 sm:px-6 lg:px-8 transition-colors"
    >
      {/* Subtle top meteorological primary accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#1565C0] to-[#E3F2FD]" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Official Title & Identity */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded bg-[#0B2239] border border-[#1D4E73] flex items-center justify-center text-[#E3F2FD] shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[26px]">
              warning_amber
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-sans">
                {t('majorWeatherWarnings', 'National Weather Warnings')}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#1565C0]/25 text-[#E3F2FD] border border-[#1565C0]/50">
                IMD Synoptic Alert Feed
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#B8C7D9] mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[#D7DEE8] font-medium">
                India Meteorological Monitoring &amp; Public Safety Centre
              </span>
              <span className="text-[#1D4E73] hidden sm:inline">•</span>
              <span>Live synoptic warnings, advisories &amp; emergency bulletins</span>
            </p>
          </div>
        </div>

        {/* Right: Operational Status & Sync */}
        <div className="flex items-center gap-3 self-start md:self-center bg-[#0B2239] border border-[#1D4E73] px-3.5 py-2 rounded-md shadow-sm">
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008000] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008000]"></span>
              </span>
              <span className="text-[11px] font-bold text-[#008000] uppercase tracking-wider">
                System Operational
              </span>
            </div>

            <div className="text-[11px] text-[#B8C7D9] font-mono mt-0.5">
              <span className="text-[#B8C7D9]">Updated: </span>
              <span className="text-[#D7DEE8] font-semibold">{lastUpdated}</span>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-[#1D4E73]" />

          <button
            id="btn-refresh-warning-telemetry"
            type="button"
            onClick={handleRefreshClick}
            disabled={isLoading || justRefreshed}
            title="Refresh National Warning Bulletins"
            aria-label="Refresh warning data"
            className="w-8 h-8 rounded bg-[#071A2D] hover:bg-[#1565C0] text-[#B8C7D9] hover:text-white border border-[#1D4E73] hover:border-[#E3F2FD] flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
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
    </header>
  );
};
