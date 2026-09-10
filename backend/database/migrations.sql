-- ====================================================================
-- MAUSAM - Atmospheric Intelligence Platform
-- Production PostgreSQL Database Schema & Migration Script
-- Compatible with Neon, Supabase, Vercel Postgres & Standard PostgreSQL
-- ====================================================================

-- 1. Locations Registry & Geographic Cache Table
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

-- 2. Provider Health & Telemetry Registry Table
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

-- 3. Weather Observations Table (Surface & Satellite Feeds)
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

-- 4. Weather Forecasts Table
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

-- 5. Severe Weather & Disaster Warnings Table (CAP Standard)
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

-- 6. Air Quality Observations Table (CPCB NAQI Standard)
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

-- 7. Marine & Ocean State Observations Table (INCOIS / Ocean Marine)
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

-- 8. Radar Imagery & Frame Metadata Table
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

-- 9. Real-Time Ingestion Logs & Provider Telemetry Table
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
