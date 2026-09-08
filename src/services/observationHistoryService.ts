import { CurrentWeather, LocationRecord } from '../types';

export interface RecordedObservation {
  locationId: string;
  stationName: string;
  timestamp: number;
  timeString: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection?: string;
  pressure: number;
  precipitation: number;
  rainfallLast1h?: number;
  rainfallLast24h?: number;
  condition: string;
  aqi?: number;
  source: string;
  status: 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
}

export interface AtmosphericDelta {
  parameter: 'Temperature' | 'Humidity' | 'Wind' | 'Pressure' | 'Rainfall';
  currentVal: string;
  previousVal: string;
  unit: string;
  diff: number | null;
  direction: 'up' | 'down' | 'stable' | 'unavailable';
  displayDiff: string;
  trendLabel?: string;
  severity?: 'normal' | 'caution' | 'warning';
}

export interface AtmosphericChangeReport {
  hasValidComparison: boolean;
  locationId: string;
  locationName: string;
  currentObs: RecordedObservation | null;
  previousObs: RecordedObservation | null;
  timeDifferenceMinutes?: number;
  deltas: {
    temperature: AtmosphericDelta;
    humidity: AtmosphericDelta;
    wind: AtmosphericDelta;
    pressure: AtmosphericDelta;
    rainfall: AtmosphericDelta;
  };
  overallStatus: 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
  lastUpdatedText: string;
  sourceText: string;
}

const STORAGE_PREFIX = 'mausam_obs_history_v2_';

class ObservationHistoryService {
  /**
   * Retrieves previous observations from persistent storage for a specific location.
   * Isolated per locationId to ensure stations are NEVER mixed.
   */
  private getStoredHistory(locationId: string): RecordedObservation[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${locationId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Storage unavailable or parsing error
    }
    return [];
  }

  /**
   * Saves observations history for a specific location, keeping up to 10 historical records.
   */
  private saveStoredHistory(locationId: string, history: RecordedObservation[]): void {
    try {
      const trimmed = history.slice(0, 10);
      localStorage.setItem(`${STORAGE_PREFIX}${locationId}`, JSON.stringify(trimmed));
    } catch {
      // Ignore quota exceeded in restricted environments
    }
  }

