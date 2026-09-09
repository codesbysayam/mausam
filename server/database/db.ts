// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// PostgreSQL Relational Database Service & Connection Pooler
// ====================================================================

import pg from 'pg';
import {
  NormalizedWeather,
  NormalizedForecast,
  NormalizedAQI,
  NormalizedWarningItem,
  GeoLocation,
} from '../normalization/types';

const { Pool } = pg;

export interface DatabaseStatus {
  connected: boolean;
  provider: 'POSTGRESQL' | 'IN_MEMORY_STRUCTURED';
  poolSize?: number;
  lastChecked: string;
  error?: string;
}

class WeatherDatabaseService {
  private static instance: WeatherDatabaseService;
  private pool: pg.Pool | null = null;
  private isPostgresActive = false;

  // In-Memory structured repository matching schema exactly when Postgres URL is unset
  private memLocations = new Map<string, GeoLocation>();
  private memObservations = new Map<string, NormalizedWeather[]>(); // location_id -> obs[]
  private memForecasts = new Map<string, NormalizedForecast>();
  private memWarnings = new Map<string, NormalizedWarningItem>();
  private memAQI = new Map<string, NormalizedAQI>();

  private constructor() {
    this.initializeConnection();
  }

  public static getInstance(): WeatherDatabaseService {
    if (!WeatherDatabaseService.instance) {
      WeatherDatabaseService.instance = new WeatherDatabaseService();
    }
    return WeatherDatabaseService.instance;
  }

  private initializeConnection(): void {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (connectionString) {
      try {
        this.pool = new Pool({
          connectionString,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        });

        this.pool.on('error', (err) => {
          console.warn('[Mausam DB] Unexpected idle client error:', err.message);
        });

        this.isPostgresActive = true;
        console.log('[Mausam DB] Initialized PostgreSQL connection pool.');
      } catch (err: any) {
        console.warn('[Mausam DB] Could not initialize PostgreSQL pool, falling back to structured in-memory store:', err.message);
        this.isPostgresActive = false;
      }
    } else {
      console.log('[Mausam DB] POSTGRES_URL not set. Running in structured memory store mode with full SQL schema compatibility.');
      this.isPostgresActive = false;
    }
  }

  public async getStatus(): Promise<DatabaseStatus> {
    const now = new Date().toISOString();
    if (this.isPostgresActive && this.pool) {
      try {
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
        return {
          connected: true,
          provider: 'POSTGRESQL',
          poolSize: this.pool.totalCount,
          lastChecked: now,
        };
      } catch (err: any) {
        return {
          connected: false,
          provider: 'POSTGRESQL',
          error: err.message,
          lastChecked: now,
        };
      }
    }

    return {
      connected: true,
      provider: 'IN_MEMORY_STRUCTURED',
      lastChecked: now,
    };
  }

  public async upsertLocation(loc: GeoLocation): Promise<void> {
    if (this.isPostgresActive && this.pool) {
      const query = `
        INSERT INTO locations (id, name, city, district, state, country, latitude, longitude, elevation, timezone, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          city = EXCLUDED.city,
          district = EXCLUDED.district,
          state = EXCLUDED.state,
          country = EXCLUDED.country,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          elevation = EXCLUDED.elevation,
          timezone = EXCLUDED.timezone,
          updated_at = NOW();
      `;
      try {
        await this.pool.query(query, [
          loc.id,
          loc.name,
          loc.city || null,
          loc.district || null,
          loc.state || null,
          loc.country,
          loc.latitude,
          loc.longitude,
          loc.elevation || null,
          loc.timezone || 'Asia/Kolkata',
        ]);
        return;
      } catch (err: any) {
        console.warn('[Mausam DB] Error executing upsertLocation on PostgreSQL:', err.message);
      }
    }

    // In-memory fallback
    this.memLocations.set(loc.id, loc);
  }

  public async saveWeatherObservation(obs: NormalizedWeather): Promise<void> {
    await this.upsertLocation(obs.location);

    if (this.isPostgresActive && this.pool) {
      const query = `
        INSERT INTO weather_observations (
          location_id, source, observed_at, temperature, feels_like, humidity,
          dew_point, pressure, wind_speed, wind_direction, wind_direction_degrees,
          wind_gust, visibility, cloud_cover, precipitation, rainfall_24h,
          uv_index, weather_code, weather_description, is_day
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17, $18, $19, $20
        );
      `;
      try {
        await this.pool.query(query, [
          obs.location.id,
          obs.source,
          new Date(obs.observedAt),
          obs.temperature,
          obs.feelsLike,
          obs.humidity,
          obs.dewPoint,
          obs.pressure,
          obs.windSpeed,
          obs.windDirection,
          obs.windDirectionDegrees,
          obs.windGust,
          obs.visibility,
          obs.cloudCover,
          obs.precipitation,
          obs.rainfall24h || null,
          obs.uvIndex,
          obs.weatherCode,
          obs.condition,
          obs.isDay,
        ]);
        return;
      } catch (err: any) {
        console.warn('[Mausam DB] Error executing saveWeatherObservation on PostgreSQL:', err.message);
      }
    }

    const list = this.memObservations.get(obs.location.id) || [];
    list.unshift(obs);
    if (list.length > 50) list.pop(); // Keep last 50
    this.memObservations.set(obs.location.id, list);
  }

