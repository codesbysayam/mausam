import React, { useState, useMemo } from 'react';
import { WarningRecord } from '../../types/warningTypes';
import { NATIONAL_WARNINGS_DATABASE } from '../../data/nationalWarningsData';
import { Clock, AlertTriangle, ChevronRight, Calendar, ShieldAlert } from 'lucide-react';

interface WarningTimelineSectionProps {
  activeWarning?: WarningRecord | null;
  onSelectWarning?: (warning: WarningRecord) => void;
}

export const WarningTimelineSection: React.FC<WarningTimelineSectionProps> = ({
  activeWarning,
  onSelectWarning,
}) => {
  const [temporalMode, setTemporalMode] = useState<'PAST' | 'NOW' | 'NEXT'>('NOW');

  // Chronologically sort all warnings by validity
  const sortedWarnings = useMemo(() => {
    return [...NATIONAL_WARNINGS_DATABASE].sort((a, b) => {
      return (a.validityTimestamp || 0) - (b.validityTimestamp || 0);
    });
  }, []);

  const nowMs = Date.now();

  const categorizedWarnings = useMemo(() => {
    const past = sortedWarnings.filter((w) => (w.validityTimestamp || 0) < nowMs);
    const current = sortedWarnings.filter(
      (w) => (w.validityTimestamp || 0) >= nowMs && (w.validityTimestamp || 0) <= nowMs + 24 * 3600 * 1000
    );
    const next = sortedWarnings.filter((w) => (w.validityTimestamp || 0) > nowMs + 24 * 3600 * 1000);

    return {
      PAST: past.length > 0 ? past : sortedWarnings.slice(0, 3),
      NOW: current.length > 0 ? current : sortedWarnings.slice(0, 5),
      NEXT: next.length > 0 ? next : sortedWarnings.slice(2, 6),
    };
  }, [sortedWarnings, nowMs]);

  const displayedList = categorizedWarnings[temporalMode];

  return (
    <section
      id="national-warning-timeline-section"
      aria-label="National Warning Timeline"
      className="bg-[#081522] border border-[#16293D] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#16293D] gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#FFB703]" />
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wide font-sans">
              NATIONAL WARNING TIMELINE
            </h3>
            <p className="text-xs text-[#90CAF9]">
              Chronological Synoptic Warning Sequences Across All States &amp; Subdivisions
            </p>
          </div>
        </div>

        {/* Temporal Mode Switch: PAST ← NOW → NEXT */}
        <div className="flex items-center gap-1 bg-[#0B1E32] p-1 rounded-lg border border-[#1B3A5A]">
          <button
            type="button"
            onClick={() => setTemporalMode('PAST')}
            className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${
              temporalMode === 'PAST'
                ? 'bg-[#1565C0] text-white shadow'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            ← PAST
          </button>
          <button
            type="button"
            onClick={() => setTemporalMode('NOW')}
            className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${
              temporalMode === 'NOW'
                ? 'bg-[#E74C3C] text-white shadow'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            ● NOW (ACTIVE)
          </button>
          <button
            type="button"
            onClick={() => setTemporalMode('NEXT')}
            className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${
              temporalMode === 'NEXT'
                ? 'bg-[#1565C0] text-white shadow'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            NEXT (OUTLOOK) →
          </button>
        </div>
      </div>

      {/* Warnings Timeline Cards */}
      <div className="space-y-2.5">
        {displayedList.map((warn, idx) => {
          const isSelected = activeWarning?.id === warn.id;

          return (
            <div
              key={`${warn.id || idx}-${idx}`}
              onClick={() => onSelectWarning && onSelectWarning(warn)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-[#0E2640] border-[#1499E8] shadow-md ring-1 ring-[#1499E8]'
                  : 'bg-[#0B1E32] border-[#1B3A5A] hover:border-[#1499E8]'
              }`}
            >
              {/* Left Column: Severity + Title + Region */}
              <div className="flex items-start gap-3">
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 ${
                    warn.severity === 'red'
                      ? 'bg-[#E74C3C] text-white'
                      : warn.severity === 'orange'
                      ? 'bg-[#F39C12] text-black'
                      : warn.severity === 'yellow'
                      ? 'bg-[#F1C40F] text-black'
                      : 'bg-[#2ECC71]/20 text-[#2ECC71]'
                  }`}
                >
                  {warn.severity.toUpperCase()} ALERT
                </span>

                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">{warn.title}</h4>
                  <div className="text-xs text-[#90CAF9] mt-0.5">
                    Region: <strong className="text-white">{warn.state}</strong> ({warn.subdivision || warn.affectedAreaText})
                  </div>
                  <div className="text-[11px] text-[#8A94A6] line-clamp-1 mt-1">
                    {warn.description}
                  </div>
                </div>
              </div>

              {/* Right Column: Validity Window + Source */}
              <div className="flex sm:flex-col items-end justify-between sm:justify-center text-right shrink-0 border-t sm:border-t-0 border-[#1B3A5A] pt-2 sm:pt-0">
                <div className="text-xs text-white font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#64B5F6]" />
                  <span>Valid: {warn.validFrom} – {warn.validUntil}</span>
                </div>
                <div className="text-[10px] text-[#78909C] mt-0.5">
                  Source: <strong className="text-[#B0BEC5]">{warn.authorityAgency || warn.source || 'IMD National Bureau'}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
