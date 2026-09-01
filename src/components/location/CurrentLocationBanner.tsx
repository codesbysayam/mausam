import React, { useState } from 'react';
import {
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  Crosshair,
  Radio,
  Clock,
  Loader2,
} from 'lucide-react';
import { LocationRecord } from '../../types';
import { NearestStationResult } from '../../services/geolocationService';

interface CurrentLocationBannerProps {
  location: LocationRecord;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  source?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  accuracyMeters?: number | null;
  nearestStationInfo?: NearestStationResult | null;
  lastDetectedAt?: Date | null;
  onRefreshLocation?: () => void;
  onDetectLocation?: () => void;
  onOpenLocationCenter?: () => void;
  onChangeLocationClick?: () => void;
  onOpenPrivacyModal?: () => void;
  isLocating?: boolean;
}

export const CurrentLocationBanner: React.FC<CurrentLocationBannerProps> = ({
  location,
  locationSource,
  source,
  accuracyMeters,
  nearestStationInfo,
  lastDetectedAt,
  onRefreshLocation,
  onDetectLocation,
  onOpenLocationCenter,
  onChangeLocationClick,
  onOpenPrivacyModal,
  isLocating = false,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const activeSource = source || locationSource || 'MANUAL_SEARCH';
  const handleRefresh = onRefreshLocation || onDetectLocation || (() => {});
  const handleChange = onOpenLocationCenter || onChangeLocationClick || (() => {});

  if (dismissed || activeSource !== 'DEVICE_GPS') return null;

  return (
    <div
      id="current-location-banner"
      className="bg-gradient-to-r from-[#0C78BA]/20 via-[#0B1E33] to-[#0C78BA]/20 border border-[#1499E8]/40 rounded-xl p-3 sm:px-4 sm:py-2.5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs animate-fadeIn"
    >
      {/* Left: Indicator & Location Summary */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#34D399] shrink-0">
          <Crosshair className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#34D399] bg-[#10B981]/15 px-1.5 py-0.5 rounded border border-[#10B981]/30">
              CURRENT LOCATION (GPS)
            </span>
            <span className="font-bold text-white">
              {location.city || location.district}, {location.state}
            </span>
            {accuracyMeters !== null && (
              <span className="text-[11px] font-mono text-[#94A3B8]">
                (±{accuracyMeters}m)
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#CBD5E1] mt-0.5">
            Nearest IMD Observation:{' '}
            <strong className="text-white">
              {nearestStationInfo?.name || location.weatherStation || location.displayName}
            </strong>{' '}
            {nearestStationInfo?.distanceKm ? `(${nearestStationInfo.distanceKm} km away)` : ''}
          </p>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLocating}
          title="Refresh current GPS location and weather telemetry"
          className="px-2.5 py-1 rounded-lg bg-[#1499E8]/20 hover:bg-[#1499E8]/30 text-[#38BDF8] border border-[#1499E8]/40 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>Refresh</span>
        </button>

        <button
          type="button"
          onClick={handleChange}
          className="px-2.5 py-1 rounded-lg bg-[#1E2E42] hover:bg-[#283C55] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Change</span>
        </button>

        {onOpenPrivacyModal && (
          <button
            type="button"
            onClick={onOpenPrivacyModal}
            title="Privacy & Data Transparency"
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2E42] transition-colors"
            aria-label="Location Privacy"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          title="Dismiss banner"
          className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2E42] transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
