import React from 'react';
import {
  ShieldAlert,
  RefreshCw,
  Radio,
  Clock,
  ExternalLink,
  ChevronRight,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { WeatherSystemEvent, CycloneProviderHealth } from '../../types/cyclone';

interface CycloneHeaderProps {
  activeSystem: WeatherSystemEvent | null;
  providerHealth: {
    imdCyclone: CycloneProviderHealth;
    imdWarnings: CycloneProviderHealth;
    sachet: CycloneProviderHealth;
  };
  countdownSeconds: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const CycloneHeader: React.FC<CycloneHeaderProps> = ({
  activeSystem,
  providerHealth,
  countdownSeconds,
  isRefreshing,
  onRefresh,
}) => {
  const getProviderBadge = (health: CycloneProviderHealth, label: string) => {
    const isLive = health.status === 'LIVE';
    const isStale = health.status === 'STALE';
    const isUnavailable = health.status === 'UNAVAILABLE' || health.status === 'ERROR';

    let colorClass = 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/40';
    let dotClass = 'bg-[#10B981]';
    let statusText = 'LIVE';

    if (isStale) {
      colorClass = 'bg-[#EAB308]/15 text-[#FDE047] border-[#EAB308]/40';
      dotClass = 'bg-[#EAB308]';
      statusText = 'RECENT';
    } else if (isUnavailable) {
      colorClass = 'bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/40';
      dotClass = 'bg-[#EF4444]';
      statusText = 'UNAVAILABLE';
    }

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border ${colorClass}`}
        title={`${label}: ${statusText}${health.latencyMs ? ` (${health.latencyMs}ms)` : ''}`}
      >
        <span className={`w-2 h-2 rounded-full ${dotClass} ${isLive ? 'animate-pulse' : ''}`} />
        <span className="font-semibold text-slate-300">{label}:</span>
        <strong className="font-bold">{statusText}</strong>
        {health.latencyMs && isLive && (
          <span className="text-[10px] opacity-75 font-normal">({health.latencyMs}ms)</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#0B1523]/95 border border-[#1E3A5F] rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0284C7]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="flex flex-col gap-4 relative z-10">
        {/* Top bar: Classification badge + Live Provider Feeds */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E2E40]/80">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E74C3C]/15 border border-[#E74C3C]/40 text-[#FF6B6B]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                {activeSystem ? activeSystem.classification : 'SYNOPTIC SURVEILLANCE'}
              </span>
            </div>

            <span className="text-xs font-mono text-[#94A3B8] hidden sm:inline-block">
              {activeSystem ? activeSystem.basin : 'North Indian Ocean'}
            </span>

            {activeSystem?.bulletinNumber && (
              <span className="px-2.5 py-1 rounded bg-[#132337] border border-[#25486F] text-[#93C5FD] text-[11px] font-mono font-medium">
                {activeSystem.bulletinNumber}
              </span>
            )}
          </div>

          {/* Right: Live Feed Diagnostics */}
          <div className="flex items-center gap-2 flex-wrap">
            {getProviderBadge(providerHealth.imdCyclone, 'IMD Cyclone')}
            {getProviderBadge(providerHealth.imdWarnings, 'IMD CAP')}
            {getProviderBadge(providerHealth.sachet, 'SACHET')}

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#132337] hover:bg-[#1A314D] border border-[#25486F] text-xs font-semibold text-[#93C5FD] hover:text-white transition-all cursor-pointer ml-1"
              title="Force sync live IMD & SACHET bulletins"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Title & Synoptic Headline */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="text-[#38BDF8]">🌀</span>
              <span>{activeSystem ? activeSystem.name : 'No Active Cyclonic System'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              {activeSystem
                ? activeSystem.advisoryText || 'Official synoptic surveillance by India Meteorological Department & RSMC New Delhi.'
                : 'Current synoptic observation indicates no active depression or cyclonic disturbance in the Bay of Bengal or Arabian Sea. Continuous surveillance operational.'}
            </p>
          </div>

          {/* Countdown timer & Next Bulletin Outlook */}
          <div className="flex items-center gap-3 shrink-0 bg-[#0F172A]/80 border border-[#1E293B] rounded-xl px-4 py-2.5">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#64748B]">Auto Sync</span>
              <span className="text-xs font-mono font-bold text-[#E2E8F0]">{countdownSeconds}s</span>
            </div>
            <div className="h-6 w-px bg-[#1E293B] mx-1" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#64748B]">Source</span>
              <a
                href={activeSystem?.sourceUrl || 'https://rsmcnewdelhi.imd.gov.in'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#38BDF8] hover:underline inline-flex items-center gap-1"
              >
                <span>IMD/RSMC</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
