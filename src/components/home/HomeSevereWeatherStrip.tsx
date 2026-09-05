import React from 'react';
import { ShieldAlert, ShieldCheck, ChevronRight } from 'lucide-react';
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
  // Aggregate real severe alerts from both alerts props and INDIA_WEATHER_DATA state warnings
  const stateSevereAlerts = INDIA_WEATHER_DATA.filter(
    (s) => s.warningLevel === 'severe' || s.warningLevel === 'alert'
  );

  const hasDirectSevere = alerts.some((a) => a.severity === 'red' || a.severity === 'orange');
  const hasSevereWeather = hasDirectSevere || stateSevereAlerts.length > 0;

  // Real affected region and actual warning text from source
  let affectedRegion = '';
  let warningDetails = '';

  if (alerts.length > 0 && alerts[0].title) {
    affectedRegion = alerts[0].affectedArea || 'Coastal & Southern India';
    warningDetails = alerts[0].title;
  } else if (stateSevereAlerts.length > 0) {
    affectedRegion = stateSevereAlerts.map((s) => s.name).slice(0, 3).join(', ') +
      (stateSevereAlerts.length > 3 ? ` (+${stateSevereAlerts.length - 3} more)` : '');
    warningDetails = stateSevereAlerts[0].warningMessage || 'Intense precipitation and squally monsoon surges';
  }

  return (
    <div
      id="severe-weather-monitor-strip"
      onClick={onNavigateToWarnings}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onNavigateToWarnings?.();
      }}
      className={`w-full cursor-pointer transition-all border rounded-lg p-3 sm:py-2.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm select-none ${
        hasSevereWeather
          ? 'bg-[#2A1115] border-[#E74C3C]/50 hover:bg-[#35151B] hover:border-[#E74C3C]'
          : 'bg-[#0E231F] border-[#2ECC71]/40 hover:bg-[#122C27] hover:border-[#2ECC71]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
            hasSevereWeather ? 'bg-[#E74C3C]/20 text-[#E74C3C]' : 'bg-[#2ECC71]/20 text-[#2ECC71]'
          }`}
        >
          {hasSevereWeather ? (
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider text-[#8A94A6] uppercase">
              SEVERE WEATHER MONITOR
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                hasSevereWeather
                  ? 'bg-[#E74C3C] text-white'
                  : 'bg-[#2ECC71] text-black'
              }`}
            >
              {hasSevereWeather ? '🔴 SEVERE WEATHER ALERT' : '🟢 NO ACTIVE SEVERE WEATHER ALERT'}
            </span>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-white mt-0.5">
            {hasSevereWeather ? (
              <span>
                <strong className="text-[#FF8C42]">{affectedRegion}</strong> — {warningDetails}
              </span>
            ) : (
              <span className="text-[#D7DEE8]">
                All national synoptic meteorological subdivisions currently reporting within routine limits.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-[#8A94A6] hover:text-white shrink-0 self-end sm:self-auto font-medium">
        <span>View Warnings Bulletin</span>
        <ChevronRight className="w-4 h-4 text-[#4FA8E0]" />
      </div>
    </div>
  );
};
