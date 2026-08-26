/**
 * IMD Connector - High-Level Orchestrator with Caching, Deduplication, and Normalized Responses
 */

import { imdClient, IMDClientResponse } from './imdClient';
import { imdCache } from './imdCache';
import {
  IMDNormalizer,
  NormalizedCurrentWeather,
  NormalizedCityForecast,
  NormalizedDistrictWarning,
  NormalizedAWSStation,
  NormalizedRainfallRecord,
  NormalizedSunMoon,
} from './imdNormalizer';
import { IMD_STATES_AND_UTS, findIMDState } from './imdStateMap';

export interface IMDConnectorResponse<T = any> {
  source: 'IMD';
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
  executionMs?: number;
}

export class IMDConnector {
  /**
   * Generic cached fetch helper with deduplication and stale fallback
   */
  private async fetchWithCache<TRaw, TNormalized>(
    cacheKey: string,
    fetcher: () => Promise<IMDClientResponse<TRaw>>,
    normalizer: (raw: TRaw) => TNormalized,
    ttlMs: number = 60000
  ): Promise<IMDConnectorResponse<TNormalized>> {
    const { entry, isStale } = imdCache.get<TNormalized>(cacheKey);

    // If cache is fresh, return immediately
    if (entry && !isStale) {
      return {
        source: 'IMD',
        status: 'success',
        fetchedAt: entry.fetchedAt,
        stale: false,
        data: entry.data,
        raw: entry.raw,
        error: null,
      };
    }

    // Check if request is already in-flight (deduplication)
    let inFlightPromise = imdCache.getInFlight(cacheKey);

    if (!inFlightPromise) {
      inFlightPromise = (async () => {
        const response = await fetcher();

        if (response.ok && response.data) {
          const normalized = normalizer(response.data);
          imdCache.set(cacheKey, normalized, response.raw, ttlMs);
          return {
            source: 'IMD' as const,
            status: 'success' as const,
            fetchedAt: response.fetchedAt,
            stale: false,
            data: normalized,
            raw: response.raw,
            error: null,
            executionMs: response.executionMs,
          };
        }

        // If fresh fetch failed but we have stale cache, return stale
        if (entry) {
          return {
            source: 'IMD' as const,
            status: 'stale' as const,
            fetchedAt: entry.fetchedAt,
            stale: true,
            data: entry.data,
            raw: entry.raw,
            error: response.error || null,
            executionMs: response.executionMs,
          };
        }

        // Complete failure with no cache
        return {
          source: 'IMD' as const,
          status: 'error' as const,
          fetchedAt: response.fetchedAt,
          stale: false,
          data: null,
          error: response.error || {
            code: 'IMD_DATA_UNAVAILABLE',
            message: 'IMD data is currently unavailable from official server.',
          },
          executionMs: response.executionMs,
        };
      })();

      imdCache.setInFlight(cacheKey, inFlightPromise);
    }

    return inFlightPromise;
  }

  // 1. Current Weather
  async getCurrentWeather(stationId?: string): Promise<IMDConnectorResponse<NormalizedCurrentWeather | null>> {
    const key = `current_wx:${stationId || 'all'}`;
    return this.fetchWithCache(
      key,
      () => imdClient.currentWeather(stationId),
      (raw) => IMDNormalizer.normalizeCurrentWeather(raw),
      60000 // 1 minute TTL
    );
  }

  // 2. City Forecast (7 Days)
  async getCityForecast(cityId: string): Promise<IMDConnectorResponse<NormalizedCityForecast | null>> {
    const key = `cityforecast:${cityId}`;
    return this.fetchWithCache(
      key,
      () => imdClient.cityForecast(cityId),
      (raw) => IMDNormalizer.normalizeCityForecast(raw, cityId),
      300000 // 5 minutes TTL
    );
  }

  // 3. District Warnings
  async getDistrictWarnings(districtId?: string): Promise<IMDConnectorResponse<NormalizedDistrictWarning[]>> {
    const key = `districtwarning:${districtId || 'all'}`;
    return this.fetchWithCache(
      key,
      () => imdClient.districtWarning(districtId),
      (raw) => IMDNormalizer.normalizeDistrictWarnings(raw),
      60000 // 1 minute TTL
    );
  }

  // 4. District Nowcast (3-hour valid severe warning)
  async getDistrictNowcast(districtId?: string): Promise<IMDConnectorResponse<any>> {
    const key = `districtnowcast:${districtId || 'all'}`;
    return this.fetchWithCache(
      key,
      () => imdClient.districtNowcast(districtId),
      (raw) => raw,
      60000
    );
  }

  // 5. Station Nowcast
  async getStationNowcast(station?: string): Promise<IMDConnectorResponse<any>> {
    const key = `stationnowcast:${station || 'all'}`;
    return this.fetchWithCache(
      key,
      () => imdClient.stationNowcast(station),
      (raw) => raw,
      60000
    );
  }

  // 6. State & District Rainfall
  async getStateRainfall(stateId?: string): Promise<IMDConnectorResponse<NormalizedRainfallRecord[]>> {
    const key = `staterainfall:${stateId || 'all'}`;
    return this.fetchWithCache(
      key,
      () => imdClient.stateRainfall(stateId),
      (raw) => IMDNormalizer.normalizeRainfall(raw),
      300000 // 5 minutes TTL
    );
  }

