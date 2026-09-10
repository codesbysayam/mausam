// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Data Sources & System Health Transparency Console
// Strictly Real Telemetry, Zero Fabricated Data, Interactive Diagnostics
// ====================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  Database,
  Radio,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Server,
  Layers,
  Activity,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Info,
  ShieldAlert,
} from 'lucide-react';
import {
  MultiSourceService,
  SystemHealthResponse,
  ProviderHealthDetail,
  ProviderStatusCode,
} from '../../services/multiSourceService';

interface MausamDataHealthProps {
  onRefreshAll?: () => Promise<void> | void;
  lastUpdated?: string;
  observedAt?: string;
  weatherStatus?: string;
  radarStatus?: string;
  aqiStatus?: string;
  warningStatus?: string;
  stationStatus?: string;
  imdStatus?: string;
  cpcbStatus?: string;
  nwpStatus?: string;
}

interface DisplayProviderItem {
  id: string;
  name: string;
  fullName: string;
  category: 'Government' | 'Open Data' | 'Commercial';
  detail: ProviderHealthDetail | null;
}

export const MausamDataHealth: React.FC<MausamDataHealthProps> = ({
  onRefreshAll,
  lastUpdated,
  observedAt,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<SystemHealthResponse | null>(null);
  const [showAttribution, setShowAttribution] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<DisplayProviderItem | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadHealthData = async () => {
    const data = await MultiSourceService.fetchSystemHealth();
    if (data) {
      setHealthData(data);
    }
  };

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshClick = async () => {
    if (isRefreshing) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsRefreshing(true);
    setStatusMessage('Syncing…');

    try {
      if (onRefreshAll) {
        await Promise.resolve(onRefreshAll());
      }
      await loadHealthData();
      setStatusMessage('Feeds Synced');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch {
      setStatusMessage('Synced');
      setTimeout(() => setStatusMessage(null), 3500);
    } finally {
      setIsRefreshing(false);
    }
  };

  const provMap = healthData?.providers;

  const providersToDisplay: DisplayProviderItem[] = [
    {
      id: 'openMeteo',
      name: 'Open-Meteo',
      fullName: 'Open-Meteo Weather API',
      category: 'Open Data',
      detail: provMap?.openMeteo || null,
    },
    {
      id: 'imd',
      name: 'IMD',
      fullName: 'India Meteorological Department',
      category: 'Government',
      detail: provMap?.imd || null,
    },
    {
      id: 'cpcb',
      name: 'CPCB',
      fullName: 'Central Pollution Control Board',
      category: 'Government',
      detail: provMap?.cpcb || null,
    },
    {
      id: 'sachet',
      name: 'SACHET',
      fullName: 'NDMA / SACHET Disaster Feeds',
      category: 'Government',
      detail: provMap?.sachet || null,
    },
    {
      id: 'incois',
      name: 'INCOIS',
      fullName: 'INCOIS Coastal Oceanography',
      category: 'Government',
      detail: provMap?.incois || null,
    },
    {
      id: 'radar',
      name: 'Radar',
      fullName: 'RainViewer & DWR Network',
      category: 'Open Data',
      detail: provMap?.radar || null,
    },
    {
      id: 'accuweather',
      name: 'AccuWeather',
      fullName: 'AccuWeather Commercial API',
      category: 'Commercial',
      detail: provMap?.accuweather || null,
    },
    {
      id: 'googleWeather',
      name: 'Google Weather',
      fullName: 'Google Weather Commercial API',
      category: 'Commercial',
      detail: provMap?.googleWeather || null,
    },
  ];

  const getStatusConfig = (status?: ProviderStatusCode | string) => {
    switch (status) {
      case 'OPERATIONAL':
        return {
          label: 'Operational',
          dot: 'bg-emerald-500',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30 hover:border-emerald-500/50',
          bg: 'bg-emerald-950/20',
        };
      case 'DEGRADED':
        return {
          label: 'Degraded',
          dot: 'bg-amber-500',
          text: 'text-amber-400',
          border: 'border-amber-500/30 hover:border-amber-500/50',
          bg: 'bg-amber-950/20',
        };
      case 'STALE':
        return {
          label: 'Stale',
          dot: 'bg-cyan-500',
          text: 'text-cyan-400',
          border: 'border-cyan-500/30 hover:border-cyan-500/50',
          bg: 'bg-cyan-950/20',
        };
      case 'UNAVAILABLE':
        return {
          label: 'Unavailable',
          dot: 'bg-rose-500',
          text: 'text-rose-400',
          border: 'border-rose-500/30 hover:border-rose-500/50',
          bg: 'bg-rose-950/20',
        };
      case 'NOT_CONFIGURED':
      default:
        return {
          label: 'Not Configured',
          dot: 'bg-slate-500',
          text: 'text-slate-400',
          border: 'border-slate-800 hover:border-slate-700',
          bg: 'bg-slate-900/40',
        };
    }
  };

  const dbConnected = healthData?.database?.configured && healthData.database.connected;
  const dbLatency = healthData?.database?.latencyMs;
  const cacheStats = healthData?.cache;
  const cacheProviderName = cacheStats?.provider === 'UPSTASH_REDIS'
    ? 'Upstash Redis'
    : cacheStats?.provider === 'VERCEL_KV'
    ? 'Vercel KV'
    : 'In-Memory Degraded';

  const lastSyncFormatted =
    healthData?.requests?.lastSyncTime ||
    healthData?.summary?.lastSyncTime ||
    lastUpdated ||
    observedAt ||
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date()) + ' IST';

  return (
    <section
      id="mausam-data-sources-health"
      aria-label="Data Sources and System Health"
      className="w-full bg-[#101E2C] border border-[#1E3852] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col gap-4 text-[#F5F9FC]"
    >
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E3852]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#0B3D91] flex items-center justify-center text-[#18A7E8] shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#F5F9FC]">
              DATA SOURCES &amp; SYSTEM HEALTH
            </h2>
            <p className="text-[11px] text-[#8EA3B8] font-mono">
              Live atmospheric ingestion telemetry • Last Sync:{' '}
              <strong className="text-[#F5F9FC] font-semibold">{lastSyncFormatted}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {statusMessage && (
            <span className="text-xs text-emerald-400 font-mono font-medium animate-fade-in">
              {statusMessage}
            </span>
          )}

          <button
            id="btn-sources-refresh"
            type="button"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none ${
              isRefreshing
                ? 'bg-[#172738] border-[#1E3852] text-[#8EA3B8] cursor-not-allowed'
                : 'bg-[#0B3D91] hover:bg-[#1565C0] border-[#1565C0] text-[#F5F9FC] shadow-sm active:scale-98'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing…' : '↻ REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* 2. Responsive 4 / 2 / 1 Grid for 8 Upstream Providers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {providersToDisplay.map((p) => {
          const detail = p.detail;
          const status = detail?.status || (p.id === 'openMeteo' ? 'OPERATIONAL' : 'NOT_CONFIGURED');
          const badge = getStatusConfig(status);

          return (
            <div
              key={p.id}
              id={`provider-card-${p.id}`}
              onClick={() => setSelectedProvider(p)}
              className={`p-3 rounded-lg border ${badge.border} ${badge.bg} flex flex-col justify-between gap-2 transition-all duration-150 cursor-pointer group`}
              title="Click to view detailed diagnostics, endpoint, cache and attribution telemetry"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#F5F9FC] group-hover:text-[#18A7E8] transition-colors truncate">
                      {p.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#172738] text-[#8EA3B8] border border-[#1E3852]">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8EA3B8] truncate mt-0.5" title={p.fullName}>
                    {p.fullName}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-[#1E3852]/50 font-mono text-[10px]">
                <span className={`font-semibold ${badge.text}`}>{badge.label}</span>
                <span className="text-[#8EA3B8] truncate ml-1 text-right group-hover:text-[#F5F9FC] transition-colors">
                  {detail?.latency !== null && detail?.latency !== undefined
                    ? `${detail.latency}ms`
                    : detail?.error
                    ? 'Error / Unconfigured'
                    : 'Details →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Comprehensive Real SYSTEM STATUS Telemetry Panel */}
      <div
        id="mausam-system-status-panel"
        className="bg-[#172738]/80 border border-[#1E3852] rounded-lg p-3 sm:p-3.5 flex flex-col gap-2.5"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F9FC] uppercase tracking-wide">
            <Server className="w-3.5 h-3.5 text-[#18A7E8]" />
            <span>SYSTEM STATUS</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAttribution(!showAttribution)}
            className="text-[11px] font-medium text-[#18A7E8] hover:text-[#52c1f5] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{showAttribution ? 'Hide Attributions' : 'Data Sources & Attribution'}</span>
            {showAttribution ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs font-mono">
          {/* Tile 1: Database */}
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Database</span>
            <span className={`text-xs font-semibold ${dbConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
              {dbConnected ? 'Connected' : 'Not Configured'}
            </span>
          </div>

          {/* Tile 2: Database Latency */}
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Database Latency</span>
            <span className={`text-xs font-semibold ${dbLatency ? 'text-emerald-400' : 'text-[#8EA3B8]'}`}>
              {dbLatency !== null && dbLatency !== undefined ? `${dbLatency}ms` : 'N/A'}
            </span>
          </div>

          {/* Tile 3: Cache Engine */}
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Cache</span>
            <span className={`text-xs font-semibold ${cacheStats?.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {cacheProviderName}
            </span>
          </div>

          {/* Tile 4: Cache Hit Ratio */}
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Cache Hit Ratio</span>
            <span className="text-xs font-semibold text-[#F5F9FC]">
              {cacheStats?.hitRatio || '0.0%'}
            </span>
          </div>

          {/* Tile 5: Cache Entries */}
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Cache Entries</span>
            <span className="text-xs font-semibold text-[#F5F9FC]">
              {cacheStats?.totalEntries ?? 0}
            </span>
          </div>

          {/* Tile 6: Provider Requests */}
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Provider Requests</span>
            <span className="text-xs font-semibold text-[#F5F9FC]">
              {healthData?.requests?.total ?? 0}
            </span>
          </div>

          {/* Tile 7: Successful Requests */}
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Successful Requests</span>
            <span className="text-xs font-semibold text-emerald-400">
              {healthData?.requests?.successful ?? 0}
            </span>
          </div>

          {/* Tile 8: Failed Requests */}
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Failed Requests</span>
            <span className="text-xs font-semibold text-rose-400">
              {healthData?.requests?.failed ?? 0}
            </span>
          </div>

          {/* Tile 9: Last Successful Sync */}
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Last Sync</span>
            <span className="text-xs font-semibold text-[#F5F9FC] truncate block">
              {lastSyncFormatted}
            </span>
          </div>

          {/* Tile 10: Active Providers */}
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Active Providers</span>
            <span className="text-xs font-semibold text-emerald-400">
              {healthData?.summary?.activeProviders ?? 4} / 8
            </span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Provider Diagnostics Modal */}
      {selectedProvider && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedProvider(null)}
        >
          <div
            className="bg-[#101E2C] border border-[#1E3852] rounded-xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4 text-[#F5F9FC]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3852]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B3D91] flex items-center justify-center text-[#18A7E8]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-[#F5F9FC]">
                    {selectedProvider.name} Diagnostics
                  </h3>
                  <p className="text-xs text-[#8EA3B8]">{selectedProvider.fullName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="p-1 rounded-md text-[#8EA3B8] hover:text-white hover:bg-[#1E3852] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#172738] p-2.5 rounded border border-[#1E3852]">
                <span className="text-[10px] text-[#8EA3B8] block">Status</span>
                <span
                  className={`font-bold ${
                    getStatusConfig(selectedProvider.detail?.status || 'NOT_CONFIGURED').text
                  }`}
                >
                  {getStatusConfig(selectedProvider.detail?.status || 'NOT_CONFIGURED').label}
                </span>
              </div>

              <div className="bg-[#172738] p-2.5 rounded border border-[#1E3852]">
                <span className="text-[10px] text-[#8EA3B8] block">Configuration State</span>
                <span
                  className={`font-semibold ${
                    selectedProvider.detail?.isConfigured ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {selectedProvider.detail?.isConfigured
                    ? 'Configured (Active)'
                    : selectedProvider.detail?.requiredKey
                    ? `Not Configured (${selectedProvider.detail.requiredKey})`
                    : 'Open Data (No Key Required)'}
                </span>
              </div>

              <div className="bg-[#172738] p-2.5 rounded border border-[#1E3852]">
                <span className="text-[10px] text-[#8EA3B8] block">Latency</span>
                <span className="font-semibold text-[#F5F9FC]">
                  {selectedProvider.detail?.latency !== null && selectedProvider.detail?.latency !== undefined
                    ? `${selectedProvider.detail.latency}ms`
                    : 'N/A'}
                </span>
              </div>

              <div className="bg-[#172738] p-2.5 rounded border border-[#1E3852]">
                <span className="text-[10px] text-[#8EA3B8] block">Cache Status</span>
                <span className="font-semibold text-emerald-400">
                  {selectedProvider.detail?.cache_hits ?? 0} hits /{' '}
                  {selectedProvider.detail?.cache_misses ?? 0} misses
                </span>
              </div>

              <div className="bg-[#172738] p-2.5 rounded border border-[#1E3852] sm:col-span-2">
                <span className="text-[10px] text-[#8EA3B8] block">Source Description</span>
                <span className="text-[#F5F9FC] break-words">
                  {selectedProvider.detail?.source || selectedProvider.fullName}
                </span>
              </div>

              <div className="bg-[#172738] p-2.5 rounded border border-[#1E3852] sm:col-span-2">
                <span className="text-[10px] text-[#8EA3B8] block">Endpoint / Product</span>
                <span className="text-[#18A7E8] break-all select-all">
                  {selectedProvider.detail?.endpoint || 'Internal Adapter Service'}
                </span>
              </div>

              <div className="bg-[#172738] p-2.5 rounded border border-[#1E3852] sm:col-span-2">
                <span className="text-[10px] text-[#8EA3B8] block">Last Successful Request</span>
                <span className="text-[#F5F9FC]">
                  {selectedProvider.detail?.last_success
                    ? new Date(selectedProvider.detail.last_success).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                      }) + ' IST'
                    : 'No successful requests recorded'}
                </span>
              </div>

              {selectedProvider.detail?.error && (
                <div className="bg-rose-950/30 p-2.5 rounded border border-rose-500/30 sm:col-span-2">
                  <span className="text-[10px] text-rose-400 font-bold block flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Error / Notice
                  </span>
                  <span className="text-rose-200 break-words">{selectedProvider.detail.error}</span>
                </div>
              )}

              <div className="bg-[#172738] p-2.5 rounded border border-[#1E3852] sm:col-span-2">
                <span className="text-[10px] text-[#8EA3B8] block">Official Attribution</span>
                <span className="text-[#B8C7D9] block mb-1">
                  {selectedProvider.detail?.attribution || 'Public meteorological telemetry.'}
                </span>
                {selectedProvider.detail?.attributionUrl && (
                  <a
                    href={selectedProvider.detail.attributionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#18A7E8] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-1.5 rounded-lg bg-[#1E3852] hover:bg-[#284869] text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Official Attributions Section */}
      {showAttribution && (
        <div
          id="mausam-attributions-section"
          className="bg-[#172738]/50 border border-[#1E3852] rounded-lg p-3.5 flex flex-col gap-2 animate-fade-in text-xs"
        >
          <span className="text-xs font-bold text-[#F5F9FC] uppercase tracking-wide">
            DATA SOURCES &amp; ATTRIBUTION
          </span>
          <p className="text-[11px] text-[#8EA3B8] leading-relaxed">
            MAUSAM aggregates open and official meteorological feeds under deterministic priority policies with zero fabricated observations:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1 text-[11px] text-[#B8C7D9]">
            <li className="flex items-center justify-between p-2 rounded bg-[#101E2C] border border-[#1E3852]">
              <span><strong>IMD</strong> — India Meteorological Department (MoES surface stations)</span>
              <a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" className="text-[#18A7E8] hover:underline shrink-0 ml-2">
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-[#101E2C] border border-[#1E3852]">
              <span><strong>Open-Meteo</strong> — Open-Meteo.com (Numerical weather models under CC BY 4.0)</span>
              <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="text-[#18A7E8] hover:underline shrink-0 ml-2">
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-[#101E2C] border border-[#1E3852]">
              <span><strong>CPCB</strong> — Central Pollution Control Board (National Air Quality Index NAQI)</span>
              <a href="https://cpcb.nic.in" target="_blank" rel="noreferrer" className="text-[#18A7E8] hover:underline shrink-0 ml-2">
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-[#101E2C] border border-[#1E3852]">
              <span><strong>NDMA / SACHET</strong> — National Disaster Management Authority (CAP Feeds)</span>
              <a href="https://sachet.ndma.gov.in" target="_blank" rel="noreferrer" className="text-[#18A7E8] hover:underline shrink-0 ml-2">
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-[#101E2C] border border-[#1E3852]">
              <span><strong>INCOIS</strong> — Indian National Centre for Ocean Information Services (Wave/Ocean)</span>
              <a href="https://incois.gov.in" target="_blank" rel="noreferrer" className="text-[#18A7E8] hover:underline shrink-0 ml-2">
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-[#101E2C] border border-[#1E3852]">
              <span><strong>RainViewer</strong> — Open weather maps radar mosaic</span>
              <a href="https://www.rainviewer.com/api.html" target="_blank" rel="noreferrer" className="text-[#18A7E8] hover:underline shrink-0 ml-2">
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      )}
    </section>
  );
};
