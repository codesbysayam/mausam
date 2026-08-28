/**
 * IMD HTTP Client with AbortController, Exponential Backoff Retries, and Auth Header injection
 */

import { classifyIMDError, IMDErrorPayload } from './imdErrors';

const DEFAULT_TIMEOUT = Number(process.env.IMD_REQUEST_TIMEOUT_MS || 10000);
const MAX_RETRIES = Number(process.env.IMD_MAX_RETRIES || 3);
const BASE_URL = process.env.IMD_API_BASE_URL || 'https://api.imd.gov.in/api/v1';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number) {
  return [408, 429, 500, 502, 503, 504].includes(status);
}

export interface IMDClientResponse<T = any> {
  ok: boolean;
  source: 'IMD';
  fetchedAt: string;
  stale: boolean;
  data: T | null;
  raw?: any;
  error?: IMDErrorPayload | null;
  executionMs?: number;
}

export class IMDClient {
  private baseUrl: string;
  private apiKey?: string;
  private apiToken?: string;
  private timeoutMs: number;

  constructor() {
    this.baseUrl = BASE_URL.replace(/\/$/, '');
    this.apiKey = process.env.IMD_API_KEY || undefined;
    this.apiToken = process.env.IMD_API_TOKEN || undefined;
    this.timeoutMs = DEFAULT_TIMEOUT;
  }

  async request<T = any>(path: string, params: Record<string, any> = {}): Promise<IMDClientResponse<T>> {
    const startTime = Date.now();
    const cleanPath = path.replace(/^\//, '');
    const url = new URL(`${this.baseUrl}/${cleanPath}`);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    let lastError: any = null;
    let lastStatus: number | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const headers: Record<string, string> = {
          Accept: 'application/json',
          'User-Agent': 'Mausam-IMD-Client/1.0',
        };

        if (this.apiKey) {
          headers['X-API-Key'] = this.apiKey;
        }

        if (this.apiToken) {
          headers['Authorization'] = `Bearer ${this.apiToken}`;
        }

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        lastStatus = response.status;

        if (!response.ok) {
          if (!isRetryableStatus(response.status) || attempt === MAX_RETRIES) {
            throw new Error(`IMD HTTP ${response.status}`);
          }

          // Exponential backoff with jitter
          await sleep(500 * Math.pow(2, attempt) + Math.random() * 250);
          continue;
        }

        const json = await response.json();
        const executionMs = Date.now() - startTime;

        return {
          ok: true,
          source: 'IMD',
          fetchedAt: new Date().toISOString(),
          stale: false,
          data: json as T,
          raw: json,
          executionMs,
        };
      } catch (error: any) {
        lastError = error;
        const retryable =
          error?.name === 'AbortError' ||
          /network|fetch|timeout/i.test(error?.message || '');

        if (!retryable || attempt === MAX_RETRIES) {
          break;
        }

        await sleep(500 * Math.pow(2, attempt) + Math.random() * 250);
      } finally {
        clearTimeout(timeout);
      }
    }

    const executionMs = Date.now() - startTime;
    const classified = classifyIMDError(lastStatus, lastError, cleanPath);

    return {
      ok: false,
      source: 'IMD',
      fetchedAt: new Date().toISOString(),
      stale: false,
      data: null,
      error: classified,
      executionMs,
    };
  }

  currentWeather(stationId?: string) {
    return this.request('current_wx', stationId ? { id: stationId } : {});
  }

  cityForecast(cityId: string) {
    return this.request('cityforecast', { id: cityId });
  }

  cityForecastLocation(cityId: string) {
    return this.request('cityforecastloc', { id: cityId });
  }

  districtNowcast(districtId?: string) {
    return this.request('districtnowcast', districtId ? { id: districtId } : {});
  }

  districtRainfall(districtId?: string) {
    return this.request('districtrainfall', districtId ? { id: districtId } : {});
  }

  districtWarning(districtId?: string) {
    return this.request('districtwarning', districtId ? { id: districtId } : {});
  }

  stationNowcast(station?: string) {
    return this.request('stationnowcast', station ? { id: station } : {});
  }

  stateRainfall(stateId?: string) {
    return this.request('staterainfall', stateId ? { id: stateId } : {});
  }

  awsData(stationId?: string) {
    return this.request('aws_data', stationId ? { id: stationId } : {});
  }

  awsState(stateId: string) {
    return this.request('aws_data', { sid: stateId });
  }

  awsMapping() {
    return this.request('aws_data_mapping');
  }

  basinQPF(basinId?: string) {
    return this.request('basinqpf', basinId ? { id: basinId } : {});
  }

  portWarning(portId?: string) {
    return this.request('portwarning', portId ? { id: portId } : {});
  }

  seaBulletin(areaId?: string) {
    return this.request('seabulletin', areaId ? { id: areaId } : {});
  }

  coastalBulletin() {
    return this.request('coastalbulletin');
  }

  subdivisionWarning() {
    return this.request('subdivisionwarning');
  }

  sunMoon(lat: number, lon: number) {
    return this.request('sunmoon', { lat, lon });
  }

  subdivisionRainfallForecast() {
    return this.request('subdivision_rainfall_forecast');
  }

  stateDistrictRainfallForecast() {
    return this.request('state_district_rainfall_forecast');
  }

  cycloneTrack() {
    return this.request('cyclone_track');
  }

  cycloneWind() {
    return this.request('cyclone_wind');
  }

  cycloneCone() {
    return this.request('cyclone_cou');
  }
}

export const imdClient = new IMDClient();
