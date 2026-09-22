// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Canonical Ask MAUSAM Types & Schemas
// Enforces single-source-of-truth between Header, Response Cards, and AI
// ====================================================================

export type SourceStatus = 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';

export type AlertSeverityLevel = 'red' | 'orange' | 'yellow' | 'green' | 'info';

export type WeatherIntent =
  | 'CURRENT_WEATHER'
  | 'FORECAST'
  | 'RAIN'
  | 'TEMPERATURE'
  | 'HUMIDITY'
  | 'WIND'
  | 'AQI'
  | 'UV'
  | 'WARNINGS'
  | 'RADAR'
  | 'AIR_QUALITY'
  | 'AGRICULTURE'
  | 'SOIL'
  | 'RAINFALL'
  | 'TRAVEL'
  | 'RUNNING'
  | 'OUTDOOR_ACTIVITY'
  | 'HEALTH'
  | 'MARINE'
  | 'TIDE'
  | 'SUNRISE_SUNSET'
  | 'GENERAL_WEATHER'
  | 'STATE_WEATHER'
  | 'MULTI_LOCATION_COMPARISON'
  | 'MULTI_INTENT'
  | 'GENERAL_KNOWLEDGE'
  | 'ABOUT_MAUSAM'
  | 'ABOUT_DEVELOPER'
  | 'HELP'
  | 'GREETING'
  | 'CLARIFICATION'
  | 'LOCATION'
  | 'GENERAL_MAUSAM_INFORMATION';

export type Timeframe =
  | 'now'
  | 'today'
  | 'tonight'
  | 'tomorrow'
  | 'tomorrow_morning'
  | 'tomorrow_evening'
  | 'this_weekend'
  | 'next_3_days'
  | 'next_7_days'
  | 'this_week';

export interface LocationMetadata {
  name: string;
  district?: string;
  state?: string;
  unionTerritory?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  elevationM?: number;
  imdStationCode?: string;
  imdStationName?: string;
}

export interface CurrentWeatherContext {
  temperatureC: number;
  feelsLikeC?: number;
  humidity?: number;
  windSpeedKmh?: number;
  windDirection?: string;
  windGustsKmh?: number;
  precipitationMm?: number;
  precipitationProbability?: number;
  weatherCode?: number;
  condition: string;
  isDay?: boolean;
  pressureHpa?: number;
  dewPointC?: number;
  uvIndex?: number;
  visibilityKm?: number;
  observedAt?: string;
}

export interface DailyForecastContext {
  date: string;
  dayName: string;
  maxTempC: number;
  minTempC: number;
  precipitationMm: number;
  precipitationProbability: number;
  condition: string;
  weatherCode: number;
  windSpeedKmh?: number;
  uvIndexMax?: number;
}

export interface HourlyForecastContext {
  time: string;
  temperatureC: number;
  precipitationMm: number;
  precipitationProbability: number;
  condition: string;
  weatherCode?: number;
  humidity?: number;
}

export interface ForecastContext {
  daily: DailyForecastContext[];
  hourly: HourlyForecastContext[];
  synopsis?: string;
}

export interface WarningContextItem {
  id: string;
  severity: AlertSeverityLevel;
  hazard: string;
  headline: string;
  affectedArea: string;
  validUntil?: string;
  issuedAt?: string;
  source: string;
  description: string;
  actionAdvice?: string;
}

export interface AqiContext {
  index?: number;
  pm25?: number;
  pm10?: number;
  category: string;
  dominantPollutant?: string;
  observedAt?: string;
  source: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface AgricultureContext {
  soilMoisture0To1cm?: number;
  soilTemperatureC?: number;
  rainfall24hMm?: number;
  precipitationProbability?: number;
  temperatureC?: number;
  humidity?: number;
  evapotranspirationMm?: number;
  advisoryText?: string;
  spraySuitability?: 'OPTIMAL' | 'MODERATE' | 'NOT_RECOMMENDED';
}

export interface MarineContext {
  waveHeightM?: number;
  seaSurfaceTempC?: number;
  tideStatus?: string;
  windSpeedKts?: number;
  seaCondition?: string;
  coastalAdvisory?: string;
}

export interface DataSourceContext {
  provider: string;
  status: SourceStatus;
  retrievedAt: string;
  observedAt?: string;
  isOfficialIMD?: boolean;
  details?: string;
}

export interface AskMausamContext {
  location: LocationMetadata;
  currentWeather?: CurrentWeatherContext;
  forecast?: ForecastContext;
  warnings?: WarningContextItem[];
  aqi?: AqiContext;
  agriculture?: AgricultureContext;
  marine?: MarineContext;
  sources: DataSourceContext[];
  contextVersion: string;
}

export interface AskMausamFact {
  label: string;
  value: string;
  source?: string;
  highlight?: boolean;
}

export interface LocationWeatherComparison {
  locationA: {
    name: string;
    state?: string;
    temperatureC?: number;
    condition?: string;
    rainMm?: number;
    humidity?: number;
    aqi?: number;
  };
  locationB: {
    name: string;
    state?: string;
    temperatureC?: number;
    condition?: string;
    rainMm?: number;
    humidity?: number;
    aqi?: number;
  };
  summary: string;
  winnerLabel?: string;
}

export type AskResponseType =
  | 'knowledge'
  | 'weather'
  | 'forecast'
  | 'warning'
  | 'aqi'
  | 'radar'
  | 'agriculture'
  | 'comparison'
  | 'clarification'
  | 'error';

export interface AskKnowledgeData {
  title: string;
  summary: string;
  bullets?: string[];
  markdown?: string;
  category?: string;
}

export interface AskMausamDebugInfo {
  query: string;
  intent: WeatherIntent;
  location: string;
  locationIsContextOnly: boolean;
  providers: string[];
  fastPath: string;
  latencyMs: number;
}

export interface AskMausamResponse {
  answer: string;
  location: string;
  intent: WeatherIntent;
  responseType?: AskResponseType;
  knowledge?: AskKnowledgeData;
  debug?: AskMausamDebugInfo;
  timeframe?: Timeframe;
  facts: AskMausamFact[];
  warnings?: string[];
  sourceStatus: SourceStatus;
  observedAt?: string;
  confidenceReason?: string;
  comparison?: LocationWeatherComparison;
  groundingSources?: Array<{ title: string; url: string; type?: string }>;
  suggestedFollowUps?: string[];
  suggestedActions?: Array<{
    label: string;
    tabId?: string;
    query?: string;
    icon?: string;
  }>;
}

export interface ConversationMemoryState {
  previousLocation?: LocationMetadata;
  previousIntent?: WeatherIntent;
  previousTimeframe?: Timeframe;
  previousEntities?: Record<string, any>;
  lastTopic?: string;
  lastRegion?: string;
  lastEntities?: Record<string, any>;
  lastInteractionTimestamp?: number;
}

export type LanguageCode =
  | 'English'
  | 'Hindi'
  | 'Odia'
  | 'Bengali'
  | 'Tamil'
  | 'Telugu'
  | 'Marathi'
  | 'Gujarati'
  | 'Kannada'
  | 'Malayalam'
  | 'Punjabi';

export interface AskMausamMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string | number;
  structured?: AskMausamResponse;
  contextSnapshot?: AskMausamContext;
  isError?: boolean;
}

