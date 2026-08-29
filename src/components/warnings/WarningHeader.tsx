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
      className="relative bg-[#151D26] border-b border-[#314255] px-4 py-4 sm:px-6 lg:px-8 transition-colors"
    >
      {/* Subtle top meteorological primary accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B72B9] via-[#4FA8E0] to-[#FF8C42]" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Official Title & Identity */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded bg-[#1E2733] border border-[#314255] flex items-center justify-center text-[#4FA8E0] shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[26px]">
              warning_amber
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-sans">
                {t('majorWeatherWarnings', 'National Weather Warnings')}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0B72B9]/25 text-[#4FA8E0] border border-[#0B72B9]/50">
                IMD Synoptic Alert Feed
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#8A94A6] mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[#DCE3EB] font-medium">
                India Meteorological Monitoring &amp; Public Safety Centre
              </span>
              <span className="text-[#314255] hidden sm:inline">•</span>
              <span>Live synoptic warnings, advisories &amp; emergency bulletins</span>
            </p>
          </div>
        </div>

        {/* Right: Operational Status & Sync */}
        <div className="flex items-center gap-3 self-start md:self-center bg-[#1E2733] border border-[#314255] px-3.5 py-2 rounded-md shadow-sm">
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2ECC71]"></span>
              </span>
              <span className="text-[11px] font-bold text-[#2ECC71] uppercase tracking-wider">
                System Operational
              </span>
            </div>

            <div className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
              <span className="text-[#8A94A6]">Updated: </span>
              <span className="text-[#DCE3EB] font-semibold">{lastUpdated}</span>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-[#314255]" />

          <button
            id="btn-refresh-warning-telemetry"
            type="button"
            onClick={handleRefreshClick}
            disabled={isLoading || justRefreshed}
            title="Refresh National Warning Bulletins"
            aria-label="Refresh warning data"
            className="w-8 h-8 rounded bg-[#151D26] hover:bg-[#0B72B9] text-[#8A94A6] hover:text-white border border-[#314255] hover:border-[#4FA8E0] flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isLoading || justRefreshed ? 'animate-spin text-[#4FA8E0]' : ''
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
