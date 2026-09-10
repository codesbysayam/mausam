// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Open-Meteo Provider Adapter (Free Primary Weather Source, No API Key Required)
// ====================================================================

import {
  NormalizedWeather,
  NormalizedForecast,
  NormalizedHourlyItem,
  NormalizedDailyItem,
  GeoLocation,
} from '../normalization/types';
import { WeatherNormalizer } from '../normalization/weatherNormalizer';

export class OpenMeteoProvider {
  private static endpoint = process.env.OPEN_METEO_ENDPOINT || 'https://api.open-meteo.com/v1';

  public static async fetchCurrentWeather(loc: GeoLocation): Promise<NormalizedWeather | null> {
    const startTime = Date.now();
    try {
      const url = `${this.endpoint}/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=dew_point_2m,uv_index,visibility&daily=sunrise,sunset&timezone=auto&timeformat=unixtime`;

      const res = await fetch(url, {
        headers: { 'User-Agent': 'MAUSAM-Atmospheric-Platform/3.0' },
        signal: AbortSignal.timeout(6500),
      });

      if (!res.ok) {
        console.warn(`[OpenMeteo] Current weather fetch failed with status ${res.status}`);
        return null;
      }

      const json = await res.json();
      const cur = json.current;
      if (!cur) return null;

      const dewPoint = json.hourly?.dew_point_2m?.[0] ?? null;
      const uv = json.hourly?.uv_index?.[0] ?? null;
      const visibilityMeters = json.hourly?.visibility?.[0] ?? null;
      const visibilityKm = visibilityMeters !== null ? Math.round((visibilityMeters / 1000) * 10) / 10 : 10;

      const sunrise = json.daily?.sunrise?.[0]
        ? new Date(json.daily.sunrise[0] * 1000).toISOString()
        : null;
      const sunset = json.daily?.sunset?.[0]
        ? new Date(json.daily.sunset[0] * 1000).toISOString()
        : null;

      const observedEpochMs = typeof cur.time === 'number' ? cur.time * 1000 : Date.now();
      const observedAt = new Date(observedEpochMs).toISOString();
      const { status: dataStatus, ageSeconds } = WeatherNormalizer.computeDataStatus(observedAt);

      const normalized: NormalizedWeather = {
        location: loc,
        observedAt,
        fetchedAt: new Date().toISOString(),
        dataStatus,
        ageSeconds,
        temperature: typeof cur.temperature_2m === 'number' ? Math.round(cur.temperature_2m * 10) / 10 : null,
        feelsLike: typeof cur.apparent_temperature === 'number' ? Math.round(cur.apparent_temperature * 10) / 10 : null,
        humidity: typeof cur.relative_humidity_2m === 'number' ? Math.round(cur.relative_humidity_2m) : null,
        dewPoint: typeof dewPoint === 'number' ? Math.round(dewPoint * 10) / 10 : null,
        pressure: typeof cur.pressure_msl === 'number' ? Math.round(cur.pressure_msl * 10) / 10 : null,
        windSpeed: typeof cur.wind_speed_10m === 'number' ? Math.round(cur.wind_speed_10m * 10) / 10 : null,
        windDirection: WeatherNormalizer.degreesToCompass(cur.wind_direction_10m),
        windDirectionDegrees: typeof cur.wind_direction_10m === 'number' ? cur.wind_direction_10m : null,
        windGust: typeof cur.wind_gusts_10m === 'number' ? Math.round(cur.wind_gusts_10m * 10) / 10 : null,
        visibility: visibilityKm,
        cloudCover: typeof cur.cloud_cover === 'number' ? cur.cloud_cover : null,
        precipitation: typeof cur.precipitation === 'number' ? cur.precipitation : 0,
        rain: typeof cur.rain === 'number' ? cur.rain : 0,
        showers: typeof cur.showers === 'number' ? cur.showers : 0,
        snowfall: typeof cur.snowfall === 'number' ? cur.snowfall : 0,
        rainfall24h: typeof cur.rain === 'number' ? cur.rain : 0,
        uvIndex: typeof uv === 'number' ? Math.round(uv * 10) / 10 : null,
        weatherCode: cur.weather_code ?? 0,
        condition: WeatherNormalizer.interpretWmoCode(cur.weather_code ?? 0),
        isDay: cur.is_day === 1,
        sunrise,
        sunset,
        source: 'Open-Meteo',
        sourcePriority: 4,
        isFallback: false,
        rawSourceAttribution: 'Weather data by Open-Meteo.com under CC BY 4.0',
      };

      return normalized;
    } catch (err: any) {
      console.warn('[OpenMeteo] fetchCurrentWeather error:', err.message);
      return null;
    }
  }

