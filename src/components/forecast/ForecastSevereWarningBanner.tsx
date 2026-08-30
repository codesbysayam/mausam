import React from 'react';
import { WeatherAlert } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, ArrowRight } from 'lucide-react';

interface ForecastSevereWarningBannerProps {
  alerts?: WeatherAlert[];
  cityName: string;
  onNavigateToAlerts?: () => void;
}

export const ForecastSevereWarningBanner: React.FC<ForecastSevereWarningBannerProps> = ({
  alerts = [],
  cityName,
  onNavigateToAlerts,
}) => {
  const activeAlerts = alerts.filter(
    (a) =>
      a.severity === 'severe' ||
      a.severity === 'Severe' ||
      a.severity === 'Extreme' ||
      a.severity === 'extreme' ||
      a.severity === 'warning' ||
      a.severity === 'Moderate' ||
      a.severity === 'red' ||
      a.severity === 'orange' ||
      a.severity === 'yellow' ||
      a.severity === 'advisory'
  );
  const hasSevere = activeAlerts.length > 0;
  const topAlert = activeAlerts[0];

  if (!hasSevere) {
    return (
      <div
        id="forecast-alert-safe-strip"
        className="rounded-xl bg-[#07111B]/80 border border-[#162331] px-4 py-2.5 flex items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-[#22C7A0]/15 text-[#22C7A0] flex items-center justify-center shrink-0 border border-[#22C7A0]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#F4F7FA]">No Active Severe Weather Warnings</span>
            <span className="text-[#93A4B8] hidden sm:inline">•</span>
            <span className="text-[#93A4B8]">
              Boundary layer stability is normal across {cityName} and adjoining sectors.
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-[#22C7A0] bg-[#22C7A0]/10 px-2 py-0.5 rounded border border-[#22C7A0]/30 shrink-0">
          Green Advisory
        </span>
      </div>
    );
  }

  const sev = (topAlert.severity || '').toLowerCase();
  const isRed = sev.includes('severe') || sev.includes('extreme') || topAlert.color === 'red';
  const isOrange = sev.includes('moderate') || sev.includes('warning') || topAlert.color === 'orange';

  const badgeBg = isRed
    ? 'bg-[#EF5350]/15 border-[#EF5350]/40 text-[#EF5350]'
    : isOrange
    ? 'bg-[#FF9F43]/15 border-[#FF9F43]/40 text-[#FF9F43]'
    : 'bg-[#FFC857]/15 border-[#FFC857]/40 text-[#FFC857]';

  const Icon = isRed ? AlertOctagon : AlertTriangle;

  return (
    <div
      id="forecast-severe-alert-banner"
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xl ${
        isRed
          ? 'bg-[#180A0A]/90 border-[#EF5350]/40'
          : isOrange
          ? 'bg-[#181108]/90 border-[#FF9F43]/40'
          : 'bg-[#181608]/90 border-[#FFC857]/40'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3.5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badgeBg}`}
        >
          <Icon className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeBg}`}>
              {topAlert.severity.toUpperCase()} ALERT
            </span>
            <span className="text-xs text-[#93A4B8]">
              Valid: {topAlert.validUntil || 'Next 6-12 Hours'}
            </span>
            <span className="text-xs text-[#93A4B8]">• Area: {cityName}</span>
          </div>

          <h3 className="text-base font-bold text-[#F4F7FA] mt-0.5">
            {topAlert.title || 'Severe Weather Bulletin Active'}
          </h3>

          <p className="text-xs text-[#D1DCE8] leading-relaxed max-w-3xl">
            {topAlert.description ||
              'Convective storm cells with gusty winds and heavy precipitation expected.'}
          </p>
        </div>
      </div>

      {onNavigateToAlerts && (
        <button
          type="button"
          onClick={onNavigateToAlerts}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start md:self-auto cursor-pointer border ${
            isRed
              ? 'bg-[#EF5350] text-white hover:bg-[#D32F2F] border-[#EF5350]'
              : 'bg-[#FF9F43] text-black hover:bg-[#F57C00] border-[#FF9F43]'
          }`}
        >
          <span>VIEW WARNING DETAILS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
