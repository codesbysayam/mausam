-- ====================================================================
-- MAUSAM - Atmospheric Intelligence Platform
-- Migration 003: Synoptic Weather Observations Telemetry Table
-- ====================================================================

CREATE TABLE IF NOT EXISTS weather_observations (
    id BIGSERIAL,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ NOT NULL,
    temperature_c NUMERIC(4, 2),                       -- Dry bulb temp (°C)
    dew_point_c NUMERIC(4, 2),                         -- Dew point temp (°C)
    wet_bulb_c NUMERIC(4, 2),                          -- Roland Stull Psychrometric Tw (°C)
    heat_index_c NUMERIC(4, 2),                        -- NOAA Steadman Heat Index (°C)
    relative_humidity NUMERIC(5, 2),                   -- Relative Humidity (%)
    surface_pressure_hpa NUMERIC(6, 2),                -- Station Level Pressure (hPa)
    mslp_hpa NUMERIC(6, 2),                            -- Mean Sea Level Pressure (hPa)
    wind_speed_kmh NUMERIC(5, 2),                      -- Sustained Wind Speed (km/h)
    wind_direction_deg NUMERIC(5, 1),                  -- Wind Direction (0 - 360°)
    wind_gust_kmh NUMERIC(5, 2),                       -- Maximum Wind Gust (km/h)
    precipitation_hourly_mm NUMERIC(6, 2) DEFAULT 0.0, -- 1-Hour Rain Accumulation (mm)
    precipitation_24h_mm NUMERIC(6, 2) DEFAULT 0.0,    -- 24-Hour Cumulative Rain (mm)
    solar_radiation_w_m2 NUMERIC(6, 1),                -- Global Solar Irradiance (W/m²)
    uv_index NUMERIC(3, 1),                            -- WMO UV Index (0 - 16)
    visibility_km NUMERIC(5, 2),                       -- Horizontal Atmospheric Visibility (km)
    cloud_cover_percent SMALLINT,                      -- Cloud Cover (0 - 100%)
    qc_status VARCHAR(24) NOT NULL DEFAULT 'VERIFIED', -- 'VERIFIED', 'SUSPECT', 'REJECTED'
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (station_id, observed_at)
);

-- Indexing for temporal range queries and station filtering
CREATE INDEX IF NOT EXISTS idx_weather_obs_time ON weather_observations(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_obs_station_time ON weather_observations(station_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_obs_qc ON weather_observations(qc_status);
