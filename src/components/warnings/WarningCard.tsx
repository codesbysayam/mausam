import React from 'react';
import { WarningRecord } from '../../types/warningTypes';
import { warningService } from '../../services/warningService';

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
  const theme = warningService.getSeverityTheme(warning.severity);

  return (
    <article
      id={`warning-card-${warning.id}`}
      aria-label={`${warning.severityLabel}: ${warning.title}`}
      className={`bg-[#0B2239] border border-[#1D4E73] rounded-md shadow-md p-4 sm:p-5 flex flex-col justify-between gap-3.5 transition-all hover:border-[#1565C0]/60 ${
        warning.severity === 'red'
          ? 'border-l-4 border-l-[#FF0000]'
          : warning.severity === 'orange'
          ? 'border-l-4 border-l-[#FFA500]'
          : warning.severity === 'yellow'
          ? 'border-l-4 border-l-[#FFFF00]'
          : warning.severity === 'purple'
          ? 'border-l-4 border-l-[#1565C0]'
          : 'border-l-4 border-l-[#008000]'
      }`}
    >
      {/* Top Header: Badge, Bulletin ID & Agency */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1D4E73]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${theme.bgBadgeClass} ${theme.textBadgeClass}`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {theme.icon}
            </span>
            <span>{warning.severityLabel}</span>
          </span>

          {/* Hazard Chip */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#071A2D] text-[#D7DEE8] border border-[#1D4E73]">
            <span className="material-symbols-outlined text-[13px] text-[#E3F2FD]">
              {warning.hazardIcon}
            </span>
            <span>{warning.hazardLabel}</span>
          </span>

          {isLocationTarget && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1565C0] text-white">
              Your Location
            </span>
          )}
        </div>

        <div className="text-[11px] font-mono text-[#B8C7D9]">
          <span>Bulletin: </span>
          <strong className="text-[#D7DEE8]">{warning.bulletinNo}</strong>
        </div>
      </div>

      {/* Main Title & Geographic Subtitle */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
          {warning.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#E3F2FD] font-medium mt-0.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">location_on</span>
          <span>{warning.affectedAreaText}</span>
        </p>
      </div>

      {/* Validity Timing Horizon Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-[#071A2D] border border-[#1D4E73] rounded text-xs">
        <div className="flex items-center gap-1.5 text-[#B8C7D9]">
          <span className="material-symbols-outlined text-[15px] text-[#008000]">
            schedule
          </span>
          <span>
            Issued: <strong className="text-[#D7DEE8] font-mono">{warning.issuedAt}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#B8C7D9]">
          <span className="material-symbols-outlined text-[15px] text-[#FFA500]">
            event_busy
          </span>
          <span>
            Valid until: <strong className="text-white font-mono">{warning.validUntil}</strong>
          </span>
        </div>
      </div>

      {/* Structured Description */}
      <p className="text-xs text-[#D7DEE8] leading-relaxed line-clamp-3">
        {warning.description}
      </p>

      {/* Potential Meteorological Impacts */}
      {warning.impacts && warning.impacts.length > 0 && (
        <div className="bg-[#071A2D]/70 border border-[#1D4E73]/70 rounded p-2.5">
          <div className="text-[11px] font-bold text-[#B8C7D9] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-[#FFA500]">
              report
            </span>
            <span>Expected Meteorological Impacts</span>
          </div>
          <ul className="space-y-1 text-xs text-[#D7DEE8]">
            {warning.impacts.slice(0, 2).map((imp, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#E3F2FD] mt-0.5">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Action Items */}
      {warning.recommendedActions && warning.recommendedActions.length > 0 && (
        <div className="bg-[#071A2D] border border-[#1D4E73] rounded p-2.5 text-xs text-[#D7DEE8]">
          <div className="text-[11px] font-bold text-[#008000] uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">
              health_and_safety
            </span>
            <span>Recommended Public Action</span>
          </div>
          <p className="line-clamp-2 text-[#D7DEE8]">
            {warning.recommendedActions[0]}
          </p>
        </div>
      )}

      {/* Footer: Source & Interactive Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1D4E73]">
        <div className="text-[11px] text-[#B8C7D9] truncate max-w-xs">
          <span>Source: </span>
          <span className="text-[#D7DEE8] font-medium">{warning.source}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            id={`btn-map-focus-${warning.id}`}
            type="button"
            onClick={() => onViewOnMap(warning)}
            className="px-3 py-1.5 rounded bg-[#071A2D] hover:bg-[#102D47] text-[#D7DEE8] hover:text-[#E3F2FD] border border-[#1D4E73] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">map</span>
            <span>Map Focus</span>
          </button>

          <button
            id={`btn-view-details-${warning.id}`}
            type="button"
            onClick={() => onViewDetails(warning)}
            className="px-3.5 py-1.5 rounded bg-[#1565C0] hover:bg-[#0B3D91] text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
          >
            <span>View Full Details</span>
            <span className="material-symbols-outlined text-[15px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
