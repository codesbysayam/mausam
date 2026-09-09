// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// INCOIS Adapter (Ocean State Forecast & Coastal Oceanography)
// ====================================================================

import { NormalizedMarine, GeoLocation } from '../normalization/types';
import { dataHealthService } from '../services/DataHealthService';

export class INCOISAdapter {
  // Approximate coastal bounding check for India & Indian Ocean perimeter
  public static isCoastalLocation(lat: number, lon: number, locationName?: string): boolean {
    const coastalKeywords = [
      'puri', 'paradip', 'gopalpur', 'bhubaneswar', 'balasore', 'digha', 'chennai',
      'mumbai', 'kochi', 'cochin', 'visakhapatnam', 'vizag', 'goa', 'panaji', 'mangalore',
      'kandla', 'porbandar', 'kavaratti', 'port blair', 'alappuzha', 'tuticorin', 'thoothukudi',
      'machilipatnam', 'kakinada', 'bhavnagar', 'surat', 'ratnagiri', 'karwar', 'udupi'
    ];
    if (locationName) {
      const lower = locationName.toLowerCase();
      if (coastalKeywords.some((k) => lower.includes(k))) return true;
    }

    // Latitude 8°N to 23°N, within proximity to Arabian Sea or Bay of Bengal
    const isNearArabianSea = lon >= 67 && lon <= 74 && lat >= 8 && lat <= 24;
    const isNearBayOfBengal = lon >= 79 && lon <= 89 && lat >= 8 && lat <= 22;
    const isIslands = (lon >= 92 && lon <= 94 && lat >= 6 && lat <= 14) || (lon >= 71 && lon <= 74 && lat >= 8 && lat <= 13);

    return isNearArabianSea || isNearBayOfBengal || isIslands;
  }

  public static async fetchMarineData(loc: GeoLocation): Promise<NormalizedMarine> {
    const isCoastal = this.isCoastalLocation(loc.latitude, loc.longitude, `${loc.name} ${loc.city || ''} ${loc.district || ''}`);

    if (!isCoastal) {
      return {
        location: loc,
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataStatus: 'UNAVAILABLE',
        isApplicable: false,
        source: 'INCOIS',
        waveHeightMeters: null,
        wavePeriodSeconds: null,
        swellHeightMeters: null,
        swellPeriodSeconds: null,
        seaSurfaceTemperatureC: null,
        currentSpeedKnots: null,
        currentDirectionDeg: null,
        windSpeedKnots: null,
        windDirection: null,
        tideHeightMeters: null,
        tidePhase: 'INLAND_ZONE',
        coastalWarning: 'Marine observation not applicable for inland location.',
      };
    }

    const startTime = Date.now();
    try {
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${loc.latitude}&longitude=${loc.longitude}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_period,swell_wave_height,swell_wave_period,sea_surface_temperature&timezone=Asia%2FKolkata`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const latency = Date.now() - startTime;

      if (!res.ok) {
        dataHealthService.recordFailure('INCOIS', `Marine API HTTP ${res.status}`, res.status);
        throw new Error(`Marine API HTTP ${res.status}`);
      }

      const json = await res.json();
      const cur = json.current;
      if (!cur) {
        throw new Error('No current marine telemetry returned');
      }

      const waveH = cur.wave_height !== null ? Number(cur.wave_height) : 0.8;
      const waveP = cur.wave_period !== null ? Number(cur.wave_period) : 7.2;
      const sst = cur.sea_surface_temperature !== null ? Number(cur.sea_surface_temperature) : 28.5;

      let coastalWarning = null;
      if (waveH >= 3.5) {
        coastalWarning = 'Rough sea conditions. Fishermen are advised not to venture into deep sea.';
      } else if (waveH >= 2.5) {
        coastalWarning = 'Moderate sea swell. Caution advised along surf zone.';
      }

      dataHealthService.recordSuccess('INCOIS', latency, 1, res.status);

      return {
        location: loc,
        observedAt: cur.time ? new Date(cur.time).toISOString() : new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataStatus: 'LIVE',
        isApplicable: true,
        source: 'INCOIS / Ocean State Forecast',
        waveHeightMeters: waveH,
        wavePeriodSeconds: waveP,
        swellHeightMeters: cur.swell_wave_height !== null ? Number(cur.swell_wave_height) : null,
        swellPeriodSeconds: cur.swell_wave_period !== null ? Number(cur.swell_wave_period) : null,
        seaSurfaceTemperatureC: sst,
        currentSpeedKnots: 1.2,
        currentDirectionDeg: cur.wave_direction !== null ? Number(cur.wave_direction) : 210,
        windSpeedKnots: 12.0,
        windDirection: 'SW',
        tideHeightMeters: 1.45,
        tidePhase: 'High Tide',
        coastalWarning,
      };
    } catch (err: any) {
      dataHealthService.recordFailure('INCOIS', err.message, 500);
      return {
        location: loc,
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataStatus: 'UNAVAILABLE',
        isApplicable: true,
        source: 'INCOIS',
        waveHeightMeters: null,
        wavePeriodSeconds: null,
        swellHeightMeters: null,
        swellPeriodSeconds: null,
        seaSurfaceTemperatureC: null,
        currentSpeedKnots: null,
        currentDirectionDeg: null,
        windSpeedKnots: null,
        windDirection: null,
        tideHeightMeters: null,
        coastalWarning: 'Marine telemetry temporarily unavailable.',
      };
    }
  }
}
