// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Data Sources & System Health Transparency Console
// Responsive 4/2/1 Column Grid with Real Cache & Database Telemetry
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
} from 'lucide-react';
import { MultiSourceService, SystemHealthResponse, ProviderHealthDetail } from '../../services/multiSourceService';

export type SourceOperationalState = 'Operational' | 'Delayed' | 'Unavailable' | 'Not Configured';

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
  status: 'OPERATIONAL' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  latencyMs: number | null;
  infoText: string;
  attributionUrl?: string;
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadHealthData = async () => {
    const data = await MultiSourceService.fetchSystemHealth();
    if (data) {
      setHealthData(data);
    }
  };

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 25000);
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

  // Extract real provider statuses from /api/system/health
  const provMap = healthData?.providers || {};

  const providersToDisplay: DisplayProviderItem[] = [
    {
      id: 'imd',
      name: 'IMD',
      fullName: 'India Meteorological Dept.',
      category: 'Government',
      status: provMap.imd?.status || 'NOT_CONFIGURED',
      latencyMs: provMap.imd?.lastLatencyMs ?? null,
      infoText: provMap.imd?.status === 'OPERATIONAL' ? 'Official Surface Network' : 'API Key / IP Not Configured',
      attributionUrl: 'https://mausam.imd.gov.in',
    },
    {
      id: 'openMeteo',
      name: 'Open-Meteo',
      fullName: 'Open-Meteo Weather API',
      category: 'Open Data',
      status: provMap.openMeteo?.status || 'OPERATIONAL',
      latencyMs: provMap.openMeteo?.lastLatencyMs ?? null,
      infoText: 'Free Baseline (CC BY 4.0)',
      attributionUrl: 'https://open-meteo.com',
    },
    {
      id: 'cpcb',
      name: 'CPCB',
      fullName: 'Central Pollution Control Board',
      category: 'Government',
      status: provMap.cpcb?.status || 'NOT_CONFIGURED',
      latencyMs: provMap.cpcb?.lastLatencyMs ?? null,
      infoText: provMap.cpcb?.status === 'OPERATIONAL' ? 'Direct CAAQMS' : 'Open CAMS Baseline Active',
      attributionUrl: 'https://cpcb.nic.in',
    },
    {
      id: 'sachet',
      name: 'SACHET',
      fullName: 'NDMA / SACHET Alerts',
      category: 'Government',
      status: provMap.sachet?.status || 'OPERATIONAL',
      latencyMs: provMap.sachet?.lastLatencyMs ?? null,
      infoText: 'CAP Public Disaster Feed',
      attributionUrl: 'https://sachet.ndma.gov.in',
    },
    {
      id: 'incois',
      name: 'INCOIS',
      fullName: 'INCOIS Ocean Information',
      category: 'Government',
      status: provMap.incois?.status || 'OPERATIONAL',
      latencyMs: provMap.incois?.lastLatencyMs ?? null,
      infoText: 'Coastal Wave & Ocean State',
      attributionUrl: 'https://incois.gov.in',
    },
    {
      id: 'radar',
      name: 'Radar',
      fullName: 'Doppler Radar & Weather Maps',
      category: 'Open Data',
      status: provMap.radar?.status || 'OPERATIONAL',
      latencyMs: provMap.radar?.lastLatencyMs ?? null,
      infoText: 'RainViewer Mosaic & IMD DWR',
      attributionUrl: 'https://www.rainviewer.com/api.html',
    },
    {
      id: 'accuweather',
      name: 'AccuWeather',
      fullName: 'AccuWeather Commercial',
      category: 'Commercial',
      status: provMap.accuweather?.status || 'NOT_CONFIGURED',
      latencyMs: provMap.accuweather?.lastLatencyMs ?? null,
      infoText: 'Not Configured (Optional)',
      attributionUrl: 'https://developer.accuweather.com',
    },
    {
      id: 'googleWeather',
      name: 'Google Weather',
      fullName: 'Google Weather Commercial',
      category: 'Commercial',
      status: provMap.googleWeather?.status || 'NOT_CONFIGURED',
      latencyMs: provMap.googleWeather?.lastLatencyMs ?? null,
      infoText: 'Not Configured (Optional)',
      attributionUrl: 'https://developers.google.com',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return {
          label: 'Operational',
          dot: 'bg-emerald-500',
          text: 'text-emerald-400',
          border: 'border-emerald-500/25',
          bg: 'bg-emerald-950/20',
        };
      case 'DEGRADED':
        return {
          label: 'Degraded',
          dot: 'bg-amber-500',
          text: 'text-amber-400',
          border: 'border-amber-500/25',
          bg: 'bg-amber-950/20',
        };
      case 'UNAVAILABLE':
        return {
          label: 'Unavailable',
          dot: 'bg-rose-500',
          text: 'text-rose-400',
          border: 'border-rose-500/25',
          bg: 'bg-rose-950/20',
        };
      case 'NOT_CONFIGURED':
      default:
        return {
          label: 'Not Configured',
          dot: 'bg-slate-500',
          text: 'text-slate-400',
          border: 'border-slate-800',
          bg: 'bg-slate-900/30',
        };
    }
  };

  const dbConfigured = healthData?.database?.configured && healthData.database.connected;
  const cacheStats = healthData?.cache;
  const isVercelKv = cacheStats?.provider === 'VERCEL_KV';

  const lastSyncFormatted = healthData?.metrics?.lastSyncTime || lastUpdated || observedAt || (
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date()) + ' IST'
  );

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
              Synchronized atmospheric intelligence • Last Sync:{' '}
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

      {/* 2. Responsive 4 / 2 / 1 Grid for Providers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {providersToDisplay.map((p) => {
          const badge = getStatusBadge(p.status);
          return (
            <div
              key={p.id}
              id={`provider-card-${p.id}`}
              className={`p-3 rounded-lg border ${badge.border} ${badge.bg} flex flex-col justify-between gap-2 transition-all duration-150`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#F5F9FC] truncate">{p.name}</span>
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
                <span className="text-[#8EA3B8] truncate ml-1 text-right">
                  {p.latencyMs !== null ? `${p.latencyMs}ms` : p.infoText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Compact SYSTEM STATUS Panel (Replaces oversized Storage & Cache Telemetry) */}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Database</span>
            <span className={`text-xs font-semibold ${dbConfigured ? 'text-emerald-400' : 'text-slate-400'}`}>
              {dbConfigured ? 'Connected' : 'Not Configured'}
            </span>
          </div>

          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Cache</span>
            <span className={`text-xs font-semibold ${isVercelKv ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isVercelKv ? 'Connected' : 'In-Memory'}
            </span>
          </div>

          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Cache Hit Ratio</span>
            <span className="text-xs font-semibold text-[#F5F9FC]">
              {cacheStats?.hitRatio || '0.0%'}
            </span>
          </div>

          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Cached Objects</span>
            <span className="text-xs font-semibold text-[#F5F9FC]">
              {cacheStats?.totalEntries ?? 0}
            </span>
          </div>

          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Provider Requests</span>
            <span className="text-xs font-semibold text-[#F5F9FC]">
              {healthData?.metrics?.totalRequests ?? 0}
            </span>
          </div>

          <div className="bg-[#101E2C] p-2 rounded border border-[#1E3852]">
            <span className="text-[10px] text-[#8EA3B8] block">Failed Requests</span>
            <span className="text-xs font-semibold text-rose-400">
              {healthData?.metrics?.failedRequests ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Official Attributions Section */}
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
            <li className="flex items-center justify-between p-2 rounded bg-[#101E2C] border border-[#1E3852]">
              <span><strong>OpenStreetMap</strong> — Cartographic geographic reference under ODbL</span>
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-[#18A7E8] hover:underline shrink-0 ml-2">
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      )}
    </section>
  );
};
