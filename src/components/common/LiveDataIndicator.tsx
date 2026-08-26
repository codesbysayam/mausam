import React from 'react';
import { RefreshCw, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export type LiveDataStatus = 'live' | 'updating' | 'stale' | 'unavailable' | 'error';

interface LiveDataIndicatorProps {
  status: LiveDataStatus;
  fetchedAt?: string | Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
  showSource?: boolean;
}

export const LiveDataIndicator: React.FC<LiveDataIndicatorProps> = ({
  status,
  fetchedAt,
  onRefresh,
  isRefreshing = false,
  className = '',
  showSource = true,
}) => {
  const formatTime = (timeStr?: string | Date) => {
    if (!timeStr) return '';
    try {
      const d = typeof timeStr === 'string' ? new Date(timeStr) : timeStr;
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return '';
    }
  };

  const formattedTime = formatTime(fetchedAt);

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 text-xs font-mono rounded-lg px-2.5 py-1.5 border transition-all ${
      status === 'live'
        ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200'
        : status === 'updating'
        ? 'bg-blue-50/90 text-blue-800 border-blue-200'
        : status === 'stale'
        ? 'bg-amber-50/90 text-amber-900 border-amber-200'
        : 'bg-rose-50/90 text-rose-800 border-rose-200'
    } ${className}`}>
      {/* Indicator Dot */}
      <span className="relative flex h-2 w-2">
        {status === 'live' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        {status === 'updating' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          status === 'live'
            ? 'bg-emerald-600'
            : status === 'updating'
            ? 'bg-blue-600'
            : status === 'stale'
            ? 'bg-amber-600'
            : 'bg-rose-600'
        }`}></span>
      </span>

      {/* Status Label */}
      <span className="font-semibold tracking-wide uppercase">
        {status === 'live' && 'IMD LIVE'}
        {status === 'updating' && 'UPDATING...'}
        {status === 'stale' && 'IMD STALE CACHE'}
        {status === 'unavailable' && 'IMD UNAVAILABLE'}
        {status === 'error' && 'IMD DISCONNECTED'}
      </span>

      {/* Last Updated Timestamp */}
      {formattedTime && (
        <span className="text-gray-600 flex items-center gap-1 border-l border-gray-300 pl-2">
          <Clock className="w-3 h-3 text-gray-500" />
          <span>{status === 'stale' ? `Last success: ${formattedTime} IST` : `Updated: ${formattedTime} IST`}</span>
        </span>
      )}

      {/* Data Source Label */}
      {showSource && (
        <span className="text-[11px] text-gray-500 font-sans hidden sm:inline">
          (Official IMD Telemetry)
        </span>
      )}

      {/* Manual Refresh Trigger */}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="ml-1 p-0.5 text-gray-600 hover:text-gray-900 focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
          title="Request fresh data from IMD"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      )}
    </div>
  );
};
export default LiveDataIndicator;
