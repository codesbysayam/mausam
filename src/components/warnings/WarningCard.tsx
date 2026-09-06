import React, { useState } from 'react';
import { WarningRecord } from '../../types/warningTypes';

interface WarningCardProps {
  warning: WarningRecord;
  onViewDetails: (warning: WarningRecord) => void;
  onViewOnMap: (warning: WarningRecord) => void;
  isLocationTarget?: boolean;
}

export const WarningCard: React.FC<WarningCardProps> = ({
  warning,
  onViewDetails,
  onViewOnMap,
  isLocationTarget = false,
}) => {
  const [copied, setCopied] = useState(false);

  // Standardized Severity Themes (only border and badge change; card background is identical)
  const getSeverityTheme = () => {
    switch (warning.severity) {
      case 'red':
        return {
          border: 'border-[#FF0000]/70',
          badge: 'bg-[#FF0000]/20 text-[#FF4D4D] border-[#FF0000]/60',
          dot: 'bg-[#FF0000]',
          label: 'RED ALERT',
        };
      case 'orange':
        return {
          border: 'border-[#FFA500]/70',
          badge: 'bg-[#FFA500]/20 text-[#FFA500] border-[#FFA500]/60',
          dot: 'bg-[#FFA500]',
          label: 'ORANGE ALERT',
        };
      case 'yellow':
        return {
          border: 'border-[#FFFF00]/70',
          badge: 'bg-[#FFFF00]/20 text-[#FFFF00] border-[#FFFF00]/60',
          dot: 'bg-[#FFFF00]',
          label: 'YELLOW WATCH',
        };
      case 'purple':
        return {
          border: 'border-[#1565C0]/70',
          badge: 'bg-[#1565C0]/20 text-[#E3F2FD] border-[#1565C0]/60',
          dot: 'bg-[#1565C0]',
          label: 'ADVISORY',
        };
      default:
        return {
          border: 'border-[#008000]/70',
          badge: 'bg-[#008000]/20 text-[#00E676] border-[#008000]/60',
          dot: 'bg-[#008000]',
          label: 'GREEN CODE',
        };
    }
  };

  const theme = getSeverityTheme();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `[IMD Weather Warning] ${warning.severity.toUpperCase()} ALERT: ${warning.title} (${warning.subdivision}, ${warning.state}). Valid until: ${warning.validUntil}. Issued by ${warning.source}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article
      id={`warning-card-${warning.id}`}
      className={`warning-card bg-[#0B263D] border rounded-md p-6 shadow-sm flex flex-col min-w-0 h-full transition-all hover:border-[#1565C0] ${theme.border}`}
    >
      {/* 1. HEADER: State/Region + Location and Severity Badge */}
      <header className="bulletin-header flex items-start justify-between gap-3 mb-[14px]">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate">
              {warning.state}
            </h4>
            <span className="text-xs text-[#AFC4D8] font-mono">
              • {warning.subdivision}
            </span>
          </div>
          {isLocationTarget && (
            <div className="mt-1">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#1565C0] text-white tracking-wide">
                Your Region
              </span>
            </div>
          )}
        </div>

        <span
          className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider shrink-0 flex items-center gap-1.5 whitespace-nowrap ${theme.badge}`}
        >
          <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
          <span>{theme.label}</span>
        </span>
      </header>

      {/* DIVIDER */}
      <div className="border-b border-[#1D5278]" />

      {/* 2. CARD CONTENT CONTAINER (Flexible, perfectly structured) */}
      <div className="warning-card-content flex-1 flex flex-col min-w-0">
        {/* HAZARD ICON + HAZARD TYPE */}
        <div className="mt-[16px] flex items-center gap-2 text-xs font-bold text-[#4FA8E0] uppercase tracking-wider">
          <span className="material-symbols-outlined text-[18px]">
            {warning.hazardIcon}
          </span>
          <span>{warning.hazardLabel}</span>
        </div>

        {/* WARNING TITLE (Min-height 54px with no ellipsis cutoffs) */}
        <h3 className="warning-title mt-[8px] text-base font-bold text-white tracking-tight leading-[1.25] min-h-[54px] flex items-start">
          {warning.title}
        </h3>

        {/* METADATA: 3-row structured grid (Bulletin No, Issued At, Valid Until) */}
        <div className="metadata-grid mt-[16px] bg-[#081F33] border border-[#1D5278] rounded p-3 text-xs font-mono grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
          <span className="text-[#AFC4D8] whitespace-nowrap">Bulletin No.</span>
          <span
            className="text-white font-semibold text-right break-words min-w-0"
            title={warning.bulletinNo}
          >
            {warning.bulletinNo}
          </span>

          <span className="text-[#AFC4D8] whitespace-nowrap">Issued At</span>
          <span className="text-white font-semibold text-right break-words min-w-0">
            {warning.issuedAt}
          </span>

          <span className="text-[#AFC4D8] whitespace-nowrap">Valid Until</span>
          <span className="text-white font-semibold text-right break-words min-w-0">
            {warning.validUntil}
          </span>
        </div>

        {/* AFFECTED DISTRICTS & ZONES */}
        <div className="mt-[16px]">
          <div className="text-[10px] font-bold text-[#AFC4D8] uppercase tracking-wider mb-2">
            Affected Districts &amp; Zones
          </div>
          <div className="zone-list flex flex-wrap gap-[6px]">
            {warning.affectedDistricts.slice(0, 4).map((dist, idx) => (
              <span
                key={idx}
                className="h-[24px] px-2.5 rounded bg-[#081F33] border border-[#1D5278] text-[11px] text-[#AFC4D8] font-medium inline-flex items-center justify-center whitespace-nowrap max-w-full truncate"
              >
                {dist}
              </span>
            ))}
            {warning.affectedDistricts.length > 4 && (
              <span className="h-[24px] px-2 rounded bg-[#081F33] border border-[#1D5278] text-[11px] text-[#AFC4D8] font-medium inline-flex items-center justify-center whitespace-nowrap">
                +{warning.affectedDistricts.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* DESCRIPTION (Readable 14px, line-height 1.6, naturally wrapping) */}
        <div className="mt-[16px] flex-1 min-w-0">
          <p className="text-[14px] leading-[1.6] text-[#AFC4D8] text-left break-words">
            {warning.description}
          </p>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-b border-[#1D5278] mt-[18px]" />

      {/* 3. FOOTER: Strict baseline alignment, standardized 42px controls */}
      <footer className="warning-card-footer mt-auto pt-4 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 shrink-0">
          <button
            id={`btn-map-focus-${warning.id}`}
            type="button"
            onClick={() => onViewOnMap(warning)}
            className="h-[42px] w-[42px] rounded bg-[#081F33] hover:bg-[#102D47] text-[#AFC4D8] hover:text-white border border-[#1D5278] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Focus Subdivision on Map"
            aria-label="Focus on Map"
          >
            <span className="material-symbols-outlined text-[18px]">location_searching</span>
          </button>

          <button
            id={`btn-share-warning-${warning.id}`}
            type="button"
            onClick={handleShare}
            className="h-[42px] w-[42px] rounded bg-[#081F33] hover:bg-[#102D47] text-[#AFC4D8] hover:text-white border border-[#1D5278] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={copied ? 'Copied Alert to Clipboard' : 'Copy Official Bulletin text'}
            aria-label="Share bulletin"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? 'check' : 'share'}
            </span>
          </button>
        </div>

        <button
          id={`btn-view-details-${warning.id}`}
          type="button"
          onClick={() => onViewDetails(warning)}
          className="h-[42px] px-4 rounded bg-[#1565C0] hover:bg-[#0B3D91] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <span>View Advisory</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </footer>
    </article>
  );
};
