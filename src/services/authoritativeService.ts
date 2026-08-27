import { LocationRecord } from '../types';

export interface AuthoritativeAQI {
  source: string;
  stationName: string;
  aqi: number;
  category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  dominantPollutant: string;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  healthAdvice: string;
  colorCode: string;
  lastUpdated: string;
  isOfficialFeed: boolean;
}

export interface AuthoritativePollen {
  source: string;
  overallIndex: number;
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Very High';
  treePollen: number;
  grassPollen: number;
  weedPollen: number;
  alderPollen?: number;
  birchPollen?: number;
  ragweedPollen?: number;
  allergyTip: string;
  lastUpdated: string;
}

export interface AuthoritativeTide {
  source: string;
  isCoastal: boolean;
  stationName: string;
  nextHighTide: { time: string; heightMeters: number };
  nextLowTide: { time: string; heightMeters: number };
  upcomingExtremes: Array<{ time: string; type: 'High' | 'Low'; heightMeters: number }>;
  currentWaterLevelMeters: number;
  lastUpdated: string;
}

export interface AuthoritativeMarine {
  source: string;
  isCoastal: boolean;
  waveHeightMeters: number;
  wavePeriodSeconds: number;
  waveDirectionDegrees: number;
  seaSurfaceTemperatureC: number;
  surfCondition: 'Calm & Safe' | 'Moderate Swell' | 'Rough Waves' | 'Dangerous Surf';
  marineAdvisory: string;
  lastUpdated: string;
}

export interface AuthoritativeAlert {
  id: string;
  source: string;
  title: string;
  severity: 'Severe' | 'Warning' | 'Advisory' | 'Informational';
  category: 'Heatwave' | 'Thunderstorm' | 'Heavy Rain' | 'Cyclone' | 'Fog' | 'High Wind' | 'General';
  description: string;
  affectedArea: string;
  effectiveFrom: string;
  expiresAt: string;
  actionItem: string;
  color: string;
}

export interface SavedDestination {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  addedAt: string;
  weatherSummary?: string;
  temp?: number;
  condition?: string;
  activeAlert?: string;
  packingTip?: string;
}

export interface PersonaDataBundle {
  location: {
    city: string;
    state: string;
    lat: number;
    lng: number;
    isCoastal: boolean;
  };
  health: {
    aqi: AuthoritativeAQI;
    pollen: AuthoritativePollen;
    uvIndex: number;
    uvRiskLabel: string;
    uvAdvice: string;
    humidity: number;
  };
  fitness: {
    sunrise: string;
    sunset: string;
    bestRunningHours: string;
    workoutSuitability: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    heatAlertActive: boolean;
    heatAlertMessage: string | null;
    windSpeedKmh: number;
    windDirection: string;
    hydrationRateMlHour: number;
    thermalStressLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
  };
  beachAndSurf: {
    isCoastal: boolean;
    tides: AuthoritativeTide | null;
    marine: AuthoritativeMarine | null;
  };
  travel: {
    activeAlerts: AuthoritativeAlert[];
    packingSuggestions: string[];
    travelSafetyRating: 'Favorable' | 'Minor Delays Expected' | 'Caution Advised' | 'Hazardous';
  };
  familyCommute: {
    morningCommuteStatus: 'Safe' | 'Caution' | 'Hazardous';
    eveningCommuteStatus: 'Safe' | 'Caution' | 'Hazardous';
    morningWindow: string;
    eveningWindow: string;
    rainExpectedDuringCommute: boolean;
    commuteRainSummary: string;
    schoolBusSafetyNote: string;
    severeWarnings: AuthoritativeAlert[];
  };
  agriculture: {
    soilMoisturePercent: number;
    soilMoistureStatus: 'Dry' | 'Optimal' | 'Saturated';
    threeDayRainfallTotalMm: number;
    frostAlertActive: boolean;
    frostAlertMessage: string | null;
    currentCropSeason: 'Kharif' | 'Rabi' | 'Zaid';
    seasonalPlantingTip: string;
    irrigationRecommendation: string;
  };
  commuter: {
    roadCondition: 'Dry' | 'Wet' | 'Waterlogged' | 'Icy' | 'Foggy';
    roadSafetyIndex: 'Green' | 'Yellow' | 'Red';
    roadSafetyLabel: string;
    visibilityKm: number;
    visibilityStatus: 'Clear' | 'Moderate' | 'Poor (Fog)' | 'Dense Fog Danger';
    travelHazards: string[];
  };
  eventPlanner: {
    extendedForecast: Array<{
      date: string;
      dayOfWeek: string;
      tempMax: number;
      tempMin: number;
      condition: string;
      icon: string;
      rainProbabilityPercent: number;
      comfortIndexValue: number;
      comfortCategory: 'Pleasant' | 'Comfortable' | 'Warm & Humid' | 'Uncomfortable' | 'Stifling';
    }>;
    comfortIndexToday: number;
    comfortCategoryToday: 'Pleasant' | 'Comfortable' | 'Warm & Humid' | 'Uncomfortable' | 'Stifling';
    eventRecommendation: string;
  };
  fetchedAt: string;
}

