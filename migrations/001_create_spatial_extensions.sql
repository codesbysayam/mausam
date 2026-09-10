-- ====================================================================
-- MAUSAM - Atmospheric Intelligence Platform
-- Migration 001: PostGIS Spatial Extension & Geography Enums
-- ====================================================================

-- Enable PostGIS spatial database extensions for geodetic spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enumeration for weather alert severity aligned with IMD / NDMA 4-tier color code
DO $$ BEGIN
    CREATE TYPE imd_warning_color AS ENUM ('Green', 'Yellow', 'Orange', 'Red');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enumeration for CPCB NAQI Air Quality Categories
DO $$ BEGIN
    CREATE TYPE aqi_category AS ENUM (
        'Good',
        'Satisfactory',
        'Moderate',
        'Poor',
        'Very Poor',
        'Severe'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enumeration for station operational status
DO $$ BEGIN
    CREATE TYPE station_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED', 'OFFLINE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