  /**
   * Computes delta and generates a rigorous atmospheric change report
   * based on actual consecutive telemetry observations.
   */
  getObservationReport(
    location: LocationRecord,
    current?: CurrentWeather | null
  ): AtmosphericChangeReport {
    const locId = location.id;
    const locName = location.displayName || `${location.city}, ${location.state}`;

    // Fallback if current telemetry is unavailable
    if (!current || current.temp === undefined || current.temp === null) {
      return {
        hasValidComparison: false,
        locationId: locId,
        locationName: locName,
        currentObs: null,
        previousObs: null,
        deltas: {
          temperature: { parameter: 'Temperature', currentVal: 'Unavailable', previousVal: 'Unavailable', unit: '°C', diff: null, direction: 'unavailable', displayDiff: 'Comparison unavailable' },
          humidity: { parameter: 'Humidity', currentVal: 'Unavailable', previousVal: 'Unavailable', unit: '%', diff: null, direction: 'unavailable', displayDiff: 'Comparison unavailable' },
          wind: { parameter: 'Wind', currentVal: 'Unavailable', previousVal: 'Unavailable', unit: 'km/h', diff: null, direction: 'unavailable', displayDiff: 'Comparison unavailable' },
          pressure: { parameter: 'Pressure', currentVal: 'Unavailable', previousVal: 'Unavailable', unit: 'hPa', diff: null, direction: 'unavailable', displayDiff: 'Comparison unavailable' },
          rainfall: { parameter: 'Rainfall', currentVal: 'Unavailable', previousVal: 'Unavailable', unit: 'mm', diff: null, direction: 'unavailable', displayDiff: 'Rainfall comparison unavailable' },
        },
        overallStatus: 'UNAVAILABLE',
        lastUpdatedText: 'Awaiting Telemetry',
        sourceText: location.imdStation ? `IMD Station (${location.imdStation})` : 'IMD / Surface Grid',
      };
    }

    const currentObs: RecordedObservation = {
      locationId: locId,
      stationName: location.weatherStation || location.city,
      timestamp: current.lastUpdatedTimestamp || Date.now(),
      timeString: current.lastUpdated || 'Current Cycle',
      temperature: Math.round(current.temp * 10) / 10,
      humidity: Math.round(current.humidity),
      windSpeed: Math.round(current.windSpeed * 10) / 10,
      windDirection: current.windDirection,
      pressure: Math.round(current.pressure * 10) / 10,
      precipitation: Math.round((current.precipitation ?? current.precipitationMm ?? 0) * 10) / 10,
      rainfallLast1h: current.rainfallLast1h !== undefined ? Math.round(current.rainfallLast1h * 10) / 10 : undefined,
      rainfallLast24h: current.rainfallLast24h !== undefined ? Math.round(current.rainfallLast24h * 10) / 10 : undefined,
      condition: current.condition || 'Clear',
      aqi: current.aqiIndex ?? current.aqiPm25,
      source: current.observationSource || (location.imdStation ? `IMD AWS (${location.imdStation})` : 'IMD-WRF Surface Telemetry'),
      status: current.observationStatus || (current.isLive ? 'LIVE' : 'RECENT'),
    };

    // Retrieve historical observations for this specific station
    const history = this.getStoredHistory(locId);

    let previousObs: RecordedObservation | null = null;

    // Check if the most recent stored record is from a previous cycle (different timestamp or different telemetry)
    if (history.length > 0) {
      const latestStored = history[0];
      if (latestStored.timestamp !== currentObs.timestamp) {
        previousObs = latestStored;
      } else if (history.length > 1) {
        previousObs = history[1];
      }
    }

    // If no prior stored observation exists in cache, check if meteorological service provided previous hour telemetry
    if (!previousObs && current.previousHourTelemetry && current.previousHourTelemetry.temp !== undefined) {
      const prevHour = current.previousHourTelemetry;
      previousObs = {
        locationId: locId,
        stationName: location.weatherStation || location.city,
        timestamp: prevHour.timestamp || (currentObs.timestamp - 3600000),
        timeString: prevHour.timeString || 'Prior Hour',
        temperature: Math.round(prevHour.temp * 10) / 10,
        humidity: Math.round(prevHour.humidity ?? currentObs.humidity),
        windSpeed: Math.round((prevHour.windSpeed ?? currentObs.windSpeed) * 10) / 10,
        pressure: Math.round((prevHour.pressure ?? currentObs.pressure) * 10) / 10,
        precipitation: Math.round((prevHour.precipitation ?? 0) * 10) / 10,
        condition: 'Prior Cycle',
        source: currentObs.source,
        status: 'RECENT',
      };
    }

    // Save newest observation into history if it's genuinely new
    if (history.length === 0 || history[0].timestamp !== currentObs.timestamp) {
      this.saveStoredHistory(locId, [currentObs, ...history.filter(h => h.timestamp !== currentObs.timestamp)]);
    }

    // If still no previous observation is found, comparison is not yet available
    if (!previousObs) {
      return {
        hasValidComparison: false,
        locationId: locId,
        locationName: locName,
        currentObs,
        previousObs: null,
        deltas: {
          temperature: {
            parameter: 'Temperature',
            currentVal: `${currentObs.temperature.toFixed(1)}°C`,
            previousVal: 'Unavailable',
            unit: '°C',
            diff: null,
            direction: 'unavailable',
            displayDiff: 'Comparison unavailable',
          },
          humidity: {
            parameter: 'Humidity',
            currentVal: `${currentObs.humidity}%`,
            previousVal: 'Unavailable',
            unit: '%',
            diff: null,
            direction: 'unavailable',
            displayDiff: 'Comparison unavailable',
          },
          wind: {
            parameter: 'Wind',
            currentVal: `${currentObs.windSpeed.toFixed(1)} km/h`,
            previousVal: 'Unavailable',
            unit: 'km/h',
            diff: null,
            direction: 'unavailable',
            displayDiff: 'Comparison unavailable',
          },
          pressure: {
            parameter: 'Pressure',
            currentVal: `${Math.round(currentObs.pressure)} hPa`,
            previousVal: 'Unavailable',
            unit: 'hPa',
            diff: null,
            direction: 'unavailable',
            displayDiff: 'Comparison unavailable',
            trendLabel: current.pressureTendency || 'Stable',
          },
          rainfall: {
            parameter: 'Rainfall',
            currentVal: `${currentObs.precipitation.toFixed(1)} mm`,
            previousVal: 'Unavailable',
            unit: 'mm',
            diff: null,
            direction: 'unavailable',
            displayDiff: 'Rainfall comparison unavailable',
          },
        },
        overallStatus: currentObs.status,
        lastUpdatedText: currentObs.timeString,
        sourceText: currentObs.source,
      };
    }

    // Calculate real deltas
    const tempDiff = Math.round((currentObs.temperature - previousObs.temperature) * 10) / 10;
    const humidityDiff = Math.round(currentObs.humidity - previousObs.humidity);
    const windDiff = Math.round((currentObs.windSpeed - previousObs.windSpeed) * 10) / 10;
    const pressureDiff = Math.round((currentObs.pressure - previousObs.pressure) * 10) / 10;

    // Pressure Trend Analysis
    let pressureTrend: 'Rising' | 'Falling' | 'Stable' = 'Stable';
    if (pressureDiff > 0.5) pressureTrend = 'Rising';
    else if (pressureDiff < -0.5) pressureTrend = 'Falling';
    else pressureTrend = 'Stable';

    // Rainfall Delta Analysis
    const currRain = currentObs.precipitation;
    const prevRain = previousObs.precipitation;
    let rainDirection: 'up' | 'down' | 'stable' = 'stable';
    let rainDisplay = 'Stable';

    if (currRain === 0 && prevRain === 0) {
      rainDisplay = 'Stable (0 mm)';
      rainDirection = 'stable';
    } else if (currRain > 0 && prevRain === 0) {
      rainDisplay = `Rainfall Started (+${currRain.toFixed(1)} mm)`;
      rainDirection = 'up';
    } else if (currRain === 0 && prevRain > 0) {
      rainDisplay = 'Rainfall Ceased';
      rainDirection = 'down';
    } else {
      const rainDiff = Math.round((currRain - prevRain) * 10) / 10;
      if (Math.abs(rainDiff) < 0.1) {
        rainDisplay = 'Stable';
        rainDirection = 'stable';
      } else if (rainDiff > 0) {
        rainDisplay = `↑ +${rainDiff.toFixed(1)} mm`;
        rainDirection = 'up';
      } else {
        rainDisplay = `↓ ${rainDiff.toFixed(1)} mm`;
        rainDirection = 'down';
      }
    }

    const timeDiffMs = Math.abs(currentObs.timestamp - previousObs.timestamp);
    const timeDiffMins = Math.round(timeDiffMs / 60000);

    return {
      hasValidComparison: true,
      locationId: locId,
      locationName: locName,
      currentObs,
      previousObs,
      timeDifferenceMinutes: timeDiffMins,
      deltas: {
        temperature: {
          parameter: 'Temperature',
          currentVal: `${currentObs.temperature.toFixed(1)}°C`,
          previousVal: `${previousObs.temperature.toFixed(1)}°C`,
          unit: '°C',
          diff: tempDiff,
          direction: Math.abs(tempDiff) < 0.1 ? 'stable' : tempDiff > 0 ? 'up' : 'down',
          displayDiff: Math.abs(tempDiff) < 0.1 ? 'Stable' : `${tempDiff > 0 ? '↑ +' : '↓ '}${tempDiff.toFixed(1)}°C`,
          severity: Math.abs(tempDiff) >= 3 ? 'warning' : Math.abs(tempDiff) >= 1.5 ? 'caution' : 'normal',
        },
        humidity: {
          parameter: 'Humidity',
          currentVal: `${currentObs.humidity}%`,
          previousVal: `${previousObs.humidity}%`,
          unit: '%',
          diff: humidityDiff,
          direction: Math.abs(humidityDiff) < 1 ? 'stable' : humidityDiff > 0 ? 'up' : 'down',
          displayDiff: Math.abs(humidityDiff) < 1 ? 'Stable' : `${humidityDiff > 0 ? '↑ +' : '↓ '}${humidityDiff}%`,
          severity: Math.abs(humidityDiff) >= 15 ? 'caution' : 'normal',
        },
        wind: {
          parameter: 'Wind',
          currentVal: `${currentObs.windSpeed.toFixed(1)} km/h`,
          previousVal: `${previousObs.windSpeed.toFixed(1)} km/h`,
          unit: 'km/h',
          diff: windDiff,
          direction: Math.abs(windDiff) < 0.5 ? 'stable' : windDiff > 0 ? 'up' : 'down',
          displayDiff: Math.abs(windDiff) < 0.5 ? 'Stable' : `${windDiff > 0 ? '↑ +' : '↓ '}${windDiff.toFixed(1)} km/h`,
          severity: Math.abs(windDiff) >= 10 ? 'warning' : 'normal',
        },
        pressure: {
          parameter: 'Pressure',
          currentVal: `${Math.round(currentObs.pressure)} hPa`,
          previousVal: `${Math.round(previousObs.pressure)} hPa`,
          unit: 'hPa',
          diff: pressureDiff,
          direction: Math.abs(pressureDiff) < 0.3 ? 'stable' : pressureDiff > 0 ? 'up' : 'down',
          displayDiff: Math.abs(pressureDiff) < 0.3 ? 'Stable' : `${pressureDiff > 0 ? '↑ +' : '↓ '}${pressureDiff.toFixed(1)} hPa`,
          trendLabel: pressureTrend,
          severity: Math.abs(pressureDiff) >= 3 ? 'warning' : 'normal',
        },
        rainfall: {
          parameter: 'Rainfall',
          currentVal: `${currentObs.precipitation.toFixed(1)} mm`,
          previousVal: `${previousObs.precipitation.toFixed(1)} mm`,
          unit: 'mm',
          diff: Math.round((currRain - prevRain) * 10) / 10,
          direction: rainDirection,
          displayDiff: rainDisplay,
          severity: currRain > 15 ? 'warning' : currRain > 5 ? 'caution' : 'normal',
        },
      },
      overallStatus: currentObs.status,
      lastUpdatedText: currentObs.timeString,
      sourceText: currentObs.source,
    };
  }
}

export const observationHistoryService = new ObservationHistoryService();
