/**
 * IMD Service for React UI Layer
 * Interfaces exclusively with the MAUSAM Server-Side IMD Connector (/api/imd/*)
 */

export interface IMDResponse<T = any> {
  source: 'IMD' | string;
  status: 'success' | 'stale' | 'error';
  fetchedAt: string;
  stale: boolean;
  data: T | null;
  raw?: any;
  error?: {
    code: string;
    message: string;
    statusCode?: number;
  } | null;
}

export interface IMDCurrentWeather {
  stationId: string;
  stationName: string;
  observationDate: string;
  observationTimeUTC: string;
  observationTimeIST: string;
  pressureHpa: number | null;
  windDirectionDegrees: number | null;
  windDirectionLabel: string;
  windSpeedKmph: number | null;
  temperatureC: number | null;
  weatherCode: number | null;
  weatherLabel: string;
  weatherCategory: string;
  cloudCoverage: string | number | null;
  humidityPercent: number | null;
  rainfall24hMm: number | null;
}

export interface IMDCityForecastDay {
  date: string;
  dayLabel: string;
  minTempC: number | null;
  maxTempC: number | null;
  weatherDescription: string;
  weatherCode?: number;
  rainfallMm?: number | null;
  humidityPercent?: number | null;
}

export interface IMDCityForecast {
  cityId: string;
  cityName: string;
  state?: string;
  forecastDate?: string;
  days: IMDCityForecastDay[];
  todayObservedMaxC?: number | null;
  todayObservedMinC?: number | null;
  past24hRainfallMm?: number | null;
  relativeHumidity?: number | null;
  sunrise?: string;
  sunset?: string;
}

export interface IMDDistrictWarning {
  districtId: string;
  districtName: string;
  stateName: string;
  warningDate: string;
  colorCode: number;
  colorName: 'NORMAL' | 'WATCH' | 'WARNING' | 'SEVERE';
  colorHex: string;
  hazardCode: number;
  hazardLabel: string;
  description: string;
  actionText: string;
}

export interface IMDAWSStation {
  stationId: string;
  callSign: string;
  district: string;
  state: string;
  station: string;
  date: string;
  time: string;
  temperatureC: number | null;
  dewPointC: number | null;
  humidityPercent: number | null;
  windDirectionDegrees: number | null;
  windDirectionLabel: string;
  windSpeedKmph: number | null;
  pressureHpa: number | null;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  latitude: number | null;
  longitude: number | null;
  weatherCode: number | null;
  weatherLabel: string;
  nebulosity: string | number | null;
  feelsLikeC: number | null;
}

export interface IMDRainfallRecord {
  id: string;
  name: string;
  state?: string;
  actualMm: number | null;
  normalMm: number | null;
  departurePercent: number | null;
  categoryCode: string;
  categoryLabel: string;
  categoryColor: string;
  date?: string;
}

export interface IMDSunMoon {
  latitude: number;
  longitude: number;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  timezone: string;
}

export interface IMDStateInfo {
  id: string;
  name: string;
  code: string;
  type: 'STATE' | 'UT';
  capitalCity: string;
  representativeStationId: string;
  representativeCityForecastId: string;
  lat: number;
  lng: number;
}

class IMDService {
  private baseApiUrl = '/api/imd';

  private async fetchApi<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<IMDResponse<T>> {
    const url = new URL(this.baseApiUrl + endpoint, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });

    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok && res.status >= 500) {
        throw new Error(`IMD server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      return json as IMDResponse<T>;
    } catch (err: any) {
      return {
        source: 'IMD',
        status: 'error',
        fetchedAt: new Date().toISOString(),
        stale: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: err?.message || 'Unable to connect to MAUSAM IMD Connector',
        },
      };
    }
  }

  // 1. Current Weather
  async getCurrentWeather(stationId?: string): Promise<IMDResponse<IMDCurrentWeather>> {
    return this.fetchApi<IMDCurrentWeather>(stationId ? `/current-weather/${stationId}` : '/current-weather');
  }

  // 2. City Forecast (7 Days)
  async getCityForecast(cityId: string): Promise<IMDResponse<IMDCityForecast>> {
    return this.fetchApi<IMDCityForecast>(`/city-forecast/${cityId}`);
  }

  // 3. District Warnings
  async getDistrictWarnings(districtId?: string): Promise<IMDResponse<IMDDistrictWarning[]>> {
    return this.fetchApi<IMDDistrictWarning[]>('/district-warning', { id: districtId });
  }

  // 4. District & State Rainfall
  async getStateRainfall(stateId?: string): Promise<IMDResponse<IMDRainfallRecord[]>> {
    return this.fetchApi<IMDRainfallRecord[]>('/state-rainfall', { id: stateId });
  }

  async getDistrictRainfall(districtId?: string): Promise<IMDResponse<IMDRainfallRecord[]>> {
    return this.fetchApi<IMDRainfallRecord[]>('/district-rainfall', { id: districtId });
  }

  // 5. AWS Data
  async getAWSData(stationId?: string, stateId?: string): Promise<IMDResponse<IMDAWSStation[]>> {
    return this.fetchApi<IMDAWSStation[]>('/aws', { id: stationId, sid: stateId });
  }

  // 6. Sun & Moon Ephemeris
  async getSunMoon(lat: number, lon: number): Promise<IMDResponse<IMDSunMoon>> {
    return this.fetchApi<IMDSunMoon>('/sunmoon', { lat, lon });
  }

  // 7. Cyclone Telemetry
  async getCycloneBundle(): Promise<IMDResponse<any>> {
    return this.fetchApi<any>('/cyclone-bundle');
  }

  // 8. Marine Telemetry
  async getMarineBundle(portId?: string, seaAreaId?: string): Promise<IMDResponse<any>> {
    return this.fetchApi<any>('/marine-bundle', { portId, seaAreaId });
  }

  // 9. National Overview (HOME Page)
  async getNationalOverview(): Promise<IMDResponse<any>> {
    return this.fetchApi<any>('/overview');
  }

  // 10. States List
  async getStates(): Promise<IMDResponse<IMDStateInfo[]>> {
    return this.fetchApi<IMDStateInfo[]>('/states');
  }

  // 11. Air Quality & Pollen Providers
  async getAQI(lat: number, lng: number, name?: string): Promise<any> {
    return this.fetchApi<any>('/environment/aqi', { lat, lng, name });
  }

  async getPollen(lat: number, lng: number): Promise<any> {
    return this.fetchApi<any>('/environment/pollen', { lat, lng });
  }

  // 12. Cache / Debug stats
  async getDebugStats(): Promise<any> {
    return this.fetchApi<any>('/debug/stats');
  }
}

export const imdService = new IMDService();
