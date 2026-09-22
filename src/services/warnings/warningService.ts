// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Canonical Warning Service (Single Source of Truth)
// Consumes live SACHET CAP / RSS feeds with 60s refresh, ETag/304 caching,
// strict expiry filtering, and zero mock data in production.
// ====================================================================

import {
  WeatherWarning,
  WarningFeedDiagnostics,
  LocationWarningResult,
  WarningSeverity,
} from '../../types/warnings';
import { parseSachetFeed } from './sachetCapParser';
import { INDIA_STATES_UTS, IndiaRegion } from '../../data/indiaRegions';
import { LocationRecord } from '../../types';

class WarningService {
  private static instance: WarningService;

  private memoryCache: {
    warnings: WeatherWarning[];
    diagnostics: WarningFeedDiagnostics;
    timestamp: number;
    etag: string | null;
  } | null = null;

  private readonly CACHE_TTL_MS = 60 * 1000; // 60 seconds fresh TTL
  private readonly STALE_TTL_MS = 15 * 60 * 1000; // 15 minutes max stale retention
  private inFlightPromise: Promise<{
    warnings: WeatherWarning[];
    diagnostics: WarningFeedDiagnostics;
  }> | null = null;

  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<(data: { warnings: WeatherWarning[]; diagnostics: WarningFeedDiagnostics }) => void> = new Set();
  private autoRefreshTimer: ReturnType<typeof setInterval> | null = null;
  private activeSubscribers = 0;

