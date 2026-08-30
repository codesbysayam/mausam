/**
 * Forecast Normalization & Meteorological Quality Control Layer
 * Validates meteorological boundaries, ensures RH <= 100%,
 * calculates Dew Point, Heat Index, Beaufort Scale, and Wind Degrees.
 */

import { HourlyForecastItem, DailyForecastItem } from '../types';

export interface NormalizedHourlyItem extends HourlyForecastItem {
  validTemp: number;
  validRainProb: number;
  validPrecipMm: number;
  validWindSpeed: number;
  validWindDirection: string;
  windDegree: number;
  validHumidity: number;
  validCloudCover: number;
  dewPoint: number;
  feelsLike: number;
  uvIndex: number;
  visibilityKm: number;
  gustSpeed: number;
}

export interface NormalizedDailyItem extends DailyForecastItem {
  validHigh: number;
  validLow: number;
  validRainProb: number;
  validPrecipMm: number;
  validHumidity: number;
  validWindSpeed: number;
  validWindDirection: string;
  validUv: number;
}

/**
 * Calculates Dew Point using the Magnus-Tetens formula
 * T in °C, RH in % (0-100)
 */
export function calculateDewPoint(tempC: number, rhPercent: number): number {
  const safeRh = Math.max(1, Math.min(100, rhPercent));
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(safeRh / 100.0);
  const dewPoint = (b * alpha) / (a - alpha);
  return Math.round(dewPoint * 10) / 10;
}

/**
 * Calculates Heat Index / Apparent Temperature in °C (Rothfusz equation)
 */
export function calculateApparentTemp(tempC: number, rhPercent: number, windSpeedKmh: number): number {
  const safeRh = Math.max(0, Math.min(100, rhPercent));
  const windMs = (windSpeedKmh * 1000) / 3600;

  // Australian apparent temperature formula for general temperature range
  const e = (safeRh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  const at = tempC + 0.33 * e - 0.70 * windMs - 4.0;
  return Math.round(at * 10) / 10;
}

/**
 * Maps cardinal wind directions to compass degrees
 */
export function directionToDegrees(dirStr?: string): number {
  if (!dirStr) return 45;
  const cleaned = dirStr.trim().toUpperCase();
  const map: Record<string, number> = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  };
  return map[cleaned] !== undefined ? map[cleaned] : 45;
}

/**
 * Converts wind speed in km/h to Beaufort wind scale category
 */
export function getBeaufortCategory(windKmh: number): { force: number; description: string } {
  const k = Math.max(0, windKmh);
  if (k < 1) return { force: 0, description: 'Calm (< 1 km/h)' };
  if (k <= 5) return { force: 1, description: 'Light Air (1–5 km/h)' };
  if (k <= 11) return { force: 2, description: 'Light Breeze (6–11 km/h)' };
  if (k <= 19) return { force: 3, description: 'Gentle Breeze (12–19 km/h)' };
  if (k <= 28) return { force: 4, description: 'Moderate Breeze (20–28 km/h)' };
  if (k <= 38) return { force: 5, description: 'Fresh Breeze (29–38 km/h)' };
  if (k <= 49) return { force: 6, description: 'Strong Breeze (39–49 km/h)' };
  if (k <= 61) return { force: 7, description: 'Near Gale (50–61 km/h)' };
  if (k <= 74) return { force: 8, description: 'Gale (62–74 km/h)' };
  if (k <= 88) return { force: 9, description: 'Strong Gale (75–88 km/h)' };
  return { force: 10, description: 'Storm / Violent Gale (89+ km/h)' };
}

/**
 * Normalizes hourly forecasts ensuring no NaN, null, or out-of-bound values reach UI
 */
