// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Weather Data Normalizer & Status Computer
// ====================================================================

import { NormalizedWeather, DataStatus } from './types';

export class WeatherNormalizer {
  /**
   * Determine data status based on true age of observation
   * LIVE: within 45 minutes
   * RECENT: within 3 hours
   * STALE: > 3 hours
   * UNAVAILABLE: null or missing
   */
  public static computeDataStatus(observedAtStr: string): { status: DataStatus; ageSeconds: number } {
    try {
      const observedEpoch = new Date(observedAtStr).getTime();
      if (isNaN(observedEpoch)) {
        return { status: 'STALE', ageSeconds: 99999 };
      }
      const ageSeconds = Math.max(0, Math.round((Date.now() - observedEpoch) / 1000));

      if (ageSeconds <= 45 * 60) {
        return { status: 'LIVE', ageSeconds };
      } else if (ageSeconds <= 180 * 60) {
        return { status: 'RECENT', ageSeconds };
      } else {
        return { status: 'STALE', ageSeconds };
      }
    } catch {
      return { status: 'STALE', ageSeconds: 99999 };
    }
  }

  /**
   * Interpret WMO weather codes into standard descriptions
   */
  public static interpretWmoCode(code: number): string {
    switch (code) {
      case 0: return 'Clear Sky';
      case 1: return 'Mainly Clear';
      case 2: return 'Partly Cloudy';
      case 3: return 'Overcast';
      case 45: return 'Fog';
      case 48: return 'Depositing Rime Fog';
      case 51: return 'Light Drizzle';
      case 53: return 'Moderate Drizzle';
      case 55: return 'Dense Drizzle';
      case 56: return 'Light Freezing Drizzle';
      case 57: return 'Dense Freezing Drizzle';
      case 61: return 'Slight Rain';
      case 63: return 'Moderate Rain';
      case 65: return 'Heavy Rain';
      case 66: return 'Light Freezing Rain';
      case 67: return 'Heavy Freezing Rain';
      case 71: return 'Slight Snow';
      case 73: return 'Moderate Snow';
      case 75: return 'Heavy Snow';
      case 77: return 'Snow Grains';
      case 80: return 'Slight Rain Showers';
      case 81: return 'Moderate Rain Showers';
      case 82: return 'Violent Rain Showers';
      case 85: return 'Slight Snow Showers';
      case 86: return 'Heavy Snow Showers';
      case 95: return 'Thunderstorm';
      case 96: return 'Thunderstorm with Slight Hail';
      case 99: return 'Thunderstorm with Heavy Hail';
      default: return 'Observed Conditions';
    }
  }

  /**
   * Normalize wind direction degrees to compass heading
   */
  public static degreesToCompass(deg: number | null): string {
    if (deg === null || isNaN(deg)) return 'CALM';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(((deg % 360) / 22.5)) % 16;
    return directions[idx];
  }
}
