// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Reusable Server-Side Radar Service
// Metadata, frames, radar stations, and satellite imagery telemetry
// Strictly truthful: no fake frames, no synthetic echo timestamps
// ====================================================================

import { IMD_DOPPLER_RADAR_NETWORK, findNearestRadarStation } from '../../data/radarStations';
import { serverCache } from './cacheService';

const INSAT_URLS: Record<string, string> = {
  ir1: 'https://mausam.imd.gov.in/Satellite/Converted/IR1.gif',
  vis: 'https://mausam.imd.gov.in/Satellite/Converted/VIS.gif',
  wv: 'https://mausam.imd.gov.in/Satellite/Converted/WV.gif',
  rgb: 'https://mausam.imd.gov.in/Satellite/Converted/RGB.gif',
};

export class RadarService {
  private static instance: RadarService;

  public static getInstance(): RadarService {
    if (!RadarService.instance) {
      RadarService.instance = new RadarService();
    }
    return RadarService.instance;
  }

  public async getMetadata() {
    const cacheKey = 'radar:metadata';
    const cached = serverCache.get(cacheKey);
    if (cached.data && !cached.isStale) {
      return cached.data;
    }

    try {
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
        headers: { 'User-Agent': 'Mausam-Radar-Service/3.0' },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        if (cached.data) return cached.data;
        return {
          status: 'UNAVAILABLE',
          available: false,
          message: `RainViewer upstream returned HTTP ${response.status}`,
          version: '2.0',
          host: '',
          radar: { past: [], nowcast: [] },
          satellite: { infrared: [] },
        };
      }

      const data = await response.json();
      serverCache.set(cacheKey, data, 120, 600);
      return data;
    } catch (err: any) {
      if (cached.data) return cached.data;
      return {
        status: 'UNAVAILABLE',
        available: false,
        message: 'Radar telemetry is currently unavailable from upstream provider',
        version: '2.0',
        host: '',
        radar: { past: [], nowcast: [] },
        satellite: { infrared: [] },
        error: err?.message,
      };
    }
  }

  public async getFrames() {
    const meta: any = await this.getMetadata();
    if (!meta || meta.status === 'UNAVAILABLE' || !meta.radar) {
      return {
        status: 'UNAVAILABLE',
        host: '',
        past: [],
        nowcast: [],
        count: 0,
      };
    }

    return {
      status: 'OPERATIONAL',
      host: meta.host || 'https://tilecache.rainviewer.com',
      past: meta.radar?.past || [],
      nowcast: meta.radar?.nowcast || [],
      count: (meta.radar?.past?.length || 0) + (meta.radar?.nowcast?.length || 0),
    };
  }

  public getStations(lat?: number, lon?: number) {
    if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
      const nearest = findNearestRadarStation(lat, lon);
      return {
        total: IMD_DOPPLER_RADAR_NETWORK.length,
        nearestStation: nearest,
        stations: IMD_DOPPLER_RADAR_NETWORK,
      };
    }

    return {
      total: IMD_DOPPLER_RADAR_NETWORK.length,
      stations: IMD_DOPPLER_RADAR_NETWORK,
    };
  }

  public async getSatellite(channelName: string = 'ir1') {
    const channel = (channelName || 'ir1').toLowerCase();
    const targetUrl = INSAT_URLS[channel] || INSAT_URLS.ir1;
    const cacheKey = `radar:satellite:${channel}`;
    const cached = serverCache.get(cacheKey);
    if (cached.data && !cached.isStale) {
      return cached.data;
    }

    try {
      const headRes = await fetch(targetUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(5000),
      });

      const contentType = headRes.headers.get('content-type') || '';
      const isImage = contentType.startsWith('image/');

      if (headRes.ok && isImage) {
        const result = {
          ok: true,
          channel,
          satellite: 'INSAT-3D / INSAT-3DR',
          source: 'India Meteorological Department (IMD)',
          imageUrl: targetUrl,
          contentType,
          status: 'LIVE',
          observedAt: new Date().toISOString(),
          fetchedAt: new Date().toISOString(),
        };
        serverCache.set(cacheKey, result, 300, 600);
        return result;
      }

      return {
        ok: false,
        channel,
        satellite: 'INSAT-3D / INSAT-3DR',
        source: 'India Meteorological Department (IMD)',
        status: 'UNAVAILABLE',
        imageUrl: null,
        message: 'Official INSAT satellite feed is temporarily offline or inaccessible.',
        errorCode: 'SATELLITE_FEED_UNAVAILABLE',
        fetchedAt: null,
      };
    } catch (err: any) {
      if (cached.data) return cached.data;
      return {
        ok: false,
        channel,
        satellite: 'INSAT-3D / INSAT-3DR',
        source: 'India Meteorological Department (IMD)',
        status: 'UNAVAILABLE',
        imageUrl: null,
        message: 'Satellite telemetry unreachable.',
        error: err?.message,
        errorCode: 'NETWORK_TIMEOUT',
        fetchedAt: null,
      };
    }
  }
}

export const radarService = RadarService.getInstance();
