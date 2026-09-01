import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { LocatingPhase } from '../../hooks/useUserLocation';
import { GeolocationServiceError } from '../../services/geolocationService';

interface UseMyLocationButtonProps {
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  onDetect?: (forceRefresh?: boolean) => Promise<any>;
  isLocating?: boolean;
  locatePhase?: LocatingPhase;
  phase?: LocatingPhase;
  locateError?: GeolocationServiceError | null;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  compact?: boolean;
  variant?: 'primary' | 'secondary' | 'toolbar' | 'ghost' | 'dropdown' | 'compact';
  className?: string;
  onOpenManualSearch?: () => void;
  onOpenPrivacyModal?: () => void;
}

export const UseMyLocationButton: React.FC<UseMyLocationButtonProps> = ({
  onDetectLocation,
  onDetect,
  isLocating = false,
  locatePhase = 'idle',
  phase,
  locateError = null,
  locationSource = 'MANUAL_SEARCH',
  compact = false,
  variant = 'primary',
  className = '',
  onOpenManualSearch,
  onOpenPrivacyModal,
}) => {
  const [showErrorPopover, setShowErrorPopover] = useState(false);
  const activeDetect = onDetectLocation || onDetect || (() => Promise.resolve(null));
  const activePhase = phase || locatePhase;
  const isCompact = compact || variant === 'compact';
  const effectiveVariant = variant === 'compact' ? 'dropdown' : variant;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowErrorPopover(false);
    const isAlreadyGps = locationSource === 'DEVICE_GPS';
    await activeDetect(isAlreadyGps);
  };

  // Determine button text and icon based on phase & source
  const isGpsActive = locationSource === 'DEVICE_GPS';

  let iconNode = <MapPin className="w-4 h-4 text-[#43C7F4]" />;
  let labelText = isCompact ? 'Locate Me' : 'Use My Current Location';

  if (isLocating || activePhase === 'locating') {
    iconNode = <Loader2 className="w-4 h-4 text-[#43C7F4] animate-spin" />;
    labelText = isCompact ? 'Locating…' : 'Locating you…';
  } else if (activePhase === 'geocoding') {
    iconNode = <Compass className="w-4 h-4 text-[#22C7A0] animate-spin" />;
    labelText = isCompact ? 'Resolving…' : 'Resolving station…';
  } else if (activePhase === 'success') {
    iconNode = <CheckCircle2 className="w-4 h-4 text-[#10B981]" />;
    labelText = isCompact ? 'Detected' : 'Location Detected';
  } else if (activePhase === 'error' || locateError) {
    iconNode = <AlertTriangle className="w-4 h-4 text-[#EF4444]" />;
    labelText = isCompact ? 'Failed' : 'Location Unavailable';
  } else if (isGpsActive) {
    iconNode = <RefreshCw className="w-4 h-4 text-[#43C7F4]" />;
    labelText = isCompact ? 'Refresh GPS' : 'Refresh Current Location';
  }

  // Variant Styling
  let baseStyle = '';
  if (effectiveVariant === 'primary') {
    baseStyle =
      'bg-gradient-to-r from-[#0C78BA] to-[#1499E8] hover:from-[#108BD4] hover:to-[#22A9F5] text-white border border-[#38BDF8]/40 shadow-md shadow-[#1499E8]/20 focus:ring-2 focus:ring-[#38BDF8]';
  } else if (effectiveVariant === 'secondary') {
    baseStyle =
      'bg-[#111C27] hover:bg-[#162331] text-[#F4F7FA] border border-[#1499E8]/40 hover:border-[#1499E8] shadow-sm shadow-[#1499E8]/10 focus:ring-2 focus:ring-[#1499E8]';
  } else if (effectiveVariant === 'toolbar') {
    baseStyle =
      'bg-[#0B131E] hover:bg-[#111C27] text-[#CBD5E1] hover:text-white border border-[#1E2E42] hover:border-[#38BDF8]/50 focus:ring-2 focus:ring-[#38BDF8]';
  } else if (effectiveVariant === 'dropdown') {
    baseStyle =
      'w-full bg-[#1499E8]/10 hover:bg-[#1499E8]/20 text-[#43C7F4] border border-[#1499E8]/30 hover:border-[#1499E8]/60 focus:ring-2 focus:ring-[#1499E8] justify-center';
  } else {
    // ghost
    baseStyle =
      'bg-transparent hover:bg-[#1499E8]/15 text-[#43C7F4] hover:text-white border border-transparent hover:border-[#1499E8]/30';
  }

  return (
    <div className="relative inline-flex flex-col">
      <button
        type="button"
        id="btn-use-my-location"
        onClick={handleClick}
        disabled={isLocating}
        aria-label={labelText}
        aria-busy={isLocating}
        title={isGpsActive ? 'Click to refresh your current GPS weather observation' : 'Detect your current location using browser GPS'}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none ${baseStyle} ${className}`}
      >
        {iconNode}
        <span className="truncate">{labelText}</span>
        {isGpsActive && locatePhase === 'idle' && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse ml-0.5" />
        )}
      </button>

      {/* Error / Permission Info Trigger Banner if in error state */}
      {locateError && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 min-w-[280px] p-3 rounded-xl bg-[#1A0F14] border border-[#EF4444]/40 text-xs shadow-2xl space-y-2 animate-fadeIn">
          <div className="flex items-start gap-2 text-[#FCA5A5]">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">{locateError.message}</div>
              {locateError.instruction && (
                <div className="text-[11px] text-[#CBD5E1] mt-0.5 leading-snug">
                  {locateError.instruction}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EF4444]/20">
            <button
              type="button"
              onClick={handleClick}
              className="px-2.5 py-1 rounded bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] font-bold text-[11px] transition-colors"
            >
              Try Again
            </button>
            {onOpenManualSearch && (
              <button
                type="button"
                onClick={() => {
                  setShowErrorPopover(false);
                  onOpenManualSearch();
                }}
                className="px-2.5 py-1 rounded bg-[#162331] hover:bg-[#1E2E42] text-white text-[11px] flex items-center gap-1 transition-colors"
              >
                <Search className="w-3 h-3 text-[#43C7F4]" />
                <span>Search Manually</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
