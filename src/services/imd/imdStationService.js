/**
 * IMD Station Service (JavaScript module)
 * Handles State -> City -> Verified IMD Meteorological Station hierarchy.
 * Manages search, lookup, and verified station validation.
 * Strictly guarantees status: 'unavailable' if a station ID is not found or unverified,
 * preventing invalid or redundant API requests.
 */

import indiaLocationsData from '../../data/indiaLocations.json';
import imdStationsData from '../../data/imdStations.json';
import { imdClient } from './imdClient.js';

export class IMDStationService {
  constructor() {
    this.states = indiaLocationsData || [];
    this.stations = imdStationsData || [];
  }

  /**
   * Default initial location is Bhubaneswar, Odisha (Station: 42971)
   */
  getDefaultLocation() {
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

  /**
   * Returns all supported States and Union Territories
   */
  getAllStates() {
    return this.states;
  }

  /**
   * Returns all verified IMD meteorological stations from database
   */
  getAllStations() {
    return this.stations;
  }

  /**
   * Checks whether a station ID exists and is verified in the database
   */
  isStationSupported(stationId) {
    if (!stationId) return false;
    const cleanId = String(stationId).trim();
    return this.stations.some((s) => s.stationId === cleanId && s.verified !== false && s.active !== false);
  }

  /**
   * Look up a station record by IMD station ID
   */
  getStationById(stationId) {
    if (!stationId) return undefined;
    const cleanId = String(stationId).trim();
    return this.stations.find((s) => s.stationId === cleanId);
  }

  /**
   * Look up a state by name or state code
   */
  getStateByName(stateName) {
    if (!stateName) return undefined;
    const q = String(stateName).toLowerCase().trim();
    return this.states.find(
      (s) => (s.state && s.state.toLowerCase() === q) || (s.stateCode && s.stateCode.toLowerCase() === q)
    );
  }

  /**
   * Get all cities mapped under a given state
   */
  getCitiesForState(stateName) {
    const stateRec = this.getStateByName(stateName);
    if (!stateRec || !Array.isArray(stateRec.cities)) return [];
    return stateRec.cities.map((c) => ({
      ...c,
      state: stateRec.state,
    }));
  }

  /**
   * Validates a location object or station ID.
   * Returns a validation result with status 'valid' or 'unavailable'.
   */
  validateLocation(location) {
    if (!location) {
      return {
        isValid: false,
        status: 'unavailable',
        reason: 'No location provided.',
        stationId: null,
      };
    }

    // If passed a string (station ID or city name), resolve it first
    if (typeof location === 'string') {
      const resolved = this.resolveLocation(location);
      if (!resolved || !resolved.stationId || !resolved.verified) {
        return {
          isValid: false,
          status: 'unavailable',
          reason: 'No verified IMD station found for the given location query.',
          stationId: null,
          location: resolved,
        };
      }
      return {
        isValid: true,
        status: 'valid',
        stationId: resolved.stationId,
        location: resolved,
      };
    }

    // If passed a location object
    const hasStationId = Boolean(location.stationId && String(location.stationId).trim() !== '');
    const isVerified = Boolean(location.verified);

    if (!hasStationId || !isVerified) {
      return {
        isValid: false,
        status: 'unavailable',
        reason: 'Live IMD observations are not available for this location.',
        stationId: location.stationId || null,
        location,
      };
    }

    const stationInDb = this.getStationById(location.stationId);
    if (!stationInDb) {
      return {
        isValid: false,
        status: 'unavailable',
        reason: `Station ID ${location.stationId} is not in the verified IMD stations registry.`,
        stationId: location.stationId,
        location,
      };
    }

    return {
      isValid: true,
      status: 'valid',
      stationId: location.stationId,
      station: stationInDb,
      location,
    };
  }

  /**
   * Resolves a city name, state name, or station ID to a standardized SelectedLocationModel
   */
  resolveLocation(cityOrStateOrStation) {
    if (!cityOrStateOrStation) return null;
    const q = String(cityOrStateOrStation).toLowerCase().trim();

    // 1. Check if it matches a station ID directly in imdStations.json
    const stationById = this.stations.find((s) => s.stationId && s.stationId.toLowerCase() === q);
    if (stationById) {
      return {
        state: stationById.state,
        city: stationById.city,
        stationId: stationById.stationId,
        stationName: stationById.stationName,
        latitude: stationById.latitude,
        longitude: stationById.longitude,
        verified: Boolean(stationById.verified),
        elevation: stationById.elevation ? `${stationById.elevation}m ASL` : undefined,
      };
    }

    // 2. Check if it matches a city in our state hierarchy
    for (const st of this.states) {
      if (Array.isArray(st.cities)) {
        for (const ct of st.cities) {
          if (
            (ct.name && ct.name.toLowerCase() === q) ||
            (ct.stationId && ct.stationId.toLowerCase() === q) ||
            (ct.name && ct.name.toLowerCase().includes(q) && q.length > 3)
          ) {
            const hasValidStation = Boolean(ct.stationId && this.isStationSupported(ct.stationId));
            return {
              state: st.state,
              stateCode: st.stateCode,
              city: ct.name,
              stationId: hasValidStation ? ct.stationId : null,
              stationName: ct.name,
              latitude: ct.latitude,
              longitude: ct.longitude,
              verified: hasValidStation,
            };
          }
        }
      }
    }

    // 3. Check if it matches a station name in imdStations.json
    const stationByName = this.stations.find(
      (s) => s.stationName && (s.stationName.toLowerCase() === q || s.stationName.toLowerCase().includes(q))
    );
    if (stationByName) {
      return {
        state: stationByName.state,
        city: stationByName.city,
        stationId: stationByName.stationId,
        stationName: stationByName.stationName,
        latitude: stationByName.latitude,
        longitude: stationByName.longitude,
        verified: Boolean(stationByName.verified),
        elevation: stationByName.elevation ? `${stationByName.elevation}m ASL` : undefined,
      };
    }

    // 4. Check if it matches a state name -> default to capital city
    const matchedState = this.states.find(
      (s) => (s.state && s.state.toLowerCase() === q) || (s.stateCode && s.stateCode.toLowerCase() === q)
    );
    if (matchedState && Array.isArray(matchedState.cities) && matchedState.cities.length > 0) {
      const capitalCity =
        matchedState.cities.find((c) => c.name && matchedState.capital && c.name.toLowerCase().includes(matchedState.capital.toLowerCase())) ||
        matchedState.cities[0];
      const hasValidStation = Boolean(capitalCity.stationId && this.isStationSupported(capitalCity.stationId));
      return {
        state: matchedState.state,
        stateCode: matchedState.stateCode,
        city: capitalCity.name,
        stationId: hasValidStation ? capitalCity.stationId : null,
        stationName: capitalCity.name,
        latitude: capitalCity.latitude,
        longitude: capitalCity.longitude,
        verified: hasValidStation,
      };
    }

    return null;
  }

  /**
   * Search through stations, cities, and states
   */
  search(query) {
    if (!query || !query.trim()) {
      // Return top representative stations
      return this.stations.slice(0, 15).map((s) => ({
        city: s.city,
        state: s.state,
        stationName: s.stationName,
        stationId: s.stationId,
        latitude: s.latitude,
        longitude: s.longitude,
        verified: Boolean(s.verified),
        matchType: 'station',
      }));
    }

    const q = query.toLowerCase().trim();
    const results = [];
    const seenKeys = new Set();

    // 1. Search Station ID exact/prefix
    this.stations.forEach((s) => {
      if (s.stationId && s.stationId.toLowerCase().includes(q)) {
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
            verified: Boolean(s.verified),
            matchType: 'id',
          });
        }
      }
    });

    // 2. Search Cities in states hierarchy
    this.states.forEach((st) => {
      if (Array.isArray(st.cities)) {
        st.cities.forEach((ct) => {
          if (ct.name && ct.name.toLowerCase().includes(q)) {
            const key = `${ct.name}-${st.state}-${ct.stationId || 'no-station'}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              const isVerifiedStation = Boolean(ct.stationId && this.isStationSupported(ct.stationId));
              results.push({
                city: ct.name,
                state: st.state,
                stationName: ct.stationId ? `${ct.name} Station` : ct.name,
                stationId: isVerifiedStation ? ct.stationId : null,
                latitude: ct.latitude,
                longitude: ct.longitude,
                verified: isVerifiedStation,
                matchType: 'city',
              });
            }
          }
        });
      }
    });

    // 3. Search State names
    this.states.forEach((st) => {
      if ((st.state && st.state.toLowerCase().includes(q)) || (st.stateCode && st.stateCode.toLowerCase() === q)) {
        if (Array.isArray(st.cities)) {
          st.cities.forEach((ct) => {
            const key = `${ct.name}-${st.state}-${ct.stationId || 'no-station'}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              const isVerifiedStation = Boolean(ct.stationId && this.isStationSupported(ct.stationId));
              results.push({
                city: ct.name,
                state: st.state,
                stationName: ct.stationId ? `${ct.name} Station` : ct.name,
                stationId: isVerifiedStation ? ct.stationId : null,
                latitude: ct.latitude,
                longitude: ct.longitude,
                verified: isVerifiedStation,
                matchType: 'state',
              });
            }
          });
        }
      }
    });

    // 4. Search Station Names in IMD Stations
    this.stations.forEach((s) => {
      if (s.stationName && s.stationName.toLowerCase().includes(q)) {
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
            verified: Boolean(s.verified),
            matchType: 'station',
          });
        }
      }
    });

    return results;
  }

  /**
   * Fetches live IMD observation for a selected location.
   * If stationId is missing or unverified, immediately returns status: 'unavailable'
   * without firing any unauthorized or invalid upstream API requests.
   */
  async fetchLiveWeather(location) {
    const validation = this.validateLocation(location);

    if (!validation.isValid || !location || !location.stationId) {
      return {
        status: 'unavailable',
        data: null,
        message: validation.reason || 'Live IMD observations are not available for this location.',
        lastUpdated: new Date().toISOString(),
        source: 'India Meteorological Department',
      };
    }

    try {
      const res = await imdClient.getCurrentWeather(location.stationId);
      if (res && res.data) {
        const enriched = {
          ...res.data,
          city: location.city || res.data.city,
          state: location.state || res.data.state,
          latitude: location.latitude ?? res.data.latitude,
          longitude: location.longitude ?? res.data.longitude,
          status: res.status === 'cached' ? 'cached' : 'live',
        };

        return {
          status: res.status === 'cached' ? 'cached' : 'live',
          data: enriched,
          lastUpdated: res.lastUpdated || new Date().toISOString(),
          source: 'India Meteorological Department',
        };
      }

      return {
        status: 'unavailable',
        data: null,
        message: (res && res.error && res.error.message) || 'Live IMD observations are not available for this location.',
        lastUpdated: new Date().toISOString(),
        source: 'India Meteorological Department',
      };
    } catch (err) {
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
export default imdStationService;
