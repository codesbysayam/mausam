// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Open-Meteo Canonical Provider (Fast Open Environmental Telemetry)
// Zero-discrepancy, lightweight TTL-cached weather, AQI & marine client
// ====================================================================

export interface OpenMeteoCurrentWeather {
  temperatureC: number;
  feelsLikeC: number;
  relativeHumidity: number;
  precipitationMm: number;
  precipitationProbability: number;
  weatherCode: number;
  condition: string;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  windDirection: string;
  pressureHpa: number;
  cloudCoverPercent: number;
  visibilityKm: number;
  uvIndex: number;
  isDay: boolean;
  observedAt: string;
  retrievedAt: string;
  provider: 'Open-Meteo';
  status: 'LIVE' | 'STALE' | 'UNAVAILABLE';
}

export interface OpenMeteoDailyForecast {
  date: string;
  dayName: string;
  tempMaxC: number;
  tempMinC: number;
  weatherCode: number;
  condition: string;
  precipitationProbability: number;
  precipitationSumMm: number;
  windSpeedMaxKmh: number;
  uvIndexMax: number;
}

export interface OpenMeteoAirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
  category: string;
  categoryColor: string;
  observedAt: string;
  retrievedAt: string;
  provider: 'Open-Meteo';
  status: 'LIVE' | 'STALE' | 'UNAVAILABLE';
}

export interface OpenMeteoMarine {
  waveHeightM: number;
  wavePeriodSec: number;
  waveDirectionDegrees: number;
  seaSurfaceTemperatureC?: number;
  observedAt: string;
  retrievedAt: string;
  provider: 'Open-Meteo';
  status: 'LIVE' | 'STALE' | 'UNAVAILABLE';
}

// Weather Code Interpretation
export function interpretWeatherCode(code: number): string {
  switch (code) {
    case 0: return 'Clear Sky';
    case 1: return 'Mainly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45:
    case 48: return 'Fog';
    case 51:
    case 53:
    case 55: return 'Drizzle';
    case 56:
    case 57: return 'Freezing Drizzle';
    case 61: return 'Slight Rain';
    case 63: return 'Moderate Rain';
    case 65: return 'Heavy Rain';
    case 71: return 'Slight Snow';
    case 73: return 'Moderate Snow';
    case 75: return 'Heavy Snow';
    case 77: return 'Snow Grains';
    case 80: return 'Light Showers';
    case 81: return 'Moderate Showers';
    case 82: return 'Violent Showers';
    case 85: return 'Snow Showers';
    case 86: return 'Heavy Snow Showers';
    case 95: return 'Thunderstorm';
    case 96: return 'Thunderstorm with Slight Hail';
    case 99: return 'Thunderstorm with Heavy Hail';
    default: return 'Fair';
  }
}

function degreesToCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round((deg % 360) / 22.5) % 16;
  return directions[idx];
}

function getAqiCategory(aqi: number): { category: string; color: string } {
  if (aqi <= 50) return { category: 'Good', color: '#10B981' };
  if (aqi <= 100) return { category: 'Satisfactory', color: '#84CC16' };
  if (aqi <= 200) return { category: 'Moderate', color: '#EAB308' };
  if (aqi <= 300) return { category: 'Poor', color: '#F97316' };
  if (aqi <= 400) return { category: 'Very Poor', color: '#EF4444' };
  return { category: 'Severe', color: '#7F1D1D' };
}

// In-Memory TTL Cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const cache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setInCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttlMs });
}

// Round coordinate to 2 decimal places (~1.1 km) for cache key stability
function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

export class OpenMeteoProvider {
  private static readonly WEATHER_TTL = 3 * 60 * 1000; // 3 minutes
  private static readonly AQI_TTL = 8 * 60 * 1000;     // 8 minutes
  private static readonly MARINE_TTL = 10 * 60 * 1000; // 10 minutes
  private static readonly FETCH_TIMEOUT = 5000;        // 5s max timeout

