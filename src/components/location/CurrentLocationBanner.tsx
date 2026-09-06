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

  if (dismissed) return null;

  const isGps = activeSource === 'DEVICE_GPS';

  return (
    <div
      id="current-location-banner"
      className="bg-[#101E2C] border border-[#1E3852] rounded-xl p-3.5 sm:px-5 sm:py-3 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
    >
      {/* Left: Indicator & Location Summary */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#0B3D91] border border-[#1565C0] flex items-center justify-center text-[#18A7E8] shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00C897] bg-[#00C897]/15 px-2 py-0.5 rounded border border-[#00C897]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C897] animate-pulse" />
              {isGps ? 'ACTIVE GPS OBSERVATION' : 'OFFICIAL OBSERVATION POINT'}
            </span>
            <span className="font-bold text-[#F5F9FC] text-sm">
              {location.city || location.district || location.name}, {location.state}
            </span>
            {isGps && accuracyMeters !== null && accuracyMeters !== undefined && (
              <span className="text-[11px] font-mono text-[#B8C7D9]">
                (±{accuracyMeters}m)
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#B8C7D9] mt-0.5 flex items-center gap-2 flex-wrap">
            <span>
              Nearest Observation:{' '}
              <strong className="text-[#F5F9FC]">
                {nearestStationInfo?.name || location.weatherStation || `${location.city || location.name} Observatory`}
              </strong>{' '}
              {nearestStationInfo?.distanceKm ? `(${nearestStationInfo.distanceKm} km away)` : ''}
            </span>
            <span className="text-[#1E3852]">•</span>
            <span className="font-mono text-[10px] text-[#8EA3B8]">
              {typeof location.lat === 'number' ? location.lat.toFixed(2) : '20.29'}°N, {typeof location.lng === 'number' ? location.lng.toFixed(2) : '85.82'}°E
            </span>
          </p>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <button
          type="button"
          id="banner-refresh-location-btn"
          onClick={handleRefresh}
          disabled={isLocating}
          title="Refresh current location and weather telemetry"
          className="px-3 py-1.5 rounded-lg bg-[#172738] hover:bg-[#1C334A] text-[#18A7E8] border border-[#1E3852] hover:border-[#18A7E8]/50 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
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
          id="banner-change-location-btn"
          onClick={handleChange}
          className="px-3 py-1.5 rounded-lg bg-[#0B3D91] hover:bg-[#1565C0] text-[#F5F9FC] border border-[#1565C0] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Change Location</span>
        </button>

        {onOpenPrivacyModal && (
          <button
            type="button"
            onClick={onOpenPrivacyModal}
            title="Privacy & Data Transparency"
            className="p-1.5 rounded-lg text-[#B8C7D9] hover:text-[#F5F9FC] hover:bg-[#172738] transition-colors cursor-pointer"
            aria-label="Location Privacy"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
