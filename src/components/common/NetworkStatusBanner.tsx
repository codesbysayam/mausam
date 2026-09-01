import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, X, CheckCircle2, Database } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface NetworkStatusBannerProps {
  isOnline: boolean;
  isApiReachable: boolean;
  lastSyncedAt?: string | Date | null;
  onRetry?: () => Promise<any> | void;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  isOnline,
  isApiReachable,
  lastSyncedAt,
  onRetry,
}) => {
  const { t } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [prevOffline, setPrevOffline] = useState(false);

  const isOfflineMode = !isOnline || !isApiReachable;

  useEffect(() => {
    if (isOfflineMode) {
      setIsDismissed(false);
      setPrevOffline(true);
    } else if (prevOffline) {
      // Show short restored toast when connection recovers
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
        setPrevOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOfflineMode, prevOffline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      }
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  };

  const formattedLastSync = React.useMemo(() => {
    if (!lastSyncedAt) return 'Recently cached';
    const date = typeof lastSyncedAt === 'string' ? new Date(lastSyncedAt) : lastSyncedAt;
    if (isNaN(date.getTime())) return 'Recently cached';
    return (
      new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date) + ' IST'
    );
  }, [lastSyncedAt]);

  // Restored Connection Notice
  if (showRestoredNotice && !isOfflineMode) {
    return (
      <aside
        id="network-restored-banner"
        aria-label="Network connection status"
        className="w-full bg-[#16382B] border-b border-[#22C7A0]/40 text-[#22C7A0] px-3 sm:px-4 py-2 text-xs transition-all duration-300 select-none shadow-md z-30"
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22C7A0]" />
            <span className="font-semibold text-white">
              {t('networkRestored', 'Live meteorological telemetry connection restored.')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowRestoredNotice(false)}
            className="text-[#22C7A0]/80 hover:text-white p-1 rounded transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  if (!isOfflineMode || isDismissed) {
    return null;
  }

  return (
    <aside
      id="network-offline-banner"
      role="status"
      aria-live="polite"
      aria-label="Network offline banner"
      className="w-full bg-[#1E190E] border-b border-[#FF9F43]/40 text-[#FFB766] px-3 sm:px-4 py-2.5 text-xs transition-all duration-300 select-none shadow-md z-30"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Indicator & Info */}
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#FF9F43]/20 border border-[#FF9F43]/40 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 text-[#FF9F43]">
            <WifiOff className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <span className="font-bold text-white tracking-wide">
              {t('offlineTelemetryActive', 'Offline Mode Active')}
            </span>
            <span className="text-[#D1DCE8]/80 text-[11px] flex items-center gap-1">
              <Database className="w-3 h-3 text-[#FF9F43]" />
              {t('servingCachedBundle', 'Operating seamlessly on local telemetry cache')}
              {formattedLastSync && (
                <span className="font-mono text-[#FFB766] font-medium">({formattedLastSync})</span>
              )}
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            id="network-retry-sync-btn"
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#FF9F43]/20 hover:bg-[#FF9F43]/30 text-white border border-[#FF9F43]/40 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Retry connecting to national weather network"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? t('reconnecting', 'Checking...') : t('retrySync', 'Retry Sync')}</span>
          </button>

          <button
            type="button"
            id="network-dismiss-banner-btn"
            onClick={() => setIsDismissed(true)}
            className="text-[#93A4B8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss offline banner"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
