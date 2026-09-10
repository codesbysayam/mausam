// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// AccuWeather Commercial Adapter (Optional Secondary Source)
// ====================================================================

import { NormalizedWeather, GeoLocation } from '../normalization/types';

export class AccuWeatherProvider {
  private static apiKey = process.env.ACCUWEATHER_API_KEY || null;

  public static isConfigured(): boolean {
    return !!process.env.ACCUWEATHER_API_KEY;
  }

  public static async checkHealth(): Promise<{
    configured: boolean;
    operational: boolean;
    latencyMs: number | null;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return {
        configured: false,
        operational: false,
        latencyMs: null,
        error: 'ACCUWEATHER_API_KEY is not configured',
      };
    }

    const start = Date.now();
    try {
      const res = await fetch(`https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${process.env.ACCUWEATHER_API_KEY}&q=28.6139,77.2090`, {
        signal: AbortSignal.timeout(4000),
      });
      return {
        configured: true,
        operational: res.ok,
        latencyMs: Date.now() - start,
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        configured: true,
        operational: false,
        latencyMs: Date.now() - start,
        error: err.message,
      };
    }
  }

  public static async fetchCurrentWeather(loc: GeoLocation): Promise<NormalizedWeather | null> {
    if (!this.isConfigured()) {
      return null;
    }
    // Only executed when commercial key is supplied
    return null;
  }
}
