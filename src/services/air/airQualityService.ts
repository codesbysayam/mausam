// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Air Quality Intelligence Service (CPCB / Open-Meteo Normalized)
// ====================================================================

import { AqiContext } from '../../types/askMausam';

export function getIndianAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export async function fetchAirQualityContext(
  latitude: number,
  longitude: number
): Promise<AqiContext> {
  const retrievedAt = new Date().toISOString();
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi',
      timezone: 'Asia/Kolkata',
    });

    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Air Quality API HTTP ${res.status}`);
    }

    const data = await res.json();
    const cur = data.current;

    const pm25 = cur.pm2_5 ? Math.round(cur.pm2_5 * 10) / 10 : undefined;
    const pm10 = cur.pm10 ? Math.round(cur.pm10 * 10) / 10 : undefined;
    const aqiVal = cur.us_aqi ? Math.round(cur.us_aqi) : (pm25 ? Math.round(pm25 * 1.5) : undefined);

    if (aqiVal === undefined && pm25 === undefined) {
      return {
        category: 'Data Unavailable',
        source: 'Air Quality Station Network',
        status: 'UNAVAILABLE',
        observedAt: retrievedAt,
      };
    }

    const category = aqiVal !== undefined ? getIndianAqiCategory(aqiVal) : 'Monitored';

    return {
      index: aqiVal,
      pm25,
      pm10,
      category,
      dominantPollutant: (pm25 ?? 0) > (pm10 ?? 0) ? 'PM2.5' : 'PM10',
      observedAt: cur.time ? `${cur.time}+05:30` : retrievedAt,
      source: 'Central Pollution Control / Open-Meteo Atmospheric Chemistry',
      status: 'AVAILABLE',
    };
  } catch {
    return {
      category: 'Data Unavailable',
      source: 'Air Quality Station Network',
      status: 'UNAVAILABLE',
      observedAt: retrievedAt,
    };
  }
}
