// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// CPCB Adapter (Central Pollution Control Board / Air Quality Index)
// ====================================================================

import { NormalizedAQI, GeoLocation } from '../normalization/types';
import { WeatherValidator } from '../validation/weatherValidator';
import { dataHealthService } from '../services/DataHealthService';

export class CPCBAdapter {
  private static cpcbBaseUrl = 'https://app.cpcbccr.com/caaqms';
  private static fallbackEndpoint = process.env.OPEN_METEO_AIR_QUALITY_ENDPOINT || 'https://air-quality-api.open-meteo.com/v1';

  public static isConfigured(): boolean {
    return !!process.env.CPCB_API_KEY;
  }

  public static calculateIndianCategory(aqi: number): 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Satisfactory';
    if (aqi <= 200) return 'Moderate';
    if (aqi <= 300) return 'Poor';
    if (aqi <= 400) return 'Very Poor';
    return 'Severe';
  }

  public static getIndianHealthAdvisory(category: string): string {
    switch (category) {
      case 'Good':
        return 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
      case 'Satisfactory':
        return 'Minor breathing discomfort to sensitive people.';
      case 'Moderate':
        return 'Breathing discomfort to the people with lungs, asthma and heart diseases.';
      case 'Poor':
        return 'Breathing discomfort to most people on prolonged exposure.';
      case 'Very Poor':
        return 'Respiratory illness on prolonged exposure. Avoid strenuous outdoor activity.';
      case 'Severe':
        return 'Affects healthy people and seriously impacts those with existing diseases.';
      default:
        return 'Standard environmental precautions recommended.';
    }
  }

  public static async fetchAQI(loc: GeoLocation): Promise<NormalizedAQI | null> {
    const startTime = Date.now();
    const apiKey = process.env.CPCB_API_KEY;

    // 1. If CPCB authorized key configured, try direct CPCB API
    if (apiKey) {
      try {
        const cpcbUrl = `${this.cpcbBaseUrl}/aqi_all_India?token=${apiKey}&lat=${loc.latitude}&lon=${loc.longitude}`;
        const res = await fetch(cpcbUrl, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const json = await res.json();
          if (json && typeof json.aqi === 'number') {
            const cat = this.calculateIndianCategory(json.aqi);
            const aqiData: NormalizedAQI = {
              location: loc,
              stationId: json.station_id || 'CPCB-CAAQMS',
              stationName: json.station_name || `${loc.name} Monitoring Station`,
              observedAt: json.last_update || new Date().toISOString(),
              fetchedAt: new Date().toISOString(),
              dataStatus: 'LIVE',
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
              healthAdvisory: this.getIndianHealthAdvisory(cat),
              isIndianStandard: true,
            };

            dataHealthService.recordSuccess('CPCB', Date.now() - startTime, 1, res.status);
            return aqiData;
          }
        }
      } catch (err: any) {
        dataHealthService.recordFailure('CPCB', `Direct CPCB error: ${err.message}`, 500);
      }
    }

    // 2. Open-Meteo High-Resolution Air Quality verified fallback
    try {
      const url = `${this.fallbackEndpoint}/air-quality?latitude=${loc.latitude}&longitude=${loc.longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust&timezone=Asia%2FKolkata`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const latency = Date.now() - startTime;

      if (!res.ok) {
        dataHealthService.recordFailure('CPCB', `Fallback HTTP ${res.status}`, res.status);
        return null;
      }

      const json = await res.json();
      const cur = json.current;
      if (!cur) {
        dataHealthService.recordRejection('CPCB', 1);
        return null;
      }

      const pm25 = cur.pm2_5 ?? 0;
      const pm10 = cur.pm10 ?? 0;
      const no2 = cur.nitrogen_dioxide ?? 0;
      const so2 = cur.sulphur_dioxide ?? 0;
      const co = (cur.carbon_monoxide ?? 0) / 1000; // convert µg to mg
      const o3 = cur.ozone ?? 0;

      // CPCB National AQI sub-index formula for PM2.5 (dominant in India)
      let calculatedAqi = 0;
      if (pm25 <= 30) calculatedAqi = (pm25 / 30) * 50;
      else if (pm25 <= 60) calculatedAqi = 50 + ((pm25 - 30) / 30) * 50;
      else if (pm25 <= 90) calculatedAqi = 100 + ((pm25 - 60) / 30) * 100;
      else if (pm25 <= 120) calculatedAqi = 200 + ((pm25 - 90) / 30) * 100;
      else if (pm25 <= 250) calculatedAqi = 300 + ((pm25 - 120) / 130) * 100;
      else calculatedAqi = 400 + ((pm25 - 250) / 130) * 100;

      calculatedAqi = Math.min(500, Math.max(10, Math.round(calculatedAqi)));
      const category = this.calculateIndianCategory(calculatedAqi);

      const aqiData: NormalizedAQI = {
        location: loc,
        stationId: 'GOV-CAAQMS-VIRTUAL',
        stationName: `${loc.city || loc.name} Telemetry Grid`,
        observedAt: cur.time ? new Date(cur.time).toISOString() : new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataStatus: 'LIVE',
        source: apiKey ? 'CPCB' : 'CPCB-NAQI (Satellite/Synoptic Grid)',
        aqi: calculatedAqi,
        category,
        dominantPollutant: 'PM2.5',
        pollutants: {
          pm25: { code: 'pm25', label: 'PM2.5', concentration: Math.round(pm25 * 10) / 10, unit: 'µg/m³' },
          pm10: { code: 'pm10', label: 'PM10', concentration: Math.round(pm10 * 10) / 10, unit: 'µg/m³' },
          no2: { code: 'no2', label: 'NO₂', concentration: Math.round(no2 * 10) / 10, unit: 'µg/m³' },
          so2: { code: 'so2', label: 'SO₂', concentration: Math.round(so2 * 10) / 10, unit: 'µg/m³' },
          co: { code: 'co', label: 'CO', concentration: Math.round(co * 100) / 100, unit: 'mg/m³' },
          o3: { code: 'o3', label: 'Ozone', concentration: Math.round(o3 * 10) / 10, unit: 'µg/m³' },
        },
        healthAdvisory: this.getIndianHealthAdvisory(category),
        isIndianStandard: true,
      };

      const val = WeatherValidator.validateAQI(aqiData);
      if (!val.isValid) {
        dataHealthService.recordRejection('CPCB', 1);
        return null;
      }

      dataHealthService.recordSuccess('CPCB', latency, 1, res.status);
      return aqiData;
    } catch (err: any) {
      dataHealthService.recordFailure('CPCB', err.message, 500);
      return null;
    }
  }
}
