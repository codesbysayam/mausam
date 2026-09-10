-- ====================================================================
-- MAUSAM - Atmospheric Intelligence Platform
-- Migration 002: Observatories & Automatic Weather Stations (AWS)
-- ====================================================================

CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(32) PRIMARY KEY,                         -- WMO index (e.g. '42182') or IMD AWS UID
    name VARCHAR(128) NOT NULL,                         -- Observatory Name (e.g. 'New Delhi (Safdarjung)')
    state VARCHAR(64) NOT NULL,                         -- State / Union Territory
    district VARCHAR(64) NOT NULL,                      -- Administrative District
    network VARCHAR(32) NOT NULL DEFAULT 'IMD_AWS',     -- 'IMD_AWS', 'IMD_SYNOPTIC', 'CPCB_CAAQMS', 'MoES_RADAR'
    latitude NUMERIC(8, 5) NOT NULL,
    longitude NUMERIC(8, 5) NOT NULL,
    elevation_meters NUMERIC(6, 2) DEFAULT 0.0,
    geom GEOMETRY(Point, 4326),                         -- Spatial geometry point (WGS84)
    status station_status NOT NULL DEFAULT 'ACTIVE',
    commissioned_date DATE,
    last_communication TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial GIST index for high-speed spatial proximity searches
CREATE INDEX IF NOT EXISTS idx_stations_geom ON stations USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_stations_state_district ON stations(state, district);

-- Trigger to auto-populate postgis geometry from lat/lon
CREATE OR REPLACE FUNCTION update_station_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_station_geom ON stations;
CREATE TRIGGER trg_station_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON stations
FOR EACH ROW EXECUTE FUNCTION update_station_geom();
