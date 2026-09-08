import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Shield,
  X,
  PhoneCall,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { WeatherAlert, LocationRecord } from '../../types';
import { WarningRecord, AlertSeverity } from '../../types/warningTypes';
import { NATIONAL_WARNINGS_DATABASE } from '../../data/nationalWarningsData';
import { warningService } from '../../services/warningService';

export interface HomeSevereWeatherStripProps {
  alerts?: WeatherAlert[];
  selectedLocation?: LocationRecord;
  lastUpdated?: string;
  onNavigateToWarnings?: () => void;
}

interface DisplayWarning {
  id: string;
  bulletinNo?: string;
  hazardHeadline: string;
  severity: AlertSeverity;
  severityBadgeLabel: string;
  isLocal: boolean;
  scopeType: 'LOCAL_DISTRICT' | 'STATE_SUBDIVISION' | 'NATIONAL';
  scopeLabel: string;
  affectedAreasHeadline: string;
  affectedCountSummary: string;
  description: string;
  validUntil: string;
  issuedAt: string;
  source: string;
  recommendedActions: string[];
  emergencyNumber?: string;
  emergencyTitle?: string;
}

/**
 * Format affected areas into clean string: "District A • District B • District C + X more"
 */
function formatAffectedAreasText(
  districts: string[] = [],
  stateName?: string,
  areaText?: string
): string {
  if (districts && districts.length > 0) {
    const primary = districts.slice(0, 4);
    const remainder = districts.length - primary.length;
    return `${primary.join(' • ')}${remainder > 0 ? ` + ${remainder} more` : ''}`;
  }
  if (areaText && areaText.trim().length > 0) {
    return areaText;
  }
  return stateName ? `${stateName} Meteorological Subdivision` : 'Regional Meteorological Subdivision';
}

/**
 * Clean hazard title to bold uppercase meteorological label
 */
function formatHazardHeadline(rawHazard?: string, rawTitle?: string): string {
  const candidate = (rawHazard || rawTitle || 'SEVERE WEATHER ALERT').trim();
  // Remove trailing "Warning", "Watch", "Advisory" for punchy headline if appropriate
  return candidate.toUpperCase();
}

/**
 * Format timestamp into clean Indian Standard Time representation
 */
