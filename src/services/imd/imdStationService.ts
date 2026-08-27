/**
 * IMD Station Service
 * Handles State -> City -> Verified IMD Meteorological Station hierarchy.
 * Manages search, lookup, and verified station validation.
 */

import indiaLocationsData from '../../data/indiaLocations.json';
import imdStationsData from '../../data/imdStations.json';
import { imdClient } from './imdClient';
import { IMDNormalizer, NormalizedStationWeather } from './imdNormalizer';

export interface StateRecord {
  state: string;
  stateCode: string;
  type: 'state' | 'ut';
  capital: string;
  cities: CityRecord[];
}

export interface CityRecord {
  name: string;
  stationId?: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  type?: string;
  state?: string;
}

export interface IMDStationRecord {
  stationId: string;
  stationName: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  active: boolean;
  verified: boolean;
}

export interface SelectedLocationModel {
  state: string;
  stateCode?: string;
  city: string;
  stationId: string | null;
  stationName?: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  elevation?: string | number;
}

export interface SearchStationResult {
  city: string;
  state: string;
  stationName: string;
  stationId: string | null;
  latitude: number;
  longitude: number;
  verified: boolean;
  matchType: 'city' | 'state' | 'station' | 'id';
}

class IMDStationService {
  private states: StateRecord[] = indiaLocationsData as StateRecord[];
  private stations: IMDStationRecord[] = imdStationsData as IMDStationRecord[];

  /**
   * Default initial location is Bhubaneswar, Odisha (Station: 42971)
   */
  getDefaultLocation(): SelectedLocationModel {
    return {
      state: 'Odisha',
      stateCode: 'OD',
      city: 'Bhubaneswar',
      stationId: '42971',
      stationName: 'Bhubaneswar Observatory',
      latitude: 20.2961,
      longitude: 85.8245,
      verified: true,
      elevation: '45m ASL',
    };
  }

  getAllStates(): StateRecord[] {
    return this.states;
  }

  getAllStations(): IMDStationRecord[] {
    return this.stations;
  }

  getStationById(stationId: string): IMDStationRecord | undefined {
    if (!stationId) return undefined;
    return this.stations.find((s) => s.stationId === String(stationId).trim());
  }

  getStateByName(stateName: string): StateRecord | undefined {
    if (!stateName) return undefined;
    const q = stateName.toLowerCase().trim();
    return this.states.find(
      (s) => s.state.toLowerCase() === q || s.stateCode.toLowerCase() === q
    );
  }

  getCitiesForState(stateName: string): CityRecord[] {
    const stateRec = this.getStateByName(stateName);
    if (!stateRec) return [];
    return stateRec.cities.map((c) => ({
      ...c,
      state: stateRec.state,
    }));
  }

  resolveLocation(cityOrStateOrStation: string): SelectedLocationModel | null {
    if (!cityOrStateOrStation) return null;
    const q = cityOrStateOrStation.toLowerCase().trim();

    // 1. Check if it matches a station ID directly
    const stationById = this.stations.find((s) => s.stationId === q);
    if (stationById) {
      return {
        state: stationById.state,
        city: stationById.city,
        stationId: stationById.stationId,
        stationName: stationById.stationName,
        latitude: stationById.latitude,
        longitude: stationById.longitude,
        verified: stationById.verified,
        elevation: stationById.elevation ? `${stationById.elevation}m ASL` : undefined,
      };
    }

    // 2. Check if it matches a city in our hierarchy
    for (const st of this.states) {
      for (const ct of st.cities) {
        if (
          ct.name.toLowerCase() === q ||
          ct.stationId === q ||
          (ct.name.toLowerCase().includes(q) && q.length > 3)
        ) {
          return {
            state: st.state,
            stateCode: st.stateCode,
            city: ct.name,
            stationId: ct.stationId || null,
            stationName: ct.name,
            latitude: ct.latitude,
            longitude: ct.longitude,
            verified: ct.verified && !!ct.stationId,
          };
        }
      }
    }

    // 3. Check if it matches a state name -> default to capital
    const matchedState = this.states.find(
      (s) => s.state.toLowerCase() === q || s.stateCode.toLowerCase() === q
    );
    if (matchedState && matchedState.cities.length > 0) {
      const capitalCity =
        matchedState.cities.find((c) => c.name.toLowerCase().includes(matchedState.capital.toLowerCase())) ||
        matchedState.cities[0];
      return {
        state: matchedState.state,
        stateCode: matchedState.stateCode,
        city: capitalCity.name,
        stationId: capitalCity.stationId || null,
        stationName: capitalCity.name,
        latitude: capitalCity.latitude,
        longitude: capitalCity.longitude,
        verified: capitalCity.verified && !!capitalCity.stationId,
      };
    }

    return null;
  }

