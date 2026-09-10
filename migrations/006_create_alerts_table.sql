-- ====================================================================
-- MAUSAM - Atmospheric Intelligence Platform
-- Migration 006: Weather Warnings & Disaster Alerts (OASIS CAP v1.2)
-- ====================================================================

CREATE TABLE IF NOT EXISTS weather_alerts (
    id VARCHAR(64) PRIMARY KEY,                         -- CAP Identifier (e.g. 'NDMA-2026-CY-04')
    sender VARCHAR(128) NOT NULL,                       -- 'IMD-Delhi', 'NDMA', 'OSDMA'
    sent_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'Actual',       -- 'Actual', 'Exercise', 'Test'
    msg_type VARCHAR(16) NOT NULL DEFAULT 'Alert',      -- 'Alert', 'Update', 'Cancel'
    event_type VARCHAR(64) NOT NULL,                    -- 'Cyclone', 'Heavy Rain', 'Heatwave', 'Squall'
    urgency VARCHAR(16) NOT NULL,                       -- 'Immediate', 'Expected', 'Future'
    severity imd_warning_color NOT NULL,                -- 'Green', 'Yellow', 'Orange', 'Red'
    certainty VARCHAR(16) NOT NULL,                     -- 'Observed', 'Likely', 'Possible'
    headline TEXT NOT NULL,
    description TEXT,
    instruction TEXT,
    area_desc TEXT NOT NULL,
    affected_polygon GEOMETRY(Polygon, 4326),          -- Geographic warning boundary
    effective_from TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_spatial ON weather_alerts USING GIST(affected_polygon);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON weather_alerts(effective_from, expires_at);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON weather_alerts(severity);
