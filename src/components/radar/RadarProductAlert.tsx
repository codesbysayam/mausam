import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, X, Radio, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { RadarProductType } from './DopplerRadarViewer';

export interface RadarProductAlertInfo {
  product: RadarProductType;
  productLabel?: string;
  stationName: string;
  stationCode: string;
  reason?: string;
  isFallbackActive?: boolean;
  fallbackSource?: string;
  timestamp?: string;
}

export interface RadarProductAlertProps {
  alert: RadarProductAlertInfo | null;
  onDismiss: () => void;
  onRetry?: () => void;
  onSwitchProduct?: (product: RadarProductType) => void;
  isRetrying?: boolean;
}

export const RadarProductAlert: React.FC<RadarProductAlertProps> = ({
  alert,
  onDismiss,
  onRetry,
  onSwitchProduct,
  isRetrying = false,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!alert) return null;

  const isFallback = alert.isFallbackActive;

  return (
    <div
      id="radar-product-alert-banner"
      role="alert"
      className={`w-full rounded-xl border p-3.5 transition-all duration-300 shadow-lg ${
        isFallback
          ? 'bg-[#1E2733]/95 border-[#0B72B9]/50 text-slate-100 shadow-[#0B72B9]/10'
          : 'bg-[#1C1814]/95 border-[#F59E0B]/40 text-amber-50 shadow-[#F59E0B]/10'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Icon and Text Details */}
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              isFallback
                ? 'bg-[#0B72B9]/20 text-[#4FA8E0] border border-[#0B72B9]/30'
                : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
            }`}
          >
            {isFallback ? (
              <Info className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white">
                {isFallback
                  ? `Fallback Active for ${alert.productLabel || alert.product}`
                  : `Feed Unavailable: ${alert.productLabel || alert.product}`}
              </span>

              {/* Station Chip */}
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-[#1E2733] border border-[#334155] px-2 py-0.5 rounded text-[#93A4B8]">
                <Radio className="w-3 h-3 text-[#43C7F4]" />
                {alert.stationCode} • {alert.stationName}
              </span>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isFallback
                    ? 'bg-[#0B72B9]/25 text-[#4FA8E0] border-[#0B72B9]/40'
                    : 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                }`}
              >
                {isFallback ? 'COMPOSITE FALLBACK' : 'STATION FEED OFFLINE'}
              </span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-3xl">
              {alert.reason ||
                `Direct IMD radar feed for ${alert.product} is offline or undergoing sensor calibration at this station.`}
              <span className="text-emerald-400 font-medium ml-1.5 inline-block">
                Map basemap, telemetry, and range rings remain fully active.
              </span>
            </p>
          </div>
        </div>

        {/* Right: Action Buttons & Dismiss */}
        <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
          {/* Retry Button */}
          {onRetry && (
            <button
              id="btn-retry-radar-product"
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1E2733] hover:bg-[#2A374A] text-white border border-[#334155] hover:border-[#4FA8E0] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              title="Attempt re-fetching this radar product"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin text-[#43C7F4]' : 'text-slate-300'}`} />
              <span>{isRetrying ? 'Checking...' : 'Retry Fetch'}</span>
            </button>
          )}

          {/* Quick Switch to MAXZ if current product isn't MAXZ */}
          {alert.product !== 'MAXZ' && onSwitchProduct && (
            <button
              id="btn-switch-to-maxz"
              type="button"
              onClick={() => onSwitchProduct('MAXZ')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0B72B9] hover:bg-[#095c96] text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Switch to MAX(Z) Reflectivity"
            >
              <span>Switch to MAX(Z)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Dismiss Button */}
          <button
            id="btn-dismiss-radar-alert"
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2733] border border-transparent hover:border-[#334155] transition-colors cursor-pointer"
            aria-label="Dismiss radar notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
