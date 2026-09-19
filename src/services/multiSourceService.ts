// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Multi-Source Data Client Service
// Strictly Zero-Fake Data, Real Provider Metrics & Unified Telemetry
// ====================================================================

export type ProviderStatusCode = 'OPERATIONAL' | 'DEGRADED' | 'STALE' | 'NOT_CONFIGURED' | 'UNAVAILABLE';

export interface ProviderHealthDetail {
  code: string;
  name: string;
  category: 'GOVERNMENT' | 'COMMERCIAL' | 'OPEN_DATA';
  status: ProviderStatusCode;
  role?: string;
  fallback?: string | null;
  currentDataSource?: string | null;
  reason?: string | null;
  nextAction?: string | null;
  isConfigured: boolean;
  requiredKey: string | null;
  latency: number | null; // in ms
  last_success: string | null;
  last_failure: string | null;
  last_checked: string;
  requests: number;
  successful_requests: number;
  failed_requests: number;
  cache_hits: number;
  cache_misses: number;
  error: string | null;
  source: string;
  endpoint: string;
  attribution: string;
  attributionUrl?: string;
  latestObservation?: string | null;
}

export interface SystemHealthResponse {
  timestamp: string;
  database: {
    configured: boolean;
    connected: boolean;
    provider: 'POSTGRESQL' | 'NOT_CONFIGURED';
    latencyMs?: number | null;
    poolSize?: number;
    lastChecked: string;
    error?: string;
  };
  cache: {
    configured: boolean;
    connected: boolean;
    provider: 'UPSTASH_REDIS' | 'VERCEL_KV' | 'IN_MEMORY_DEGRADED' | string;
    totalEntries: number;
    hits: number;
    misses: number;
    hitRatio: string;
    hitRatioNumeric: number;
    lastPurge: string;
    totalRequests: number;
  };
  summary: {
    totalSources: number;
    operational: number;
    degraded: number;
    notConfigured: number;
    unavailable: number;
    activeProviders: number;
    providerAvailabilityPct: number;
    overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    lastSyncTime: string;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    cacheHits: number;
    cacheMisses: number;
    lastSyncTime: string;
  };
  providers: {
    openMeteo: ProviderHealthDetail;
    imd: ProviderHealthDetail;
    cpcb: ProviderHealthDetail;
    sachet: ProviderHealthDetail;
    incois: ProviderHealthDetail;
    radar: ProviderHealthDetail;
    accuweather: ProviderHealthDetail;
    googleWeather: ProviderHealthDetail;
  };
}

import { apiFetch } from './apiClient';

export class MultiSourceService {
  public static async fetchSystemHealth(): Promise<SystemHealthResponse | null> {
    try {
      return await apiFetch<SystemHealthResponse>('/api/system?mode=health', { timeoutMs: 5000, ttlMs: 60000 });
    } catch {
      return null;
    }
  }

  public static async fetchSystemProviders(): Promise<any[] | null> {
    try {
      const data = await apiFetch<any>('/api/system?mode=providers', { timeoutMs: 6000, ttlMs: 60000 });
      return data?.items || data?.providers || null;
    } catch {
      return null;
    }
  }

  public static async fetchSystemReadiness(): Promise<any | null> {
    try {
      return await apiFetch<any>('/api/system?mode=readiness', { timeoutMs: 5000, ttlMs: 30000 });
    } catch {
      return null;
    }
  }
}
