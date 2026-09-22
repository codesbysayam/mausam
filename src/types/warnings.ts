// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Canonical Weather Warning Types & Contract
// Single source of truth for all warning data across UI and services
// ====================================================================

export type WarningSeverity =
  | 'GREEN'
  | 'YELLOW'
  | 'ORANGE'
  | 'RED'
  | 'UNKNOWN';

export type WarningStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'UNAVAILABLE';

export type WarningHazard =
  | 'HEAVY_RAIN'
  | 'VERY_HEAVY_RAIN'
  | 'EXTREMELY_HEAVY_RAIN'
  | 'THUNDERSTORM'
  | 'LIGHTNING'
  | 'CYCLONE'
  | 'FLOOD'
  | 'HEAT_WAVE'
  | 'COLD_WAVE'
  | 'DUST_STORM'
  | 'FOG'
  | 'LANDSLIDE'
  | 'TSUNAMI'
  | 'HIGH_WAVES'
  | 'OTHER';

export type WarningSource =
  | 'SACHET_NDMA'
  | 'NDMA/SACHET'
  | 'IMD'
  | 'CWC'
  | 'INCOIS'
  | 'STATE_SDMA'
  | 'OTHER';

export interface WeatherWarning {
  id: string;
  source: WarningSource;
  sourceUrl?: string;
  title: string;
  description?: string;
  hazard: WarningHazard;
  severity: WarningSeverity;
  status: WarningStatus;
  issuedAt: string;        // ISO 8601 UTC
  effectiveFrom?: string;  // ISO 8601 UTC
  validUntil?: string;     // ISO 8601 UTC
  region?: string;
  state?: string;
  unionTerritory?: string;
  district?: string;
  subdivision?: string;
  affectedRegions: string[];
  instructions?: string[];
  rawSourceId?: string;
  rawUpdatedAt?: string;
  fetchedAt: string;       // ISO 8601 UTC
  // Additional rich metadata for UI display
  sender?: string;
  category?: string;
  certainty?: string;
  urgency?: string;
  latitude?: number;
  longitude?: number;
  rawSeverityText?: string;
}

export interface WarningFeedDiagnostics {
  status: 'LIVE' | 'STALE' | 'UNAVAILABLE';
  lastFetchedAt: string | null;
  lastSuccessfulFetchAt: string | null;
  lastAttemptAt: string;
  totalAlertsReceived: number;
  activeAlertsCount: number;
  expiredAlertsCount: number;
  httpStatus: number | null;
  endpoint: string;
  error?: string | null;
  cacheStatus: 'FRESH' | 'STALE' | 'MISS';
}

export interface LocationWarningResult {
  status: 'LIVE' | 'STALE' | 'UNAVAILABLE';
  primaryWarning: WeatherWarning | null;
  allLocationWarnings: WeatherWarning[];
  additionalCount: number;
  locationName: string;
  isAllClear: boolean;
  diagnostics: WarningFeedDiagnostics;
}

export interface WarningFilter {
  state?: string;
  district?: string;
  severity?: WarningSeverity | 'ALL';
  hazard?: WarningHazard | 'ALL';
  searchQuery?: string;
  status?: WarningStatus | 'ALL';
}
