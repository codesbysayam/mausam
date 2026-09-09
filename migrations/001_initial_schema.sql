-- ====================================================================
-- MAUSAM - Atmospheric Intelligence Platform
-- PostgreSQL Relational Schema Migration 001
-- Multi-Source Normalized Weather & Environmental Telemetry
-- Compatible with Supabase, Neon, AWS RDS, and Cloud SQL PostgreSQL
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    elevation NUMERIC(8, 2),
    timezone VARCHAR(64) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_lat ON locations (latitude);
CREATE INDEX IF NOT EXISTS idx_locations_lng ON locations (longitude);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations (city);
CREATE INDEX IF NOT EXISTS idx_locations_district ON locations (district);
CREATE INDEX IF NOT EXISTS idx_locations_state ON locations (state);
CREATE INDEX IF NOT EXISTS idx_locations_country ON locations (country);
CREATE INDEX IF NOT EXISTS idx_locations_lat_lon ON locations (latitude, longitude);

-- 3. DATA SOURCES TABLE
CREATE TABLE IF NOT EXISTS data_sources (
    code VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'GOVERNMENT', 'COMMERCIAL', 'OPEN_DATA'
    base_url VARCHAR(512),
    auth_type VARCHAR(64) DEFAULT 'API_KEY',
    is_active BOOLEAN DEFAULT TRUE,
    attribution VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. WEATHER OBSERVATIONS TABLE
CREATE TABLE IF NOT EXISTS weather_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    source VARCHAR(64) NOT NULL,
    source_station_id VARCHAR(64),
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature NUMERIC(5, 2),
    feels_like NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    dew_point NUMERIC(5, 2),
    pressure NUMERIC(7, 2),
    pressure_trend VARCHAR(32),
    wind_speed NUMERIC(6, 2),
    wind_direction VARCHAR(16),
    wind_direction_degrees NUMERIC(5, 2),
    wind_gust NUMERIC(6, 2),
    visibility NUMERIC(6, 2),
    cloud_cover NUMERIC(5, 2),
    precipitation NUMERIC(7, 2),
    rainfall_1h NUMERIC(7, 2),
    rainfall_3h NUMERIC(7, 2),
    rainfall_24h NUMERIC(7, 2),
    uv_index NUMERIC(4, 1),
    weather_code INT,
    weather_description VARCHAR(255),
    is_day BOOLEAN,
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_obs_location ON weather_observations (location_id);
CREATE INDEX IF NOT EXISTS idx_weather_obs_observed ON weather_observations (observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_obs_source ON weather_observations (source);

-- 5. WEATHER FORECASTS TABLE
CREATE TABLE IF NOT EXISTS weather_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    source VARCHAR(64) NOT NULL,
    model VARCHAR(64) NOT NULL DEFAULT 'ENSEMBLE',
    run_time TIMESTAMP WITH TIME ZONE,
    forecast_time TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature NUMERIC(5, 2),
    feels_like NUMERIC(5, 2),
    precipitation_probability NUMERIC(5, 2),
    precipitation NUMERIC(7, 2),
    rain NUMERIC(7, 2),
    snowfall NUMERIC(7, 2),
    humidity NUMERIC(5, 2),
    pressure NUMERIC(7, 2),
    wind_speed NUMERIC(6, 2),
    wind_direction VARCHAR(16),
    wind_gust NUMERIC(6, 2),
    cloud_cover NUMERIC(5, 2),
    uv_index NUMERIC(4, 1),
    weather_code INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecasts_location ON weather_forecasts (location_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_time ON weather_forecasts (forecast_time);
CREATE INDEX IF NOT EXISTS idx_forecasts_source ON weather_forecasts (source);
CREATE INDEX IF NOT EXISTS idx_forecasts_model ON weather_forecasts (model);

-- 6. WEATHER HOURLY & DAILY
CREATE TABLE IF NOT EXISTS weather_hourly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature NUMERIC(5, 2),
    feels_like NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    rain_probability NUMERIC(5, 2),
    precipitation NUMERIC(6, 2),
    weather_code INT,
    wind_speed NUMERIC(6, 2),
    source VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (location_id, timestamp, source)
);

CREATE TABLE IF NOT EXISTS weather_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    temp_max NUMERIC(5, 2),
    temp_min NUMERIC(5, 2),
    weather_code INT,
    condition VARCHAR(128),
    precipitation_sum NUMERIC(6, 2),
    precipitation_probability_max NUMERIC(5, 2),
    wind_speed_max NUMERIC(6, 2),
    uv_index_max NUMERIC(4, 1),
    sunrise VARCHAR(32),
    sunset VARCHAR(32),
    source VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (location_id, date, source)
);

-- 7. WARNINGS TABLE
CREATE TABLE IF NOT EXISTS warnings (
    id VARCHAR(128) PRIMARY KEY,
    source VARCHAR(64) NOT NULL,
    warning_id VARCHAR(128),
    country VARCHAR(64) DEFAULT 'India',
    state VARCHAR(128),
    district VARCHAR(128),
    subdivision VARCHAR(128),
    hazard VARCHAR(128) NOT NULL,
    severity VARCHAR(32) NOT NULL, -- 'RED', 'ORANGE', 'YELLOW', 'GREEN'
    warning_code VARCHAR(64),
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    affected_area TEXT,
    description TEXT,
    safety_guidance TEXT[],
    source_url VARCHAR(512),
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warnings_district ON warnings (district);
CREATE INDEX IF NOT EXISTS idx_warnings_state ON warnings (state);
CREATE INDEX IF NOT EXISTS idx_warnings_severity ON warnings (severity);
CREATE INDEX IF NOT EXISTS idx_warnings_validity ON warnings (valid_until);

-- 8. AQI OBSERVATIONS & POLLUTANTS
CREATE TABLE IF NOT EXISTS aqi_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    station_id VARCHAR(64),
    source VARCHAR(64) NOT NULL,
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    aqi INT,
    category VARCHAR(64),
    pm25 NUMERIC(7, 2),
    pm10 NUMERIC(7, 2),
    no2 NUMERIC(7, 2),
    so2 NUMERIC(7, 2),
    co NUMERIC(7, 2),
    o3 NUMERIC(7, 2),
    nh3 NUMERIC(7, 2),
    dominant_pollutant VARCHAR(32),
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aqi_obs_location ON aqi_observations (location_id);
CREATE INDEX IF NOT EXISTS idx_aqi_obs_observed ON aqi_observations (observed_at DESC);

CREATE TABLE IF NOT EXISTS air_pollutants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aqi_observation_id UUID NOT NULL REFERENCES aqi_observations(id) ON DELETE CASCADE,
    pollutant_code VARCHAR(32) NOT NULL,
    concentration NUMERIC(8, 3) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    sub_index INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. STATIONS & STATION OBSERVATIONS
CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL, -- 'AWS', 'ARG', 'SURFACE_OBSERVATORY', 'DWR_RADAR'
    state VARCHAR(128),
    district VARCHAR(128),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    elevation NUMERIC(8, 2),
    agency VARCHAR(64) DEFAULT 'IMD',
    status VARCHAR(32) DEFAULT 'OPERATIONAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stations_code ON stations (code);
CREATE INDEX IF NOT EXISTS idx_stations_coords ON stations (latitude, longitude);

CREATE TABLE IF NOT EXISTS station_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id VARCHAR(64) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    pressure NUMERIC(7, 2),
    wind_speed NUMERIC(6, 2),
    wind_direction VARCHAR(16),
    rainfall_1h NUMERIC(6, 2),
    rainfall_24h NUMERIC(6, 2),
    battery_voltage NUMERIC(4, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. MARINE OBSERVATIONS
CREATE TABLE IF NOT EXISTS marine_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    source VARCHAR(64) NOT NULL, -- 'INCOIS', 'OPEN_METEO_MARINE'
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    wave_height NUMERIC(5, 2),
    wave_period NUMERIC(5, 2),
    swell_height NUMERIC(5, 2),
    swell_period NUMERIC(5, 2),
    sea_surface_temperature NUMERIC(5, 2),
    current_speed NUMERIC(5, 2),
    current_direction NUMERIC(5, 2),
    wind_speed NUMERIC(6, 2),
    wind_direction VARCHAR(16),
    tide_height NUMERIC(5, 2),
    tide_time TIMESTAMP WITH TIME ZONE,
    coastal_warning VARCHAR(255),
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marine_obs_loc ON marine_observations (location_id);

-- 11. AGROMET & SOLAR
CREATE TABLE IF NOT EXISTS agromet_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    soil_moisture_percent NUMERIC(5, 2),
    soil_temperature_surface NUMERIC(5, 2),
    evapotranspiration_mm NUMERIC(5, 2),
    crop_advisory TEXT,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(64) DEFAULT 'IMD_AGROMET',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solar_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id VARCHAR(64) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sunrise VARCHAR(32) NOT NULL,
    sunset VARCHAR(32) NOT NULL,
    solar_noon VARCHAR(32),
    civil_dawn VARCHAR(32),
    civil_dusk VARCHAR(32),
    day_length_minutes INT,
    moonrise VARCHAR(32),
    moonset VARCHAR(32),
    moon_phase VARCHAR(64),
    moon_illumination INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (location_id, date)
);

-- 12. RADAR METADATA
CREATE TABLE IF NOT EXISTS radar_metadata (
    id VARCHAR(64) PRIMARY KEY,
    station_code VARCHAR(32) NOT NULL,
    station_name VARCHAR(128) NOT NULL,
    product_type VARCHAR(64) NOT NULL, -- 'MAXZ', 'PPZ', 'PAC', 'SRI'
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    elevation_angle NUMERIC(4, 2),
    sweep_range_km INT DEFAULT 250,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. API HEALTH & WEATHER CACHE
CREATE TABLE IF NOT EXISTS api_health (
    source VARCHAR(64) PRIMARY KEY,
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN', -- 'OPERATIONAL', 'DEGRADED', 'UNAVAILABLE', 'NOT_CONFIGURED'
    last_success TIMESTAMP WITH TIME ZONE,
    last_failure TIMESTAMP WITH TIME ZONE,
    last_latency_ms INT,
    http_status INT,
    records_fetched BIGINT DEFAULT 0,
    records_rejected BIGINT DEFAULT 0,
    error_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weather_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    data_type VARCHAR(64) NOT NULL,
    data JSONB NOT NULL,
    source VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache (expires_at);
