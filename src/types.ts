export type NavigationTab = 
  | 'today'
  | 'radar'
  | 'crowdsource'
  | 'agromet'
  | 'tools'
  | 'forecast'
  | 'hourly'
  | 'insights'
  | 'activities'
  | 'alerts'
  | 'saved-places'
  | 'settings'
  | 'help';

export type WeatherConditionType = 
  | 'rain'
  | 'sunny'
  | 'thunderstorm'
  | 'fog'
  | 'duststorm';

export type NormalizedWeatherCondition =
  | 'CLEAR'
  | 'PARTLY_CLOUDY'
  | 'CLOUDY'
  | 'OVERCAST'
  | 'DRIZZLE'
  | 'RAIN'
  | 'HEAVY_RAIN'
  | 'THUNDERSTORM'
  | 'FOG'
  | 'HAZE'
  | 'DUST'
  | 'SNOW'
  | 'UNKNOWN';

export interface LocationRecord {
  id: string;
  state: string;
  district: string;
  city: string;
  name?: string;
  stationId?: string;
  lat: number;
  lng: number;
  pincode?: string;
  timezone: string;
  displayName: string;
  aliases?: string[];
  isPrimary?: boolean;
  elevation?: string;
  weatherStation?: string;
  imdStation?: string | null;
  radarCoverage?: 'Gopalpur DWR' | 'Paradip DWR' | 'Sambalpur DWR' | 'Kolkata DWR' | 'Visakhapatnam DWR' | string | null;
  coastalStatus?: 'coastal' | 'inland';
}

export type RadarLayer = 'radar' | 'satellite' | 'wind' | 'temp' | 'aqi';

export interface WeatherStation {
  id: string;
  name: string;
  code: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  elevation: string;
  status: 'active' | 'calibrating' | 'standby';
  pm25: number;
  temp: number;
  condition: string;
  weatherType: WeatherConditionType;
  normalizedCondition?: NormalizedWeatherCondition;
  radarType?: string; // S-Band / X-Band
  reflectivityDbz?: number;
  precipitationMm?: number;
  isCoastal?: boolean;
}

export interface CurrentWeather {
  temp: number;
  unit: 'C' | 'F';
  high: number;
  low: number;
  tempMax?: number;
  tempMin?: number;
  feelsLike?: number;
  condition: string;
  normalizedCondition: NormalizedWeatherCondition;
  weatherType: WeatherConditionType;
  icon: string;
  windSpeed: number; // km/h
  windDirection: string;
  windDirectionDeg?: number;
  windGusts?: number;
  humidity: number; // %
  pressure: number; // hPa
  dewPoint: number; // °C
  uvIndex: number;
  uvDescription?: string;
  pollen: 'Low' | 'Moderate' | 'High' | 'Very High';
  pollenCount?: number; // grains/m³
  grassPollen?: number; // grains/m³
  treePollen?: number; // grains/m³
  weedPollen?: number; // grains/m³
  aqi?: number;
  aqiPm25: number; // µg/m³
  aqiPm10?: number; // µg/m³
  aqiIndex?: number; // Indian CPCB / US AQI Index
  aqiDescription?: string;
  no2?: number; // µg/m³
  so2?: number; // µg/m³
  co?: number; // µg/m³
  o3?: number; // µg/m³
  dust?: number; // µg/m³
  aqiStatus: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Hazardous';
  precipitation: number; // mm currently
  precipitationMm?: number;
  precipitationProbability: number; // %
  isRainingNow: boolean;
  rainExpectedSummary?: string;
  cloudCover?: number;
  visibility?: number;
  visibilityKm?: number;
  elevation?: string;
  sunrise?: string;
  sunset?: string;
  solarNoon?: string;
  daylightDuration?: string;
  dayLength?: string;
  dawnTime?: string;
  duskTime?: string;
  solarElevationDeg?: number;
  stationName: string;
  stationCode: string;
  locationId?: string;
  lastUpdated: string;
  lastUpdatedTimestamp?: number;
  source: string;
  isLive?: boolean;
  error?: string | null;
}

// Crowdsource Mausam Types
export type WeatherEventType = 
  | 'Rain'
  | 'Drizzle'
  | 'Thunder / Lightning'
  | 'Hailstorm'
  | 'Dust Storm'
  | 'Fog'
  | 'Snow'
  | 'Gusty Wind';

export type DamageAssessmentType = 
  | 'None / Nil'
  | 'Minor tree branch breakage'
  | 'Power line / Utility disruption'
  | 'Structural roof / wall damage'
  | 'Crop lodging / field flooding'
  | 'Severe infrastructural damage';

export interface CrowdsourceReport {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  district: string;
  state: string;
  lat?: number;
  lng?: number;
  weatherEvent: WeatherEventType;
  damage: DamageAssessmentType;
  details: string;
  reporterName: string;
  mediaUrl?: string;
  mediaType?: 'photo' | 'video';
  status: 'Verified by IMD' | 'Under Review' | 'Submitted';
  upvotes: number;
}

// Agromet Meghdoot Types
export interface CropAdvisory {
  cropName: string;
  stage: string; // Sowing, Vegetative, Flowering, Harvesting
  sowingAdvice: string;
  irrigationAdvice: string;
  fertilizerAdvice: string;
  pestDiseaseAdvice: string;
  harvestingAdvice: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskAlert: string;
}

export interface AgrometDistrictBulletin {
  state: string;
  district: string;
  amfuUnit: string;
  bulletinNo: string;
  issueDay: 'Tuesday' | 'Friday';
  issueDate: string;
  validPeriod: string;
  weatherSummary: string;
  rainfallForecast5Days: string;
  crops: CropAdvisory[];
}

// Forecasting Tools Types
export interface ForecastingTool {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  roleInForecasting: string;
  specifications: string[];
  liveStatus: string;
  keyMetricLabel: string;
  keyMetricValue: string;
}

export interface WeatherAlert {
  id: string;
  agency: string;
  title: string;
  severity: 'severe' | 'warning' | 'advisory' | 'info' | 'Severe' | 'Extreme' | 'Moderate' | 'red' | 'orange' | 'yellow' | 'extreme';
  description: string;
  affectedDistricts: string[];
  affectedArea?: string;
  issuedAt: string;
  validUntil: string;
  actionItem: string;
  color: string;
}

export interface HourlyForecastItem {
  time: string;
  hourNumber: number;
  temp: number;
  condition: string;
  icon: string;
  aqi: number;
  rainProb: number;
  windSpeed: number;
  uv: number;
  humidity: number;
  isNow?: boolean;
  precipitationProbability?: number;
  windDirection?: string;
  cloudCover?: number;
  qpf?: number;
  pressure?: number;
  precipitation?: number;
}

export interface DailyForecastItem {
  day: string;
  date: string;
  condition: string;
  icon: string;
  high: number;
  low: number;
  rainProb: number;
  uv: number;
  aqi: number;
  humidity: number;
  wind: string;
  barProgress: {
    startPercent: number;
    widthPercent: number;
    color: string;
  };
}

export interface TelemetryDetail {
  title: string;
  value: string | number;
  unit: string;
  status: string;
  statusColor: string;
  description: string;
  history: number[];
  normRange: string;
}

export interface FitnessProfile {
  activity: string;
  optimalWindow: string;
  suitabilityScore: number;
  recommendation: string;
  peakUv: number;
  peakUvWindow: string;
  hydrationRateMlPerHour: number;
  hydrationReason: string;
  thermalStress: string;
}

export interface HistoricalTrendPoint {
  time: string;
  hour: number;
  temp: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  rain: number;
}