  public static async fetchForecast(loc: GeoLocation): Promise<NormalizedForecast | null> {
    try {
      const url = `${this.endpoint}/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,pressure_msl,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=auto&forecast_days=7`;

      const res = await fetch(url, {
        headers: { 'User-Agent': 'MAUSAM-Atmospheric-Platform/3.0' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.warn(`[OpenMeteo] Forecast fetch failed with status ${res.status}`);
        return null;
      }

      const json = await res.json();
      const hourly = json.hourly;
      const daily = json.daily;

      const hourlyItems: NormalizedHourlyItem[] = [];
      if (hourly && Array.isArray(hourly.time)) {
        const count = Math.min(hourly.time.length, 48); // 48-hour forward projection
        for (let i = 0; i < count; i++) {
          const visMeters = hourly.visibility?.[i] ?? null;
          hourlyItems.push({
            time: hourly.time[i],
            temperature: typeof hourly.temperature_2m?.[i] === 'number' ? Math.round(hourly.temperature_2m[i] * 10) / 10 : null,
            feelsLike: typeof hourly.apparent_temperature?.[i] === 'number' ? Math.round(hourly.apparent_temperature[i] * 10) / 10 : null,
            humidity: typeof hourly.relative_humidity_2m?.[i] === 'number' ? Math.round(hourly.relative_humidity_2m[i]) : null,
            dewPoint: typeof hourly.dew_point_2m?.[i] === 'number' ? Math.round(hourly.dew_point_2m[i] * 10) / 10 : null,
            precipitationProbability: hourly.precipitation_probability?.[i] ?? 0,
            precipitation: hourly.precipitation?.[i] ?? 0,
            rain: hourly.rain?.[i] ?? 0,
            showers: hourly.showers?.[i] ?? 0,
            snowfall: hourly.snowfall?.[i] ?? 0,
            weatherCode: hourly.weather_code?.[i] ?? 0,
            condition: WeatherNormalizer.interpretWmoCode(hourly.weather_code?.[i] ?? 0),
            windSpeed: typeof hourly.wind_speed_10m?.[i] === 'number' ? Math.round(hourly.wind_speed_10m[i] * 10) / 10 : null,
            windDirection: WeatherNormalizer.degreesToCompass(hourly.wind_direction_10m?.[i]),
            windDirectionDegrees: hourly.wind_direction_10m?.[i] ?? null,
            windGust: typeof hourly.wind_gusts_10m?.[i] === 'number' ? Math.round(hourly.wind_gusts_10m[i] * 10) / 10 : null,
            pressure: typeof hourly.pressure_msl?.[i] === 'number' ? Math.round(hourly.pressure_msl[i]) : null,
            cloudCover: hourly.cloud_cover?.[i] ?? null,
            visibility: visMeters !== null ? Math.round((visMeters / 1000) * 10) / 10 : null,
            uvIndex: typeof hourly.uv_index?.[i] === 'number' ? Math.round(hourly.uv_index[i] * 10) / 10 : null,
            isDay: hourly.is_day?.[i] === 1,
          });
        }
      }

      const dailyItems: NormalizedDailyItem[] = [];
      if (daily && Array.isArray(daily.time)) {
        for (let i = 0; i < daily.time.length; i++) {
          dailyItems.push({
            date: daily.time[i],
            weatherCode: daily.weather_code?.[i] ?? 0,
            condition: WeatherNormalizer.interpretWmoCode(daily.weather_code?.[i] ?? 0),
            tempMax: typeof daily.temperature_2m_max?.[i] === 'number' ? Math.round(daily.temperature_2m_max[i] * 10) / 10 : null,
            tempMin: typeof daily.temperature_2m_min?.[i] === 'number' ? Math.round(daily.temperature_2m_min[i] * 10) / 10 : null,
            apparentTempMax: typeof daily.apparent_temperature_max?.[i] === 'number' ? Math.round(daily.apparent_temperature_max[i] * 10) / 10 : null,
            apparentTempMin: typeof daily.apparent_temperature_min?.[i] === 'number' ? Math.round(daily.apparent_temperature_min[i] * 10) / 10 : null,
            precipitationSum: typeof daily.precipitation_sum?.[i] === 'number' ? Math.round(daily.precipitation_sum[i] * 10) / 10 : 0,
            rainSum: daily.rain_sum?.[i] ?? 0,
            showersSum: daily.showers_sum?.[i] ?? 0,
            snowfallSum: daily.snowfall_sum?.[i] ?? 0,
            precipitationHours: daily.precipitation_hours?.[i] ?? 0,
            precipitationProbabilityMax: daily.precipitation_probability_max?.[i] ?? 0,
            windSpeedMax: typeof daily.wind_speed_10m_max?.[i] === 'number' ? Math.round(daily.wind_speed_10m_max[i] * 10) / 10 : null,
            windGustMax: typeof daily.wind_gusts_10m_max?.[i] === 'number' ? Math.round(daily.wind_gusts_10m_max[i] * 10) / 10 : null,
            windDirectionDominant: daily.wind_direction_10m_dominant?.[i] ?? null,
            uvIndexMax: typeof daily.uv_index_max?.[i] === 'number' ? Math.round(daily.uv_index_max[i] * 10) / 10 : null,
            sunrise: daily.sunrise?.[i] || null,
            sunset: daily.sunset?.[i] || null,
          });
        }
      }

      return {
        location: loc,
        generatedAt: new Date().toISOString(),
        source: 'Open-Meteo',
        sourceAttribution: 'Weather forecast data by Open-Meteo.com under CC BY 4.0',
        hourly: hourlyItems,
        daily: dailyItems,
      };
    } catch (err: any) {
      console.warn('[OpenMeteo] fetchForecast error:', err.message);
      return null;
    }
  }

  public static async checkHealth(): Promise<{ operational: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.endpoint}/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m`, {
        signal: AbortSignal.timeout(4000),
      });
      const latencyMs = Date.now() - start;
      return { operational: res.ok, latencyMs };
    } catch (err: any) {
      return { operational: false, latencyMs: Date.now() - start, error: err.message };
    }
  }
}
