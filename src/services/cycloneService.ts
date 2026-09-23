// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Canonical Cyclone Service (Frontend Singleton)
// Real-time synchronization with server-side ingestion pipeline (/api/cyclone)
// Features 60-second auto-refresh, AbortController request deduplication,
// BroadcastChannel cross-tab sync, and event listeners.
// ====================================================================

import {
  CyclonePayload,
  WeatherSystemEvent,
  RegionalWarningStatus,
} from '../types/cyclone';

export class CycloneService {
  private static instance: CycloneService;

  private memoryCache: {
    payload: CyclonePayload;
    timestamp: number;
  } | null = null;

  private readonly CACHE_TTL_MS = 60 * 1000; // 60 seconds
  private inFlightPromise: Promise<CyclonePayload> | null = null;
  private abortController: AbortController | null = null;

  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<(data: CyclonePayload) => void> = new Set();
  private autoRefreshTimer: any = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel('mausam-cyclone-v1');
          this.broadcastChannel.onmessage = (event) => {
            if (event.data?.type === 'CYCLONE_SYNC' && event.data.payload) {
              this.memoryCache = {
                payload: event.data.payload,
                timestamp: event.data.timestamp || Date.now(),
              };
              this.notifyListeners();
            }
          };
        }
      } catch {
        // Fallback
      }

      // Reconnect and tab focus auto-sync
      window.addEventListener('online', () => {
        this.fetchCycloneData(true).catch(() => {});
      });

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.isCacheStale()) {
          this.fetchCycloneData(true).catch(() => {});
        }
      });

      // Start 60-second background ticker
      this.autoRefreshTimer = setInterval(() => {
        this.fetchCycloneData(false).catch(() => {});
      }, 60 * 1000);
    }
  }

  public static getInstance(): CycloneService {
    if (!CycloneService.instance) {
      CycloneService.instance = new CycloneService();
    }
    return CycloneService.instance;
  }

  public isCacheStale(): boolean {
    if (!this.memoryCache) return true;
    return Date.now() - this.memoryCache.timestamp > this.CACHE_TTL_MS;
  }

  public getCachedPayload(): CyclonePayload | null {
    return this.memoryCache?.payload || null;
  }

  /**
   * Primary fetch for canonical cyclone & regional warnings payload
   */
  public async fetchCycloneData(forceRefresh = false): Promise<CyclonePayload> {
    const now = Date.now();

    // 1. Return fresh memory cache if available and not forced
    if (!forceRefresh && this.memoryCache && now - this.memoryCache.timestamp < this.CACHE_TTL_MS) {
      return this.memoryCache.payload;
    }

    // 2. Reuse in-flight promise to avoid duplicate concurrent calls
    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    // Abort any older pending fetch
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    this.inFlightPromise = (async () => {
      try {
        const baseUrl = typeof window !== 'undefined' ? '' : 'http://127.0.0.1:3000';
        const query = forceRefresh ? '?mode=bundle&force=1' : '?mode=bundle';
        const targetUrl = `${baseUrl}/api/cyclone${query}`;

        const res = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          signal: this.abortController?.signal,
        });

        if (!res.ok) {
          throw new Error(`Cyclone API returned status ${res.status}`);
        }

        const data: CyclonePayload = await res.json();

        this.memoryCache = {
          payload: data,
          timestamp: now,
        };

        // Broadcast to other tabs
        try {
          this.broadcastChannel?.postMessage({
            type: 'CYCLONE_SYNC',
            payload: data,
            timestamp: now,
          });
        } catch {
          // Ignore
        }

        this.notifyListeners();
        return data;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          if (this.memoryCache) return this.memoryCache.payload;
        }

        // If cache exists, fall back to stale cache with truthful health
        if (this.memoryCache) {
          return {
            ...this.memoryCache.payload,
            providerHealth: {
              imdCyclone: { ...this.memoryCache.payload.providerHealth.imdCyclone, status: 'STALE' },
              imdWarnings: { ...this.memoryCache.payload.providerHealth.imdWarnings, status: 'STALE' },
              sachet: { ...this.memoryCache.payload.providerHealth.sachet, status: 'STALE' },
            },
          };
        }

        throw err;
      } finally {
        this.inFlightPromise = null;
      }
    })();

    return this.inFlightPromise;
  }

  public async getActiveSystem(): Promise<WeatherSystemEvent | null> {
    const payload = await this.fetchCycloneData();
    return payload.systems[0] || null;
  }

  public async getRegionalWarnings(): Promise<RegionalWarningStatus[]> {
    const payload = await this.fetchCycloneData();
    return payload.regionalWarnings;
  }

  public async getRegionalWarningForState(
    stateOrCode: string
  ): Promise<RegionalWarningStatus | null> {
    const payload = await this.fetchCycloneData();
    const clean = (stateOrCode || '').toLowerCase().trim();
    return (
      payload.regionalWarnings.find(
        (r) =>
          r.regionName.toLowerCase() === clean ||
          r.regionCode.toLowerCase() === clean ||
          r.regionName.toLowerCase().includes(clean)
      ) || null
    );
  }

  public subscribe(listener: (data: CyclonePayload) => void): () => void {
    this.listeners.add(listener);
    if (this.memoryCache) {
      listener(this.memoryCache.payload);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    if (!this.memoryCache) return;
    const payload = this.memoryCache.payload;
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch {
        // Safe dispatch
      }
    });
  }
}

export const cycloneService = CycloneService.getInstance();
