// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// SACHET / NDMA Provider Adapter (Common Alerting Protocol - CAP)
// ====================================================================

import { NormalizedWarningItem, GeoLocation } from '../normalization/types';
import { WarningNormalizer, RawCapAlert } from '../normalization/warningNormalizer';

export class SachetProvider {
  private static feedUrl = process.env.SACHET_FEED_URL || 'https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails';
  private static alertCache: { data: RawCapAlert[]; timestamp: number } | null = null;
  private static CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

  public static async checkHealth(): Promise<{ operational: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const res = await fetch(this.feedUrl, {
        headers: { Accept: 'application/json', 'User-Agent': 'MAUSAM-Disaster-Engine/3.0' },
        signal: AbortSignal.timeout(5000),
      });
      return {
        operational: res.ok,
        latencyMs: Date.now() - start,
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (err: any) {
      return { operational: false, latencyMs: Date.now() - start, error: err.message };
    }
  }

  public static async fetchAllRawAlerts(): Promise<RawCapAlert[]> {
    const now = Date.now();
    if (this.alertCache && now - this.alertCache.timestamp < this.CACHE_TTL_MS) {
      return this.alertCache.data;
    }

    try {
      const res = await fetch(this.feedUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MAUSAM-Disaster-Engine/3.0',
        },
        signal: AbortSignal.timeout(6500),
      });

      if (!res.ok) {
        return this.alertCache?.data || [];
      }

      const json = await res.json();
      const rawList = Array.isArray(json) ? json : [];
      this.alertCache = { data: rawList, timestamp: now };
      return rawList;
    } catch (err: any) {
      console.warn('[SACHET Provider] Feed fetch error:', err.message);
      return this.alertCache?.data || [];
    }
  }

  public static async getActiveWarningsForLocation(loc: GeoLocation): Promise<NormalizedWarningItem[]> {
    const allAlerts = await this.fetchAllRawAlerts();
    if (!allAlerts || allAlerts.length === 0) {
      return [];
    }

    const matchedItems: NormalizedWarningItem[] = [];

    for (const alert of allAlerts) {
      // Must be active and unexpired
      if (!WarningNormalizer.isAlertValidAndActive(alert)) {
        continue;
      }

      // Must match requested state / district / location
      if (WarningNormalizer.matchesLocation(alert, loc)) {
        matchedItems.push(WarningNormalizer.normalizeCapAlert(alert, loc));
      }
    }

    return matchedItems;
  }
}