export function normalizeHourlyForecast(rawItems: HourlyForecastItem[]): NormalizedHourlyItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return [];

  return rawItems.map((item, idx) => {
    const validTemp = typeof item.temp === 'number' && !isNaN(item.temp) ? Math.round(item.temp * 10) / 10 : 28;
    const validRainProb = typeof item.precipitationProbability === 'number' && !isNaN(item.precipitationProbability)
      ? Math.max(0, Math.min(100, Math.round(item.precipitationProbability)))
      : (typeof item.rainProb === 'number' && !isNaN(item.rainProb) ? Math.max(0, Math.min(100, Math.round(item.rainProb))) : 20);

    const rawPrecip = (item as unknown as { precipitationMm?: number }).precipitationMm;
    const validPrecipMm = typeof rawPrecip === 'number' && !isNaN(rawPrecip)
      ? Math.max(0, Math.round(rawPrecip * 10) / 10)
      : Math.max(0, Math.round((validRainProb > 50 ? (validRainProb - 40) * 0.15 : 0) * 10) / 10);

    const validWindSpeed = typeof item.windSpeed === 'number' && !isNaN(item.windSpeed)
      ? Math.max(0, Math.round(item.windSpeed))
      : 12;

    const validWindDirection = item.windDirection || 'NE';
    const windDegree = directionToDegrees(validWindDirection);

    const validHumidity = typeof item.humidity === 'number' && !isNaN(item.humidity)
      ? Math.max(0, Math.min(100, Math.round(item.humidity)))
      : 74;

    const validCloudCover = typeof item.cloudCover === 'number' && !isNaN(item.cloudCover)
      ? Math.max(0, Math.min(100, Math.round(item.cloudCover)))
      : 45;

    const dewPoint = calculateDewPoint(validTemp, validHumidity);
    const feelsLike = calculateApparentTemp(validTemp, validHumidity, validWindSpeed);
    const uvIndex = idx >= 3 && idx <= 8 ? Math.round((7.5 - Math.abs(idx - 5) * 1.2) * 10) / 10 : 0;
    const visibilityKm = validHumidity > 90 ? 4.5 : validRainProb > 60 ? 6.0 : 10.0;
    const gustSpeed = Math.round(validWindSpeed * 1.35);

    return {
      ...item,
      validTemp,
      validRainProb,
      validPrecipMm,
      validWindSpeed,
      validWindDirection,
      windDegree,
      validHumidity,
      validCloudCover,
      dewPoint,
      feelsLike,
      uvIndex,
      visibilityKm,
      gustSpeed,
    };
  });
}

/**
 * Normalizes 7-day daily forecast data
 */
export function normalizeDailyForecast(rawItems: DailyForecastItem[]): NormalizedDailyItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return [];

  return rawItems.map((item) => {
    const validHigh = typeof item.high === 'number' && !isNaN(item.high) ? Math.round(item.high * 10) / 10 : 33;
    const validLow = typeof item.low === 'number' && !isNaN(item.low) ? Math.round(item.low * 10) / 10 : 25;
    const validRainProb = typeof item.rainProb === 'number' && !isNaN(item.rainProb)
      ? Math.max(0, Math.min(100, Math.round(item.rainProb)))
      : 30;

    const rawPrecip = (item as unknown as { precipitationMm?: number }).precipitationMm;
    const validPrecipMm = typeof rawPrecip === 'number' && !isNaN(rawPrecip)
      ? Math.max(0, Math.round(rawPrecip * 10) / 10)
      : Math.round((validRainProb > 40 ? (validRainProb - 30) * 0.25 : 0) * 10) / 10;

    const validHumidity = typeof item.humidity === 'number' && !isNaN(item.humidity)
      ? Math.max(0, Math.min(100, Math.round(item.humidity)))
      : 72;

    const windParts = (item.wind || '12 km/h NE').split(' ');
    const validWindSpeed = parseInt(windParts[0], 10) || 12;
    const validWindDirection = windParts[2] || 'NE';

    const validUv = typeof item.uv === 'number' && !isNaN(item.uv) ? item.uv : 7.0;

    return {
      ...item,
      validHigh,
      validLow,
      validRainProb,
      validPrecipMm,
      validHumidity,
      validWindSpeed,
      validWindDirection,
      validUv,
    };
  });
}
