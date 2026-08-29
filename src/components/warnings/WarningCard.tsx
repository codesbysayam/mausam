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
      className={`bg-[#1E2733] border border-[#314255] rounded-md shadow-md p-4 sm:p-5 flex flex-col justify-between gap-3.5 transition-all hover:border-[#4FA8E0]/60 ${
        warning.severity === 'red'
          ? 'border-l-4 border-l-[#E74C3C]'
          : warning.severity === 'orange'
          ? 'border-l-4 border-l-[#FF8C42]'
          : warning.severity === 'yellow'
          ? 'border-l-4 border-l-[#F1C40F]'
          : warning.severity === 'purple'
          ? 'border-l-4 border-l-[#9B59B6]'
          : 'border-l-4 border-l-[#2ECC71]'
      }`}
    >
      {/* Top Header: Badge, Bulletin ID & Agency */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#314255]">
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#151D26] text-[#DCE3EB] border border-[#314255]">
            <span className="material-symbols-outlined text-[13px] text-[#4FA8E0]">
              {warning.hazardIcon}
            </span>
            <span>{warning.hazardLabel}</span>
          </span>

          {isLocationTarget && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0B72B9] text-white">
              Your Location
            </span>
          )}
        </div>

        <div className="text-[11px] font-mono text-[#8A94A6]">
          <span>Bulletin: </span>
          <strong className="text-[#DCE3EB]">{warning.bulletinNo}</strong>
        </div>
      </div>

      {/* Main Title & Geographic Subtitle */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
          {warning.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#4FA8E0] font-medium mt-0.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]">location_on</span>
          <span>{warning.affectedAreaText}</span>
        </p>
      </div>

      {/* Validity Timing Horizon Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-[#151D26] border border-[#314255] rounded text-xs">
        <div className="flex items-center gap-1.5 text-[#8A94A6]">
          <span className="material-symbols-outlined text-[15px] text-[#2ECC71]">
            schedule
          </span>
          <span>
            Issued: <strong className="text-[#DCE3EB] font-mono">{warning.issuedAt}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#8A94A6]">
          <span className="material-symbols-outlined text-[15px] text-[#FF8C42]">
            event_busy
          </span>
          <span>
            Valid until: <strong className="text-white font-mono">{warning.validUntil}</strong>
          </span>
        </div>
      </div>

      {/* Structured Description */}
      <p className="text-xs text-[#DCE3EB] leading-relaxed line-clamp-3">
        {warning.description}
      </p>

      {/* Potential Meteorological Impacts */}
      {warning.impacts && warning.impacts.length > 0 && (
        <div className="bg-[#151D26]/70 border border-[#314255]/70 rounded p-2.5">
          <div className="text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-[#FF8C42]">
              report
            </span>
            <span>Expected Meteorological Impacts</span>
          </div>
          <ul className="space-y-1 text-xs text-[#DCE3EB]">
            {warning.impacts.slice(0, 2).map((imp, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#4FA8E0] mt-0.5">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Action Items */}
      {warning.recommendedActions && warning.recommendedActions.length > 0 && (
        <div className="bg-[#151D26] border border-[#314255] rounded p-2.5 text-xs text-[#DCE3EB]">
          <div className="text-[11px] font-bold text-[#2ECC71] uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">
              health_and_safety
            </span>
            <span>Recommended Public Action</span>
          </div>
          <p className="line-clamp-2 text-[#DCE3EB]">
            {warning.recommendedActions[0]}
          </p>
        </div>
      )}

      {/* Footer: Source & Interactive Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#314255]">
        <div className="text-[11px] text-[#8A94A6] truncate max-w-xs">
          <span>Source: </span>
          <span className="text-[#DCE3EB] font-medium">{warning.source}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            id={`btn-map-focus-${warning.id}`}
            type="button"
            onClick={() => onViewOnMap(warning)}
            className="px-3 py-1.5 rounded bg-[#151D26] hover:bg-[#2A3749] text-[#DCE3EB] hover:text-[#4FA8E0] border border-[#314255] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">map</span>
            <span>Map Focus</span>
          </button>

          <button
            id={`btn-view-details-${warning.id}`}
            type="button"
            onClick={() => onViewDetails(warning)}
            className="px-3.5 py-1.5 rounded bg-[#0B72B9] hover:bg-[#0A5A94] text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
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
