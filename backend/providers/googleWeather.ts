// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Google Weather Commercial Adapter (Optional Secondary Source)
// ====================================================================

import { NormalizedWeather, GeoLocation } from '../normalization/types';

export class GoogleWeatherProvider {
  public static isConfigured(): boolean {
    return !!process.env.GOOGLE_WEATHER_API_KEY;
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
        error: 'GOOGLE_WEATHER_API_KEY is not configured',
      };
    }

    return {
      configured: true,
      operational: false,
      latencyMs: null,
      error: 'Google Weather API endpoint validation pending key quota verification',
    };
  }

  public static async fetchCurrentWeather(loc: GeoLocation): Promise<NormalizedWeather | null> {
    if (!this.isConfigured()) {
      return null;
    }
    return null;
  }
}
