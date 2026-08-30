import React from 'react';
import { WeatherAlert } from '../../types';
import { ShieldAlert, AlertTriangle, ShieldCheck, ArrowRight, BellRing } from 'lucide-react';

interface HomeSevereAlertBannerProps {
  alerts: WeatherAlert[];
  onNavigateToWarnings?: () => void;
}

export const HomeSevereAlertBanner: React.FC<HomeSevereAlertBannerProps> = ({
  alerts = [],
  onNavigateToWarnings,
}) => {
  const activeAlert = alerts[0];
  const hasSevere = alerts.some((a) => a.severity === 'red');
  const hasOrange = alerts.some((a) => a.severity === 'orange');
  const hasYellow = alerts.some((a) => a.severity === 'yellow');

  const statusConfig = hasSevere
    ? {
        level: 'RED',
        label: 'RED (ACTION REQUIRED)',
        bg: 'bg-[#EF5350]/15 border-[#EF5350]/50 text-[#EF5350]',
        badgeBg: 'bg-[#EF5350] text-white',
        title: activeAlert?.title || 'Severe Convective / Intense Rainfall Warning Active',
        desc: activeAlert?.description || 'Significant atmospheric disturbance detected. Severe localized gusts and precipitation expected.',
        action: activeAlert?.actionItem || 'Stay indoors, disconnect electrical equipment, and avoid vulnerable trees or metal structures.',
        icon: ShieldAlert,
      }
    : hasOrange
    ? {
        level: 'ORANGE',
        label: 'ORANGE (BE PREPARED)',
        bg: 'bg-[#FF9F43]/15 border-[#FF9F43]/50 text-[#FF9F43]',
        badgeBg: 'bg-[#FF9F43] text-black',
        title: activeAlert?.title || 'Heavy Precipitation & Thunderstorm Warning',
        desc: activeAlert?.description || 'Moderate to heavy spells with localized waterlogging possible across low-lying roads.',
        action: activeAlert?.actionItem || 'Plan transit with caution; check for road disruptions before outdoor travel.',
        icon: AlertTriangle,
      }
    : hasYellow
    ? {
        level: 'YELLOW',
        label: 'YELLOW (BE AWARE)',
        bg: 'bg-[#FFC857]/15 border-[#FFC857]/50 text-[#FFC857]',
        badgeBg: 'bg-[#FFC857] text-black',
        title: activeAlert?.title || 'Thunderstorm & Gusty Winds Advisory',
        desc: activeAlert?.description || 'Scattered convective cloud formation with brief showers likely during evening hours.',
        action: activeAlert?.actionItem || 'Normal activities may continue with awareness of brief localized showers.',
        icon: BellRing,
      }
    : {
        level: 'GREEN',
        label: 'GREEN (ROUTINE)',
        bg: 'bg-[#22C7A0]/10 border-[#22C7A0]/30 text-[#22C7A0]',
        badgeBg: 'bg-[#22C7A0] text-black',
        title: 'All-India Atmospheric Conditions Normal',
        desc: 'No severe cyclonic, intense squall, or extreme meteorological alerts active in the immediate regional district.',
        action: 'Atmospheric stability is favorable for routine outdoor activities and agricultural field operations.',
        icon: ShieldCheck,
      };

  const Icon = statusConfig.icon;

  return (
    <section
      id="homepage-severe-alert-banner"
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${statusConfig.bg}`}
    >
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#071018] border border-current flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6" />
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#93A4B8]">
              Synoptic Alert Level
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig.badgeBg}`}>
              {statusConfig.label}
            </span>
            {alerts.length > 1 && (
              <span className="text-[10px] text-[#93A4B8] font-mono">
                +{alerts.length - 1} more active bulletin{alerts.length > 2 ? 's' : ''}
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-[#F4F7FA]">
            {statusConfig.title}
          </h3>

          <p className="text-xs text-[#D1DCE8] mt-0.5">
            {statusConfig.desc}
          </p>

          <p className="text-xs text-[#93A4B8] mt-1 font-medium">
            Guidance: {statusConfig.action}
          </p>
        </div>
      </div>

      {onNavigateToWarnings && (
        <button
          type="button"
          onClick={onNavigateToWarnings}
          className="mausam-btn mausam-btn--secondary text-xs font-semibold py-2 px-4 whitespace-nowrap self-start md:self-auto shrink-0 flex items-center gap-1.5"
        >
          <span>All Bulletins &amp; Advisories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </section>
  );
};
