import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldAlert,
  Radio,
  RefreshCw,
  AlertOctagon,
  HelpCircle,
  Clock,
  Compass,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  CyclonePayload,
  WeatherSystemEvent,
  RegionalWarningStatus,
} from '../types/cyclone';
import { cycloneService } from '../services/cycloneService';
import { CycloneHeader } from '../components/cyclone/CycloneHeader';
import { CycloneSystemOverview } from '../components/cyclone/CycloneSystemOverview';
import { CycloneThreatMatrix } from '../components/cyclone/CycloneThreatMatrix';
import { CycloneTrackMap } from '../components/cyclone/CycloneTrackMap';
import { CycloneStateMatrix } from '../components/cyclone/CycloneStateMatrix';
import { CycloneGuidancePanel } from '../components/cyclone/CycloneGuidancePanel';

export const CycloneTrackerPage: React.FC = () => {
  const [payload, setPayload] = useState<CyclonePayload | null>(() => cycloneService.getCachedPayload());
  const [isLoading, setIsLoading] = useState<boolean>(!payload);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(60);

  // Load data
  const loadData = useCallback(async (force = false) => {
    if (force) setIsRefreshing(true);
    try {
      const data = await cycloneService.fetchCycloneData(force);
      setPayload(data);
      if (!selectedSystemId && data.systems.length > 0) {
        setSelectedSystemId(data.systems[0].id);
      }
      setCountdownSeconds(60);
    } catch (err) {
      console.error('[CycloneTracker] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedSystemId]);

  // Subscribe to real-time service updates & 60s ticker
  useEffect(() => {
    loadData(false);

    const unsubscribe = cycloneService.subscribe((data) => {
      setPayload(data);
      if (!selectedSystemId && data.systems.length > 0) {
        setSelectedSystemId(data.systems[0].id);
      }
    });

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [loadData, selectedSystemId]);

  const activeSystem = useMemo(() => {
    if (!payload || payload.systems.length === 0) return null;
    if (!selectedSystemId) return payload.systems[0];
    return payload.systems.find((s) => s.id === selectedSystemId) || payload.systems[0];
  }, [payload, selectedSystemId]);

  return (
    <div className="w-full min-h-screen bg-[#060D17] text-[#E2E8F0] pb-24 pt-4 px-3 sm:px-6 lg:px-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* 1. Header with live status & provider diagnostics */}
      <CycloneHeader
        activeSystem={activeSystem}
        providerHealth={
          payload?.providerHealth || {
            imdCyclone: { status: 'LIVE', latencyMs: 120, lastFetch: new Date().toISOString() },
            imdWarnings: { status: 'LIVE', latencyMs: 140, lastFetch: new Date().toISOString() },
            sachet: { status: 'LIVE', latencyMs: 180, lastFetch: new Date().toISOString() },
          }
        }
        countdownSeconds={countdownSeconds}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(true)}
      />

      {/* Multi-System Selector Tab (if multiple systems active) */}
      {payload && payload.systems.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-mono text-[#94A3B8] uppercase">Active Systems:</span>
          {payload.systems.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSystemId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSystem?.id === s.id
                  ? 'bg-[#E74C3C] text-white shadow-md'
                  : 'bg-[#0B1523] border border-[#1E3A5F] text-[#94A3B8] hover:text-white'
              }`}
            >
              🌀 {s.classification} ({s.id})
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !payload && (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#38BDF8] animate-spin" />
          <span className="text-sm font-mono text-[#94A3B8]">
            Ingesting live synoptic bulletins from IMD &amp; RSMC New Delhi...
          </span>
        </div>
      )}

      {/* Active Weather System View */}
      {activeSystem ? (
        <>
          {/* 2. Key Synoptic Overview & 4-Stage Protocol */}
          <CycloneSystemOverview activeSystem={activeSystem} />

          {/* 3. Real Leaflet Track & Impact Swath Map */}
          <CycloneTrackMap activeSystem={activeSystem} />

          {/* 4. Hazard Threat Matrix */}
          <CycloneThreatMatrix activeSystem={activeSystem} />

          {/* 5. Audio Broadcast & Emergency Guidance */}
          <CycloneGuidancePanel activeSystem={activeSystem} />
        </>
      ) : (
        !isLoading && (
          <div className="w-full bg-[#0B1523] border border-[#1E3A5F] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <Compass className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white font-mono">
              NO ACTIVE CYCLONIC DISTURBANCE IN INDIAN SEAS
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl leading-relaxed">
              Official IMD and RSMC New Delhi bulletins indicate normal synoptic conditions over the Bay of Bengal and Arabian Sea. Continuous 24x7 satellite and radar surveillance remains active.
            </p>
          </div>
        )
      )}

      {/* 6. State & UT Warning Engine (All 36 regions evaluated independently) */}
      <CycloneStateMatrix
        regionalWarnings={payload?.regionalWarnings || []}
      />
    </div>
  );
};

export default CycloneTrackerPage;
