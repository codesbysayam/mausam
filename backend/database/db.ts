// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// PostgreSQL Database Layer & Connection Pool
// Compatible with Neon, Supabase, Vercel Postgres & Standard PostgreSQL
// ====================================================================

import pg from 'pg';
import {
  POSTGRES_MIGRATION_DDL,
  SQL_QUERIES,
  ProviderHealthRecord,
} from './schema';
import {
  NormalizedWeather,
  NormalizedForecast,
  NormalizedAQI,
  NormalizedWarningItem,
  NormalizedMarine,
  RadarFrameInfo,
  GeoLocation,
} from '../normalization/types';

const { Pool } = pg;

export interface DatabaseStatus {
  configured: boolean;
  connected: boolean;
  provider: 'POSTGRESQL' | 'NOT_CONFIGURED';
  latencyMs?: number | null;
  poolSize?: number;
  lastChecked: string;
  error?: string;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private pool: pg.Pool | null = null;
  private isConfigured = false;
  private isConnected = false;
  private lastLatencyMs: number | null = null;
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
    const start = Date.now();
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      this.lastLatencyMs = Date.now() - start;
      this.isConnected = true;
      this.lastError = null;

      if (!this.migrationRan) {
        await client.query(POSTGRES_MIGRATION_DDL);
        this.migrationRan = true;
      }

