// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// PostgreSQL Database Layer & Connection Pool
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
  configured: boolean;
  connected: boolean;
  provider: 'POSTGRESQL' | 'NOT_CONFIGURED';
  poolSize?: number;
  lastChecked: string;
  error?: string;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: pg.Pool | null = null;
  private isConfigured = false;
  private isConnected = false;
  private lastError: string | null = null;
  private migrationRan = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initialize(): void {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
      this.isConfigured = false;
      this.isConnected = false;
      console.log('[Mausam DB] DATABASE_URL not configured. Running in stateless API-first mode without persistent database.');
      return;
    }

    try {
      this.isConfigured = true;
      this.pool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      });

      this.pool.on('error', (err) => {
        console.warn('[Mausam DB] Unexpected PostgreSQL client error:', err.message);
        this.isConnected = false;
        this.lastError = err.message;
      });

      // Test connection and run schema migrations
      this.testAndMigrate();
    } catch (err: any) {
      this.isConnected = false;
      this.lastError = err.message;
      console.warn('[Mausam DB] Failed to create PostgreSQL pool:', err.message);
    }
  }

  private async testAndMigrate(): Promise<void> {
    if (!this.pool) return;
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      this.isConnected = true;
      this.lastError = null;

      if (!this.migrationRan) {
        await this.runMigrations(client);
        this.migrationRan = true;
      }

      client.release();
      console.log('[Mausam DB] PostgreSQL connected successfully and schemas verified.');
    } catch (err: any) {
      this.isConnected = false;
      this.lastError = err.message;
      console.warn('[Mausam DB] PostgreSQL connection test failed:', err.message);
    }
  }

  private async runMigrations(client: pg.PoolClient): Promise<void> {
    const ddl = `
      CREATE TABLE IF NOT EXISTS locations (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        city VARCHAR(128),
        district VARCHAR(128),
        state VARCHAR(128),
        country VARCHAR(64) DEFAULT 'India',
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        elevation DOUBLE PRECISION,
        timezone VARCHAR(64) DEFAULT 'Asia/Kolkata',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_locations_lat_lon ON locations(latitude, longitude);

      CREATE TABLE IF NOT EXISTS weather_observations (
        id SERIAL PRIMARY KEY,
        location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
        source VARCHAR(64) NOT NULL,
        observed_at TIMESTAMPTZ NOT NULL,
        fetched_at TIMESTAMPTZ DEFAULT NOW(),
        temperature DOUBLE PRECISION,
        feels_like DOUBLE PRECISION,
        humidity DOUBLE PRECISION,
        dew_point DOUBLE PRECISION,
        pressure DOUBLE PRECISION,
        wind_speed DOUBLE PRECISION,
        wind_direction VARCHAR(32),
        wind_gust DOUBLE PRECISION,
        precipitation DOUBLE PRECISION,
        rain DOUBLE PRECISION,
        snowfall DOUBLE PRECISION,
        cloud_cover DOUBLE PRECISION,
        visibility DOUBLE PRECISION,
        uv_index DOUBLE PRECISION,
        weather_code INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_weather_obs_loc ON weather_observations(location_id);
      CREATE INDEX IF NOT EXISTS idx_weather_obs_observed ON weather_observations(observed_at);
      CREATE INDEX IF NOT EXISTS idx_weather_obs_fetched ON weather_observations(fetched_at);

      CREATE TABLE IF NOT EXISTS weather_forecasts (
        id SERIAL PRIMARY KEY,
        location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
        source VARCHAR(64) NOT NULL,
        generated_at TIMESTAMPTZ NOT NULL,
        fetched_at TIMESTAMPTZ DEFAULT NOW(),
        forecast_json JSONB NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_forecasts_loc ON weather_forecasts(location_id);

      CREATE TABLE IF NOT EXISTS aqi_observations (
        id SERIAL PRIMARY KEY,
        location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
        source VARCHAR(64) NOT NULL,
        station_id VARCHAR(64),
        observed_at TIMESTAMPTZ NOT NULL,
        fetched_at TIMESTAMPTZ DEFAULT NOW(),
        aqi INTEGER NOT NULL,
        category VARCHAR(32) NOT NULL,
        dominant_pollutant VARCHAR(32),
        pm25 DOUBLE PRECISION,
        pm10 DOUBLE PRECISION,
        no2 DOUBLE PRECISION,
        so2 DOUBLE PRECISION,
        co DOUBLE PRECISION,
        o3 DOUBLE PRECISION
      );
      CREATE INDEX IF NOT EXISTS idx_aqi_loc ON aqi_observations(location_id);

      CREATE TABLE IF NOT EXISTS warnings (
        id VARCHAR(128) PRIMARY KEY,
        source VARCHAR(64) NOT NULL,
        hazard VARCHAR(128) NOT NULL,
        severity VARCHAR(32) NOT NULL,
        state VARCHAR(128),
        district VARCHAR(128),
        headline TEXT,
        description TEXT,
        instruction TEXT,
        issued_at TIMESTAMPTZ NOT NULL,
        valid_from TIMESTAMPTZ,
        valid_until TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT TRUE,
        fetched_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_warnings_active ON warnings(is_active);
    `;
    await client.query(ddl);
  }

  public async getStatus(): Promise<DatabaseStatus> {
    const now = new Date().toISOString();

    if (!this.isConfigured || !this.pool) {
      return {
        configured: false,
        connected: false,
        provider: 'NOT_CONFIGURED',
        lastChecked: now,
        error: 'DATABASE_URL environment variable is not configured',
      };
    }

    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.isConnected = true;

      return {
        configured: true,
        connected: true,
        provider: 'POSTGRESQL',
        poolSize: this.pool.totalCount,
        lastChecked: now,
      };
    } catch (err: any) {
      this.isConnected = false;
      this.lastError = err.message;
      return {
        configured: true,
        connected: false,
        provider: 'POSTGRESQL',
        error: err.message,
        lastChecked: now,
      };
    }
  }

  public async upsertLocation(loc: GeoLocation): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      const id = loc.id || `${loc.latitude.toFixed(3)}_${loc.longitude.toFixed(3)}`;
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
          updated_at = NOW()
      `;
      await this.pool.query(query, [
        id,
        loc.name,
        loc.city || null,
        loc.district || null,
        loc.state || null,
        loc.country || 'India',
        loc.latitude,
        loc.longitude,
        loc.elevation || null,
        loc.timezone || 'Asia/Kolkata',
      ]);
    } catch (err: any) {
      console.warn('[Mausam DB] upsertLocation failed:', err.message);
    }
  }

  public async saveWeatherObservation(obs: NormalizedWeather): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      await this.upsertLocation(obs.location);
      const locId = obs.location.id || `${obs.location.latitude.toFixed(3)}_${obs.location.longitude.toFixed(3)}`;
      const query = `
        INSERT INTO weather_observations (
          location_id, source, observed_at, fetched_at, temperature, feels_like,
          humidity, dew_point, pressure, wind_speed, wind_direction, wind_gust,
          precipitation, rain, snowfall, cloud_cover, visibility, uv_index, weather_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      `;
      await this.pool.query(query, [
        locId,
        obs.source,
        obs.observedAt,
        obs.fetchedAt,
        obs.temperature,
        obs.feelsLike,
        obs.humidity,
        obs.dewPoint,
        obs.pressure,
        obs.windSpeed,
        obs.windDirection,
        obs.windGust,
        obs.precipitation,
        obs.rain ?? null,
        obs.snowfall ?? null,
        obs.cloudCover,
        obs.visibility,
        obs.uvIndex,
        obs.weatherCode,
      ]);
    } catch (err: any) {
      console.warn('[Mausam DB] saveWeatherObservation failed:', err.message);
    }
  }

  public async saveForecast(forecast: NormalizedForecast): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      await this.upsertLocation(forecast.location);
      const locId = forecast.location.id || `${forecast.location.latitude.toFixed(3)}_${forecast.location.longitude.toFixed(3)}`;
      const query = `
        INSERT INTO weather_forecasts (location_id, source, generated_at, fetched_at, forecast_json)
        VALUES ($1, $2, $3, NOW(), $4)
      `;
      await this.pool.query(query, [
        locId,
        forecast.source,
        forecast.generatedAt,
        JSON.stringify(forecast),
      ]);
    } catch (err: any) {
      console.warn('[Mausam DB] saveForecast failed:', err.message);
    }
  }

  public async saveAQI(aqi: NormalizedAQI): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      await this.upsertLocation(aqi.location);
      const locId = aqi.location.id || `${aqi.location.latitude.toFixed(3)}_${aqi.location.longitude.toFixed(3)}`;
      const query = `
        INSERT INTO aqi_observations (
          location_id, source, station_id, observed_at, fetched_at, aqi,
          category, dominant_pollutant, pm25, pm10, no2, so2, co, o3
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `;
      await this.pool.query(query, [
        locId,
        aqi.source,
        aqi.stationId,
        aqi.observedAt,
        aqi.fetchedAt,
        aqi.aqi,
        aqi.category,
        aqi.dominantPollutant,
        aqi.pollutants.pm25?.concentration ?? null,
        aqi.pollutants.pm10?.concentration ?? null,
        aqi.pollutants.no2?.concentration ?? null,
        aqi.pollutants.so2?.concentration ?? null,
        aqi.pollutants.co?.concentration ?? null,
        aqi.pollutants.o3?.concentration ?? null,
      ]);
    } catch (err: any) {
      console.warn('[Mausam DB] saveAQI failed:', err.message);
    }
  }
}

export const dbService = DatabaseService.getInstance();