  /**
   * Fetch current surface observation and daily forecast
   */
  public static async getWeather(
    lat: number,
    lng: number,
    includeDailyForecast = true
  ): Promise<{
    current: OpenMeteoCurrentWeather | null;
    daily: OpenMeteoDailyForecast[];
    status: 'LIVE' | 'STALE' | 'UNAVAILABLE';
  }> {
    const key = `om:weather:${coordKey(lat, lng)}:${includeDailyForecast}`;
    const cached = getFromCache<{ current: OpenMeteoCurrentWeather; daily: OpenMeteoDailyForecast[]; status: any }>(key);
    if (cached) {
      return cached;
    }

    const currentVars = [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'rain',
      'showers',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'surface_pressure',
      'cloud_cover',
      'is_day',
    ];

    const dailyVars = includeDailyForecast
      ? [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'precipitation_probability_max',
          'wind_speed_10m_max',
          'uv_index_max',
        ]
      : [];

    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
      current: currentVars.join(','),
      timezone: 'Asia/Kolkata',
    });

    if (includeDailyForecast) {
      params.set('daily', dailyVars.join(','));
      params.set('forecast_days', '7');
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT);

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        return { current: null, daily: [], status: 'UNAVAILABLE' };
      }

      const json = await res.json();
      const cur = json.current;
      if (!cur) {
        return { current: null, daily: [], status: 'UNAVAILABLE' };
      }

      const weatherCode = cur.weather_code ?? 0;
      const condition = interpretWeatherCode(weatherCode);
      const windDeg = cur.wind_direction_10m ?? 0;
      const windKmh = cur.wind_speed_10m ? Math.round(cur.wind_speed_10m) : 0;
      const nowIso = new Date().toISOString();

      const current: OpenMeteoCurrentWeather = {
        temperatureC: Math.round((cur.temperature_2m ?? 0) * 10) / 10,
        feelsLikeC: Math.round((cur.apparent_temperature ?? cur.temperature_2m ?? 0) * 10) / 10,
        relativeHumidity: Math.round(cur.relative_humidity_2m ?? 0),
        precipitationMm: Math.round((cur.precipitation ?? 0) * 10) / 10,
        precipitationProbability: json.daily?.precipitation_probability_max?.[0] ?? (cur.precipitation > 0 ? 85 : 10),
        weatherCode,
        condition,
        windSpeedKmh: windKmh,
        windDirectionDegrees: windDeg,
        windDirection: degreesToCompass(windDeg),
        pressureHpa: Math.round(cur.surface_pressure ?? 1012),
        cloudCoverPercent: Math.round(cur.cloud_cover ?? 0),
        visibilityKm: 10,
        uvIndex: json.daily?.uv_index_max?.[0] ?? 6,
        isDay: cur.is_day === 1,
        observedAt: cur.time ? `${cur.time}:00+05:30` : nowIso,
        retrievedAt: nowIso,
        provider: 'Open-Meteo',
        status: 'LIVE',
      };

      const daily: OpenMeteoDailyForecast[] = [];
      if (json.daily && Array.isArray(json.daily.time)) {
        for (let i = 0; i < json.daily.time.length; i++) {
          const dateStr = json.daily.time[i];
          const d = new Date(dateStr);
          const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
          const code = json.daily.weather_code?.[i] ?? 0;

          daily.push({
            date: dateStr,
            dayName,
            tempMaxC: Math.round(json.daily.temperature_2m_max?.[i] ?? 0),
            tempMinC: Math.round(json.daily.temperature_2m_min?.[i] ?? 0),
            weatherCode: code,
            condition: interpretWeatherCode(code),
            precipitationProbability: json.daily.precipitation_probability_max?.[i] ?? 0,
            precipitationSumMm: Math.round((json.daily.precipitation_sum?.[i] ?? 0) * 10) / 10,
            windSpeedMaxKmh: Math.round(json.daily.wind_speed_10m_max?.[i] ?? 0),
            uvIndexMax: Math.round(json.daily.uv_index_max?.[i] ?? 0),
          });
        }
      }

      const result = { current, daily, status: 'LIVE' as const };
      setInCache(key, result, this.WEATHER_TTL);
      return result;
    } catch {
      return { current: null, daily: [], status: 'UNAVAILABLE' };
    }
  }

  /**
   * Fetch Air Quality from Open-Meteo Air Quality API
   */
  public static async getAirQuality(
    lat: number,
    lng: number
  ): Promise<OpenMeteoAirQuality | null> {
    const key = `om:aqi:${coordKey(lat, lng)}`;
    const cached = getFromCache<OpenMeteoAirQuality>(key);
    if (cached) return cached;

    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
      current: 'us_aqi,pm2_5,pm10',
      timezone: 'Asia/Kolkata',
    });

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT);

      const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) return null;

      const json = await res.json();
      const cur = json.current;
      if (!cur || cur.us_aqi === undefined) return null;

      const aqiVal = Math.round(cur.us_aqi);
      const { category, color } = getAqiCategory(aqiVal);
      const nowIso = new Date().toISOString();

      const result: OpenMeteoAirQuality = {
        aqi: aqiVal,
        pm25: Math.round((cur.pm2_5 ?? 0) * 10) / 10,
        pm10: Math.round((cur.pm10 ?? 0) * 10) / 10,
        category,
        categoryColor: color,
        observedAt: cur.time ? `${cur.time}:00+05:30` : nowIso,
        retrievedAt: nowIso,
        provider: 'Open-Meteo',
        status: 'LIVE',
      };

      setInCache(key, result, this.AQI_TTL);
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Fetch Marine Conditions from Open-Meteo Marine API
   */
  public static async getMarine(
    lat: number,
    lng: number
  ): Promise<OpenMeteoMarine | null> {
    const key = `om:marine:${coordKey(lat, lng)}`;
    const cached = getFromCache<OpenMeteoMarine>(key);
    if (cached) return cached;

    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
      current: 'wave_height,wave_direction,wave_period',
      timezone: 'Asia/Kolkata',
    });

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT);

      const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?${params.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) return null;

      const json = await res.json();
      const cur = json.current;
      if (!cur || cur.wave_height === undefined) return null;

      const nowIso = new Date().toISOString();
      const result: OpenMeteoMarine = {
        waveHeightM: Math.round((cur.wave_height ?? 0) * 10) / 10,
        wavePeriodSec: Math.round((cur.wave_period ?? 0) * 10) / 10,
        waveDirectionDegrees: Math.round(cur.wave_direction ?? 0),
        observedAt: cur.time ? `${cur.time}:00+05:30` : nowIso,
        retrievedAt: nowIso,
        provider: 'Open-Meteo',
        status: 'LIVE',
      };

      setInCache(key, result, this.MARINE_TTL);
      return result;
    } catch {
      return null;
    }
  }
}
