// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Normalized Data Schema & Contract
// ====================================================================

export type SourceCategory = 'GOVERNMENT' | 'COMMERCIAL' | 'OPEN_DATA';

export type DataStatus = 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';

export interface SourceAttribution {
  name: string;
  code: string;
  category: SourceCategory;
  isConfigured: boolean;
  attributionRequired: boolean;
  attributionText: string;
  licenseUrl?: string;
}

export interface GeoLocation {
  id: string;
  name: string;
  city?: string;
  district?: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  isCoastal?: boolean;
}

export interface NormalizedWeather {
  location: GeoLocation;
  observedAt: string;
  fetchedAt: string;
  dataStatus: DataStatus;
  ageSeconds: number;

  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  dewPoint: number | null;
  pressure: number | null;
  pressureTrend?: 'rising' | 'falling' | 'steady';
  windSpeed: number | null;
  windDirection: string | null;
  windDirectionDegrees: number | null;
  windGust: number | null;
  visibility: number | null;
  cloudCover: number | null;
  precipitation: number | null;
  rainfall1h?: number | null;
  rainfall3h?: number | null;
  rainfall24h?: number | null;
  uvIndex: number | null;
  weatherCode: number | null;
  condition: string;
  isDay: boolean;

  source: string;
  sourcePriority: number;
  isFallback: boolean;
  rawSourceAttribution: string;
}

export interface NormalizedHourlyItem {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  condition: string;
  windSpeed: number;
  uvIndex?: number;
}

export interface NormalizedDailyItem {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  condition: string;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise?: string;
  sunset?: string;
}

export interface NormalizedForecast {
  location: GeoLocation;
  model: string;
  runTime?: string;
  generatedAt: string;
  source: string;
  dataStatus: DataStatus;
  hourly: NormalizedHourlyItem[];
  daily: NormalizedDailyItem[];
  sourceAttribution: string;
}

export interface NormalizedPollutant {
  code: 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3' | 'nh3';
  label: string;
  concentration: number;
  unit: string;
  subIndex?: number;
}

export interface NormalizedAQI {
  location: GeoLocation;
  stationId?: string;
  stationName?: string;
  observedAt: string;
  fetchedAt: string;
  dataStatus: DataStatus;
  source: string;

  aqi: number | null;
  category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' | 'Unavailable';
  dominantPollutant: string | null;
  pollutants: Record<string, NormalizedPollutant>;
  healthAdvisory: string;
  isIndianStandard: boolean;
}

export interface NormalizedWarningItem {
  id: string;
  source: string;
  warningId?: string;
  country: string;
  state?: string;
  district?: string;
  subdivision?: string;
  hazard: string;
  severity: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  severityLabel: string;
  issuedAt: string;
  validFrom?: string;
  validUntil: string;
  affectedArea: string;
  description: string;
  safetyGuidance: string[];
  isActive: boolean;
}

export interface NormalizedMarine {
  location: GeoLocation;
  observedAt: string;
  fetchedAt: string;
  dataStatus: DataStatus;
  isApplicable: boolean;
  source: string;

  waveHeightMeters: number | null;
  wavePeriodSeconds: number | null;
  swellHeightMeters: number | null;
  swellPeriodSeconds: number | null;
  seaSurfaceTemperatureC: number | null;
  currentSpeedKnots: number | null;
  currentDirectionDeg: number | null;
  windSpeedKnots: number | null;
  windDirection: string | null;
  tideHeightMeters: number | null;
  tidePhase?: string;
  coastalWarning?: string | null;
}

export interface NormalizedSolar {
  location: GeoLocation;
  date: string;
  sunrise: string;
  sunset: string;
  solarNoon: string;
  civilDawn: string;
  civilDusk: string;
  dayLengthFormatted: string;
  dayLengthMinutes: number;
  azimuthDeg: number;
  elevationDeg: number;
  isDaytime: boolean;
  moonrise?: string;
  moonset?: string;
  moonPhase?: string;
  moonIlluminationPercent?: number;
  source: string;
}

export interface StandardApiResponse<T> {
  status: 'success' | 'error';
  source: string;
  dataStatus: DataStatus;
  observedAt: string;
  fetchedAt: string;
  ageSeconds: number;
  primarySource: string;
  fallbackSource?: string;
  attribution?: string;
  data: T;
  error?: string;
}
