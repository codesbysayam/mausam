// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Canonical Cyclone & Tropical Disturbance Types & Contract
// Defined strictly to official IMD / RSMC New Delhi / SACHET specifications.
// ====================================================================

export type CycloneClassification =
  | 'Low Pressure Area'
  | 'Well Marked Low Pressure Area'
  | 'Depression'
  | 'Deep Depression'
  | 'Cyclonic Storm'
  | 'Severe Cyclonic Storm'
  | 'Very Severe Cyclonic Storm'
  | 'Extremely Severe Cyclonic Storm'
  | 'Super Cyclonic Storm'
  | string;

export type WarningLevel =
  | 'NO_WARNING'
  | 'WATCH'
  | 'YELLOW'
  | 'ORANGE'
  | 'RED'
  | 'UNKNOWN';

export type RegionalWarningState =
  | 'ACTIVE_WARNING'
  | 'NO_ACTIVE_WARNING'
  | 'DATA_UNAVAILABLE';

export type ThreatLevel =
  | 'NO_WARNING'
  | 'WATCH'
  | 'YELLOW'
  | 'ORANGE'
  | 'RED'
  | 'NOT_AVAILABLE';

export type SourceStatus =
  | 'LIVE'
  | 'RECENT'
  | 'STALE'
  | 'UNAVAILABLE'
  | 'ERROR';

export interface WeatherSystemForecastPoint {
  time: string;
  latitude: number;
  longitude: number;
  expectedClassification: string;
  windSpeed?: string;
  centralPressure?: string;
  locationName?: string;
}

export interface WeatherSystemTimelineEvent {
  timestamp: string;
  event: string;
  source: string;
}

/**
 * Requirement 2: Canonical Cyclone / Disturbance Object
 */
export interface WeatherSystemEvent {
  id: string;
  name: string;
  classification: CycloneClassification;
  basin: string;
  source: string;
  sourceUrl: string;

  latitude: number;
  longitude: number;

  pressure: number | string;
  maxSustainedWind: number | string;
  windGust: number | string;
  movementDirection: string;
  movementSpeed: number | string;

  currentLocation: string;
  forecastTrack: WeatherSystemForecastPoint[];
  historicalTrack?: WeatherSystemForecastPoint[];
  expectedLandfall: string;
  expectedLandfallWindow: string;

  issuedAt: string;
  updatedAt: string;
  nextBulletinAt: string;

  status: 'ACTIVE' | 'WEAKENED' | 'DISSIPATED';
  affectedStates: string[];
  affectedDistricts: string[];

  rainfallThreat: ThreatLevel;
  windThreat: ThreatLevel;
  stormSurgeThreat: ThreatLevel;
  thunderstormThreat: ThreatLevel;
  coastalConditionsThreat?: ThreatLevel;

  sourceStatus: SourceStatus;
  fetchedAt: string;

  bulletinNumber?: string;
  advisoryText?: string;
  damagePotential?: string[];
  suggestedActions?: string[];
  conePolygon?: Array<[number, number]>;
}

/**
 * Requirement 5: State + UT Warning Engine (All 36 Regions)
 */
export interface RegionalWarningStatus {
  regionCode: string;
  regionName: string;
  regionType: 'STATE' | 'UNION_TERRITORY';
  warningLevel: WarningLevel;
  hazards: string[];
  affectedDistricts: string[];
  sourceWarnings: any[];
  validFrom: string;
  validUntil: string;
  lastUpdated: string;
  status: RegionalWarningState;
}

export interface CycloneProviderHealth {
  status: SourceStatus;
  latencyMs: number | null;
  lastFetch: string | null;
  httpStatus?: number | null;
  endpoint?: string;
  error?: string | null;
}

export interface CyclonePayload {
  systems: WeatherSystemEvent[];
  activeCount: number;
  selectedSystemId: string | null;
  regionalWarnings: RegionalWarningStatus[];
  stateCount: number;
  utCount: number;
  totalRegions: number;
  lastSync: string;
  providerHealth: {
    imdCyclone: CycloneProviderHealth;
    imdWarnings: CycloneProviderHealth;
    sachet: CycloneProviderHealth;
  };
}