  private constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('mausam-warnings-v2');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'WARNINGS_SYNC' && event.data.payload) {
            this.memoryCache = {
              warnings: event.data.payload.warnings,
              diagnostics: event.data.payload.diagnostics,
              timestamp: event.data.timestamp || Date.now(),
              etag: event.data.etag || null,
            };
            this.notifyListeners();
          }
        };
      } catch {
        // Fallback for environments without BroadcastChannel
      }

      // Add listener for network reconnect
      window.addEventListener('online', () => {
        this.fetchWarnings(true).catch(() => {});
      });

      // Add listener for tab focus / visibility
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.isCacheStale()) {
          this.fetchWarnings(true).catch(() => {});
        }
      });
    }
  }

  public static getInstance(): WarningService {
    if (!WarningService.instance) {
      WarningService.instance = new WarningService();
    }
    return WarningService.instance;
  }

  private isCacheStale(): boolean {
    if (!this.memoryCache) return true;
    return Date.now() - this.memoryCache.timestamp > this.CACHE_TTL_MS;
  }

  /**
   * Primary fetch for all warnings across India
   */
  public async fetchWarnings(forceRefresh = false): Promise<{
    warnings: WeatherWarning[];
    activeWarnings: WeatherWarning[];
    diagnostics: WarningFeedDiagnostics;
  }> {
    const now = Date.now();

    // 1. Return fresh memory cache if valid and not forced
    if (!forceRefresh && this.memoryCache && now - this.memoryCache.timestamp < this.CACHE_TTL_MS) {
      const active = this.filterActiveWarnings(this.memoryCache.warnings);
      return {
        warnings: this.memoryCache.warnings,
        activeWarnings: active,
        diagnostics: this.memoryCache.diagnostics,
      };
    }

    // 2. Reuse in-flight request to prevent duplicate concurrent network calls
    if (this.inFlightPromise) {
      const res = await this.inFlightPromise;
      return {
        warnings: res.warnings,
        activeWarnings: this.filterActiveWarnings(res.warnings),
        diagnostics: res.diagnostics,
      };
    }

    this.inFlightPromise = (async () => {
      const attemptIso = new Date().toISOString();
      try {
        const headers: Record<string, string> = {
          Accept: 'application/json, application/xml, text/xml, */*',
        };
        if (!forceRefresh && this.memoryCache?.etag && this.memoryCache.warnings.length > 0) {
          headers['If-None-Match'] = this.memoryCache.etag;
        }

        const baseUrl =
          typeof window !== 'undefined'
            ? ''
            : 'http://127.0.0.1:3000';
        const query = forceRefresh ? '?mode=feed&force=1' : '?mode=feed';
        const targetUrl = `${baseUrl}/api/warnings${query}`;
        const res = await fetch(targetUrl, {
          method: 'GET',
          headers,
        });

        // 3. Handle 304 Not Modified
        if (res.status === 304 && this.memoryCache) {
          this.memoryCache.timestamp = now;
          this.memoryCache.diagnostics.cacheStatus = 'FRESH';
          this.memoryCache.diagnostics.status = 'LIVE';
          return {
            warnings: this.memoryCache.warnings,
            diagnostics: this.memoryCache.diagnostics,
          };
        }

        if (!res.ok) {
          throw new Error(`Upstream server responded with HTTP ${res.status}`);
        }

        const etag = res.headers.get('etag');
        const text = await res.text();
        const parsed = parseSachetFeed(text, attemptIso);

        const activeWarnings = this.filterActiveWarnings(parsed.warnings);
        const expiredCount = parsed.warnings.length - activeWarnings.length;

        const diagnostics: WarningFeedDiagnostics = {
          status: 'LIVE',
          lastFetchedAt: attemptIso,
          lastSuccessfulFetchAt: attemptIso,
          lastAttemptAt: attemptIso,
          totalAlertsReceived: parsed.rawCount,
          activeAlertsCount: activeWarnings.length,
          expiredAlertsCount: expiredCount,
          httpStatus: res.status,
          endpoint: 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml',
          cacheStatus: 'FRESH',
          error: null,
        };

        this.memoryCache = {
          warnings: parsed.warnings,
          diagnostics,
          timestamp: now,
          etag,
        };

        // Broadcast to other tabs
        try {
          this.broadcastChannel?.postMessage({
            type: 'WARNINGS_SYNC',
            payload: { warnings: parsed.warnings, diagnostics },
            timestamp: now,
            etag,
          });
        } catch {
          // Ignore
        }

        this.notifyListeners();

        return {
          warnings: parsed.warnings,
          diagnostics,
        };
      } catch (err: any) {
        const errorMsg = err?.message || 'Warning network stream unavailable';

        // 4. Stale cache fallback (retains truthfulness)
        if (this.memoryCache && now - this.memoryCache.timestamp < this.STALE_TTL_MS) {
          const staleDiag: WarningFeedDiagnostics = {
            ...this.memoryCache.diagnostics,
            status: 'STALE',
            lastAttemptAt: attemptIso,
            cacheStatus: 'STALE',
            error: errorMsg,
          };
          return {
            warnings: this.memoryCache.warnings,
            diagnostics: staleDiag,
          };
        }

        // 5. Zero-cache unavailable state
        const unavailDiag: WarningFeedDiagnostics = {
          status: 'UNAVAILABLE',
          lastFetchedAt: null,
          lastSuccessfulFetchAt: null,
          lastAttemptAt: attemptIso,
          totalAlertsReceived: 0,
          activeAlertsCount: 0,
          expiredAlertsCount: 0,
          httpStatus: null,
          endpoint: 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml',
          cacheStatus: 'MISS',
          error: errorMsg,
        };

        return {
          warnings: [],
          diagnostics: unavailDiag,
        };
      } finally {
        this.inFlightPromise = null;
      }
    })();

    const result = await this.inFlightPromise;
    return {
      warnings: result.warnings,
      activeWarnings: this.filterActiveWarnings(result.warnings),
      diagnostics: result.diagnostics,
    };
  }

  /**
   * Filter active warnings strictly excluding expired ones
   */
  public filterActiveWarnings(warnings: WeatherWarning[]): WeatherWarning[] {
    const now = Date.now();
    return warnings.filter((w) => {
      if (w.status === 'EXPIRED' || w.status === 'CANCELLED') return false;
      if (w.validUntil) {
        const exp = new Date(w.validUntil).getTime();
        if (!isNaN(exp) && exp < now) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Get warning for a specific location across all 28 states and 8 UTs
   */
  public async getWarningForLocation(
    location?: LocationRecord | { state?: string; district?: string; city?: string; lat?: number; lng?: number; country?: string },
    forceRefresh = false
  ): Promise<LocationWarningResult> {
    const isInternational =
      location?.country &&
      !location.country.toLowerCase().includes('india') &&
      location.country.toLowerCase() !== 'in';

    const locName =
      (location && 'name' in location ? location.name : null) ||
      location?.city ||
      location?.district ||
      location?.state ||
      'India';

    if (isInternational) {
      const nowIso = new Date().toISOString();
      return {
        status: 'LIVE',
        primaryWarning: null,
        allLocationWarnings: [],
        additionalCount: 0,
        locationName: locName,
        isAllClear: false,
        diagnostics: {
          status: 'LIVE',
          lastFetchedAt: nowIso,
          lastSuccessfulFetchAt: nowIso,
          lastAttemptAt: nowIso,
          totalAlertsReceived: 0,
          activeAlertsCount: 0,
          expiredAlertsCount: 0,
          httpStatus: 200,
          endpoint: 'N/A',
          cacheStatus: 'FRESH',
          error: null,
        },
      };
    }

    const { activeWarnings, diagnostics } = await this.fetchWarnings(forceRefresh);

    if (diagnostics.status === 'UNAVAILABLE') {
      return {
        status: 'UNAVAILABLE',
        primaryWarning: null,
        allLocationWarnings: [],
        additionalCount: 0,
        locationName: locName,
        isAllClear: false,
        diagnostics,
      };
    }

    // Match alerts for location
    const matched = this.matchWarningsForLocation(activeWarnings, location);

    // Sort matched by severity (RED > ORANGE > YELLOW > GREEN)
    matched.sort((a, b) => getSeverityRank(b.severity) - getSeverityRank(a.severity));

    const primary = matched.length > 0 ? matched[0] : null;

    return {
      status: diagnostics.status,
      primaryWarning: primary,
      allLocationWarnings: matched,
      additionalCount: Math.max(0, matched.length - 1),
      locationName: locName,
      isAllClear: matched.length === 0,
      diagnostics,
    };
  }

  /**
   * Location matching across state name, state code, district, and coordinates
   */
  private matchWarningsForLocation(
    warnings: WeatherWarning[],
    loc?: { state?: string; district?: string; city?: string; lat?: number; lng?: number }
  ): WeatherWarning[] {
    if (!loc) return warnings;

    const terms: string[] = [];
    if (loc.state) terms.push(loc.state.toLowerCase().trim());
    if (loc.district) terms.push(loc.district.toLowerCase().trim());
    if (loc.city) terms.push(loc.city.toLowerCase().trim());

    // Resolve state aliases if any
    const stateObj = INDIA_STATES_UTS.find(
      (s) =>
        (loc.state && s.name.toLowerCase() === loc.state.toLowerCase()) ||
        (loc.state && s.code.toLowerCase() === loc.state.toLowerCase()) ||
        (loc.district && s.districts?.some((d) => d.toLowerCase() === loc.district?.toLowerCase()))
    );

    if (stateObj) {
      terms.push(stateObj.name.toLowerCase());
      terms.push(stateObj.code.toLowerCase());
    }

    if (terms.length === 0 && !loc.lat && !loc.lng) {
      return warnings;
    }

    return warnings.filter((w) => {
      // 1. Direct state match
      if (loc.state && w.state && w.state.toLowerCase() === loc.state.toLowerCase()) {
        return true;
      }

      // 2. Direct district match
      if (loc.district && w.district && w.district.toLowerCase() === loc.district.toLowerCase()) {
        return true;
      }

      // 3. Match within affectedRegions array
      const hasRegionMatch = w.affectedRegions?.some((r) => {
        const rLower = r.toLowerCase();
        return terms.some((t) => rLower.includes(t) || t.includes(rLower));
      });
      if (hasRegionMatch) return true;

      // 4. Match within title and description
      const text = `${w.title} ${w.description || ''}`.toLowerCase();
      const hasTextMatch = terms.some((t) => {
        if (t.length < 3) return false;
        return text.includes(t);
      });
      if (hasTextMatch) return true;

      // 5. Geographic distance fallback if coordinates available
      if (
        typeof loc.lat === 'number' &&
        typeof loc.lng === 'number' &&
        typeof w.latitude === 'number' &&
        typeof w.longitude === 'number'
      ) {
        const dist = calculateHaversineKm(loc.lat, loc.lng, w.latitude, w.longitude);
        if (dist <= 80) return true;
      }

      return false;
    });
  }

  /**
   * Get all active non-expired warnings across India
   */
  public async getAllActiveWarnings(forceRefresh = false): Promise<WeatherWarning[]> {
    const { activeWarnings } = await this.fetchWarnings(forceRefresh);
    return activeWarnings;
  }

  /**
   * National summary statistics
   */
  public async getNationalStats(forceRefresh = false): Promise<{
    totalActive: number;
    redCount: number;
    orangeCount: number;
    yellowCount: number;
    affectedStates: string[];
    diagnostics: WarningFeedDiagnostics;
  }> {
    const { activeWarnings, diagnostics } = await this.fetchWarnings(forceRefresh);

    let red = 0;
    let orange = 0;
    let yellow = 0;
    const states = new Set<string>();

    for (const w of activeWarnings) {
      if (w.severity === 'RED') red++;
      else if (w.severity === 'ORANGE') orange++;
      else if (w.severity === 'YELLOW') yellow++;

      if (w.state) states.add(w.state);
    }

    return {
      totalActive: activeWarnings.length,
      redCount: red,
      orangeCount: orange,
      yellowCount: yellow,
      affectedStates: Array.from(states),
      diagnostics,
    };
  }

  /**
   * Subscribe to live 60-second auto-refresh
   */
  public subscribe(
    callback: (data: { warnings: WeatherWarning[]; diagnostics: WarningFeedDiagnostics }) => void
  ): () => void {
    this.listeners.add(callback);
    this.activeSubscribers++;

    // Start 60s timer if first subscriber
    if (!this.autoRefreshTimer) {
      this.autoRefreshTimer = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) {
          return;
        }
        this.fetchWarnings(true).catch(() => {});
      }, 60000);
    }

    // Immediately trigger with current cache if available
    if (this.memoryCache) {
      callback({
        warnings: this.filterActiveWarnings(this.memoryCache.warnings),
        diagnostics: this.memoryCache.diagnostics,
      });
    } else {
      this.fetchWarnings().catch(() => {});
    }

    return () => {
      this.listeners.delete(callback);
      this.activeSubscribers--;
      if (this.activeSubscribers <= 0 && this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
        this.autoRefreshTimer = null;
      }
    };
  }

  private notifyListeners(): void {
    if (!this.memoryCache) return;
    const data = {
      warnings: this.filterActiveWarnings(this.memoryCache.warnings),
      diagnostics: this.memoryCache.diagnostics,
    };
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (err) {
        console.error('[WarningService] Listener error:', err);
      }
    }
  }
}

