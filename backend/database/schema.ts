// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// PostgreSQL Database Schema & Entity Definitions
// Optimized for Neon, Supabase, Vercel Postgres & High-Throughput Ingestion
// ====================================================================

export type ProviderCategory = 'GOVERNMENT' | 'COMMERCIAL' | 'OPEN_DATA';
export type ProviderStatus = 'OPERATIONAL' | 'DEGRADED' | 'STALE' | 'NOT_CONFIGURED' | 'UNAVAILABLE';
export type ObservationStatus = 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
export type WarningSeverity = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
export type ForecastType = 'HOURLY' | 'DAILY' | 'EXTENDED';

// --------------------------------------------------------------------
// 1. Entity Interfaces
// --------------------------------------------------------------------

export interface LocationRecord {
  id: string; // e.g. "28.614_77.209" or UUID
  name: string;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number | null;
  timezone: string;
  last_resolved?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface ProviderHealthRecord {
  provider_code: string; // e.g. "OPEN_METEO", "IMD", "CPCB", "SACHET", "INCOIS", "RADAR"
  provider_name: string;
  category: ProviderCategory;
  status: ProviderStatus;
  is_configured: boolean;
  latency_ms?: number | null;
  last_success?: Date | string | null;
  last_failure?: Date | string | null;
  last_checked: Date | string;
  requests_count: number;
  successful_requests: number;
  failed_requests: number;
  cache_hits: number;
  cache_misses: number;
  last_error?: string | null;
  source_url?: string | null;
  attribution_text?: string | null;
  attribution_url?: string | null;
  updated_at?: Date | string;
}

export interface WeatherObservationRecord {
  id?: number;
  location_id: string;
  provider: string; // "Open-Meteo", "IMD", etc.
  location_name?: string | null;
  latitude: number;
  longitude: number;
  observed_at: Date | string;
  received_at: Date | string;
  status: ObservationStatus;
  temperature?: number | null;
  feels_like?: number | null;
  humidity?: number | null;
  dew_point?: number | null;
  pressure?: number | null;
  pressure_trend?: string | null;
  wind_speed?: number | null;
  wind_direction?: string | null;
  wind_direction_deg?: number | null;
  wind_gust?: number | null;
  precipitation?: number | null;
  rain?: number | null;
  showers?: number | null;
  snowfall?: number | null;
  cloud_cover?: number | null;
  visibility?: number | null;
  uv_index?: number | null;
  weather_code?: number | null;
  condition_text?: string | null;
  is_day?: boolean | null;
  sunrise?: Date | string | null;
  sunset?: Date | string | null;
  source_url?: string | null;
  ttl_seconds?: number;
  payload_json?: any;
  error_message?: string | null;
}

export interface WeatherForecastRecord {
  id?: number;
  location_id: string;
  provider: string;
  location_name?: string | null;
  latitude: number;
  longitude: number;
  forecast_type: ForecastType;
  generated_at: Date | string;
  received_at: Date | string;
  status: ObservationStatus;
  payload_json: any;
  source_url?: string | null;
  ttl_seconds?: number;
  error_message?: string | null;
}

export interface WarningAlertRecord {
  id: string; // Alert UUID or CAP identifier
  provider: string; // "SACHET", "IMD", "NDMA"
  hazard: string;
  severity: WarningSeverity;
  severity_label?: string | null;
  state?: string | null;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  headline?: string | null;
  description?: string | null;
  instruction?: string | null;
  issued_at: Date | string;
  received_at: Date | string;
  valid_from?: Date | string | null;
  valid_until?: Date | string | null;
  is_active: boolean;
  affected_area?: string | null;
  source_url?: string | null;
  ttl_seconds?: number;
  payload_json?: any;
  error_message?: string | null;
}

export interface AqiObservationRecord {
  id?: number;
  location_id: string;
  provider: string; // "CPCB", "OPEN_METEO_CAMS"
  station_id?: string | null;
  station_name?: string | null;
  location_name?: string | null;
  latitude: number;
  longitude: number;
  observed_at: Date | string;
  received_at: Date | string;
  status: ObservationStatus;
  aqi: number;
  category: string; // "Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe"
  dominant_pollutant?: string | null;
  pm25?: number | null;
  pm10?: number | null;
  no2?: number | null;
  so2?: number | null;
  co?: number | null;
  o3?: number | null;
  payload_json?: any;
  source_url?: string | null;
  ttl_seconds?: number;
  error_message?: string | null;
}

export interface MarineObservationRecord {
  id?: number;
  location_id: string;
  provider: string; // "INCOIS", "OPEN_MARINE"
  location_name?: string | null;
  latitude: number;
  longitude: number;
  observed_at: Date | string;
  received_at: Date | string;
  status: ObservationStatus;
  wave_height_meters?: number | null;
  swell_height_meters?: number | null;
  wave_period_seconds?: number | null;
  sst_celsius?: number | null;
  current_speed_knots?: number | null;
  current_direction_deg?: number | null;
  coastal_advisory?: string | null;
  payload_json?: any;
  source_url?: string | null;
  ttl_seconds?: number;
  error_message?: string | null;
}

export interface RadarMetadataRecord {
  id?: number;
  provider: string; // "RAINVIEWER", "IMD_DWR"
  frame_epoch: number;
  observed_at: Date | string;
  received_at: Date | string;
  status: ObservationStatus;
  path: string;
  tile_url: string;
  host_url?: string | null;
  source_url?: string | null;
  ttl_seconds?: number;
  error_message?: string | null;
}

export interface ApiRequestLogRecord {
  id?: number;
  provider: string;
  endpoint: string;
  method?: string;
  http_status?: number | null;
  latency_ms: number;
  is_success: boolean;
  records_count?: number;
  from_cache?: boolean;
  error_message?: string | null;
  created_at?: Date | string;
}

// --------------------------------------------------------------------
// 2. Comprehensive PostgreSQL DDL & Indexing Strategy
// --------------------------------------------------------------------

export const POSTGRES_MIGRATION_DDL = `
-- ====================================================================
-- MAUSAM Atmospheric Intelligence Platform - Production DDL
-- Compatible with Neon, Supabase, Vercel Postgres & Standard PostgreSQL
-- ====================================================================

-- 1. Location Registry & Geographic Cache
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
  last_resolved TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_lat_lon ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_state_dist ON locations(state, district);

-- 2. Provider Health & Telemetry Registry
CREATE TABLE IF NOT EXISTS provider_health (
  provider_code VARCHAR(64) PRIMARY KEY,
  provider_name VARCHAR(128) NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'OPEN_DATA',
  status VARCHAR(32) NOT NULL DEFAULT 'NOT_CONFIGURED',
  is_configured BOOLEAN DEFAULT FALSE,
  latency_ms INTEGER,
  last_success TIMESTAMPTZ,
  last_failure TIMESTAMPTZ,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  requests_count BIGINT DEFAULT 0,
  successful_requests BIGINT DEFAULT 0,
  failed_requests BIGINT DEFAULT 0,
  cache_hits BIGINT DEFAULT 0,
  cache_misses BIGINT DEFAULT 0,
  last_error TEXT,
  source_url TEXT,
  attribution_text TEXT,
  attribution_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_health_status ON provider_health(status);

-- 3. Surface & Model Weather Observations
CREATE TABLE IF NOT EXISTS weather_observations (
  id BIGSERIAL PRIMARY KEY,
  location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
  provider VARCHAR(64) NOT NULL,
  location_name VARCHAR(128),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(32) DEFAULT 'LIVE',
  temperature DOUBLE PRECISION,
  feels_like DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  dew_point DOUBLE PRECISION,
  pressure DOUBLE PRECISION,
  pressure_trend VARCHAR(32),
  wind_speed DOUBLE PRECISION,
  wind_direction VARCHAR(32),
  wind_direction_deg INTEGER,
  wind_gust DOUBLE PRECISION,
  precipitation DOUBLE PRECISION,
  rain DOUBLE PRECISION,
  showers DOUBLE PRECISION,
  snowfall DOUBLE PRECISION,
  cloud_cover DOUBLE PRECISION,
  visibility DOUBLE PRECISION,
  uv_index DOUBLE PRECISION,
  weather_code INTEGER,
  condition_text VARCHAR(128),
  is_day BOOLEAN,
  sunrise TIMESTAMPTZ,
  sunset TIMESTAMPTZ,
  source_url TEXT,
  ttl_seconds INTEGER DEFAULT 300,
  payload_json JSONB,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_weather_obs_coords ON weather_observations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_weather_obs_provider ON weather_observations(provider);
CREATE INDEX IF NOT EXISTS idx_weather_obs_observed ON weather_observations(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_obs_received ON weather_observations(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_obs_status ON weather_observations(status);

-- 4. Hourly & Daily Weather Forecasts
CREATE TABLE IF NOT EXISTS weather_forecasts (
  id BIGSERIAL PRIMARY KEY,
  location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
  provider VARCHAR(64) NOT NULL,
  location_name VARCHAR(128),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  forecast_type VARCHAR(32) NOT NULL DEFAULT 'HOURLY',
  generated_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(32) DEFAULT 'LIVE',
  payload_json JSONB NOT NULL,
  source_url TEXT,
  ttl_seconds INTEGER DEFAULT 1800,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_forecasts_coords ON weather_forecasts(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_forecasts_provider ON weather_forecasts(provider);
CREATE INDEX IF NOT EXISTS idx_forecasts_gen ON weather_forecasts(generated_at DESC);

-- 5. Severe Weather & Disaster Warning Alerts (CAP Standard)
CREATE TABLE IF NOT EXISTS warning_alerts (
  id VARCHAR(128) PRIMARY KEY,
  provider VARCHAR(64) NOT NULL,
  hazard VARCHAR(128) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  severity_label VARCHAR(64),
  state VARCHAR(128),
  district VARCHAR(128),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  headline TEXT,
  description TEXT,
  instruction TEXT,
  issued_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  affected_area TEXT,
  source_url TEXT,
  ttl_seconds INTEGER DEFAULT 180,
  payload_json JSONB,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_warnings_active ON warning_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_warnings_provider ON warning_alerts(provider);
CREATE INDEX IF NOT EXISTS idx_warnings_validity ON warning_alerts(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_warnings_state_dist ON warning_alerts(state, district);

-- 6. Air Quality Observations (CPCB NAQI Standard)
CREATE TABLE IF NOT EXISTS aqi_observations (
  id BIGSERIAL PRIMARY KEY,
  location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
  provider VARCHAR(64) NOT NULL,
  station_id VARCHAR(64),
  station_name VARCHAR(128),
  location_name VARCHAR(128),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(32) DEFAULT 'LIVE',
  aqi INTEGER NOT NULL,
  category VARCHAR(32) NOT NULL,
  dominant_pollutant VARCHAR(32),
  pm25 DOUBLE PRECISION,
  pm10 DOUBLE PRECISION,
  no2 DOUBLE PRECISION,
  so2 DOUBLE PRECISION,
  co DOUBLE PRECISION,
  o3 DOUBLE PRECISION,
  payload_json JSONB,
  source_url TEXT,
  ttl_seconds INTEGER DEFAULT 900,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_aqi_coords ON aqi_observations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_aqi_provider ON aqi_observations(provider);
CREATE INDEX IF NOT EXISTS idx_aqi_observed ON aqi_observations(observed_at DESC);

-- 7. Marine & Ocean State Observations
CREATE TABLE IF NOT EXISTS marine_observations (
  id BIGSERIAL PRIMARY KEY,
  location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
  provider VARCHAR(64) NOT NULL,
  location_name VARCHAR(128),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(32) DEFAULT 'LIVE',
  wave_height_meters DOUBLE PRECISION,
  swell_height_meters DOUBLE PRECISION,
  wave_period_seconds DOUBLE PRECISION,
  sst_celsius DOUBLE PRECISION,
  current_speed_knots DOUBLE PRECISION,
  current_direction_deg DOUBLE PRECISION,
  coastal_advisory TEXT,
  payload_json JSONB,
  source_url TEXT,
  ttl_seconds INTEGER DEFAULT 2700,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_marine_coords ON marine_observations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_marine_observed ON marine_observations(observed_at DESC);

-- 8. Radar Frames & Imagery Metadata
CREATE TABLE IF NOT EXISTS radar_metadata (
  id BIGSERIAL PRIMARY KEY,
  provider VARCHAR(64) NOT NULL,
  frame_epoch BIGINT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(32) DEFAULT 'LIVE',
  path TEXT NOT NULL,
  tile_url TEXT NOT NULL,
  host_url TEXT,
  source_url TEXT,
  ttl_seconds INTEGER DEFAULT 300,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_radar_epoch ON radar_metadata(frame_epoch DESC);
CREATE INDEX IF NOT EXISTS idx_radar_observed ON radar_metadata(observed_at DESC);

-- 9. Real-Time Ingestion Logs & Provider Telemetry
CREATE TABLE IF NOT EXISTS api_request_logs (
  id BIGSERIAL PRIMARY KEY,
  provider VARCHAR(64) NOT NULL,
  endpoint TEXT NOT NULL,
  method VARCHAR(16) DEFAULT 'GET',
  http_status INTEGER,
  latency_ms INTEGER NOT NULL,
  is_success BOOLEAN NOT NULL,
  records_count INTEGER DEFAULT 0,
  from_cache BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_provider ON api_request_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_success ON api_request_logs(is_success);
`;

// --------------------------------------------------------------------
// 3. Parameterized Query Statements
// --------------------------------------------------------------------

export const SQL_QUERIES = {
  // Locations
  UPSERT_LOCATION: `
    INSERT INTO locations (id, name, city, district, state, country, latitude, longitude, elevation, timezone, last_resolved, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      city = COALESCE(EXCLUDED.city, locations.city),
      district = COALESCE(EXCLUDED.district, locations.district),
      state = COALESCE(EXCLUDED.state, locations.state),
      country = EXCLUDED.country,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      elevation = COALESCE(EXCLUDED.elevation, locations.elevation),
      last_resolved = NOW(),
      updated_at = NOW()
    RETURNING *;
  `,

  // Weather Observations
  INSERT_WEATHER_OBSERVATION: `
    INSERT INTO weather_observations (
      location_id, provider, location_name, latitude, longitude, observed_at, received_at,
      status, temperature, feels_like, humidity, dew_point, pressure, pressure_trend,
      wind_speed, wind_direction, wind_direction_deg, wind_gust, precipitation, rain,
      showers, snowfall, cloud_cover, visibility, uv_index, weather_code, condition_text,
      is_day, sunrise, sunset, source_url, ttl_seconds, payload_json, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
    RETURNING id;
  `,

  GET_LATEST_WEATHER_OBSERVATION: `
    SELECT * FROM weather_observations
    WHERE location_id = $1
    ORDER BY observed_at DESC
    LIMIT 1;
  `,

  // Provider Health
  UPSERT_PROVIDER_HEALTH: `
    INSERT INTO provider_health (
      provider_code, provider_name, category, status, is_configured, latency_ms,
      last_success, last_failure, last_checked, requests_count, successful_requests,
      failed_requests, cache_hits, cache_misses, last_error, source_url,
      attribution_text, attribution_url, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
    ON CONFLICT (provider_code) DO UPDATE SET
      provider_name = EXCLUDED.provider_name,
      category = EXCLUDED.category,
      status = EXCLUDED.status,
      is_configured = EXCLUDED.is_configured,
      latency_ms = COALESCE(EXCLUDED.latency_ms, provider_health.latency_ms),
      last_success = COALESCE(EXCLUDED.last_success, provider_health.last_success),
      last_failure = COALESCE(EXCLUDED.last_failure, provider_health.last_failure),
      last_checked = NOW(),
      requests_count = provider_health.requests_count + EXCLUDED.requests_count,
      successful_requests = provider_health.successful_requests + EXCLUDED.successful_requests,
      failed_requests = provider_health.failed_requests + EXCLUDED.failed_requests,
      cache_hits = provider_health.cache_hits + EXCLUDED.cache_hits,
      cache_misses = provider_health.cache_misses + EXCLUDED.cache_misses,
      last_error = EXCLUDED.last_error,
      updated_at = NOW()
    RETURNING *;
  `,

  GET_ALL_PROVIDER_HEALTH: `
    SELECT * FROM provider_health
    ORDER BY category, provider_name;
  `,

  // Forecasts
  INSERT_FORECAST: `
    INSERT INTO weather_forecasts (
      location_id, provider, location_name, latitude, longitude, forecast_type,
      generated_at, received_at, status, payload_json, source_url, ttl_seconds, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12)
    RETURNING id;
  `,

  // AQI Observations
  INSERT_AQI_OBSERVATION: `
    INSERT INTO aqi_observations (
      location_id, provider, station_id, station_name, location_name, latitude, longitude,
      observed_at, received_at, status, aqi, category, dominant_pollutant,
      pm25, pm10, no2, so2, co, o3, payload_json, source_url, ttl_seconds, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    RETURNING id;
  `,

  // Warnings
  UPSERT_WARNING_ALERT: `
    INSERT INTO warning_alerts (
      id, provider, hazard, severity, severity_label, state, district, latitude, longitude,
      headline, description, instruction, issued_at, received_at, valid_from, valid_until,
      is_active, affected_area, source_url, ttl_seconds, payload_json, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), $14, $15, $16, $17, $18, $19, $20, $21)
    ON CONFLICT (id) DO UPDATE SET
      severity = EXCLUDED.severity,
      severity_label = EXCLUDED.severity_label,
      headline = EXCLUDED.headline,
      description = EXCLUDED.description,
      instruction = EXCLUDED.instruction,
      valid_until = EXCLUDED.valid_until,
      is_active = EXCLUDED.is_active,
      received_at = NOW();
  `,

  // Marine Observations
  INSERT_MARINE_OBSERVATION: `
    INSERT INTO marine_observations (
      location_id, provider, location_name, latitude, longitude, observed_at, received_at,
      status, wave_height_meters, swell_height_meters, wave_period_seconds, sst_celsius,
      current_speed_knots, current_direction_deg, coastal_advisory, payload_json, source_url, ttl_seconds, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING id;
  `,

  // Radar Metadata
  INSERT_RADAR_FRAME: `
    INSERT INTO radar_metadata (
      provider, frame_epoch, observed_at, received_at, status, path, tile_url,
      host_url, source_url, ttl_seconds, error_message
    ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, $10)
    RETURNING id;
  `,

  // API Ingestion Logs
  INSERT_API_REQUEST_LOG: `
    INSERT INTO api_request_logs (
      provider, endpoint, method, http_status, latency_ms, is_success, records_count, from_cache, error_message, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING id;
  `,
};
