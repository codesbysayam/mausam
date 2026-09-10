// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// CPCB National Air Quality Index (NAQI) Normalizer
// ====================================================================

import { NormalizedAQI, GeoLocation, NormalizedPollutant } from './types';

export class AqiNormalizer {
  public static calculateIndianCategory(aqi: number): 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Satisfactory';
    if (aqi <= 200) return 'Moderate';
    if (aqi <= 300) return 'Poor';
    if (aqi <= 400) return 'Very Poor';
    return 'Severe';
  }

  public static getIndianHealthAdvisory(category: string): string {
    switch (category) {
      case 'Good':
        return 'Minimal impact. Air quality is considered satisfactory, and air pollution poses little or no risk.';
      case 'Satisfactory':
        return 'Minor breathing discomfort to sensitive people.';
      case 'Moderate':
        return 'Breathing discomfort to the people with lungs, asthma and heart diseases.';
      case 'Poor':
        return 'Breathing discomfort to most people on prolonged exposure.';
      case 'Very Poor':
        return 'Respiratory illness on prolonged exposure. Avoid strenuous outdoor exertion.';
      case 'Severe':
        return 'Affects healthy people and seriously impacts those with existing diseases. Stay indoors.';
      default:
        return 'Standard environmental precautions recommended.';
    }
  }

  /**
   * CPCB Sub-index calculation for PM2.5 (24h average in µg/m³)
   */
  public static calculatePm25SubIndex(pm25: number): number {
    if (pm25 <= 30) return Math.round((pm25 / 30) * 50);
    if (pm25 <= 60) return Math.round(50 + ((pm25 - 30) / 30) * 50);
    if (pm25 <= 90) return Math.round(100 + ((pm25 - 60) / 30) * 100);
    if (pm25 <= 120) return Math.round(200 + ((pm25 - 90) / 30) * 100);
    if (pm25 <= 250) return Math.round(300 + ((pm25 - 120) / 130) * 100);
    return Math.round(400 + ((pm25 - 250) / 130) * 100);
  }

  /**
   * CPCB Sub-index calculation for PM10 (24h average in µg/m³)
   */
  public static calculatePm10SubIndex(pm10: number): number {
    if (pm10 <= 50) return Math.round(pm10);
    if (pm10 <= 100) return Math.round(pm10);
    if (pm10 <= 250) return Math.round(100 + ((pm10 - 100) / 150) * 100);
    if (pm10 <= 350) return Math.round(200 + ((pm10 - 250) / 100) * 100);
    if (pm10 <= 430) return Math.round(300 + ((pm10 - 350) / 80) * 100);
    return Math.round(400 + ((pm10 - 430) / 80) * 100);
  }

  /**
   * Compute overall NAQI from individual pollutant sub-indices
   */
  public static calculateOverallAqi(pollutants: Record<string, NormalizedPollutant | undefined>): {
    aqi: number;
    dominant: string;
  } {
    let maxAqi = 0;
    let dominant = 'PM2.5';

    for (const [key, p] of Object.entries(pollutants)) {
      if (p && p.subIndex !== undefined && p.subIndex > maxAqi) {
        maxAqi = p.subIndex;
        dominant = p.label;
      }
    }

    return {
      aqi: Math.min(500, Math.max(1, maxAqi)),
      dominant,
    };
  }
}
