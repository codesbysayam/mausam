-- ====================================================================
-- MAUSAM - Atmospheric Intelligence Platform
-- Production PostgreSQL Database Schema & Migration Script
-- Compatible with Vercel Postgres, Supabase, Neon & Self-Hosted Postgres
-- ====================================================================

-- 1. Locations Table
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_locations_lat_lon ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_state_dist ON locations(state, district);

-- 2. Stations Table
CREATE TABLE IF NOT EXISTS stations (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  state VARCHAR(128),
  district VARCHAR(128),
  station_type VARCHAR(64) NOT NULL, -- AWS, ARG, DWR, CAAQMS, SYNOPTIC
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  elevation DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stations_type ON stations(station_type);
CREATE INDEX IF NOT EXISTS idx_stations_coords ON stations(latitude, longitude);

-- 3. Weather Observations Table
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
  weather_code INTEGER,
  raw_payload_hash VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_weather_obs_loc ON weather_observations(location_id);
CREATE INDEX IF NOT EXISTS idx_weather_obs_source ON weather_observations(source);
CREATE INDEX IF NOT EXISTS idx_weather_obs_observed ON weather_observations(observed_at);
CREATE INDEX IF NOT EXISTS idx_weather_obs_fetched ON weather_observations(fetched_at);

-- 4. Weather Forecasts Table
CREATE TABLE IF NOT EXISTS weather_forecasts (
  id SERIAL PRIMARY KEY,
  location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
  source VARCHAR(64) NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  forecast_json JSONB NOT NULL,
  raw_payload_hash VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_forecasts_loc ON weather_forecasts(location_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_generated ON weather_forecasts(generated_at);

-- 5. Warnings Table
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
CREATE INDEX IF NOT EXISTS idx_warnings_state_dist ON warnings(state, district);
CREATE INDEX IF NOT EXISTS idx_warnings_active ON warnings(is_active);
CREATE INDEX IF NOT EXISTS idx_warnings_validity ON warnings(valid_from, valid_until);

-- 6. AQI Observations Table
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
CREATE INDEX IF NOT EXISTS idx_aqi_observed ON aqi_observations(observed_at);

-- 7. Marine Observations Table
CREATE TABLE IF NOT EXISTS marine_observations (
  id SERIAL PRIMARY KEY,
  location_id VARCHAR(64) REFERENCES locations(id) ON DELETE CASCADE,
  source VARCHAR(64) NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  wave_height_meters DOUBLE PRECISION,
  swell_height_meters DOUBLE PRECISION,
  wave_period_seconds DOUBLE PRECISION,
  sst_celsius DOUBLE PRECISION,
  current_speed_knots DOUBLE PRECISION,
  current_direction_deg DOUBLE PRECISION
);
CREATE INDEX IF NOT EXISTS idx_marine_loc ON marine_observations(location_id);
CREATE INDEX IF NOT EXISTS idx_marine_observed ON marine_observations(observed_at);

-- 8. Radar Frames Table
CREATE TABLE IF NOT EXISTS radar_frames (
  id SERIAL PRIMARY KEY,
  source VARCHAR(64) NOT NULL,
  frame_epoch BIGINT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  path TEXT NOT NULL,
  tile_url TEXT NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_radar_epoch ON radar_frames(frame_epoch);

-- 9. Provider Health Table
CREATE TABLE IF NOT EXISTS provider_health (
  provider_code VARCHAR(64) PRIMARY KEY,
  provider_name VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  last_success TIMESTAMPTZ,
  last_failure TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  last_latency_ms INTEGER,
  last_error TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Data Fetch Logs Table
CREATE TABLE IF NOT EXISTS data_fetch_logs (
  id SERIAL PRIMARY KEY,
  provider_code VARCHAR(64) NOT NULL,
  endpoint TEXT NOT NULL,
  http_status INTEGER,
  latency_ms INTEGER,
  records_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fetch_logs_provider ON data_fetch_logs(provider_code);
CREATE INDEX IF NOT EXISTS idx_fetch_logs_created ON data_fetch_logs(created_at);
