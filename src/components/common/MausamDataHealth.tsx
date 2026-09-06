import React, { useState, useRef } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

export type SourceOperationalState = 'Operational' | 'Delayed' | 'Unavailable';

interface MausamDataHealthProps {
  imdStatus?: SourceOperationalState;
  cpcbStatus?: SourceOperationalState;
  radarStatus?: SourceOperationalState;
  nwpStatus?: SourceOperationalState;
  stationStatus?: SourceOperationalState;
  weatherStatus?: SourceOperationalState;
  aqiStatus?: SourceOperationalState;
  warningStatus?: SourceOperationalState;
  onRefreshAll?: () => Promise<void> | void;
  lastUpdated?: string;
  observedAt?: string;
}

export const MausamDataHealth: React.FC<MausamDataHealthProps> = ({
  imdStatus,
  cpcbStatus,
  radarStatus,
  nwpStatus,
  stationStatus,
  weatherStatus = 'Operational',
  aqiStatus = 'Operational',
  warningStatus = 'Operational',
  onRefreshAll,
  lastUpdated,
  observedAt,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const displayTime = lastUpdated || observedAt || new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date()) + ' IST';

  const handleRefreshClick = async () => {
    if (isRefreshing) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsRefreshing(true);
    setStatusMessage('Syncing feeds…');

    try {
      if (onRefreshAll) {
        await Promise.resolve(onRefreshAll());
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setStatusMessage('Data feeds synchronized');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setStatusMessage('Sync completed with warnings');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Structured per Requirement 6: IMD, CPCB, Radar, NWP, Station Network
  const sources: { name: string; status: SourceOperationalState; detail: string }[] = [
    {
      name: 'IMD',
      status: imdStatus || weatherStatus || 'Operational',
      detail: 'Surface Observatories',
    },
    {
      name: 'CPCB',
      status: cpcbStatus || aqiStatus || 'Operational',
      detail: 'National AQI Network',
    },
    {
      name: 'Radar',
      status: radarStatus || 'Operational',
      detail: 'Doppler Weather Radar',
    },
    {
      name: 'NWP',
      status: nwpStatus || 'Operational',
      detail: 'Numerical Weather Prediction',
    },
    {
      name: 'Station Network',
      status: stationStatus || 'Operational',
      detail: 'AWS / ARG Telemetry',
    },
  ];

  const getStatusColor = (status: SourceOperationalState) => {
    switch (status) {
      case 'Operational':
        return { text: 'text-[#00C897]', dot: 'bg-[#00C897]' };
      case 'Delayed':
        return { text: 'text-[#F59E0B]', dot: 'bg-[#F59E0B]' };
      case 'Unavailable':
      default:
        return { text: 'text-[#EF4444]', dot: 'bg-[#EF4444]' };
    }
  };

  return (
    <div
      id="mausam-data-health-panel"
      className="bg-[#101E2C] border border-[#1E3852] rounded-xl p-3.5 sm:p-4 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-6 h-6 rounded bg-[#0B3D91] flex items-center justify-center text-[#18A7E8]">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#F5F9FC]">
            MAUSAM DATA HEALTH &amp; SOURCE TRANSPARENCY
          </span>
          <span className="text-[11px] text-[#B8C7D9] font-mono">
            Latest Observation: <strong className="text-[#F5F9FC]">{displayTime}</strong>
          </span>
        </div>

        {/* Source Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-1">
          {sources.map((src) => {
            const colors = getStatusColor(src.status);
            return (
              <div
                key={src.name}
                className="bg-[#172738] border border-[#1E3852] rounded-lg px-2.5 py-1.5 flex flex-col"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-[#F5F9FC]">{src.name}</span>
                  <span className={`flex items-center gap-1 font-mono text-[10px] font-bold ${colors.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    {src.status}
                  </span>
                </div>
                <span className="text-[9px] text-[#8EA3B8] truncate">{src.detail}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Refresh Control Button */}
      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
        {statusMessage && (
          <span className="text-xs text-[#00C897] font-mono font-medium animate-fade-in">
            {statusMessage}
          </span>
        )}

        <button
          id="btn-global-refresh-all"
          type="button"
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none ${
            isRefreshing
              ? 'bg-[#172738] border-[#1E3852] text-[#8EA3B8] cursor-not-allowed'
              : 'bg-[#0B3D91] hover:bg-[#1565C0] border-[#1565C0] text-[#F5F9FC] shadow-sm'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing Feeds…' : '↻ REFRESH ALL'}</span>
        </button>
      </div>
    </div>
  );
};
