// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Open-Meteo Adapter (Verified Free Multi-Model Baseline)
// ====================================================================

import { NormalizedWeather, NormalizedForecast, NormalizedHourlyItem, NormalizedDailyItem, GeoLocation } from '../normalization/types';
import { WeatherValidator } from '../validation/weatherValidator';
import { dataHealthService } from '../services/DataHealthService';

export class OpenMeteoAdapter {
  private static weatherEndpoint = process.env.OPEN_METEO_ENDPOINT || 'https://api.open-meteo.com/v1';

  private static interpretWmoCode(code: number): string {
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
      case 61: return 'Slight Rain';
      case 63: return 'Moderate Rain';
      case 65: return 'Heavy Rain';
      case 71: return 'Slight Snow';
      case 73: return 'Moderate Snow';
      case 75: return 'Heavy Snow';
      case 80: return 'Slight Rain Showers';
      case 81: return 'Moderate Rain Showers';
      case 82: return 'Violent Rain Showers';
      case 95: return 'Thunderstorm';
      case 96: return 'Thunderstorm with Slight Hail';
      case 99: return 'Thunderstorm with Heavy Hail';
      default: return 'Observed Conditions';
    }
  }

  public static async fetchCurrentWeather(loc: GeoLocation): Promise<NormalizedWeather | null> {
    const startTime = Date.now();
    try {
      const url = `${this.weatherEndpoint}/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=dew_point_2m,uv_index&timeformat=unixtime`;

      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const latency = Date.now() - startTime;

      if (!res.ok) {
        dataHealthService.recordFailure('OPEN_METEO', `HTTP ${res.status}: ${res.statusText}`, res.status);
        return null;
      }

      const json = await res.json();
      const current = json.current;
      if (!current) {
        dataHealthService.recordRejection('OPEN_METEO', 1);
        return null;
      }

      const dewPoint = json.hourly?.dew_point_2m?.[0] ?? null;
      const uv = json.hourly?.uv_index?.[0] ?? null;

      const observedEpochMs = typeof current.time === 'number' ? current.time * 1000 : Date.now();

      const normalized: NormalizedWeather = {
        location: loc,
        observedAt: new Date(observedEpochMs).toISOString(),
        fetchedAt: new Date().toISOString(),
        dataStatus: 'LIVE',
        ageSeconds: 0,
        temperature: typeof current.temperature_2m === 'number' ? Math.round(current.temperature_2m * 10) / 10 : null,
        feelsLike: typeof current.apparent_temperature === 'number' ? Math.round(current.apparent_temperature * 10) / 10 : null,
        humidity: typeof current.relative_humidity_2m === 'number' ? Math.round(current.relative_humidity_2m) : null,
        dewPoint: typeof dewPoint === 'number' ? Math.round(dewPoint * 10) / 10 : null,
        pressure: typeof current.pressure_msl === 'number' ? Math.round(current.pressure_msl * 10) / 10 : null,
        windSpeed: typeof current.wind_speed_10m === 'number' ? Math.round(current.wind_speed_10m * 10) / 10 : null,
        windDirection: current.wind_direction_10m !== undefined ? `${Math.round(current.wind_direction_10m)}°` : null,
        windDirectionDegrees: typeof current.wind_direction_10m === 'number' ? current.wind_direction_10m : null,
        windGust: typeof current.wind_gusts_10m === 'number' ? current.wind_gusts_10m : null,
        visibility: 10,
        cloudCover: typeof current.cloud_cover === 'number' ? current.cloud_cover : null,
        precipitation: typeof current.precipitation === 'number' ? current.precipitation : 0,
        rainfall24h: typeof current.rain === 'number' ? current.rain : 0,
        uvIndex: typeof uv === 'number' ? uv : 0,
        weatherCode: current.weather_code ?? 0,
        condition: this.interpretWmoCode(current.weather_code ?? 0),
        isDay: current.is_day === 1,
        source: 'Open-Meteo',
        sourcePriority: 4,
        isFallback: true,
        rawSourceAttribution: 'Open-Meteo / WMO Standard Synoptic Ensemble under CC BY 4.0',
      };

      const validation = WeatherValidator.validateObservation(normalized);
      if (!validation.isValid) {
        dataHealthService.recordRejection('OPEN_METEO', 1);
        console.warn('[OpenMeteoAdapter] Observation rejected by validator:', validation.errors);
        return null;
      }

      dataHealthService.recordSuccess('OPEN_METEO', latency, 1, res.status);
      return normalized;
    } catch (err: any) {
      dataHealthService.recordFailure('OPEN_METEO', err.message, 500);
      return null;
    }
  }

  public static async fetchForecast(loc: GeoLocation, model: string = 'ecmwf_ifs025'): Promise<NormalizedForecast | null> {
    const startTime = Date.now();
    try {
      const url = `${this.weatherEndpoint}/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7`;

      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const latency = Date.now() - startTime;

      if (!res.ok) {
        dataHealthService.recordFailure('OPEN_METEO', `Forecast HTTP ${res.status}: ${res.statusText}`, res.status);
        return null;
      }

      const json = await res.json();
      const hourlyData = json.hourly;
      const dailyData = json.daily;

      if (!hourlyData || !dailyData) {
        dataHealthService.recordRejection('OPEN_METEO', 1);
        return null;
      }

      const hourly: NormalizedHourlyItem[] = [];
      const times = hourlyData.time || [];
      for (let i = 0; i < Math.min(times.length, 48); i++) {
        hourly.push({
          time: new Date(times[i]).toISOString(),
          temperature: Math.round(hourlyData.temperature_2m?.[i] ?? 0),
          feelsLike: Math.round(hourlyData.apparent_temperature?.[i] ?? 0),
          humidity: Math.round(hourlyData.relative_humidity_2m?.[i] ?? 0),
          precipitationProbability: hourlyData.precipitation_probability?.[i] ?? 0,
          precipitation: hourlyData.precipitation?.[i] ?? 0,
          weatherCode: hourlyData.weather_code?.[i] ?? 0,
          condition: this.interpretWmoCode(hourlyData.weather_code?.[i] ?? 0),
          windSpeed: Math.round(hourlyData.wind_speed_10m?.[i] ?? 0),
          uvIndex: hourlyData.uv_index?.[i] ?? 0,
        });
      }

      const daily: NormalizedDailyItem[] = [];
      const dailyDates = dailyData.time || [];
      for (let i = 0; i < dailyDates.length; i++) {
        daily.push({
          date: dailyDates[i],
          tempMax: Math.round(dailyData.temperature_2m_max?.[i] ?? 0),
          tempMin: Math.round(dailyData.temperature_2m_min?.[i] ?? 0),
          weatherCode: dailyData.weather_code?.[i] ?? 0,
          condition: this.interpretWmoCode(dailyData.weather_code?.[i] ?? 0),
          precipitationSum: dailyData.precipitation_sum?.[i] ?? 0,
          precipitationProbabilityMax: dailyData.precipitation_probability_max?.[i] ?? 0,
          windSpeedMax: Math.round(dailyData.wind_speed_10m_max?.[i] ?? 0),
          uvIndexMax: dailyData.uv_index_max?.[i] ?? 0,
          sunrise: dailyData.sunrise?.[i] ? new Date(dailyData.sunrise[i]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined,
          sunset: dailyData.sunset?.[i] ? new Date(dailyData.sunset[i]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined,
        });
      }

      const forecast: NormalizedForecast = {
        location: loc,
        model: model.toUpperCase(),
        generatedAt: new Date().toISOString(),
        source: 'Open-Meteo',
        dataStatus: 'LIVE',
        hourly,
        daily,
        sourceAttribution: 'Weather forecasts by Open-Meteo.com under CC BY 4.0.',
      };

      const validation = WeatherValidator.validateForecast(forecast);
      if (!validation.isValid) {
        dataHealthService.recordRejection('OPEN_METEO', 1);
        return null;
      }

      dataHealthService.recordSuccess('OPEN_METEO', latency, hourly.length + daily.length, res.status);
      return forecast;
    } catch (err: any) {
      dataHealthService.recordFailure('OPEN_METEO', err.message, 500);
      return null;
    }
  }
}
