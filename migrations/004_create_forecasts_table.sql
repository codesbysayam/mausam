-- ====================================================================
-- MAUSAM - Atmospheric Intelligence Platform
-- Migration 004: NWP Multi-Model Forecasts Table
-- ====================================================================

CREATE TABLE IF NOT EXISTS forecasts (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    model_name VARCHAR(32) NOT NULL,                    -- 'ECMWF_IFS', 'NCEP_GFS', 'NCMRWF_NCUM', 'IMD_WRF'
    model_run_at TIMESTAMPTZ NOT NULL,                  -- Cycle initialization time (e.g. 00Z, 06Z, 12Z, 18Z)
    forecast_for TIMESTAMPTZ NOT NULL,                  -- Target valid timestep
    lead_time_hours SMALLINT NOT NULL,                  -- Lead time (T + X hours)
    temperature_c NUMERIC(4, 2),
    dew_point_c NUMERIC(4, 2),
    relative_humidity NUMERIC(5, 2),
    precipitation_amount_mm NUMERIC(6, 2) DEFAULT 0.0,
    precipitation_probability_pct SMALLINT,
    wind_speed_kmh NUMERIC(5, 2),
    wind_direction_deg NUMERIC(5, 1),
    surface_pressure_hpa NUMERIC(6, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_forecast_entry UNIQUE (station_id, model_name, model_run_at, forecast_for)
);

CREATE INDEX IF NOT EXISTS idx_forecasts_station_model ON forecasts(station_id, model_name, forecast_for);
CREATE INDEX IF NOT EXISTS idx_forecasts_target ON forecasts(forecast_for);
