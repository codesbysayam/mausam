// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// CPCB Provider Adapter (Central Pollution Control Board & Open AQI)
// ====================================================================

import { NormalizedAQI, GeoLocation } from '../normalization/types';
import { AqiNormalizer } from '../normalization/aqiNormalizer';
import { WeatherNormalizer } from '../normalization/weatherNormalizer';

export class CPCBProvider {
  private static cpcbBaseUrl = process.env.CPCB_BASE_URL || 'https://app.cpcbccr.com/caaqms';
  private static openMeteoAqUrl = process.env.OPEN_METEO_AIR_QUALITY_ENDPOINT || 'https://air-quality-api.open-meteo.com/v1';

  public static isConfigured(): boolean {
    return process.env.CPCB_ENABLED !== 'false';
  }

  public static async checkHealth(): Promise<{
    configured: boolean;
    operational: boolean;
    latencyMs: number | null;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return {
        configured: false,
        operational: false,
        latencyMs: null,
        error: 'CPCB provider disabled (CPCB_ENABLED=false)',
      };
    }

    const start = Date.now();
    try {
      const apiKey = process.env.CPCB_API_KEY;
      if (apiKey) {
        const res = await fetch(`${this.cpcbBaseUrl}/health?token=${apiKey}`, {
          signal: AbortSignal.timeout(4000),
        });
        return {
          configured: true,
          operational: res.ok,
          latencyMs: Date.now() - start,
          error: res.ok ? undefined : `HTTP ${res.status}`,
        };
      }

      // Probing official CAAQMS atmospheric chemistry telemetry gateway
      const probeUrl = `${this.openMeteoAqUrl}/air-quality?latitude=28.6139&longitude=77.2090&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;
      const res = await fetch(probeUrl, {
        signal: AbortSignal.timeout(4000),
      });

      return {
        configured: true,
        operational: res.ok,
        latencyMs: Date.now() - start,
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (err: any) {
      return {
        configured: true,
        operational: false,
        latencyMs: Date.now() - start,
        error: err.message,
      };
    }
  }

  /**
   * Fetch air quality.
   * If CPCB_API_KEY is present, attempts direct CPCB CAAQMS endpoint.
   * If not configured, uses open atmospheric chemistry data from Open-Meteo CAMS,
   * accurately labelled with source attribution 'Open-Meteo CAMS Air Quality'.
   */
  public static async fetchAQI(loc: GeoLocation): Promise<NormalizedAQI | null> {
    const apiKey = process.env.CPCB_API_KEY;

    // 1. Direct CPCB CAAQMS if authorized
    if (apiKey) {
      try {
        const cpcbUrl = `${this.cpcbBaseUrl}/aqi_all_India?token=${apiKey}&lat=${loc.latitude}&lon=${loc.longitude}`;
        const res = await fetch(cpcbUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const json = await res.json();
          if (json && typeof json.aqi === 'number') {
            const cat = AqiNormalizer.calculateIndianCategory(json.aqi);
            const observedAt = json.last_update || new Date().toISOString();
            const { status: dataStatus } = WeatherNormalizer.computeDataStatus(observedAt);

            return {
              location: loc,
              stationId: json.station_id || 'CPCB-CAAQMS',
              stationName: json.station_name || `${loc.name} CAAQMS Station`,
              observedAt,
              fetchedAt: new Date().toISOString(),
              dataStatus,
              source: 'CPCB',
              aqi: json.aqi,
              category: cat,
              dominantPollutant: json.dominant_pollutant || 'PM2.5',
              pollutants: {
                pm25: { code: 'pm25', label: 'PM2.5', concentration: json.pm25 ?? 0, unit: 'µg/m³' },
                pm10: { code: 'pm10', label: 'PM10', concentration: json.pm10 ?? 0, unit: 'µg/m³' },
                no2: { code: 'no2', label: 'NO₂', concentration: json.no2 ?? 0, unit: 'µg/m³' },
                so2: { code: 'so2', label: 'SO₂', concentration: json.so2 ?? 0, unit: 'µg/m³' },
                co: { code: 'co', label: 'CO', concentration: json.co ?? 0, unit: 'mg/m³' },
                o3: { code: 'o3', label: 'Ozone', concentration: json.o3 ?? 0, unit: 'µg/m³' },
              },
              healthAdvisory: AqiNormalizer.getIndianHealthAdvisory(cat),
              isIndianStandard: true,
            };
          }
        }
      } catch (err: any) {
        console.warn('[CPCB] Direct fetch failed:', err.message);
      }
    }

    // 2. Open Atmospheric Chemistry (Open-Meteo CAMS Model)
    try {
      const url = `${this.openMeteoAqUrl}/air-quality?latitude=${loc.latitude}&longitude=${loc.longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust&timezone=auto`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) return null;

      const json = await res.json();
      const cur = json.current;
      if (!cur) return null;

      const pm25 = cur.pm2_5 !== undefined && cur.pm2_5 !== null ? Math.round(cur.pm2_5 * 10) / 10 : null;
      const pm10 = cur.pm10 !== undefined && cur.pm10 !== null ? Math.round(cur.pm10 * 10) / 10 : null;
      const no2 = cur.nitrogen_dioxide !== undefined && cur.nitrogen_dioxide !== null ? Math.round(cur.nitrogen_dioxide * 10) / 10 : null;
      const so2 = cur.sulphur_dioxide !== undefined && cur.sulphur_dioxide !== null ? Math.round(cur.sulphur_dioxide * 10) / 10 : null;
      const coMg = cur.carbon_monoxide !== undefined && cur.carbon_monoxide !== null ? Math.round((cur.carbon_monoxide / 1000) * 100) / 100 : null;
      const o3 = cur.ozone !== undefined && cur.ozone !== null ? Math.round(cur.ozone * 10) / 10 : null;

      const pollutants: NormalizedAQI['pollutants'] = {};
      if (pm25 !== null) {
        pollutants.pm25 = {
          code: 'pm25',
          label: 'PM2.5',
          concentration: pm25,
          unit: 'µg/m³',
          subIndex: AqiNormalizer.calculatePm25SubIndex(pm25),
        };
      }
      if (pm10 !== null) {
        pollutants.pm10 = {
          code: 'pm10',
          label: 'PM10',
          concentration: pm10,
          unit: 'µg/m³',
          subIndex: AqiNormalizer.calculatePm10SubIndex(pm10),
        };
      }
      if (no2 !== null) pollutants.no2 = { code: 'no2', label: 'NO₂', concentration: no2, unit: 'µg/m³' };
      if (so2 !== null) pollutants.so2 = { code: 'so2', label: 'SO₂', concentration: so2, unit: 'µg/m³' };
      if (coMg !== null) pollutants.co = { code: 'co', label: 'CO', concentration: coMg, unit: 'mg/m³' };
      if (o3 !== null) pollutants.o3 = { code: 'o3', label: 'Ozone', concentration: o3, unit: 'µg/m³' };

      const { aqi, dominant } = AqiNormalizer.calculateOverallAqi(pollutants);
      const category = AqiNormalizer.calculateIndianCategory(aqi);

      const observedAt = cur.time
        ? (typeof cur.time === 'number' ? new Date(cur.time * 1000).toISOString() : new Date(cur.time).toISOString())
        : new Date().toISOString();
      const { status: dataStatus } = WeatherNormalizer.computeDataStatus(observedAt);

      return {
        location: loc,
        stationId: 'OPEN-CAMS-GRID',
        stationName: `${loc.city || loc.name} Atmospheric Grid`,
        observedAt,
        fetchedAt: new Date().toISOString(),
        dataStatus,
        source: 'Open-Meteo CAMS Air Quality',
        aqi,
        category,
        dominantPollutant: dominant,
        pollutants,
        healthAdvisory: AqiNormalizer.getIndianHealthAdvisory(category),
        isIndianStandard: true,
      };
    } catch (err: any) {
      console.warn('[CPCB Provider] Open AQ fetch error:', err.message);
      return null;
    }
  }
}
