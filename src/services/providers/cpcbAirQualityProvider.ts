// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// CPCB & Normalized Air Quality Provider
// Queries verified CPCB CAAQMS when available, with Open-Meteo fallback
// Strictly retains true provider attribution and avoids fabricated AQI
// ====================================================================

import { OpenMeteoProvider } from './openMeteoProvider';

export interface NormalizedAirQuality {
  aqi: number | null;
  category: string;
  categoryColor: string;
  station?: string;
  city?: string;
  pollutants: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
  };
  observedAt: string;
  retrievedAt: string;
  provider: string;
  status: 'LIVE' | 'STALE' | 'UNAVAILABLE';
}

function getCpcbCategory(aqi: number | null): { category: string; color: string } {
  if (aqi === null || aqi === undefined) {
    return { category: 'Unavailable', color: '#64748B' };
  }
  if (aqi <= 50) return { category: 'Good', color: '#10B981' };
  if (aqi <= 100) return { category: 'Satisfactory', color: '#84CC16' };
  if (aqi <= 200) return { category: 'Moderate', color: '#EAB308' };
  if (aqi <= 300) return { category: 'Poor', color: '#F97316' };
  if (aqi <= 400) return { category: 'Very Poor', color: '#EF4444' };
  return { category: 'Severe', color: '#7F1D1D' };
}

export class CpcbAirQualityProvider {
  /**
   * Resolve AQI for given coordinates and city
   */
  public static async getAirQuality(
    lat: number,
    lng: number,
    cityName?: string
  ): Promise<NormalizedAirQuality> {
    const nowIso = new Date().toISOString();

    // 1. Attempt verified CPCB endpoint if configured in environment / server
    try {
      if (typeof window !== 'undefined') {
        const cpcbUrl = `/api/authoritative?service=cpcb&city=${encodeURIComponent(cityName || '')}&lat=${lat}&lng=${lng}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(cpcbUrl, { signal: controller.signal }).catch(() => null);
        clearTimeout(timeout);

        if (res && res.ok) {
          const json = await res.json().catch(() => null);
          if (json && json.aqi !== undefined && json.source === 'CPCB') {
            const cat = getCpcbCategory(json.aqi);
            return {
              aqi: json.aqi,
              category: json.category || cat.category,
              categoryColor: cat.color,
              station: json.station || `${cityName || 'Regional'} CAAQMS`,
              city: cityName,
              pollutants: json.pollutants || {},
              observedAt: json.observedAt || nowIso,
              retrievedAt: nowIso,
              provider: 'Central Pollution Control Board (CPCB)',
              status: 'LIVE',
            };
          }
        }
      }
    } catch {
      // Fall through to Open-Meteo fallback
    }

    // 2. Open-Meteo Environmental Chemistry Fallback (Fast & Free)
    const omAqi = await OpenMeteoProvider.getAirQuality(lat, lng);
    if (omAqi && omAqi.aqi !== null) {
      const cat = getCpcbCategory(omAqi.aqi);
      return {
        aqi: omAqi.aqi,
        category: cat.category,
        categoryColor: cat.color,
        city: cityName,
        pollutants: {
          pm25: omAqi.pm25,
          pm10: omAqi.pm10,
        },
        observedAt: omAqi.observedAt,
        retrievedAt: omAqi.retrievedAt,
        provider: 'Open-Meteo Atmospheric Chemistry',
        status: omAqi.status,
      };
    }

    return {
      aqi: null,
      category: 'Data Unavailable',
      categoryColor: '#64748B',
      city: cityName,
      pollutants: {},
      observedAt: nowIso,
      retrievedAt: nowIso,
      provider: 'Central Pollution Control Board / Open-Meteo',
      status: 'UNAVAILABLE',
    };
  }
}
