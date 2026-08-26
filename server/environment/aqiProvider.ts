/**
 * Air Quality Provider Interface
 * Rule 30: NEVER generate fake AQI values. If no authorized CPCB/IMD SAFAR API is configured,
 * report 'Data unavailable' with status code.
 */

export interface AQIData {
  source: 'CPCB' | 'SAFAR' | 'IMD' | 'UNAVAILABLE';
  status: 'available' | 'unavailable';
  aqi: number | null;
  category: string;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
  stationName?: string;
  updatedAt: string;
  message: string;
}

export class AQIProvider {
  static async getAQIForLocation(lat: number, lng: number, locationName?: string): Promise<AQIData> {
    // Note: Official IMD API does not currently offer a public AQI/SAFAR open endpoint key in the provided doc
    // If a verified provider API key is provided via env, it would be queried here.
    return {
      source: 'UNAVAILABLE',
      status: 'unavailable',
      aqi: null,
      category: 'Data unavailable',
      pm25: null,
      pm10: null,
      no2: null,
      so2: null,
      co: null,
      o3: null,
      stationName: locationName,
      updatedAt: new Date().toISOString(),
      message: 'Official IMD / SAFAR real-time AQI feed requires dedicated departmental credentials.',
    };
  }
}
