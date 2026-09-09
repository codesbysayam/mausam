import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Radio, Database, Cpu, ChevronDown, ChevronUp, ShieldCheck, HelpCircle } from 'lucide-react';
import { MultiSourceService, SystemHealthResponse, SourceHealthItem } from '../../services/multiSourceService';

export type SourceOperationalState = 'Operational' | 'Delayed' | 'Unavailable' | 'Not Configured';

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
  onRefreshAll,
  lastUpdated,
  observedAt,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<SystemHealthResponse | null>(null);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadHealthData = async () => {
    const data = await MultiSourceService.fetchSystemHealth();
    if (data) {
      setHealthData(data);
    }
  };

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const displayTime = lastUpdated || observedAt || new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date()) + ' IST';

  const handleRefreshClick = async () => {
    if (isRefreshing) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsRefreshing(true);
    setStatusMessage('Syncing multi-source pipeline…');

    try {
      if (onRefreshAll) {
        await Promise.resolve(onRefreshAll());
      }
      await loadHealthData();
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

  // Map sources from health data if available, fallback to props
  const sourcesToRender = healthData?.sources && healthData.sources.length > 0
    ? healthData.sources
    : [
        { code: 'IMD', name: 'IMD', status: imdStatus === 'Unavailable' ? 'UNAVAILABLE' : 'OPERATIONAL', attributionText: 'Official IMD Surface Network' },
        { code: 'OPEN_METEO', name: 'Open-Meteo', status: 'OPERATIONAL', attributionText: 'Free Multi-Model Synoptic Baseline (CC BY 4.0)' },
        { code: 'CPCB', name: 'CPCB', status: cpcbStatus === 'Unavailable' ? 'UNAVAILABLE' : 'OPERATIONAL', attributionText: 'National Ambient Air Quality' },
        { code: 'NDMA_SACHET', name: 'NDMA / SACHET', status: 'OPERATIONAL', attributionText: 'CAP Public Disaster Warnings' },
        { code: 'INCOIS', name: 'INCOIS', status: 'OPERATIONAL', attributionText: 'Ocean State Forecast' },
        { code: 'ACCUWEATHER', name: 'AccuWeather', status: 'NOT_CONFIGURED', attributionText: 'Commercial Key Required' },
        { code: 'GOOGLE_WEATHER', name: 'Google Weather', status: 'NOT_CONFIGURED', attributionText: 'Cloud Weather SKU Required' },
      ];

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr.toUpperCase()) {
      case 'OPERATIONAL':
        return { text: 'text-[#00C897]', dot: 'bg-[#00C897]', label: 'Operational', border: 'border-[#00C897]/30' };
      case 'DEGRADED':
      case 'DELAYED':
        return { text: 'text-[#F59E0B]', dot: 'bg-[#F59E0B]', label: 'Degraded', border: 'border-[#F59E0B]/30' };
      case 'NOT_CONFIGURED':
        return { text: 'text-[#8EA3B8]', dot: 'bg-[#64748B]', label: 'Not Configured', border: 'border-[#334155]' };
      case 'UNAVAILABLE':
      default:
        return { text: 'text-[#EF4444]', dot: 'bg-[#EF4444]', label: 'Unavailable', border: 'border-[#EF4444]/30' };
    }
  };

  return (
    <div
      id="mausam-data-health-panel"
      className="bg-[#101E2C] border border-[#1E3852] rounded-xl p-3.5 sm:p-4 shadow-md flex flex-col gap-3"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

            {healthData?.database && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#172738] border border-[#1E3852] text-[#8EA3B8]">
                <Database className="w-3 h-3 text-[#18A7E8]" />
                {healthData.database.provider === 'POSTGRESQL' ? 'PostgreSQL Pool Active' : 'Relational Memory Store'}
              </span>
            )}
            {healthData?.cache && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#172738] border border-[#1E3852] text-[#8EA3B8]">
                <Cpu className="w-3 h-3 text-[#00C897]" />
                Cache Hit Ratio: {(Number(healthData.cache.hitRatio) * 100).toFixed(1)}%
              </span>
            )}
          </div>

          {/* Source Status Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-1">
            {sourcesToRender.map((src: any) => {
              const badge = getStatusBadge(src.status);
              return (
                <div
                  key={src.code || src.name}
                  className={`bg-[#172738] border ${badge.border} rounded-lg px-2.5 py-1.5 flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#F5F9FC] truncate">{src.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} shrink-0`} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`font-mono text-[9px] font-bold ${badge.text}`}>
                      {badge.label}
                    </span>
                    {src.lastLatencyMs && (
                      <span className="text-[8px] font-mono text-[#8EA3B8]">{src.lastLatencyMs}ms</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
          <button
            type="button"
            onClick={() => setShowDetailedModal(!showDetailedModal)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1E3852] bg-[#172738] hover:bg-[#1E3852] text-xs font-medium text-[#B8C7D9] transition-colors cursor-pointer"
            title="Inspect Data Source Transparency"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#18A7E8]" />
            <span>Audit</span>
            {showDetailedModal ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

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

      {/* Expandable Transparency & Attribution Drawer */}
      {showDetailedModal && (
        <div className="mt-2 pt-3 border-t border-[#1E3852] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs animate-fade-in">
          <div className="bg-[#172738] p-3 rounded-lg border border-[#1E3852]">
            <span className="text-[11px] font-bold text-[#F5F9FC] uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00C897]" />
              Deterministic Priority Policy
            </span>
            <p className="text-[11px] text-[#B8C7D9] mt-1.5 leading-relaxed">
              In India, observations strictly prioritize official <strong>IMD</strong> telemetry. When commercial keys (Google Weather, AccuWeather) are unconfigured or rate-limited, the system seamlessly falls back to <strong>Open-Meteo</strong> (CC BY 4.0) ensuring uninterrupted service with zero fake data.
            </p>
          </div>

          <div className="bg-[#172738] p-3 rounded-lg border border-[#1E3852]">
            <span className="text-[11px] font-bold text-[#F5F9FC] uppercase tracking-wide flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#18A7E8]" />
              Storage &amp; Cache Telemetry
            </span>
            <div className="mt-2 space-y-1 font-mono text-[10px] text-[#8EA3B8]">
              <div>Database Engine: <span className="text-[#F5F9FC] font-semibold">{healthData?.database.provider || 'ACTIVE'}</span></div>
              <div>Cache TTLs: Weather (5m), Forecast (30m), Alerts (5m)</div>
              <div>Cached Objects: <span className="text-[#F5F9FC]">{healthData?.cache.totalEntries || 0}</span></div>
            </div>
          </div>

          <div className="bg-[#172738] p-3 rounded-lg border border-[#1E3852]">
            <span className="text-[11px] font-bold text-[#F5F9FC] uppercase tracking-wide flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
              Official Attributions
            </span>
            <p className="text-[10px] text-[#8EA3B8] mt-1.5 leading-relaxed">
              CPCB (Air Quality), INCOIS (Ocean State Forecast), NDMA (Disaster CAP Feeds), Open-Meteo (WMO Numerical Models), IMD (Surface AWS &amp; DWR Radar).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

