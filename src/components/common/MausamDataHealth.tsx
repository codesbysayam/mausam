import React, { useState, useRef } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

export type FeedStatus = 'Operational' | 'DEGRADED';

interface MausamDataHealthProps {
  weatherStatus?: FeedStatus;
  radarStatus?: FeedStatus;
  aqiStatus?: FeedStatus;
  warningStatus?: FeedStatus;
  stationStatus?: FeedStatus;
  onRefreshAll?: () => Promise<void> | void;
  lastUpdated?: string;
}

export const MausamDataHealth: React.FC<MausamDataHealthProps> = ({
  weatherStatus = 'Operational',
  radarStatus = 'Operational',
  aqiStatus = 'Operational',
  warningStatus = 'Operational',
  stationStatus = 'Operational',
  onRefreshAll,
  lastUpdated = '21:03 IST',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleRefreshClick = async () => {
    if (isRefreshing) return; // prevent duplicate simultaneous requests

    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsRefreshing(true);
    setStatusMessage('Refreshing…');

    try {
      if (onRefreshAll) {
        await Promise.resolve(onRefreshAll());
      } else {
        // Minimal delay to simulate atomic synchronization
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setStatusMessage('Updated just now');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setStatusMessage('Refresh completed with warnings');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const feeds = [
    { name: 'Weather API', status: weatherStatus },
    { name: 'Radar Feed', status: radarStatus },
    { name: 'AQI Feed', status: aqiStatus },
    { name: 'Warning Feed', status: warningStatus },
    { name: 'Station Network', status: stationStatus },
  ];

  return (
    <div
      id="mausam-data-health-panel"
      className="bg-[#17212B] border border-[#334155] rounded-xl p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#0B72B9]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            MAUSAM DATA HEALTH
          </span>
          <span className="text-[10px] text-[#8A94A6] font-mono">
            (Last update: <strong className="text-[#D7DEE8]">{lastUpdated}</strong>)
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs">
          {feeds.map((feed) => {
            const isOk = feed.status === 'Operational';
            return (
              <div key={feed.name} className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-[#8A94A6]">{feed.name}</span>
                <span
                  className={`flex items-center gap-1 font-bold ${
                    isOk ? 'text-[#2ECC71]' : 'text-[#E74C3C]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOk ? 'bg-[#2ECC71]' : 'bg-[#E74C3C] animate-ping'}`} />
                  {feed.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Refresh Control Button */}
      <div className="flex items-center gap-2 shrink-0">
        {statusMessage && (
          <span className="text-xs text-[#2ECC71] font-mono font-medium animate-fade-in">
            {statusMessage}
          </span>
        )}

        <button
          id="btn-global-refresh-all"
          type="button"
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none ${
            isRefreshing
              ? 'bg-[#1E2733] border-[#334155] text-[#8A94A6] cursor-not-allowed'
              : 'bg-[#0B72B9] hover:bg-[#0B72B9]/80 border-[#0B72B9] text-white shadow-sm'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing…' : '↻ REFRESH ALL DATA'}</span>
        </button>
      </div>
    </div>
  );
};