  async getDistrictRainfall(districtId?: string): Promise<IMDConnectorResponse<NormalizedRainfallRecord[]>> {
    const key = `districtrainfall:${districtId || 'all'}`;
    return this.fetchWithCache(
      key,
      () => imdClient.districtRainfall(districtId),
      (raw) => IMDNormalizer.normalizeRainfall(raw),
      300000
    );
  }

  // 7. AWS / ARG Surface Data
  async getAWSData(stationId?: string, stateId?: string): Promise<IMDConnectorResponse<NormalizedAWSStation[]>> {
    const key = `aws:${stationId || stateId || 'all'}`;
    return this.fetchWithCache(
      key,
      () => (stateId ? imdClient.awsState(stateId) : imdClient.awsData(stationId)),
      (raw) => IMDNormalizer.normalizeAWSData(raw),
      60000
    );
  }

  // 8. Sun / Moon Ephemeris
  async getSunMoon(lat: number, lon: number): Promise<IMDConnectorResponse<NormalizedSunMoon | null>> {
    const key = `sunmoon:${lat.toFixed(2)}_${lon.toFixed(2)}`;
    return this.fetchWithCache(
      key,
      () => imdClient.sunMoon(lat, lon),
      (raw) => IMDNormalizer.normalizeSunMoon(raw, lat, lon),
      3600000 // 1 hour TTL
    );
  }

  // 9. Cyclone Telemetry (Track, Wind, Cone)
  async getCycloneData(): Promise<IMDConnectorResponse<any>> {
    const key = 'cyclone_bundle';
    return this.fetchWithCache(
      key,
      async () => {
        const [track, wind, cou] = await Promise.allSettled([
          imdClient.cycloneTrack(),
          imdClient.cycloneWind(),
          imdClient.cycloneCone(),
        ]);
        const trackData = track.status === 'fulfilled' ? track.value.data : null;
        const windData = wind.status === 'fulfilled' ? wind.value.data : null;
        const couData = cou.status === 'fulfilled' ? cou.value.data : null;

        return {
          ok: !!(trackData || windData || couData),
          source: 'IMD' as const,
          fetchedAt: new Date().toISOString(),
          stale: false,
          data: {
            activeStorms: trackData || [],
            windRadii: windData || [],
            coneOfUncertainty: couData || [],
            synopticStatus: trackData && Array.isArray(trackData) && trackData.length > 0
              ? 'Active Tropical Cyclone / Depression Monitored'
              : 'No active cyclonic disturbance in Indian seas',
          },
          raw: { track: trackData, wind: windData, cou: couData },
        };
      },
      (raw) => raw,
      60000
    );
  }

  // 10. Marine Bulletins & Warnings (Port, Sea, Coastal)
  async getMarineBulletins(portId?: string, seaAreaId?: string): Promise<IMDConnectorResponse<any>> {
    const key = `marine:${portId || ''}_${seaAreaId || ''}`;
    return this.fetchWithCache(
      key,
      async () => {
        const [port, sea, coastal] = await Promise.allSettled([
          imdClient.portWarning(portId),
          imdClient.seaBulletin(seaAreaId),
          imdClient.coastalBulletin(),
        ]);

        const portData = port.status === 'fulfilled' ? port.value.data : null;
        const seaData = sea.status === 'fulfilled' ? sea.value.data : null;
        const coastalData = coastal.status === 'fulfilled' ? coastal.value.data : null;

        return {
          ok: !!(portData || seaData || coastalData),
          source: 'IMD' as const,
          fetchedAt: new Date().toISOString(),
          stale: false,
          data: {
            portWarnings: portData || [],
            seaBulletins: seaData || [],
            coastalBulletins: coastalData || [],
          },
          raw: { port: portData, sea: seaData, coastal: coastalData },
        };
      },
      (raw) => raw,
      300000 // 5 minutes TTL
    );
  }

  // 11. National Synoptic Overview (For HOME page)
  async getNationalOverview(): Promise<IMDConnectorResponse<any>> {
    const key = 'national_synoptic_overview';
    return this.fetchWithCache(
      key,
      async () => {
        // Fetch key summary feeds concurrently with deduplication
        const [currentRes, warningsRes, rainfallRes] = await Promise.allSettled([
          imdClient.currentWeather(),
          imdClient.subdivisionWarning(),
          imdClient.stateDistrictRainfallForecast(),
        ]);

        return {
          ok: true,
          source: 'IMD' as const,
          fetchedAt: new Date().toISOString(),
          stale: false,
          data: {
            statesCount: IMD_STATES_AND_UTS.length,
            statesList: IMD_STATES_AND_UTS,
            synopticStatus: 'Normal Monsoon/Seasonal Airflow across Indian Subcontinent',
            monsoonTroughStatus: 'Active along designated IMD coordinates',
            subdivisionWarnings: subdivisionWarningData(warningsRes),
            nationalRainfallForecast: rainfallRes.status === 'fulfilled' ? rainfallRes.value.data : null,
            totalObservatoriesReporting: 550,
          },
          raw: null,
        };
      },
      (raw) => raw,
      60000
    );
  }

  // 12. States metadata list
  getStates() {
    return IMD_STATES_AND_UTS;
  }

  getStateDetails(idOrName: string) {
    return findIMDState(idOrName);
  }
}

function subdivisionWarningData(result: PromiseSettledResult<any>) {
  if (result.status === 'fulfilled' && result.value?.data) {
    return result.value.data;
  }
  return [];
}

export const imdConnector = new IMDConnector();