function formatCleanTime(timeString?: string): string {
  if (!timeString) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} IST`;
  }
  if (timeString.includes('IST')) {
    // Extract just time or date if very long
    return timeString;
  }
  return `${timeString} IST`;
}

export const HomeSevereWeatherStrip: React.FC<HomeSevereWeatherStripProps> = ({
  alerts = [],
  selectedLocation,
  lastUpdated,
  onNavigateToWarnings,
}) => {
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // 1. Resolve and categorize warnings with location awareness
  const {
    activeWarning,
    totalActiveCount,
    hasSevereAlert,
    isDataAvailable,
  } = useMemo(() => {
    const db = NATIONAL_WARNINGS_DATABASE || [];
    if (!db || db.length === 0) {
      return {
        activeWarning: null,
        totalActiveCount: 0,
        hasSevereAlert: false,
        isDataAvailable: false,
      };
    }

    const locCity = (selectedLocation?.city || '').toLowerCase();
    const locDistrict = (selectedLocation?.district || '').toLowerCase();
    const locState = (selectedLocation?.state || '').toLowerCase();

    // Check direct local warnings for selected location
    const matchedRecords: { record: WarningRecord; matchTier: number }[] = [];

    db.forEach((warn) => {
      const warnState = (warn.state || '').toLowerCase();
      const stateMatch =
        warnState === locState ||
        warnState.includes(locState) ||
        locState.includes(warnState);

      const districtMatch = (warn.affectedDistricts || []).some((d) => {
        const dl = d.toLowerCase();
        return (
          dl === locDistrict ||
          dl === locCity ||
          locDistrict.includes(dl) ||
          locCity.includes(dl)
        );
      });

      if (districtMatch && stateMatch) {
        // Highest priority: direct district match
        matchedRecords.push({ record: warn, matchTier: 1 });
      } else if (stateMatch) {
        // Second priority: state-wide / subdivision match
        matchedRecords.push({ record: warn, matchTier: 2 });
      }
    });

    // Sort local matches by matchTier (district first), then severity (red > orange > yellow)
    const severityRank: Record<string, number> = {
      red: 4,
      orange: 3,
      yellow: 2,
      green: 1,
      purple: 1,
    };

    matchedRecords.sort((a, b) => {
      const tierDiff = a.matchTier - b.matchTier;
      if (tierDiff !== 0) return tierDiff;
      const rankA = severityRank[a.record.severity] || 0;
      const rankB = severityRank[b.record.severity] || 0;
      return rankB - rankA;
    });

    const localActive = matchedRecords.filter((m) => m.record.severity !== 'green');

    // If local active warning exists, pick the primary local warning
    if (localActive.length > 0) {
      const best = localActive[0];
      const rec = best.record;
      const isDirectDistrict = best.matchTier === 1;

      const locationLabel = selectedLocation?.city || selectedLocation?.district || selectedLocation?.state;
      const scopeLabel = isDirectDistrict
        ? `LOCAL ADVISORY • ${locationLabel?.toUpperCase()}`
        : `REGIONAL SUBDIVISION • ${(rec.state || locationLabel || 'STATE').toUpperCase()}`;

      const display: DisplayWarning = {
        id: rec.id,
        bulletinNo: rec.bulletinNo,
        hazardHeadline: formatHazardHeadline(rec.hazardLabel, rec.title),
        severity: rec.severity,
        severityBadgeLabel:
          rec.severity === 'red'
            ? 'RED ALERT'
            : rec.severity === 'orange'
            ? 'ORANGE ALERT'
            : rec.severity === 'yellow'
            ? 'YELLOW WATCH'
            : 'NORMAL',
        isLocal: true,
        scopeType: isDirectDistrict ? 'LOCAL_DISTRICT' : 'STATE_SUBDIVISION',
        scopeLabel,
        affectedAreasHeadline: formatAffectedAreasText(
          rec.affectedDistricts,
          rec.state,
          rec.affectedAreaText
        ),
        affectedCountSummary: `${rec.affectedDistricts?.length || 1} districts (${rec.state})`,
        description: rec.description,
        validUntil: rec.validUntil ? rec.validUntil.replace(/•.*/, '').trim() : 'Next 24 Hours',
        issuedAt: rec.issuedAt ? rec.issuedAt.replace(/•.*/, '').trim() : 'Routine Synoptic Cycle',
        source: rec.source || 'IMD Warning Service',
        recommendedActions: rec.recommendedActions || [],
        emergencyNumber: rec.emergencyContact?.number,
        emergencyTitle: rec.emergencyContact?.title,
      };

      return {
        activeWarning: display,
        totalActiveCount: localActive.length,
        hasSevereAlert: rec.severity === 'red' || rec.severity === 'orange',
        isDataAvailable: true,
      };
    }

    // If no local severe warning exists, check for direct alerts prop
    const directSevere = alerts.filter(
      (a) => a.severity === 'red' || a.severity === 'orange' || a.severity === 'severe'
    );
    if (directSevere.length > 0) {
      const prim = directSevere[0];
      const isRed = prim.severity === 'red' || prim.severity === 'severe';
      const display: DisplayWarning = {
        id: prim.id || 'alert-direct-01',
        hazardHeadline: formatHazardHeadline(prim.title, prim.title),
        severity: isRed ? 'red' : 'orange',
        severityBadgeLabel: isRed ? 'RED ALERT' : 'ORANGE ALERT',
        isLocal: true,
        scopeType: 'LOCAL_DISTRICT',
        scopeLabel: `LOCAL ADVISORY • ${(selectedLocation?.city || 'DISTRICT').toUpperCase()}`,
        affectedAreasHeadline: prim.affectedArea || prim.affectedDistricts?.join(' • ') || 'Local Met Sector',
        affectedCountSummary: `${prim.affectedDistricts?.length || 1} local districts`,
        description: prim.description || 'Active atmospheric disturbance detected over the local sector.',
        validUntil: prim.validUntil || 'Next 24 Hours',
        issuedAt: prim.issuedAt || 'Recent Cycle',
        source: prim.agency || 'IMD Warning Service',
        recommendedActions: prim.actionItem ? [prim.actionItem] : [],
      };

      return {
        activeWarning: display,
        totalActiveCount: directSevere.length,
        hasSevereAlert: true,
        isDataAvailable: true,
      };
    }

    // Local location has NO severe warning!
    return {
      activeWarning: null,
      totalActiveCount: 0,
      hasSevereAlert: false,
      isDataAvailable: true,
    };
  }, [alerts, selectedLocation]);

  // Clean data timestamp and freshness calculation
  const updatedTime = useMemo(() => {
    return formatCleanTime(lastUpdated);
  }, [lastUpdated]);

  // State 1: Warning Data Unavailable
  if (!isDataAvailable) {
    return (
      <section
        id="severe-weather-alert-center"
        aria-label="Severe Weather Alert Center"
        className="w-full rounded-xl border border-[#1E2E40] border-l-4 border-l-[#64748B] bg-[#0F1722] p-4 sm:p-5 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[#94A3B8]">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-[#94A3B8]" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#E2E8F0]">
              SEVERE WEATHER ALERT CENTER
            </span>
            <span className="text-xs text-[#94A3B8]">
              • Warning data temporarily unavailable
            </span>
          </div>
          <button
            type="button"
            id="btn-view-warnings-bulletin"
            onClick={onNavigateToWarnings}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-semibold text-[#E2E8F0] transition-colors cursor-pointer"
          >
            <span>View Warnings Bulletin</span>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </button>
        </div>
      </section>
    );
  }

  // State 2: No Active Warning for the Selected Location (Reassuring, Clean, Green)
  if (!activeWarning) {
    const locName = selectedLocation?.city
      ? `${selectedLocation.city}${selectedLocation.state ? `, ${selectedLocation.state}` : ''}`
      : selectedLocation?.state || 'the selected location';

    return (
      <section
        id="severe-weather-alert-center"
        aria-label="Severe Weather Alert Center"
        className="w-full rounded-xl border border-[#1E3A2F] border-l-4 border-l-[#10B981] bg-[#0A1612] p-4 sm:p-4.5 lg:p-5 shadow-sm transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-[#10B981]">
                <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                <span className="text-xs font-bold tracking-wider uppercase text-[#E2E8F0]">
                  SEVERE WEATHER ALERT CENTER
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold font-mono tracking-wider uppercase bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                NO ACTIVE WARNING
              </span>
            </div>

            {/* Reassuring local status text */}
            <div className="text-sm font-semibold text-white mt-0.5">
              No severe weather warning is currently reported for {locName}.
            </div>
            <p className="text-xs text-[#94A3B8]">
              Atmospheric conditions and synoptic parameters are within seasonal routine limits across this division.
            </p>
          </div>

          {/* Action Button */}
          <div className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              id="btn-view-warnings-bulletin"
              onClick={onNavigateToWarnings}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#142A22] hover:bg-[#1B382E] border border-[#10B981]/40 hover:border-[#10B981] text-[#A7F3D0] hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer"
            >
              <span>View All-India Bulletins</span>
              <ChevronRight className="w-4 h-4 text-[#A7F3D0] shrink-0" />
            </button>
          </div>
        </div>

        {/* Clean Government Footer */}
        <div className="mt-3 pt-2.5 border-t border-[#1E3A2F]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span>Source: IMD Warning Service</span>
            <span>·</span>
            <span>Updated: {updatedTime}</span>
            <span>·</span>
            <span className="text-[#34D399] font-medium">Status: Routine</span>
          </div>
          <span className="text-[10px] text-[#64748B]">All 36 Met Subdivisions Monitored</span>
        </div>
      </section>
    );
  }

  // State 3: Active Warning (Red, Orange, or Yellow)
  const isRed = activeWarning.severity === 'red';
  const isOrange = activeWarning.severity === 'orange';
  const isYellow = activeWarning.severity === 'yellow';

  // Severity color styles
  const railColorClass = isRed
    ? 'border-l-[#EF4444]'
    : isOrange
    ? 'border-l-[#F97316]'
    : 'border-l-[#EAB308]';

  const badgeStyles = isRed
    ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50'
    : isOrange
    ? 'bg-[#F97316]/20 text-[#F97316] border-[#F97316]/50'
    : 'bg-[#EAB308]/20 text-[#EAB308] border-[#EAB308]/50';

  const iconColorClass = isRed
    ? 'text-[#EF4444]'
    : isOrange
    ? 'text-[#F97316]'
    : 'text-[#EAB308]';

  const pulseDotClass = isRed
    ? 'bg-[#EF4444] animate-ping'
    : isOrange
    ? 'bg-[#F97316] animate-pulse'
    : 'bg-[#EAB308]';

  return (
    <>
      <section
        id="severe-weather-alert-center"
        aria-label="Severe Weather Alert Center"
        className={`w-full rounded-xl border border-[#1E2E40] border-l-4 ${railColorClass} bg-[#0D1520] p-4 sm:p-4.5 lg:p-5 shadow-sm transition-colors`}
      >
        <div className="flex flex-col gap-3">
          {/* Header Row: Icon + Title + Scope + Severity Badge */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <AlertTriangle className={`w-4.5 h-4.5 shrink-0 ${iconColorClass}`} />
              <h2 className="text-xs font-bold tracking-wider uppercase text-[#E2E8F0]">
                SEVERE WEATHER ALERT
              </h2>
              <span className="hidden sm:inline-block text-[#475569]">|</span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] tracking-wide uppercase">
                {activeWarning.scopeLabel}
              </span>
            </div>

            {/* Severity Badge (Right) */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-bold font-mono tracking-wider uppercase border shrink-0 ${badgeStyles}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${pulseDotClass}`} />
                {activeWarning.severityBadgeLabel}
              </span>
            </div>
          </div>

          {/* Main Hazard Headline (Prominent, High Legibility, Uppercase) */}
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-white tracking-tight leading-snug">
              {activeWarning.hazardHeadline}
            </h3>

            {/* Affected Areas immediately below the headline */}
            <div className="text-xs sm:text-sm font-semibold text-[#CBD5E1] mt-1 tracking-normal">
              {activeWarning.affectedAreasHeadline}
            </div>
          </div>

          {/* Concise Official Warning Description */}
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed line-clamp-2">
            {activeWarning.description}
          </p>

          {/* 3-Column Warning Metadata Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 py-2.5 border-y border-[#1E2E40]/70 my-0.5">
            {/* Col 1: Valid Until */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#64748B]">
                VALID UNTIL
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#E2E8F0] truncate">
                {activeWarning.validUntil || 'Next 24 Hours'}
              </span>
            </div>

            {/* Col 2: Affected Areas */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#64748B]">
                AFFECTED AREAS
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#E2E8F0] truncate">
                {activeWarning.affectedCountSummary}
              </span>
            </div>

            {/* Col 3: Issued Timestamp */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#64748B]">
                ISSUED
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#E2E8F0] truncate">
                {activeWarning.issuedAt || 'Current Synoptic Cycle'}
              </span>
            </div>
          </div>

          {/* Action Row & Source / Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
            {/* Left: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                id="btn-view-full-warning"
                onClick={onNavigateToWarnings}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-semibold text-white tracking-wide transition-colors cursor-pointer"
              >
                <span>View Full Warning</span>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
              </button>

              {/* Safety Guidance button for severe / high-impact alerts */}
              {hasSevereAlert && (
                <button
                  type="button"
                  id="btn-open-safety-guidance"
                  onClick={() => setIsSafetyModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#271317] hover:bg-[#381B21] border border-[#EF4444]/40 hover:border-[#EF4444] text-[#FFA39E] hover:text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 shrink-0 text-[#EF4444]" />
                  <span>Safety Guidance</span>
                </button>
              )}

              {/* Multiple active warnings indicator */}
              {totalActiveCount > 1 && (
                <button
                  type="button"
                  onClick={onNavigateToWarnings}
                  className="text-[11px] font-semibold text-[#38BDF8] hover:text-[#7DD3FC] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  +{totalActiveCount - 1} more active warning{totalActiveCount > 2 ? 's' : ''}
                </button>
              )}
            </div>

            {/* Right: Source & Status (Clean, Government-style) */}
            <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
              <span>Source: IMD Warning Service</span>
              <span>·</span>
              <span>Updated: {updatedTime}</span>
              <span>·</span>
              <span className="text-[#38BDF8] font-medium">Status: Recent</span>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Guidance Modal / Sheet */}
      {isSafetyModalOpen && (
        <div
          id="safety-guidance-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsSafetyModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-[#0F1722] border border-[#334155] shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col gap-4 text-[#E2E8F0]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#1E2E40] pb-3">
              <div className="flex items-center gap-2 text-[#EF4444]">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Emergency Public Safety Guidance
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    {activeWarning.hazardHeadline}
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-safety-modal"
                onClick={() => setIsSafetyModalOpen(false)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
                aria-label="Close Safety Guidance"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recommended Safety Actions List */}
            <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1]">
                Recommended Preventive Measures (IMD &amp; NDMA)
              </span>

              {activeWarning.recommendedActions.length > 0 ? (
                activeWarning.recommendedActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#141F2E] border border-[#1E2E40] text-xs text-[#CBD5E1]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-[#141F2E] text-xs text-[#94A3B8]">
                  Stay indoors during severe squall periods, avoid waterlogged low-lying areas, and monitor official meteorological updates.
                </div>
              )}

              {/* Emergency Helplines Box */}
              <div className="mt-2 p-3 rounded-lg bg-[#1A1115] border border-[#EF4444]/30 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFA39E] flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                  Immediate Emergency Contacts
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-[#0F1722] border border-[#334155]">
                    <div className="text-[10px] text-[#94A3B8] uppercase">National Emergency</div>
                    <div className="text-sm font-bold text-white">112 (Toll-Free)</div>
                  </div>
                  <div className="p-2 rounded bg-[#0F1722] border border-[#334155]">
                    <div className="text-[10px] text-[#94A3B8] uppercase">
                      {activeWarning.emergencyTitle || 'State Disaster Helpline'}
                    </div>
                    <div className="text-sm font-bold text-[#FFA39E]">
                      {activeWarning.emergencyNumber || '1070'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1E2E40]">
              <button
                type="button"
                onClick={() => setIsSafetyModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-semibold text-[#CBD5E1] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSafetyModalOpen(false);
                  onNavigateToWarnings?.();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-xs font-semibold text-white transition-colors"
              >
                <span>Open Full Bulletin &amp; Radar</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeSevereWeatherStrip;
