// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Cross-Source Validation Engine
// ====================================================================

import { NormalizedWeather, NormalizedForecast, NormalizedAQI } from '../normalization/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class WeatherValidator {
  /**
   * Validate geographical coordinates
   */
  public static validateCoordinates(lat: number, lon: number): boolean {
    if (typeof lat !== 'number' || typeof lon !== 'number') return false;
    if (isNaN(lat) || isNaN(lon)) return false;
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  /**
   * Validate timestamp string (must be valid ISO date or parseable timestamp not far into the future)
   */
  public static validateTimestamp(timestampStr: string): boolean {
    if (!timestampStr) return false;
    const date = new Date(timestampStr);
    if (isNaN(date.getTime())) return false;
    // Allow up to 24 hours of clock/timezone drift for observations
    const maxFuture = Date.now() + 24 * 60 * 60 * 1000;
    return date.getTime() <= maxFuture;
  }

  /**
   * Strict verification of a current weather observation.
   * Null values mean unavailable (which is valid).
   * Non-null values MUST be physically plausible.
   */
  public static validateObservation(obs: Partial<NormalizedWeather>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Coordinates
    if (!obs.location || !this.validateCoordinates(obs.location.latitude, obs.location.longitude)) {
      errors.push(`Invalid location coordinates: ${obs.location?.latitude}, ${obs.location?.longitude}`);
    }

    // Timestamp
    if (!obs.observedAt || !this.validateTimestamp(obs.observedAt)) {
      errors.push(`Invalid observation timestamp: ${obs.observedAt}`);
    }

    // Temperature: Earth record extremes are -89.2°C to 56.7°C
    if (obs.temperature !== null && obs.temperature !== undefined) {
      if (typeof obs.temperature !== 'number' || isNaN(obs.temperature)) {
        errors.push(`Temperature must be a valid number, got: ${obs.temperature}`);
      } else if (obs.temperature < -80 || obs.temperature > 65) {
        errors.push(`Temperature out of physical boundary (-80 to 65°C): ${obs.temperature}°C`);
      }
    }

    // Humidity: 0% to 100%
    if (obs.humidity !== null && obs.humidity !== undefined) {
      if (typeof obs.humidity !== 'number' || isNaN(obs.humidity)) {
        errors.push(`Humidity must be a valid number, got: ${obs.humidity}`);
      } else if (obs.humidity < 0 || obs.humidity > 100) {
        errors.push(`Humidity out of physical boundary (0-100%): ${obs.humidity}%`);
      }
    }

    // Pressure: 850 hPa to 1085 hPa (Dead Sea to Siberian High)
    if (obs.pressure !== null && obs.pressure !== undefined) {
      if (typeof obs.pressure !== 'number' || isNaN(obs.pressure)) {
        errors.push(`Pressure must be a valid number, got: ${obs.pressure}`);
      } else if (obs.pressure < 800 || obs.pressure > 1100) {
        errors.push(`Atmospheric pressure out of physical limits (800-1100 hPa): ${obs.pressure} hPa`);
      }
    }

    // Wind Speed: >= 0 km/h and <= 400 km/h (Category 5 hurricane gusts peak ~350 km/h)
    if (obs.windSpeed !== null && obs.windSpeed !== undefined) {
      if (typeof obs.windSpeed !== 'number' || isNaN(obs.windSpeed)) {
        errors.push(`Wind speed must be a valid number, got: ${obs.windSpeed}`);
      } else if (obs.windSpeed < 0 || obs.windSpeed > 450) {
        errors.push(`Wind speed out of physical limits (0-450 km/h): ${obs.windSpeed}`);
      }
    }

    // Precipitation & Rainfall: >= 0 mm
    if (obs.precipitation !== null && obs.precipitation !== undefined) {
      if (typeof obs.precipitation !== 'number' || isNaN(obs.precipitation)) {
        errors.push(`Precipitation must be a valid number, got: ${obs.precipitation}`);
      } else if (obs.precipitation < 0) {
        errors.push(`Precipitation cannot be negative: ${obs.precipitation} mm`);
      }
    }
    if (obs.rainfall24h !== null && obs.rainfall24h !== undefined) {
      if (typeof obs.rainfall24h !== 'number' || isNaN(obs.rainfall24h)) {
        errors.push(`Rainfall 24h must be a valid number, got: ${obs.rainfall24h}`);
      } else if (obs.rainfall24h < 0) {
        errors.push(`Rainfall 24h cannot be negative: ${obs.rainfall24h} mm`);
      }
    }

    // UV Index: 0 to 20
    if (obs.uvIndex !== null && obs.uvIndex !== undefined) {
      if (obs.uvIndex < 0 || obs.uvIndex > 25) {
        warnings.push(`UV index ${obs.uvIndex} is unusual (standard range 0-16)`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Forecast structure and timestamps
   */
  public static validateForecast(forecast: Partial<NormalizedForecast>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!forecast.hourly || !Array.isArray(forecast.hourly) || forecast.hourly.length === 0) {
      errors.push('Forecast must contain at least one hourly step');
    }

    if (forecast.hourly) {
      let previousTime = 0;
      for (let i = 0; i < forecast.hourly.length; i++) {
        const step = forecast.hourly[i];
        const stepTime = new Date(step.time).getTime();
        if (isNaN(stepTime)) {
          errors.push(`Hourly step ${i} has invalid timestamp: ${step.time}`);
          break;
        }
        if (i > 0 && stepTime <= previousTime) {
          warnings.push(`Hourly timestamps are not strictly ascending at index ${i}`);
        }
        previousTime = stepTime;

        if (step.temperature < -80 || step.temperature > 65) {
          errors.push(`Step ${i} temperature out of bounds: ${step.temperature}`);
        }
        if (step.precipitation < 0) {
          errors.push(`Step ${i} precipitation cannot be negative: ${step.precipitation}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Air Quality Index (AQI) observations
   */
  public static validateAQI(aqi: Partial<NormalizedAQI>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (aqi.aqi !== null && aqi.aqi !== undefined) {
      if (typeof aqi.aqi !== 'number' || isNaN(aqi.aqi)) {
        errors.push(`AQI must be a valid number, got: ${aqi.aqi}`);
      } else if (aqi.aqi < 0 || aqi.aqi > 1000) {
        errors.push(`AQI out of plausible limits (0-1000): ${aqi.aqi}`);
      }
    }

    if (aqi.pollutants) {
      for (const [code, p] of Object.entries(aqi.pollutants)) {
        if (p.concentration < 0) {
          errors.push(`Pollutant ${code} concentration cannot be negative: ${p.concentration}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