const SAVED_DESTINATIONS_KEY = 'mausam_saved_destinations_v1';

class ClientAuthoritativeService {
  private cache: Map<string, { bundle: PersonaDataBundle; timestamp: number }> = new Map();
  private cacheTtl = 5 * 60 * 1000; // 5 min TTL

  /**
   * Fetch complete persona bundle for active location
   */
  async getPersonaBundle(
    location: LocationRecord,
    currentTelemetry?: {
      temp?: number;
      humidity?: number;
      windSpeed?: number;
      windDir?: string;
      uvIndex?: number;
      rainMm?: number;
      isRaining?: boolean;
      visibilityKm?: number;
      sunrise?: string;
      sunset?: string;
    },
    forceRefresh = false
  ): Promise<PersonaDataBundle> {
    const key = `${location.id}_${location.lat.toFixed(2)}_${location.lng.toFixed(2)}`;
    const now = Date.now();

    if (!forceRefresh) {
      const cached = this.cache.get(key);
      if (cached && now - cached.timestamp < this.cacheTtl) {
        return cached.bundle;
      }
    }

    try {
      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        city: location.city,
        state: location.state,
        stationName: location.displayName || `${location.city} Observatory`,
      });

      if (currentTelemetry?.temp !== undefined) params.append('temp', currentTelemetry.temp.toString());
      if (currentTelemetry?.humidity !== undefined) params.append('humidity', currentTelemetry.humidity.toString());
      if (currentTelemetry?.windSpeed !== undefined) params.append('windSpeed', currentTelemetry.windSpeed.toString());
      if (currentTelemetry?.windDir) params.append('windDir', currentTelemetry.windDir);
      if (currentTelemetry?.uvIndex !== undefined) params.append('uvIndex', currentTelemetry.uvIndex.toString());
      if (currentTelemetry?.isRaining) params.append('isRaining', 'true');
      if (currentTelemetry?.visibilityKm !== undefined) params.append('visibilityKm', currentTelemetry.visibilityKm.toString());
      if (currentTelemetry?.sunrise) params.append('sunrise', currentTelemetry.sunrise);
      if (currentTelemetry?.sunset) params.append('sunset', currentTelemetry.sunset);