function getSeverityRank(sev: WarningSeverity): number {
  switch (sev) {
    case 'RED':
      return 4;
    case 'ORANGE':
      return 3;
    case 'YELLOW':
      return 2;
    case 'GREEN':
      return 1;
    default:
      return 0;
  }
}

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const warningService = WarningService.getInstance();
export default warningService;

/**
 * Universal helper for Ask MAUSAM and conversational context builders
 */
export async function getActiveWarningsForLocation(
  state?: string,
  district?: string,
  city?: string
): Promise<{
  status: 'ACTIVE_WARNINGS' | 'NO_ACTIVE_WARNINGS' | 'UNAVAILABLE';
  warnings: WeatherWarning[];
  source: string;
  summaryText: string;
}> {
  try {
    const res = await warningService.getWarningForLocation({ state, district, city });
    if (res.status === 'UNAVAILABLE') {
      return {
        status: 'UNAVAILABLE',
        warnings: [],
        source: 'NDMA/SACHET',
        summaryText: 'Official warning service currently unreachable.',
      };
    }
    if (res.allLocationWarnings && res.allLocationWarnings.length > 0) {
      return {
        status: 'ACTIVE_WARNINGS',
        warnings: res.allLocationWarnings,
        source: res.primaryWarning?.source || 'NDMA/SACHET',
        summaryText: res.primaryWarning?.title || `${res.allLocationWarnings.length} active warnings in effect.`,
      };
    }
    return {
      status: 'NO_ACTIVE_WARNINGS',
      warnings: [],
      source: 'NDMA/SACHET',
      summaryText: 'No active official warnings for this location.',
    };
  } catch {
    return {
      status: 'UNAVAILABLE',
      warnings: [],
      source: 'NDMA/SACHET',
      summaryText: 'Official warning service currently unreachable.',
    };
  }
}

