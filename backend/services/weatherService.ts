// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Weather Service (Current Weather, Forecasts, Hourly, Daily)
// Multi-Tier Caching, PostgreSQL Logging & Normalized Response
// ====================================================================

import {
  NormalizedWeather,
  NormalizedForecast,
  StandardApiResponse,
  GeoLocation,
} from '../normalization/types';
import { centralDataResolver } from './centralDataResolver';

export class WeatherService {
  private static instance: WeatherService;

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  public async getCurrentWeather(loc: GeoLocation): Promise<StandardApiResponse<NormalizedWeather>> {
    return centralDataResolver.resolveWeather(loc);
  }

  public async getForecast(loc: GeoLocation): Promise<StandardApiResponse<NormalizedForecast>> {
    return centralDataResolver.resolveForecast(loc);
  }

  public async getHourly(loc: GeoLocation): Promise<StandardApiResponse<NormalizedForecast['hourly']>> {
    const forecastRes = await this.getForecast(loc);
    return {
      ...forecastRes,
      data: forecastRes.data.hourly,
    };
  }

  public async getDaily(loc: GeoLocation): Promise<StandardApiResponse<NormalizedForecast['daily']>> {
    const forecastRes = await this.getForecast(loc);
    return {
      ...forecastRes,
      data: forecastRes.data.daily,
    };
  }
}

export const weatherService = WeatherService.getInstance();
