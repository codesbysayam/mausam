import React from 'react';
import {
  MapPin,
  Compass,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Sun,
  CloudRain,
  ShieldCheck,
  RefreshCw,
  Clock,
  Radio,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import { LocationRecord, CurrentWeather } from '../../types';
import { LocatingPhase } from '../../services/geolocationService';
import { UseMyLocationButton } from '../location/UseMyLocationButton';

export interface WeatherSnapshotProps {
  weatherBundle?: WeatherDataBundle | null;
  location: LocationRecord;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  isLocating?: boolean;
  locatePhase?: LocatingPhase;
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  onOpenLocationCenter?: () => void;
  onOpenPrivacyModal?: () => void;
  className?: string;
  variant?: 'card' | 'compact' | 'banner' | 'dashboard';
}

export const WeatherSnapshot: React.FC<WeatherSnapshotProps> = ({
  weatherBundle,
  location,
  locationSource = 'MANUAL_SEARCH',
  isLocating = false,
  locatePhase = 'idle',
  onDetectLocation,
  onOpenLocationCenter,
  onOpenPrivacyModal,
  className = '',
  variant = 'card',
}) => {
  const current: CurrentWeather | undefined = weatherBundle?.current;

  // Format observation time
  const observationTimeStr = weatherBundle?.lastFetchedAt
    ? new Date(weatherBundle.lastFetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Live Synoptic';

  const isGps = locationSource === 'DEVICE_GPS';

  if (variant === 'compact') {
    return (
      <div
        id="weather-snapshot-compact"
        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#0E1722] border border-[#1E2E42] text-white ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#1499E8]/15 border border-[#1499E8]/30 flex items-center justify-center text-[#43C7F4] shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-white truncate">{location.city}</span>
              {isGps && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                  GPS
                </span>
              )}
            </div>
            <div className="text-[10px] text-[#93A4B8] truncate">{location.state}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {current ? (
            <div className="text-right">
              <div className="text-sm font-bold text-white font-mono">{Math.round(current.temp)}°C</div>
              <div className="text-[10px] text-[#38BDF8]">{current.condition}</div>
            </div>
          ) : (
            <span className="text-[10px] text-[#93A4B8]">Observing…</span>
          )}

          {onDetectLocation && (
            <UseMyLocationButton
              onDetect={onDetectLocation}
              isLocating={isLocating}
              phase={locatePhase}
              locationSource={locationSource}
              compact
              variant="toolbar"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id="weather-snapshot-card"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B131E] via-[#0E1724] to-[#121E2E] border border-[#1E2E42] shadow-xl p-4 md:p-5 text-white ${className}`}
    >
      {/* Decorative Synoptic Radial Glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#1499E8]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#38BDF8]">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#38BDF8]" />
              Active Telemetry Snapshot
            </span>
            {isGps ? (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                GPS ACTIVE
              </span>
            ) : (
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#1E2E42] text-[#93A4B8]">
                STATION SEARCH
              </span>
            )}
          </div>

          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#43C7F4] shrink-0" />
            <span className="truncate">{location.city}</span>
            <span className="text-sm font-normal text-[#93A4B8]">({location.state})</span>
          </h3>

          <div className="flex items-center gap-3 text-[11px] text-[#93A4B8] mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#43C7F4]" />
              {observationTimeStr}
            </span>
            <span>•</span>
            <span className="text-[#38BDF8]">IMD AWS Telemetry</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onDetectLocation && (
            <UseMyLocationButton
              onDetect={onDetectLocation}
              isLocating={isLocating}
              phase={locatePhase}
              locationSource={locationSource}
              compact
              variant="secondary"
            />
          )}

          {onOpenLocationCenter && (
            <button
              type="button"
              onClick={onOpenLocationCenter}
              className="p-2 rounded-xl bg-[#111C27] hover:bg-[#162331] text-[#D1DCE8] hover:text-white border border-[#1E2E42] text-xs transition-colors cursor-pointer"
              title="Change Observatory Location"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#38BDF8]" />
            </button>
          )}

          {onOpenPrivacyModal && (
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="p-2 rounded-xl bg-[#111C27] hover:bg-[#162331] text-[#93A4B8] hover:text-white border border-[#1E2E42] text-xs transition-colors cursor-pointer"
              title="Geolocation Privacy Settings"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Meteorological Metrics Grid */}
      {current ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#1E2E42]/60">
          <div className="p-3 rounded-xl bg-[#111C27]/70 border border-[#1E2E42]/50">
            <div className="text-[10px] uppercase font-semibold text-[#93A4B8] flex items-center gap-1">
              <Sun className="w-3 h-3 text-[#FBBF24]" />
              Temperature
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {Math.round(current.temp)}°C
            </div>
            <div className="text-[10px] text-[#93A4B8] mt-0.5">
              Feels {current.feelsLike !== undefined ? `${Math.round(current.feelsLike)}°C` : `${Math.round(current.temp)}°C`}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111C27]/70 border border-[#1E2E42]/50">
            <div className="text-[10px] uppercase font-semibold text-[#93A4B8] flex items-center gap-1">
              <Droplets className="w-3 h-3 text-[#38BDF8]" />
              Humidity
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {current.humidity}%
            </div>
            <div className="text-[10px] text-[#93A4B8] mt-0.5">
              Dew {Math.round(current.dewPoint ?? (current.temp - ((100 - current.humidity) / 5)))}°C
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111C27]/70 border border-[#1E2E42]/50">
            <div className="text-[10px] uppercase font-semibold text-[#93A4B8] flex items-center gap-1">
              <Wind className="w-3 h-3 text-[#34D399]" />
              Wind
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {Math.round(current.windSpeed)} <span className="text-xs font-normal">km/h</span>
            </div>
            <div className="text-[10px] text-[#93A4B8] mt-0.5 truncate">
              {current.windDirection} • {current.pressure} hPa
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111C27]/70 border border-[#1E2E42]/50">
            <div className="text-[10px] uppercase font-semibold text-[#93A4B8] flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-[#818CF8]" />
              Conditions
            </div>
            <div className="text-sm font-bold text-white truncate mt-1.5">
              {current.condition}
            </div>
            <div className="text-[10px] text-[#38BDF8] mt-0.5">
              AQI {current.aqi ?? current.aqiPm25} ({current.aqiStatus})
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-[#93A4B8] border-t border-[#1E2E42]/60">
          Loading active meteorological telemetry…
        </div>
      )}
    </div>
  );
};
