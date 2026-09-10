// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Normalized Data Model & Type System
// ====================================================================

export type DataStatus = 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE' | 'NOT_CONFIGURED';

export interface GeoLocation {
  id?: string;
  name: string;
  city?: string;
  district?: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
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
  rain?: number | null;
  showers?: number | null;
  snowfall?: number | null;
  rainfall24h?: number | null;
  uvIndex: number | null;
  weatherCode: number | null;
  condition: string;
  isDay: boolean;
  sunrise?: string | null;
  sunset?: string | null;
  source: string;
  sourcePriority: number;
  isFallback: boolean;
  rawSourceAttribution: string;
}

export interface NormalizedHourlyItem {
  time: string;
  temperature: number | null;
  feelsLike: number | null;
  humidity: number | null;
  dewPoint?: number | null;
  precipitationProbability: number | null;
  precipitation: number | null;
  rain?: number | null;
  showers?: number | null;
  snowfall?: number | null;
  weatherCode: number | null;
  condition: string;
  windSpeed: number | null;
  windDirection: string | null;
  windDirectionDegrees?: number | null;
  windGust?: number | null;
  pressure?: number | null;
  cloudCover?: number | null;
  visibility?: number | null;
  uvIndex?: number | null;
  isDay: boolean;
}

export interface NormalizedDailyItem {
  date: string;
  weatherCode: number | null;
  condition: string;
  tempMax: number | null;
  tempMin: number | null;
  apparentTempMax?: number | null;
  apparentTempMin?: number | null;
  precipitationSum: number | null;
  rainSum?: number | null;
  showersSum?: number | null;
  snowfallSum?: number | null;
  precipitationHours?: number | null;
  precipitationProbabilityMax: number | null;
  windSpeedMax: number | null;
  windGustMax?: number | null;
  windDirectionDominant?: number | null;
  uvIndexMax: number | null;
  sunrise: string | null;
  sunset: string | null;
}

export interface NormalizedForecast {
  location: GeoLocation;
  generatedAt: string;
  source: string;
  sourceAttribution: string;
  hourly: NormalizedHourlyItem[];
  daily: NormalizedDailyItem[];
}

export interface NormalizedPollutant {
  code: string;
  label: string;
  concentration: number;
  unit: string;
  subIndex?: number;
}

export interface NormalizedAQI {
  location: GeoLocation;
  stationId: string;
  stationName: string;
  observedAt: string;
  fetchedAt: string;
  dataStatus: DataStatus;
  source: string;
  aqi: number;
  category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  dominantPollutant: string;
  pollutants: {
    pm25?: NormalizedPollutant;
    pm10?: NormalizedPollutant;
    no2?: NormalizedPollutant;
    so2?: NormalizedPollutant;
    co?: NormalizedPollutant;
    o3?: NormalizedPollutant;
  };
  healthAdvisory: string;
  isIndianStandard: boolean;
}

export interface NormalizedWarningItem {
  id: string;
  source: string;
  warningId: string;
  country: string;
  state?: string;
  district?: string;
  hazard: string;
  severity: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  severityLabel: string;
  urgency?: string;
  certainty?: string;
  headline?: string;
  issuedAt: string;
  validFrom?: string;
  validUntil?: string;
  affectedArea: string;
  description: string;
  instruction?: string;
  safetyGuidance: string[];
  isActive: boolean;
  coordinates?: { lat: number; lon: number } | null;
}

export interface NormalizedMarine {
  location: GeoLocation;
  isCoastal: boolean;
  observedAt: string;
  fetchedAt: string;
  dataStatus: DataStatus;
  source: string;
  significantWaveHeightMeters?: number | null;
  swellHeightMeters?: number | null;
  wavePeriodSeconds?: number | null;
  swellPeriodSeconds?: number | null;
  seaSurfaceTemperatureCelsius?: number | null;
  surfaceCurrentSpeedKnots?: number | null;
  surfaceCurrentDirectionDeg?: number | null;
  mixedLayerDepthMeters?: number | null;
  tideCategory?: 'High' | 'Low' | 'Normal';
  coastalAdvisory?: string;
  message?: string;
}

export interface RadarFrameInfo {
  source: string;
  observedTime: string;
  frameEpoch: number;
  path: string;
  tileUrl: string;
  radarHost: string;
  status: DataStatus;
  lastUpdated: string;
}
