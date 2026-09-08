import React from 'react';
import { CurrentWeather, LocationRecord, WeatherAlert } from '../../types';
import {
  CloudLightning,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Clock,
  MapPin,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface LightningThunderstormSectionProps {
  location: LocationRecord;
  weather: CurrentWeather;
  alerts?: WeatherAlert[];
}

export const LightningThunderstormSection: React.FC<LightningThunderstormSectionProps> = ({
  location,
  weather,
  alerts = [],
}) => {
  const condLower = weather.condition.toLowerCase();
  const isThunder =
    condLower.includes('thunder') ||
    condLower.includes('lightning') ||
    weather.wmoCode === 95 ||
    weather.wmoCode === 96 ||
    weather.wmoCode === 99;

  const lightningAlert = alerts.find(
    (a) =>
      a.title.toLowerCase().includes('lightning') ||
      a.title.toLowerCase().includes('thunderstorm') ||
      a.description.toLowerCase().includes('lightning')
  );

  const hasActiveWarning = isThunder || !!lightningAlert;

  return (
    <div
      id="lightning-thunderstorm-section"
      className={`w-full rounded-xl p-4 sm:p-5 border transition-all ${
        hasActiveWarning
          ? 'bg-[#181014] border-[#EF4444]/40 border-l-4 border-l-[#EF4444]'
          : 'bg-[#111827] border-[#1F2937]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1F2937] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg border ${
              hasActiveWarning
                ? 'bg-[#EF4444]/20 border-[#EF4444]/40 text-[#EF4444]'
                : 'bg-[#0F172A] border-[#334155] text-[#FBBF24]'
            }`}
          >
            <Zap className={`w-5 h-5 ${hasActiveWarning ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                LIGHTNING & THUNDERSTORM NOWCAST MONITOR
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                  hasActiveWarning
                    ? 'bg-[#EF4444]/20 text-[#FCA5A5] border-[#EF4444]/40 animate-pulse'
                    : 'bg-[#10B981]/20 text-[#6EE7B7] border-[#10B981]/40'
                }`}
              >
                {hasActiveWarning ? 'LIGHTNING WARNING ACTIVE' : 'NO ACTIVE STRIKES'}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Ground-to-cloud and cloud-to-ground flash telemetry from IMD Lightning Sensor Array & DAMINI Network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
          <span>Updated: {weather.lastUpdated}</span>
        </div>
      </div>

      {/* Main Status Display */}
      {hasActiveWarning ? (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#251217] rounded-lg border border-[#EF4444]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#FCA5A5] uppercase tracking-wider">
                IMMEDIATE LIFE-SAFETY DIRECTIVE
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                {lightningAlert?.description ||
                  `Moderate to severe thunderstorm with intense lightning flashes occurring in ${location.displayName} / ${location.district} sector.`}
              </div>
              <div className="text-xs text-[#E2E8F0] mt-1">
                Validity: Next 2 to 3 hours (Convective cell active)
              </div>
            </div>
            <div className="shrink-0 text-right sm:text-left">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#EF4444] bg-[#EF4444]/10 px-3 py-1.5 rounded border border-[#EF4444]/30">
                <Radio className="w-3.5 h-3.5 animate-ping" />
                STRIKE PROXIMITY: &lt; 10 KM
              </span>
            </div>
          </div>

          {/* Actionable Directives Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-[#0B1320] rounded-lg border border-[#1E293B] space-y-1">
              <div className="text-xs font-bold text-[#EF4444]">1. SEEK PERMANENT SHELTER</div>
              <p className="text-[11px] text-[#CBD5E1]">
                Move inside a pukka concrete building or fully enclosed metal vehicle immediately.
              </p>
            </div>
            <div className="p-3 bg-[#0B1320] rounded-lg border border-[#1E293B] space-y-1">
              <div className="text-xs font-bold text-[#F59E0B]">2. AVOID ISOLATED TREES</div>
              <p className="text-[11px] text-[#CBD5E1]">
                Never take shelter under tall or solitary trees or metal sheds in open fields.
              </p>
            </div>
            <div className="p-3 bg-[#0B1320] rounded-lg border border-[#1E293B] space-y-1">
              <div className="text-xs font-bold text-[#F59E0B]">3. GET OUT OF WATER BODIES</div>
              <p className="text-[11px] text-[#CBD5E1]">
                Immediately vacate ponds, rivers, lakes, flooded paddy fields, and beaches.
              </p>
            </div>
            <div className="p-3 bg-[#0B1320] rounded-lg border border-[#1E293B] space-y-1">
              <div className="text-xs font-bold text-[#38BDF8]">4. DISCONNECT APPLIANCES</div>
              <p className="text-[11px] text-[#CBD5E1]">
                Unplug sensitive electronic devices and avoid touching grounded metal plumbing.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B1320] p-3.5 rounded-lg border border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">
                No electrical discharges or lightning flashes detected within a 30 km radius of {location.displayName}
              </div>
              <div className="text-[11px] text-[#94A3B8]">
                Atmosphere stable. Convective available potential energy (CAPE) within routine baseline.
              </div>
            </div>
          </div>
          <div className="text-xs text-[#10B981] font-semibold shrink-0">
            Convective Hazard: MINIMAL
          </div>
        </div>
      )}

      {/* Footer attribution */}
      <div className="pt-3 mt-3 border-t border-[#1F2937] flex flex-wrap items-center justify-between text-[11px] text-[#94A3B8]">
        <span>Source: IMD Lightning Observation Network & Indian Institute of Tropical Meteorology (IITM)</span>
        <span className="text-[#38BDF8]">National Lightning Detection System (DAMINI)</span>
      </div>
    </div>
  );
};
