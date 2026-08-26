/**
 * Pollen Provider Interface
 * Rule 30: The supplied IMD API reference does NOT define a pollen endpoint.
 * NEVER fabricate pollen values. Return 'Data unavailable'.
 */

export interface PollenData {
  source: 'IMD' | 'UNAVAILABLE';
  status: 'unavailable';
  treePollen: null;
  grassPollen: null;
  weedPollen: null;
  overallIndex: null;
  category: 'Data unavailable';
  message: string;
  updatedAt: string;
}

export class PollenProvider {
  static async getPollenForLocation(_lat: number, _lng: number): Promise<PollenData> {
    return {
      source: 'UNAVAILABLE',
      status: 'unavailable',
      treePollen: null,
      grassPollen: null,
      weedPollen: null,
      overallIndex: null,
      category: 'Data unavailable',
      message: 'Official IMD API does not provide botanical pollen telemetry in current release.',
      updatedAt: new Date().toISOString(),
    };
  }
}