  public async getLatestObservation(locationId: string): Promise<NormalizedWeather | null> {
    if (this.isPostgresActive && this.pool) {
      try {
        const res = await this.pool.query(
          `SELECT * FROM weather_observations WHERE location_id = $1 ORDER BY observed_at DESC LIMIT 1;`,
          [locationId]
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const locRes = await this.pool.query(`SELECT * FROM locations WHERE id = $1;`, [locationId]);
          const locRow = locRes.rows[0] || {};
          return {
            location: {
              id: locationId,
              name: locRow.name || 'Location',
              city: locRow.city,
              district: locRow.district,
              state: locRow.state,
              country: locRow.country || 'India',
              latitude: Number(locRow.latitude),
              longitude: Number(locRow.longitude),
            },
            observedAt: row.observed_at.toISOString(),
            fetchedAt: new Date().toISOString(),
            dataStatus: 'RECENT',
            ageSeconds: Math.round((Date.now() - new Date(row.observed_at).getTime()) / 1000),
            temperature: row.temperature !== null ? Number(row.temperature) : null,
            feelsLike: row.feels_like !== null ? Number(row.feels_like) : null,
            humidity: row.humidity !== null ? Number(row.humidity) : null,
            dewPoint: row.dew_point !== null ? Number(row.dew_point) : null,
            pressure: row.pressure !== null ? Number(row.pressure) : null,
            windSpeed: row.wind_speed !== null ? Number(row.wind_speed) : null,
            windDirection: row.wind_direction,
            windDirectionDegrees: row.wind_direction_degrees !== null ? Number(row.wind_direction_degrees) : null,
            windGust: row.wind_gust !== null ? Number(row.wind_gust) : null,
            visibility: row.visibility !== null ? Number(row.visibility) : null,
            cloudCover: row.cloud_cover !== null ? Number(row.cloud_cover) : null,
            precipitation: row.precipitation !== null ? Number(row.precipitation) : null,
            rainfall24h: row.rainfall_24h !== null ? Number(row.rainfall_24h) : null,
            uvIndex: row.uv_index !== null ? Number(row.uv_index) : null,
            weatherCode: row.weather_code,
            condition: row.weather_description || 'Observed',
            isDay: row.is_day ?? true,
            source: row.source,
            sourcePriority: 1,
            isFallback: false,
            rawSourceAttribution: 'Relational Database Store',
          };
        }
      } catch (err: any) {
        console.warn('[Mausam DB] Query getLatestObservation failed on PostgreSQL:', err.message);
      }
    }

    const list = this.memObservations.get(locationId);
    return list && list.length > 0 ? list[0] : null;
  }

  public async saveForecast(forecast: NormalizedForecast): Promise<void> {
    await this.upsertLocation(forecast.location);

    if (this.isPostgresActive && this.pool) {
      try {
        const client = await this.pool.connect();
        try {
          await client.query('BEGIN');
          for (const step of forecast.hourly.slice(0, 24)) {
            await client.query(
              `INSERT INTO weather_forecasts (
                location_id, source, model, forecast_time, temperature, feels_like,
                precipitation_probability, precipitation, humidity, wind_speed, weather_code
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [
                forecast.location.id,
                forecast.source,
                forecast.model,
                new Date(step.time),
                step.temperature,
                step.feelsLike,
                step.precipitationProbability,
                step.precipitation,
                step.humidity,
                step.windSpeed,
                step.weatherCode,
              ]
            );
          }
          await client.query('COMMIT');
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
        return;
      } catch (err: any) {
        console.warn('[Mausam DB] Error saving forecast to PostgreSQL:', err.message);
      }
    }

    this.memForecasts.set(forecast.location.id, forecast);
  }

  public async getForecast(locationId: string): Promise<NormalizedForecast | null> {
    return this.memForecasts.get(locationId) || null;
  }

  public async saveAQI(aqi: NormalizedAQI): Promise<void> {
    await this.upsertLocation(aqi.location);
    this.memAQI.set(aqi.location.id, aqi);
  }

  public async getAQI(locationId: string): Promise<NormalizedAQI | null> {
    return this.memAQI.get(locationId) || null;
  }
}

export const weatherDatabase = WeatherDatabaseService.getInstance();
