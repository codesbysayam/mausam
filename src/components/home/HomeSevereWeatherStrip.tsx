import React from 'react';
import { ShieldAlert, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { WeatherAlert } from '../../types';
import { INDIA_WEATHER_DATA } from '../../data/indiaWeatherData';

interface HomeSevereWeatherStripProps {
  alerts?: WeatherAlert[];
  onNavigateToWarnings?: () => void;
}

export const HomeSevereWeatherStrip: React.FC<HomeSevereWeatherStripProps> = ({
  alerts = [],
  onNavigateToWarnings,
}) => {
  // Check if warning data sources are available
  const isDataAvailable = (alerts && alerts.length > 0) || (INDIA_WEATHER_DATA && INDIA_WEATHER_DATA.length > 0);

  if (!isDataAvailable) {
    return (
      <div
        id="severe-weather-monitor-panel"
        className="w-full rounded-xl border border-[#334155] border-l-4 border-l-[#94A3B8] bg-[#141C24] p-4 sm:p-5 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#E2E8F0]">
              SEVERE WEATHER MONITOR
            </span>
            <span className="text-xs text-[#94A3B8]">
              Warning data unavailable
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigateToWarnings}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-semibold text-[#E2E8F0] transition-colors"
          >
            <span>View Warnings Bulletin</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Aggregate real severe alerts from both alerts props and INDIA_WEATHER_DATA
  const directSevereAlerts = alerts.filter(
    (a) => a.severity === 'red' || a.severity === 'orange' || a.severity === 'severe' || a.severity === 'Extreme'
  );
  const stateSevereAlerts = INDIA_WEATHER_DATA.filter(
    (s) => s.warningLevel === 'severe' || s.warningLevel === 'alert'
  );

  const hasSevereWeather = directSevereAlerts.length > 0 || stateSevereAlerts.length > 0;

  // Determine highest severity
  const isRedSeverity =
    directSevereAlerts.some((a) => a.severity === 'red' || a.severity === 'severe' || a.severity === 'Extreme') ||
    stateSevereAlerts.some((s) => s.warningLevel === 'severe');

  // Dynamic affected locations text from real verified data
  let affectedLocations = '';
  let alertSummary = '';

  if (directSevereAlerts.length > 0 && directSevereAlerts[0].title) {
    const primaryAlert = directSevereAlerts[0];
    affectedLocations = primaryAlert.affectedArea || primaryAlert.affectedDistricts?.join(', ') || 'Coastal & Southern India';
    alertSummary = primaryAlert.description || primaryAlert.title;
  } else if (stateSevereAlerts.length > 0) {
    const topStates = stateSevereAlerts.slice(0, 3).map((s) => s.name);
    const remainingCount = stateSevereAlerts.length - 3;
    affectedLocations = topStates.join(', ') + (remainingCount > 0 ? ` (+${remainingCount} more)` : '');
    alertSummary = stateSevereAlerts[0].warningMessage || 'Orange alert for moderate to heavy coastal rainfall and squally winds.';
  }

  const totalAffectedCount = directSevereAlerts.length > 0 ? directSevereAlerts.length : stateSevereAlerts.length;

  if (!hasSevereWeather) {
    return (
      <div
        id="severe-weather-monitor-panel"
        className="w-full rounded-xl border border-[#1E3A2F] border-l-4 border-l-[#2ECC71] bg-[#0D1C17] p-4 sm:p-4.5 lg:p-5 shadow-sm transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-[#2ECC71]">
                <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                <span className="text-xs font-bold tracking-wider uppercase text-[#E2E8F0]">
                  SEVERE WEATHER MONITOR
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase bg-[#2ECC71]/15 text-[#6EE7B7] border border-[#2ECC71]/35 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]" />
                NO ACTIVE SEVERE WEATHER ALERTS
              </span>
            </div>
            <div className="text-sm font-semibold text-white mt-0.5">
              All 36 National Meteorological Subdivisions currently reporting within routine limits.
            </div>
            <p className="text-xs text-[#94A3B8]">
              No active Red or Orange severe atmospheric warnings issued by IMD at this time.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onNavigateToWarnings}
              id="btn-view-warnings-bulletin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#142A22] hover:bg-[#1B382E] border border-[#2ECC71]/40 hover:border-[#2ECC71] text-[#A7F3D0] hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer"
            >
              <span>View Warnings Bulletin</span>
              <ChevronRight className="w-4 h-4 text-[#A7F3D0] shrink-0" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active severe weather panel
  const accentBorderClass = isRedSeverity ? 'border-l-[#EF4444]' : 'border-l-[#F97316]';
  const badgeColorClass = isRedSeverity
    ? 'bg-[#EF4444]/20 text-[#FFA39E] border-[#EF4444]/40'
    : 'bg-[#F97316]/20 text-[#FFD591] border-[#F97316]/40';
  const pulseColorClass = isRedSeverity ? 'bg-[#EF4444]' : 'bg-[#F97316]';

  return (
    <div
      id="severe-weather-monitor-panel"
      className={`w-full rounded-xl border border-[#3D1A21] border-l-4 ${accentBorderClass} bg-[#1A0E12] p-4 sm:p-4.5 lg:p-5 shadow-sm transition-colors`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Main Alert Information */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Header Row: Icon + Title + Distinct Compact Badge */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1.5 text-[#EF4444]">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase text-[#E2E8F0]">
                SEVERE WEATHER MONITOR
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase border shrink-0 ${badgeColorClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${pulseColorClass}`} />
              SEVERE WEATHER ALERT
            </span>
          </div>

          {/* Alert Content: Affected Locations (primary) + Description (secondary) */}
          <div className="space-y-0.5">
            <div className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
              <span className="text-[#FFA07A] font-extrabold">{affectedLocations}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">
              {alertSummary}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#94A3B8]">
            <span className="font-medium text-[#A0AEC0]">Source: IMD Synoptic Division</span>
            <span>•</span>
            <span>{totalAffectedCount} Subdivisions under Alert</span>
          </div>
        </div>

        {/* Action Area: Desktop right, Tablet/Mobile bottom */}
        <div className="shrink-0 w-full sm:w-auto lg:self-center">
          <button
            type="button"
            onClick={onNavigateToWarnings}
            id="btn-view-warnings-bulletin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#271317] hover:bg-[#381B21] border border-[#E74C3C]/40 hover:border-[#E74C3C] text-[#FF9E9E] hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/50"
          >
            <span>View Warnings Bulletin</span>
            <ChevronRight className="w-4 h-4 text-[#FF9E9E] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

