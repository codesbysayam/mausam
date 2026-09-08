import { LocationRecord, WeatherStation } from '../types';
import { ALL_INDIA_LOCATIONS } from '../data/allIndiaLocations';
import { PRIMARY_ODISHA_LOCATION } from '../data/odishaLocations';

export interface SmartSearchResult {
  location: LocationRecord;
  intentTab: 'home' | 'weather' | 'forecast' | 'warnings' | 'radar' | 'aqi' | 'agromet' | 'reports';
  intentLabel: string;
  matchedParameter?: string;
  displayTitle: string;
  displaySubtitle: string;
}

class LocationService {
  private locations: LocationRecord[] = ALL_INDIA_LOCATIONS;
  private selectedLocationId: string = PRIMARY_ODISHA_LOCATION.id;
  private dynamicLocations: Map<string, LocationRecord> = new Map();

  constructor() {
    // Check if there was a previously saved detected location
    try {
      const saved = localStorage.getItem('mausam_detected_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.record?.id) {
          this.dynamicLocations.set(parsed.record.id, parsed.record);
        }
      }
    } catch {
      // Ignore
    }
  }

  getAllLocations(): LocationRecord[] {
    return [...Array.from(this.dynamicLocations.values()), ...this.locations];
  }

  getOdishaLocations(): LocationRecord[] {
    return this.locations.filter((l) => l.state === 'Odisha');
  }

  getNationalStations(): LocationRecord[] {
    return this.locations.filter((l) => l.state !== 'Odisha');
  }

  getPrimaryLocation(): LocationRecord {
    return PRIMARY_ODISHA_LOCATION;
  }

  registerDynamicLocation(loc: LocationRecord): void {
    if (loc && loc.id) {
      this.dynamicLocations.set(loc.id, loc);
    }
  }

  findLocationById(id: string): LocationRecord | undefined {
    if (!id) return undefined;
    const cleanId = id.toLowerCase().trim();

    // 0. Check dynamic locations (GPS detected)
    if (this.dynamicLocations.has(cleanId)) {
      return this.dynamicLocations.get(cleanId);
    }
    for (const [k, v] of this.dynamicLocations.entries()) {
      if (k.toLowerCase() === cleanId) return v;
    }

    // 1. Direct ID match
    const direct = this.locations.find((l) => l.id.toLowerCase() === cleanId);
    if (direct) return direct;

    // 2. Partial ID match (e.g. 'delhi' matching 'delhi-safdarjung')
    const partialId = this.locations.find(
      (l) => l.id.toLowerCase().includes(cleanId) || cleanId.includes(l.id.toLowerCase())
    );
    if (partialId) return partialId;

    // 3. Match by aliases or city
    return this.findLocationByName(id);
  }

  getLocationById(id: string): LocationRecord {
    return this.findLocationById(id) || this.getPrimaryLocation();
  }

  findLocationByName(name: string): LocationRecord | undefined {
    if (!name) return undefined;
    const q = name.toLowerCase().trim();

    // 1. Exact city match
    const exactCity = this.locations.find((l) => l.city.toLowerCase() === q);
    if (exactCity) return exactCity;

    // 2. Exact district match
    const exactDistrict = this.locations.find((l) => l.district.toLowerCase() === q);
    if (exactDistrict) return exactDistrict;

    // 3. Exact alias match
    const exactAlias = this.locations.find(
      (l) => l.aliases && l.aliases.some((a) => a.toLowerCase() === q)
    );
    if (exactAlias) return exactAlias;

    // 4. Exact display name match
    const exactDisplay = this.locations.find((l) => l.displayName.toLowerCase() === q);
    if (exactDisplay) return exactDisplay;

    // 5. Partial city match (e.g. "delhi" matching "New Delhi" or "new delhi" matching "New Delhi")
    const partialCity = this.locations.find(
      (l) => l.city.toLowerCase().includes(q) || q.includes(l.city.toLowerCase())
    );
    if (partialCity) return partialCity;

    // 6. Partial alias match
    const partialAlias = this.locations.find(
      (l) => l.aliases && l.aliases.some((a) => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))
    );
    if (partialAlias) return partialAlias;

    // 7. State match
    const stateMatch = this.locations.find(
      (l) => l.state.toLowerCase() === q || l.state.toLowerCase().includes(q)
    );
    if (stateMatch) return stateMatch;

    return undefined;
  }

  findLocationsByState(state: string): LocationRecord[] {
    if (!state) return [];
    const q = state.toLowerCase().trim();
    return this.locations.filter((l) => l.state.toLowerCase() === q || l.state.toLowerCase().includes(q));
  }

  searchLocations(query: string): LocationRecord[] {
    if (!query.trim()) return this.locations;
    const q = query.toLowerCase().trim();

    const matches = this.locations.filter(
      (l) =>
        l.city.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.displayName.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        (l.pincode && l.pincode.includes(q)) ||
        (l.aliases && l.aliases.some((a) => a.toLowerCase().includes(q))) ||
        l.id.toLowerCase().includes(q)
    );

    // Sort matches for highest relevancy: exact city first, then city starting with query, etc.
    return matches.sort((a, b) => {
      const aCityExact = a.city.toLowerCase() === q;
      const bCityExact = b.city.toLowerCase() === q;
      if (aCityExact && !bCityExact) return -1;
      if (!aCityExact && bCityExact) return 1;

      const aCityStarts = a.city.toLowerCase().startsWith(q);
      const bCityStarts = b.city.toLowerCase().startsWith(q);
      if (aCityStarts && !bCityStarts) return -1;
      if (!aCityStarts && bCityStarts) return 1;

      const aNameStarts = a.displayName.toLowerCase().startsWith(q);
      const bNameStarts = b.displayName.toLowerCase().startsWith(q);
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;

      return 0;
    });
  }

  /**
   * Intent-based smart search.
   * Recognizes location + parameter queries (e.g., "Kolkata AQI", "Mumbai warnings", "Delhi temperature", "Odisha rainfall", "Jaipur radar")
   * and directs user directly to the relevant view.
   */
  smartSearch(query: string): SmartSearchResult[] {
    if (!query || !query.trim()) return [];
    const raw = query.toLowerCase().trim();

    type TabType = 'home' | 'weather' | 'forecast' | 'warnings' | 'radar' | 'aqi' | 'agromet' | 'reports';

    let intentTab: TabType = 'weather';
    let intentLabel = 'Live Weather';
    let matchedParameter: string | undefined = undefined;

    const keywords: { patterns: string[]; tab: TabType; label: string; param: string }[] = [
      { patterns: ['aqi', 'air quality', 'air', 'pollution', 'pm2.5', 'pm10'], tab: 'aqi', label: 'Air Quality (NAQI)', param: 'AQI' },
      { patterns: ['warning', 'warnings', 'alert', 'alerts', 'cyclone', 'danger', 'hazard'], tab: 'warnings', label: 'Severe Weather Warnings', param: 'Warnings' },
      { patterns: ['radar', 'doppler', 'dwr', 'satellite', 'echo', 'reflectivity'], tab: 'radar', label: 'Doppler Radar & Maps', param: 'Radar' },
      { patterns: ['forecast', '7-day', 'weekly', 'tomorrow', 'extended'], tab: 'forecast', label: '7-Day Forecast', param: 'Forecast' },
      { patterns: ['agriculture', 'agromet', 'crop', 'farming', 'soil', 'irrigation', 'kisan'], tab: 'agromet', label: 'Agromet & Crop Advisories', param: 'Agromet' },
      { patterns: ['report', 'bulletin', 'pdf', 'export', 'download'], tab: 'reports', label: 'Meteorological Reports', param: 'Reports' },
      { patterns: ['temp', 'temperature', 'heat', 'cold'], tab: 'weather', label: 'Temperature & Thermal Telemetry', param: 'Temperature' },
      { patterns: ['rain', 'rainfall', 'precipitation', 'monsoon'], tab: 'weather', label: 'Rainfall & Precipitation', param: 'Rainfall' },
      { patterns: ['wind', 'gust', 'breeze'], tab: 'weather', label: 'Wind Velocity & Vector', param: 'Wind' },
      { patterns: ['humidity', 'dew point', 'dewpoint', 'moisture'], tab: 'weather', label: 'Humidity & Dew Point', param: 'Humidity' },
      { patterns: ['uv', 'sun', 'solar', 'radiation'], tab: 'weather', label: 'Solar & UV Exposure', param: 'Solar/UV' },
      { patterns: ['marine', 'sea', 'wave', 'tide', 'coastal'], tab: 'weather', label: 'Marine & Ocean State', param: 'Marine' },
      { patterns: ['weather', 'nowcast', 'observation', 'climate'], tab: 'weather', label: 'Current Weather Telemetry', param: 'Weather' },
    ];

    // Check if query contains any of the patterns
    let locationPart = raw;
    for (const kw of keywords) {
      for (const pat of kw.patterns) {
        const regex = new RegExp(`\\b${pat}\\b`, 'i');
        if (regex.test(raw)) {
          intentTab = kw.tab;
          intentLabel = kw.label;
          matchedParameter = kw.param;
          locationPart = raw.replace(regex, ' ').replace(/\s+/g, ' ').trim();
          break;
        }
      }
      if (matchedParameter) break;
    }

    // Search locations with the stripped locationPart, or raw if stripped is empty
    const searchTerm = locationPart || raw;
    let locations = this.searchLocations(searchTerm);

    // If no locations matched stripped term, try matching raw query
    if (locations.length === 0 && locationPart !== raw) {
      locations = this.searchLocations(raw);
    }

    // If still no locations and user just typed an intent word (e.g. "AQI" or "Radar"), return current location with that intent
    if (locations.length === 0 && matchedParameter) {
      const currentLoc = this.getSelectedLocation();
      return [
        {
          location: currentLoc,
          intentTab,
          intentLabel,
          matchedParameter,
          displayTitle: `${currentLoc.city} — ${intentLabel}`,
          displaySubtitle: `View live ${matchedParameter} data for ${currentLoc.city}, ${currentLoc.state}`,
        },
      ];
    }

    return locations.map((loc) => ({
      location: loc,
      intentTab,
      intentLabel,
      matchedParameter,
      displayTitle: matchedParameter ? `${loc.city} — ${intentLabel}` : `${loc.city}, ${loc.state}`,
      displaySubtitle: matchedParameter
        ? `Open ${matchedParameter} in ${intentLabel} for ${loc.city}`
        : `${loc.district || loc.state} • ${loc.elevation || 'AWS Station'}`,
    }));
  }

  getSelectedLocation(): LocationRecord {
    try {
      const storedId = localStorage.getItem('mausam_selected_location_id');
      if (storedId) {
        const found = this.findLocationById(storedId);
        if (found) {
          this.selectedLocationId = found.id;
          return found;
        }
      }
    } catch {
      // Ignore in restricted environments
    }
    return this.getLocationById(this.selectedLocationId);
  }

  getLocationSource(): 'DEVICE_GPS' | 'MANUAL_SEARCH' {
    try {
      const source = localStorage.getItem('mausam_location_source');
      if (source === 'DEVICE_GPS') return 'DEVICE_GPS';
    } catch {
      // Ignore
    }
    return 'MANUAL_SEARCH';
  }

  setSelectedLocation(target: string | LocationRecord, source: 'DEVICE_GPS' | 'MANUAL_SEARCH' = 'MANUAL_SEARCH'): LocationRecord {
    const loc = typeof target === 'string' ? this.getLocationById(target) : target;
    this.registerDynamicLocation(loc);
    this.selectedLocationId = loc.id;
    try {
      localStorage.setItem('mausam_selected_location_id', loc.id);
      localStorage.setItem('mausam_location_source', source);
    } catch {
      // Ignore in restricted iframe
    }
    return loc;
  }

  clearSavedLocation(): void {
    this.selectedLocationId = PRIMARY_ODISHA_LOCATION.id;
    try {
      localStorage.removeItem('mausam_selected_location_id');
      localStorage.removeItem('mausam_location_source');
      localStorage.removeItem('mausam_detected_location');
    } catch {
      // Ignore
    }
  }

  /**
   * Converts a LocationRecord into a WeatherStation interface compatible with legacy map components
   */
  locationToWeatherStation(
    loc: LocationRecord,
    temp = 31.0,
    condition = 'Clear',
    weatherType: 'sunny' | 'rain' | 'thunderstorm' | 'fog' | 'duststorm' = 'sunny',
    pm25 = 45
  ): WeatherStation {
    return {
      id: loc.id,
      name: loc.displayName,
      code: loc.imdStation || `AWS-${loc.district.substring(0, 3).toUpperCase()}`,
      state: loc.state,
      district: loc.district,
      lat: loc.lat,
      lng: loc.lng,
      elevation: loc.elevation || '35m ASL',
      status: 'active',
      pm25,
      temp,
      condition,
      weatherType,
      radarType: loc.radarCoverage || 'IMD Regional AWS',
      reflectivityDbz: weatherType === 'rain' ? 38 : weatherType === 'thunderstorm' ? 52 : 12,
      isCoastal: loc.coastalStatus === 'coastal',
    };
  }
}

export const locationService = new LocationService();
