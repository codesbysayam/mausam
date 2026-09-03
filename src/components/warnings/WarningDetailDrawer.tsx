import React, { useEffect } from 'react';
import { WarningRecord } from '../../types/warningTypes';
import { warningService } from '../../services/warningService';

interface WarningDetailDrawerProps {
  warning: WarningRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WarningDetailDrawer: React.FC<WarningDetailDrawerProps> = ({
  warning,
  isOpen,
  onClose,
}) => {
  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !warning) return null;

  const theme = warningService.getSeverityTheme(warning.severity);

  return (
    <div
      id="warning-detail-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-end transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="warning-detail-drawer-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-warning-title"
        className="w-full max-w-2xl h-full bg-[#0B2239] border-l border-[#1D4E73] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Top Sticky Header */}
        <div className="p-4 sm:p-5 bg-[#071A2D] border-b border-[#1D4E73] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${theme.bgBadgeClass} ${theme.textBadgeClass}`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {theme.icon}
              </span>
              <span>{warning.severityLabel}</span>
            </span>

            <span className="text-xs font-mono text-[#B8C7D9]">
              {warning.bulletinNo}
            </span>
          </div>

          <button
            id="btn-close-warning-drawer"
            type="button"
            onClick={onClose}
            aria-label="Close details drawer"
            className="w-8 h-8 rounded bg-[#0B2239] hover:bg-[#102D47] text-[#B8C7D9] hover:text-white border border-[#1D4E73] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-[#D7DEE8] scrollbar-thin scrollbar-thumb-[#1D4E73]">
          {/* Title & Location Banner */}
          <div className="space-y-1 pb-4 border-b border-[#1D4E73]">
            <div className="flex items-center gap-1 text-[#E3F2FD] text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[15px]">
                location_city
              </span>
              <span>{warning.state} • {warning.subdivision}</span>
            </div>

            <h2
              id="drawer-warning-title"
              className="text-xl sm:text-2xl font-bold text-white tracking-tight"
            >
              {warning.title}
            </h2>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#B8C7D9]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#008000]">
                  schedule
                </span>
                <span>
                  Issued: <strong className="text-white font-mono">{warning.issuedAt}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#FFA500]">
                  event_busy
                </span>
                <span>
                  Valid until: <strong className="text-white font-mono">{warning.validUntil}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Affected Districts Tags */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-[#B8C7D9] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#E3F2FD]">
                pin_drop
              </span>
              <span>Designated Affected Districts ({warning.affectedDistricts.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {warning.affectedDistricts.map((district, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-[#071A2D] border border-[#1D4E73] text-xs font-semibold text-white"
                >
                  {district}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Meteorological Synoptic Summary */}
          <div className="bg-[#071A2D] border border-[#1D4E73] rounded-md p-4 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#E3F2FD]">
                radar
              </span>
              <span>Synoptic Warning Bulletin</span>
            </h4>
            <p className="text-xs leading-relaxed text-[#D7DEE8]">
              {warning.description}
            </p>
            {warning.meteorologicalSynopsys && (
              <p className="text-[11px] text-[#B8C7D9] italic pt-1 border-t border-[#1D4E73]/70">
                {warning.meteorologicalSynopsys}
              </p>
            )}
          </div>

          {/* Expected Meteorological Quantities */}
          {warning.expectedConditions && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#B8C7D9] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#FFFF00]">
                  analytics
                </span>
                <span>Expected Numerical Telemetry</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {warning.expectedConditions.rainfall && (
                  <div className="bg-[#071A2D] border border-[#1D4E73] rounded p-2.5">
                    <span className="text-[10px] text-[#B8C7D9] uppercase">
                      24h Precipitation
                    </span>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {warning.expectedConditions.rainfall}
                    </div>
                  </div>
                )}

                {warning.expectedConditions.windSpeed && (
                  <div className="bg-[#071A2D] border border-[#1D4E73] rounded p-2.5">
                    <span className="text-[10px] text-[#B8C7D9] uppercase">
                      Sustained Wind Speed
                    </span>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {warning.expectedConditions.windSpeed}
                    </div>
                  </div>
                )}

                {warning.expectedConditions.windGusts && (
                  <div className="bg-[#071A2D] border border-[#1D4E73] rounded p-2.5">
                    <span className="text-[10px] text-[#B8C7D9] uppercase">
                      Peak Wind Gusts
                    </span>
                    <div className="text-xs font-bold font-mono text-[#FFA500] mt-0.5">
                      {warning.expectedConditions.windGusts}
                    </div>
                  </div>
                )}

                {warning.expectedConditions.visibility && (
                  <div className="bg-[#071A2D] border border-[#1D4E73] rounded p-2.5">
                    <span className="text-[10px] text-[#B8C7D9] uppercase">
                      Visibility Range
                    </span>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {warning.expectedConditions.visibility}
                    </div>
                  </div>
                )}

                {warning.expectedConditions.waveHeight && (
                  <div className="bg-[#071A2D] border border-[#1D4E73] rounded p-2.5">
                    <span className="text-[10px] text-[#B8C7D9] uppercase">
                      Coastal Sea Wave
                    </span>
                    <div className="text-xs font-bold font-mono text-[#E3F2FD] mt-0.5">
                      {warning.expectedConditions.waveHeight}
                    </div>
                  </div>
                )}

                {warning.expectedConditions.temperature && (
                  <div className="bg-[#071A2D] border border-[#1D4E73] rounded p-2.5">
                    <span className="text-[10px] text-[#B8C7D9] uppercase">
                      Temperature Range
                    </span>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {warning.expectedConditions.temperature}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Potential Impacts */}
          {warning.impacts && (
            <div className="space-y-2 bg-[#071A2D] border border-[#1D4E73] rounded-md p-3.5">
              <h4 className="text-xs font-bold text-[#FFA500] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  report_problem
                </span>
                <span>Hazard Impact Assessment</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-[#D7DEE8]">
                {warning.impacts.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#FFA500] mt-0.5 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Safety Guidance */}
          {warning.recommendedActions && (
            <div className="space-y-2 bg-[#071A2D] border border-[#008000]/40 rounded-md p-3.5">
              <h4 className="text-xs font-bold text-[#008000] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  health_and_safety
                </span>
                <span>Actionable Public Advisory &amp; Standard Operating Procedures</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-[#D7DEE8]">
                {warning.recommendedActions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#008000] font-bold">✓</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Operational Timeline Progression */}
          {warning.timeline && warning.timeline.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#B8C7D9] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#E3F2FD]">
                  timeline
                </span>
                <span>Bulletin Progression Timeline</span>
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#1D4E73]">
                {warning.timeline.map((evt, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 ${
                        evt.status === 'completed'
                          ? 'bg-[#008000] border-[#071A2D]'
                          : evt.status === 'current'
                          ? 'bg-[#FF0000] border-[#FFFFFF] animate-pulse'
                          : 'bg-[#1D4E73] border-[#071A2D]'
                      }`}
                    />
                    <div className="text-[11px] font-mono text-[#B8C7D9]">
                      {evt.date} • {evt.time}
                    </div>
                    <div className="font-bold text-white text-xs">{evt.title}</div>
                    <div className="text-[11px] text-[#D7DEE8]">{evt.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Issuing Authority & Emergency Helpline Contact */}
          <div className="bg-[#071A2D] border border-[#1D4E73] rounded-md p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="text-[10px] text-[#B8C7D9] uppercase">Issuing Authority</div>
                <div className="font-bold text-white">{warning.source}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#B8C7D9] uppercase">Tracking Radar</div>
                <div className="font-mono text-[#E3F2FD]">{warning.radarTrackingStation || 'IMD DWR Network'}</div>
              </div>
            </div>

            {warning.emergencyContact && (
              <div className="pt-2 border-t border-[#1D4E73] flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold text-[#FFA500] uppercase">
                    {warning.emergencyContact.title}
                  </div>
                  <div className="text-sm font-bold font-mono text-white">
                    {warning.emergencyContact.number}
                  </div>
                </div>

                <a
                  href={`tel:${warning.emergencyContact.number.split('/')[0].trim()}`}
                  className="px-3 py-1.5 rounded bg-[#FF0000] hover:bg-[#CC0000] text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">call</span>
                  <span>Call Helpline</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-4 bg-[#071A2D] border-t border-[#1D4E73] flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-[#B8C7D9] font-mono">
            National Meteorological Feed • Confidential &amp; Verified
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#0B2239] hover:bg-[#102D47] text-white text-xs font-bold border border-[#1D4E73] transition-colors cursor-pointer"
          >
            Close Bulletin
          </button>
        </div>
      </div>
    </div>
  );
};
