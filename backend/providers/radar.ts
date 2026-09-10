// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Doppler Radar Provider (RainViewer Weather Maps & IMD DWR Network)
// ====================================================================

import { RadarFrameInfo, DataStatus } from '../normalization/types';

export class RadarProvider {
  private static rainviewerApi = 'https://api.rainviewer.com/public/weather-maps.json';
  private static cachedMeta: { data: any; timestamp: number } | null = null;
  private static CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

  public static async checkHealth(): Promise<{ operational: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const res = await fetch(this.rainviewerApi, {
        headers: { 'User-Agent': 'MAUSAM-Radar/3.0' },
        signal: AbortSignal.timeout(4000),
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

  public static async fetchLatestFrame(): Promise<RadarFrameInfo | null> {
    const now = Date.now();
    let meta = this.cachedMeta?.data;

    if (!meta || now - (this.cachedMeta?.timestamp || 0) > this.CACHE_TTL_MS) {
      try {
        const res = await fetch(this.rainviewerApi, {
          headers: { 'User-Agent': 'MAUSAM-Radar/3.0' },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          meta = await res.json();
          this.cachedMeta = { data: meta, timestamp: now };
        }
      } catch (err: any) {
        console.warn('[RadarProvider] Failed to fetch weather-maps metadata:', err.message);
      }
    }

    if (!meta) {
      return null;
    }

    const host = meta.host || 'https://tilecache.rainviewer.com';
    const radarFrames = meta.radar?.past;

    if (!radarFrames || !Array.isArray(radarFrames) || radarFrames.length === 0) {
      return null;
    }

    // Get the absolute latest available radar frame
    const latest = radarFrames[radarFrames.length - 1];
    const frameEpoch = typeof latest.time === 'number' ? latest.time : Math.floor(Date.now() / 1000);
    const observedTime = new Date(frameEpoch * 1000).toISOString();

    const ageSeconds = Math.max(0, Math.round((Date.now() - frameEpoch * 1000) / 1000));
    let status: DataStatus = 'LIVE';
    if (ageSeconds > 45 * 60) {
      status = 'RECENT';
    }
    if (ageSeconds > 180 * 60) {
      status = 'STALE';
    }

    const path = latest.path || `/v2/radar/${frameEpoch}/256`;
    const tileUrl = `${host}${path}/0/0/0/2/1_1.png`;

    return {
      source: 'RainViewer Open Weather Maps API',
      observedTime,
      frameEpoch,
      path,
      tileUrl,
      radarHost: host,
      status,
      lastUpdated: new Date().toISOString(),
    };
  }
}
