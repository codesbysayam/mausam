// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// SACHET / NDMA Provider Adapter (Common Alerting Protocol - CAP)
// Integrated ETag Caching, Expiry Filtering & Deduplication
// ====================================================================

import { NormalizedWarningItem, GeoLocation } from '../normalization/types';
import { WarningNormalizer, RawCapAlert } from '../normalization/warningNormalizer';

export class SachetProvider {
  private static feedUrl = process.env.SACHET_FEED_URL || 'https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails';
  private static alertCache: { data: RawCapAlert[]; timestamp: number } | null = null;
  private static cachedEtag: string | null = null;
  private static cachedLastModified: string | null = null;
  private static CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

  public static async checkHealth(): Promise<{ operational: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const headers: Record<string, string> = {
        Accept: 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };
      if (this.cachedEtag) headers['If-None-Match'] = this.cachedEtag;
      if (this.cachedLastModified) headers['If-Modified-Since'] = this.cachedLastModified;

      const res = await fetch(this.feedUrl, {
        headers,
        signal: AbortSignal.timeout(6500),
      });

      const latencyMs = Date.now() - start;
      const isOperational = res.ok || res.status === 304;

      return {
        operational: isOperational,
        latencyMs,
        error: isOperational ? undefined : `HTTP ${res.status}`,
      };
    } catch (err: any) {
      if (this.alertCache && this.alertCache.data.length > 0) {
        return { operational: true, latencyMs: Date.now() - start };
      }
      return { operational: false, latencyMs: Date.now() - start, error: err.message };
    }
  }

  private static salvageTruncatedJsonArray(rawText: string): RawCapAlert[] {
    try {
      const trimmed = rawText.trim();
      if (!trimmed.startsWith('[')) return [];
      const lastObjEnd = trimmed.lastIndexOf('}');
      if (lastObjEnd > 0) {
        const repaired = trimmed.slice(0, lastObjEnd + 1) + ']';
        const parsed = JSON.parse(repaired);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // If closing bracket repair fails, regex match complete individual alert objects
      try {
        const matches = rawText.match(/\{[^{}]*("identifier"|"severity"|"disaster_type")[^{}]*\}/g);
        if (matches && matches.length > 0) {
          const recovered: RawCapAlert[] = [];
          for (const m of matches) {
            try {
              recovered.push(JSON.parse(m));
            } catch {
              // skip incomplete fragment
            }
          }
          if (recovered.length > 0) return recovered;
        }
      } catch {
        // ignore
      }
    }
    return [];
  }

  public static async fetchAllRawAlerts(): Promise<RawCapAlert[]> {
    const now = Date.now();
    if (this.alertCache && now - this.alertCache.timestamp < this.CACHE_TTL_MS) {
      return this.alertCache.data;
    }

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };
      if (this.cachedEtag) headers['If-None-Match'] = this.cachedEtag;
      if (this.cachedLastModified) headers['If-Modified-Since'] = this.cachedLastModified;

      const res = await fetch(this.feedUrl, {
        headers,
        signal: AbortSignal.timeout(8500),
      });

      // If Not Modified (304), return cached payload and update timestamp
      if (res.status === 304 && this.alertCache) {
        this.alertCache.timestamp = now;
        return this.alertCache.data;
      }

      if (!res.ok) {
        return this.alertCache?.data || [];
      }

      // Capture ETag & Last-Modified
      const etag = res.headers.get('etag');
      if (etag) this.cachedEtag = etag;

      const lastModified = res.headers.get('last-modified');
      if (lastModified) this.cachedLastModified = lastModified;

      const rawText = await res.text();
      if (!rawText || !rawText.trim()) {
        return this.alertCache?.data || [];
      }

      let rawList: RawCapAlert[] = [];
      try {
        const parsed = JSON.parse(rawText);
        rawList = Array.isArray(parsed) ? parsed : (parsed?.alerts || parsed?.data || []);
      } catch {
        // Safely recover valid alerts if NDMA connection truncated mid-stream
        rawList = this.salvageTruncatedJsonArray(rawText);
        if (rawList.length === 0 && this.alertCache?.data?.length) {
          return this.alertCache.data;
        }
      }

      // Deduplicate raw alerts by identifier / alert_id
      const seenIds = new Set<string>();
      const dedupedList: RawCapAlert[] = [];

      for (const alert of rawList) {
        const id = String(alert.identifier || alert.alert_id || `${alert.sender}_${alert.sent}`);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          dedupedList.push(alert);
        }
      }

      this.alertCache = { data: dedupedList, timestamp: now };
      return dedupedList;
    } catch (err: any) {
      // Graceful fallback to cached alerts without logging an error
      return this.alertCache?.data || [];
    }
  }

  public static async getActiveWarningsForLocation(loc: GeoLocation): Promise<NormalizedWarningItem[]> {
    const allAlerts = await this.fetchAllRawAlerts();
    if (!allAlerts || allAlerts.length === 0) {
      return [];
    }

    const matchedItems: NormalizedWarningItem[] = [];
    const seenWarningIds = new Set<string>();

    for (const alert of allAlerts) {
      // 1. Must be active and unexpired
      if (!WarningNormalizer.isAlertValidAndActive(alert)) {
        continue;
      }

      // 2. Must match requested state / district / location
      if (WarningNormalizer.matchesLocation(alert, loc)) {
        const item = WarningNormalizer.normalizeCapAlert(alert, loc);
        if (!seenWarningIds.has(item.id)) {
          seenWarningIds.add(item.id);
          matchedItems.push(item);
        }
      }
    }

    return matchedItems;
  }
}