  search(query: string): SearchStationResult[] {
    if (!query || !query.trim()) {
      // Return representative stations
      return this.stations.slice(0, 15).map((s) => ({
        city: s.city,
        state: s.state,
        stationName: s.stationName,
        stationId: s.stationId,
        latitude: s.latitude,
        longitude: s.longitude,
        verified: s.verified,
        matchType: 'station',
      }));
    }

    const q = query.toLowerCase().trim();
    const results: SearchStationResult[] = [];
    const seenKeys = new Set<string>();

    // 1. Search Station ID exact/prefix
    this.stations.forEach((s) => {
      if (s.stationId.toLowerCase().includes(q)) {
        const key = `${s.city}-${s.state}-${s.stationId}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          results.push({
            city: s.city,
            state: s.state,
            stationName: s.stationName,
            stationId: s.stationId,
            latitude: s.latitude,
            longitude: s.longitude,
            verified: s.verified,
            matchType: 'id',
          });
        }
      }
    });

    // 2. Search Cities in states hierarchy
    this.states.forEach((st) => {
      st.cities.forEach((ct) => {
        if (ct.name.toLowerCase().includes(q)) {
          const key = `${ct.name}-${st.state}-${ct.stationId || 'no-station'}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            results.push({
              city: ct.name,
              state: st.state,
              stationName: ct.stationId ? `${ct.name} Station` : ct.name,
              stationId: ct.stationId || null,
              latitude: ct.latitude,
              longitude: ct.longitude,
              verified: ct.verified && !!ct.stationId,
              matchType: 'city',
            });
          }
        }
      });
    });

    // 3. Search State names
    this.states.forEach((st) => {
      if (st.state.toLowerCase().includes(q) || st.stateCode.toLowerCase() === q) {
        st.cities.forEach((ct) => {
          const key = `${ct.name}-${st.state}-${ct.stationId || 'no-station'}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            results.push({
              city: ct.name,
              state: st.state,
              stationName: ct.stationId ? `${ct.name} Station` : ct.name,
              stationId: ct.stationId || null,
              latitude: ct.latitude,
              longitude: ct.longitude,
              verified: ct.verified && !!ct.stationId,
              matchType: 'state',
            });
          }
        });
      }
    });

    // 4. Search Station Names in IMD Stations
    this.stations.forEach((s) => {
      if (s.stationName.toLowerCase().includes(q)) {
        const key = `${s.city}-${s.state}-${s.stationId}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          results.push({
            city: s.city,
            state: s.state,
            stationName: s.stationName,
            stationId: s.stationId,
            latitude: s.latitude,
            longitude: s.longitude,
            verified: s.verified,
            matchType: 'station',
          });
        }
      }
    });

    return results;
  }

  /**
   * Fetches live IMD observation for a selected location.
   * If stationId is missing, returns status: 'unavailable' without falling back to Bhubaneswar.
   */
  async fetchLiveWeather(
    location: SelectedLocationModel
  ): Promise<{
    status: 'live' | 'cached' | 'unavailable' | 'error';
    data: NormalizedStationWeather | null;
    message?: string;
    lastUpdated?: string;
    source?: string;
  }> {
    if (!location.stationId || !location.verified) {
      return {
        status: 'unavailable',
        data: null,
        message: 'Live IMD observations are not available for this location.',
        lastUpdated: new Date().toISOString(),
        source: 'India Meteorological Department',
      };
    }

    try {
      const res = await imdClient.getCurrentWeather(location.stationId);
      if (res.data) {
        const enriched: NormalizedStationWeather = {
          ...res.data,
          city: location.city,
          state: location.state,
          latitude: location.latitude,
          longitude: location.longitude,
          status: res.status === 'cached' ? 'cached' : 'live',
        };
        return {
          status: res.status === 'cached' ? 'cached' : 'live',
          data: enriched,
          lastUpdated: res.lastUpdated || new Date().toISOString(),
          source: 'India Meteorological Department',
        };
      }

      // If server returned error or null data
      return {
        status: 'unavailable',
        data: null,
        message: res.error?.message || 'Live IMD observations are not available for this location.',
        lastUpdated: new Date().toISOString(),
        source: 'India Meteorological Department',
      };
    } catch (err: any) {
      return {
        status: 'error',
        data: null,
        message: err.message || 'Failed to connect to IMD meteorological server.',
        lastUpdated: new Date().toISOString(),
        source: 'India Meteorological Department',
      };
    }
  }
}

export const imdStationService = new IMDStationService();