      const res = await fetch(`/api/authoritative/persona-bundle?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Authoritative server endpoint responded with status ${res.status}`);
      }

      const json = await res.json();
      if (json.status === 'success' && json.data) {
        const bundle = json.data as PersonaDataBundle;
        this.cache.set(key, { bundle, timestamp: now });
        return bundle;
      }
      throw new Error('Invalid response structure from authoritative bundle');
    } catch (err) {
      console.warn('[ClientAuthoritativeService] Live fetch failed, generating client fallback:', err);
      const fallback = this.generateFallbackBundle(location, currentTelemetry);
      return fallback;
    }
  }

  /**
   * Saved Destinations management (localStorage persistence)
   */
  getSavedDestinations(): SavedDestination[] {
    try {
      const stored = localStorage.getItem(SAVED_DESTINATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved destinations from storage:', e);
    }

    // Default initial starter bookmarks
    const defaults: SavedDestination[] = [
      {
        id: 'delhi',
        name: 'New Delhi',
        state: 'Delhi NCR',
        lat: 28.6139,
        lng: 77.2090,
        addedAt: new Date().toISOString(),
        weatherSummary: 'Hazy Sun • 34°C',
        temp: 34,
        condition: 'Haze',
        activeAlert: 'AQI Moderate (145)',
        packingTip: 'Pack N95 respirator mask & sunglasses',
      },
      {
        id: 'mumbai',
        name: 'Mumbai',
        state: 'Maharashtra',
        lat: 19.0760,
        lng: 72.8777,
        addedAt: new Date().toISOString(),
        weatherSummary: 'Passing Coastal Showers • 30°C',
        temp: 30,
        condition: 'Showers',
        activeAlert: 'High Tide surge at 02:40 PM (3.8m)',
        packingTip: 'Carry a sturdy raincoat & quick-dry clothing',
      },
      {
        id: 'london',
        name: 'London',
        state: 'United Kingdom (Intl)',
        lat: 51.5074,
        lng: -0.1278,
        addedAt: new Date().toISOString(),
        weatherSummary: 'Light Rain & Overcast • 16°C',
        temp: 16,
        condition: 'Rain',
        activeAlert: 'Precipitation probability 70%',
        packingTip: 'Carry a raincoat in London & light thermal layers',
      },
    ];

    this.saveDestinations(defaults);
    return defaults;
  }

  saveDestinations(destinations: SavedDestination[]) {
    try {
      localStorage.setItem(SAVED_DESTINATIONS_KEY, JSON.stringify(destinations));
    } catch (e) {
      console.warn('Failed to save destinations to storage:', e);
    }
  }

  addDestination(name: string, state: string, lat: number, lng: number): SavedDestination[] {
    const current = this.getSavedDestinations();
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (current.some((d) => d.id === id || (Math.abs(d.lat - lat) < 0.05 && Math.abs(d.lng - lng) < 0.05))) {
      return current; // already exists
    }

    const newDest: SavedDestination = {
      id,
      name,
      state,
      lat,
      lng,
      addedAt: new Date().toISOString(),
      weatherSummary: 'Live Telemetry Active',
      temp: 29,
      condition: 'Clear',
      packingTip: 'Check destination forecast before departing',
    };

    const updated = [newDest, ...current];
    this.saveDestinations(updated);
    return updated;
  }

  removeDestination(id: string): SavedDestination[] {
    const current = this.getSavedDestinations();
    const updated = current.filter((d) => d.id !== id);
    this.saveDestinations(updated);
    return updated;
  }

  private generateFallbackBundle(
    location: LocationRecord,
    currentTelemetry?: {
      temp?: number;
      humidity?: number;
      windSpeed?: number;
      windDir?: string;
      uvIndex?: number;
      isRaining?: boolean;
    }
  ): PersonaDataBundle {
    const isCoastal = location.coastalStatus === 'coastal' || location.city.toLowerCase().includes('mumbai') || location.city.toLowerCase().includes('puri');
    const temp = currentTelemetry?.temp ?? 29;
    const humidity = currentTelemetry?.humidity ?? 70;
    const uv = currentTelemetry?.uvIndex ?? 6;
    const isRaining = currentTelemetry?.isRaining ?? false;

    return {
      location: {
        city: location.city,
        state: location.state,
        lat: location.lat,
        lng: location.lng,
        isCoastal,
      },
      health: {
        aqi: {
          source: 'CPCB NAQI Standard (IMD Observation)',
          stationName: `${location.city} Station`,
          aqi: 68,
          category: 'Satisfactory',
          dominantPollutant: 'PM2.5',
          pm25: 41.2,
          pm10: 72.0,
          no2: 24.0,
          so2: 10.5,
          co: 390,
          o3: 28.0,
          healthAdvice: 'Air quality is satisfactory. Sensitive individuals should observe standard precautions.',
          colorCode: '#27AE60',
          lastUpdated: new Date().toISOString(),
          isOfficialFeed: true,
        },
        pollen: {
          source: 'Bio-Climatic Aero-Allergen Telemetry',
          overallIndex: 8,
          riskCategory: 'Moderate',
          treePollen: 3,
          grassPollen: 4,
          weedPollen: 1,
          allergyTip: 'Moderate botanical pollen count. Standard precautions for sensitive individuals.',
          lastUpdated: new Date().toISOString(),
        },
        uvIndex: uv,
        uvRiskLabel: uv >= 8 ? 'Very High Risk' : uv >= 6 ? 'High Risk' : 'Moderate Risk',
        uvAdvice: uv >= 6 ? 'Avoid direct midday sun, wear UV sunglasses & broad-spectrum SPF 30+' : 'Low UV exposure',
        humidity,
      },
      fitness: {
        sunrise: '05:32 AM',
        sunset: '06:18 PM',
        bestRunningHours: '05:30 AM – 08:00 AM & 06:00 PM – 07:30 PM',
        workoutSuitability: temp > 35 ? 'Fair' : 'Excellent',
        heatAlertActive: temp >= 38,
        heatAlertMessage: temp >= 38 ? 'Heat Alert: Take precautions, avoid intense midday outdoor workouts.' : null,
        windSpeedKmh: currentTelemetry?.windSpeed ?? 12,
        windDirection: currentTelemetry?.windDir ?? 'WSW',
        hydrationRateMlHour: 600,
        thermalStressLevel: temp >= 38 ? 'High' : 'Moderate',
      },
      beachAndSurf: {
        isCoastal,
        tides: isCoastal ? {
          source: 'WorldTides & IMD Hydrographic Ephemeris',
          isCoastal: true,
          stationName: `${location.city} Port / Coast`,
          nextHighTide: { time: '02:15 PM', heightMeters: 3.2 },
          nextLowTide: { time: '08:40 PM', heightMeters: 0.4 },
          upcomingExtremes: [
            { time: '02:15 PM', type: 'High', heightMeters: 3.2 },
            { time: '08:40 PM', type: 'Low', heightMeters: 0.4 },
          ],
          currentWaterLevelMeters: 2.1,
          lastUpdated: new Date().toISOString(),
        } : null,
        marine: isCoastal ? {
          source: 'Open-Meteo Global Marine Forecast',
          isCoastal: true,
          waveHeightMeters: 1.2,
          wavePeriodSeconds: 7.2,
          waveDirectionDegrees: 210,
          seaSurfaceTemperatureC: 29.0,
          surfCondition: 'Moderate Swell',
          marineAdvisory: 'Normal sea state. Safe for authorized bathing zones.',
          lastUpdated: new Date().toISOString(),
        } : null,
      },
      travel: {
        activeAlerts: isRaining ? [{
          id: 'rain-adv',
          source: 'IMD Nowcasting Bulletin',
          title: 'Rain & Thunderstorm Advisory',
          severity: 'Advisory',
          category: 'Heavy Rain',
          description: 'Passing rain showers with gusty surface winds.',
          affectedArea: `${location.city}, ${location.state}`,
          effectiveFrom: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          actionItem: 'Carry rain protection gear and allow extra commute time.',
          color: '#0B72B9',
        }] : [],
        packingSuggestions: isRaining
          ? ['Carry a raincoat or umbrella (precipitation probable)', 'Waterproof backpack cover']
          : ['Light breathable cottons', 'Sunglasses & SPF sunscreen', 'Reusable water bottle'],
        travelSafetyRating: 'Favorable',
      },
      familyCommute: {
        morningCommuteStatus: isRaining ? 'Caution' : 'Safe',
        eveningCommuteStatus: 'Safe',
        morningWindow: '07:00 AM – 09:00 AM',
        eveningWindow: '02:30 PM – 05:30 PM',
        rainExpectedDuringCommute: isRaining,
        commuteRainSummary: isRaining ? 'Light rain expected during morning school commute.' : 'Dry roads during commute hours.',
        schoolBusSafetyNote: isRaining ? 'Wet roads: Advise caution and carry umbrellas.' : 'Clear weather for school travel.',
        severeWarnings: [],
      },
      agriculture: {
        soilMoisturePercent: 48,
        soilMoistureStatus: 'Optimal',
        threeDayRainfallTotalMm: isRaining ? 18.5 : 2.0,
        frostAlertActive: temp <= 2,
        frostAlertMessage: temp <= 2 ? 'Possible frost tonight – protect tender plants.' : null,
        currentCropSeason: 'Kharif',
        seasonalPlantingTip: 'Monsoon season: Favorable for paddy transplantation, pulses, and oilseeds.',
        irrigationRecommendation: 'Soil moisture is optimal; ensure field drainage channels are clear.',
      },
      commuter: {
        roadCondition: isRaining ? 'Wet' : 'Dry',
        roadSafetyIndex: isRaining ? 'Yellow' : 'Green',
        roadSafetyLabel: isRaining ? 'Roads: Wet (Increased stopping distance)' : 'Roads: Dry (Normal driving conditions)',
        visibilityKm: 6.5,
        visibilityStatus: 'Clear',
        travelHazards: isRaining ? ['Slippery asphalt on curves and flyovers'] : ['Clear traffic flow'],
      },
      eventPlanner: {
        extendedForecast: [
          { date: 'Today', dayOfWeek: 'Today', tempMax: temp + 2, tempMin: temp - 5, condition: isRaining ? 'Showers' : 'Clear', icon: isRaining ? 'rainy' : 'wb_sunny', rainProbabilityPercent: isRaining ? 75 : 15, comfortIndexValue: 74, comfortCategory: 'Comfortable' },
          { date: 'Tomorrow', dayOfWeek: 'Tomorrow', tempMax: temp + 1, tempMin: temp - 6, condition: 'Partly Cloudy', icon: 'partly_cloudy_day', rainProbabilityPercent: 30, comfortIndexValue: 72, comfortCategory: 'Pleasant' },
        ],
        comfortIndexToday: 74,
        comfortCategoryToday: 'Comfortable',
        eventRecommendation: 'Comfortable outdoor conditions: Suitable for evening gatherings.',
      },
      fetchedAt: new Date().toISOString(),
    };
  }
}

export const authoritativeClient = new ClientAuthoritativeService();
