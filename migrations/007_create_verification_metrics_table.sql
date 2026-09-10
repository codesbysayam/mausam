-- ====================================================================
-- MAUSAM - Atmospheric Intelligence Platform
-- Migration 007: NWP Forecast Verification & Skill Tracking
-- ====================================================================

CREATE TABLE IF NOT EXISTS forecast_verification_metrics (
    id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(32) NOT NULL,
    parameter VARCHAR(32) NOT NULL,                     -- 'temperature_c', 'precipitation_24h', 'wind_speed_kmh'
    lead_time_hours SMALLINT NOT NULL,                  -- 24, 48, 72, 96, 120
    evaluation_date DATE NOT NULL,
    sample_size INTEGER NOT NULL,
    mae NUMERIC(6, 3) NOT NULL,
    rmse NUMERIC(6, 3) NOT NULL,
    bias NUMERIC(6, 3) NOT NULL,
    pearson_r NUMERIC(4, 3),
    threat_score_csi NUMERIC(4, 3),
    probability_of_detection_pod NUMERIC(4, 3),
    false_alarm_ratio_far NUMERIC(4, 3),
    heidke_skill_score_hss NUMERIC(4, 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_verification_record UNIQUE (model_name, parameter, lead_time_hours, evaluation_date)
);

CREATE INDEX IF NOT EXISTS idx_verification_model_date ON forecast_verification_metrics(model_name, evaluation_date DESC);
