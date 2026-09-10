-- ====================================================================
-- MAUSAM - Atmospheric Intelligence Platform
-- Migration 005: Ambient Air Quality (CPCB CAAQMS Telemetry)
-- ====================================================================

CREATE TABLE IF NOT EXISTS air_quality_observations (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ NOT NULL,
    pm25_ug_m3 NUMERIC(6, 2),                          -- Fine Particulate Matter 2.5 (µg/m³)
    pm10_ug_m3 NUMERIC(6, 2),                          -- Respirable Suspended Particulate Matter 10 (µg/m³)
    no2_ug_m3 NUMERIC(6, 2),                           -- Nitrogen Dioxide (µg/m³)
    so2_ug_m3 NUMERIC(6, 2),                           -- Sulphur Dioxide (µg/m³)
    co_mg_m3 NUMERIC(5, 2),                            -- Carbon Monoxide (mg/m³)
    ozone_ug_m3 NUMERIC(6, 2),                         -- Photochemical Ozone (µg/m³)
    nh3_ug_m3 NUMERIC(6, 2),                           -- Ammonia (µg/m³)
    aqi_value SMALLINT NOT NULL,                       -- Composite National AQI (0 - 500)
    aqi_category aqi_category NOT NULL,                -- 'Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'
    prominent_pollutant VARCHAR(16) NOT NULL,          -- 'PM2.5', 'PM10', 'NO2', etc.
    sub_indices JSONB,                                 -- Parameter-wise sub-index values
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_aqi_obs UNIQUE (station_id, observed_at)
);

CREATE INDEX IF NOT EXISTS idx_aqi_station_time ON air_quality_observations(station_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_aqi_value ON air_quality_observations(aqi_value);