      client.release();
      console.log(`[Mausam DB] PostgreSQL connected successfully (${this.lastLatencyMs}ms) and schemas verified.`);
    } catch (err: any) {
      this.lastLatencyMs = null;
      this.isConnected = false;
      this.lastError = err.message;
      console.warn('[Mausam DB] PostgreSQL connection test failed:', err.message);
    }
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

    const start = Date.now();
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.lastLatencyMs = Date.now() - start;
      this.isConnected = true;

      return {
        configured: true,
        connected: true,
        provider: 'POSTGRESQL',
        latencyMs: this.lastLatencyMs,
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
        latencyMs: null,
        error: err.message,
        lastChecked: now,
      };
    }
  }

  public async upsertLocation(loc: GeoLocation): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      const id = loc.id || `${loc.latitude.toFixed(3)}_${loc.longitude.toFixed(3)}`;
      await this.pool.query(SQL_QUERIES.UPSERT_LOCATION, [
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

      await this.pool.query(SQL_QUERIES.INSERT_WEATHER_OBSERVATION, [
        locId,
        obs.source,
        obs.location.name,
        obs.location.latitude,
        obs.location.longitude,
        obs.observedAt,
        obs.dataStatus,
        obs.temperature,
        obs.feelsLike,
        obs.humidity,
        obs.dewPoint,
        obs.pressure,
        obs.pressureTrend || 'steady',
        obs.windSpeed,
        obs.windDirection,
        obs.windDirectionDegrees,
        obs.windGust,
        obs.precipitation,
        obs.rain ?? null,
        obs.showers ?? null,
        obs.snowfall ?? null,
        obs.cloudCover,
        obs.visibility,
        obs.uvIndex,
        obs.weatherCode,
        obs.condition,
        obs.isDay,
        obs.sunrise ? new Date(obs.sunrise) : null,
        obs.sunset ? new Date(obs.sunset) : null,
        obs.rawSourceAttribution || null,
        300,
        JSON.stringify(obs),
        null,
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

      await this.pool.query(SQL_QUERIES.INSERT_FORECAST, [
        locId,
        forecast.source,
        forecast.location.name,
        forecast.location.latitude,
        forecast.location.longitude,
        'HOURLY',
        forecast.generatedAt,
        'LIVE',
        JSON.stringify(forecast),
        forecast.sourceAttribution || null,
        1800,
        null,
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

      await this.pool.query(SQL_QUERIES.INSERT_AQI_OBSERVATION, [
        locId,
        aqi.source,
        aqi.stationId,
        aqi.stationName,
        aqi.location.name,
        aqi.location.latitude,
        aqi.location.longitude,
        aqi.observedAt,
        aqi.dataStatus,
        aqi.aqi,
        aqi.category,
        aqi.dominantPollutant,
        aqi.pollutants.pm25?.concentration ?? null,
        aqi.pollutants.pm10?.concentration ?? null,
        aqi.pollutants.no2?.concentration ?? null,
        aqi.pollutants.so2?.concentration ?? null,
        aqi.pollutants.co?.concentration ?? null,
        aqi.pollutants.o3?.concentration ?? null,
        JSON.stringify(aqi),
        null,
        900,
        null,
      ]);
    } catch (err: any) {
      console.warn('[Mausam DB] saveAQI failed:', err.message);
    }
  }

  public async saveWarning(warning: NormalizedWarningItem): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      await this.pool.query(SQL_QUERIES.UPSERT_WARNING_ALERT, [
        warning.id,
        warning.source,
        warning.hazard,
        warning.severity,
        warning.severityLabel,
        warning.state || null,
        warning.district || null,
        warning.coordinates?.lat || null,
        warning.coordinates?.lon || null,
        warning.headline || null,
        warning.description,
        warning.instruction || null,
        warning.issuedAt,
        warning.validFrom ? new Date(warning.validFrom) : null,
        warning.validUntil ? new Date(warning.validUntil) : null,
        warning.isActive,
        warning.affectedArea,
        null,
        180,
        JSON.stringify(warning),
        null,
      ]);
    } catch (err: any) {
      console.warn('[Mausam DB] saveWarning failed:', err.message);
    }
  }

  public async saveMarine(marine: NormalizedMarine): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      await this.upsertLocation(marine.location);
      const locId = marine.location.id || `${marine.location.latitude.toFixed(3)}_${marine.location.longitude.toFixed(3)}`;

      await this.pool.query(SQL_QUERIES.INSERT_MARINE_OBSERVATION, [
        locId,
        marine.source,
        marine.location.name,
        marine.location.latitude,
        marine.location.longitude,
        marine.observedAt,
        marine.dataStatus,
        marine.significantWaveHeightMeters ?? null,
        marine.swellHeightMeters ?? null,
        marine.wavePeriodSeconds ?? null,
        marine.seaSurfaceTemperatureCelsius ?? null,
        marine.surfaceCurrentSpeedKnots ?? null,
        marine.surfaceCurrentDirectionDeg ?? null,
        marine.coastalAdvisory || null,
        JSON.stringify(marine),
        null,
        2700,
        marine.message || null,
      ]);
    } catch (err: any) {
      console.warn('[Mausam DB] saveMarine failed:', err.message);
    }
  }

  public async saveRadarFrame(radar: RadarFrameInfo): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      await this.pool.query(SQL_QUERIES.INSERT_RADAR_FRAME, [
        radar.source,
        radar.frameEpoch,
        radar.observedTime,
        radar.status,
        radar.path,
        radar.tileUrl,
        radar.radarHost,
        null,
        300,
        null,
      ]);
    } catch (err: any) {
      console.warn('[Mausam DB] saveRadarFrame failed:', err.message);
    }
  }

  public async updateProviderHealth(record: Partial<ProviderHealthRecord> & { provider_code: string; provider_name: string }): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      await this.pool.query(SQL_QUERIES.UPSERT_PROVIDER_HEALTH, [
        record.provider_code,
        record.provider_name,
        record.category || 'OPEN_DATA',
        record.status || 'NOT_CONFIGURED',
        record.is_configured ?? false,
        record.latency_ms ?? null,
        record.last_success ? new Date(record.last_success) : null,
        record.last_failure ? new Date(record.last_failure) : null,
        record.requests_count ?? 1,
        record.successful_requests ?? (record.status === 'OPERATIONAL' ? 1 : 0),
        record.failed_requests ?? (record.status === 'UNAVAILABLE' ? 1 : 0),
        record.cache_hits ?? 0,
        record.cache_misses ?? 1,
        record.last_error ?? null,
        record.source_url ?? null,
        record.attribution_text ?? null,
        record.attribution_url ?? null,
      ]);
    } catch (err: any) {
      console.warn('[Mausam DB] updateProviderHealth failed:', err.message);
    }
  }

  public async logApiRequest(
    provider: string,
    endpoint: string,
    latencyMs: number,
    isSuccess: boolean,
    httpStatus?: number,
    fromCache = false,
    errorMessage?: string
  ): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      await this.pool.query(SQL_QUERIES.INSERT_API_REQUEST_LOG, [
        provider,
        endpoint,
        'GET',
        httpStatus || (isSuccess ? 200 : 500),
        latencyMs,
        isSuccess,
        1,
        fromCache,
        errorMessage || null,
      ]);
    } catch {
      // Non-blocking log
    }
  }
}

export const dbService = DatabaseService.getInstance();
