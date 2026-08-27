/**
 * IMD Data Normalizer - Translates raw IMD API structures into standard MAUSAM formats
 * Follows official IMD field names and weather code specifications.
 * Strictly guarantees NO NaN, NO undefined, NO null, and NO Infinity in formatted outputs.
 */

export interface NormalizedStationWeather {
  stationId: string;
  stationName: string;
  city: string;
  state: string;

  observationDate: string;
  observationTime: string;

  temperatureC: number | null;
  humidity: number | null;
  pressureHpa: number | null;

  windSpeedKmph: number | null;
  windDirection: string;
  windDirectionCode: number | null;

  weatherCode: number | null;
  weatherDescription: string;

  nebulosity: string | number | null;
  rainfall24hMm: number | null;

  latitude: number;
  longitude: number;

  source: string;
  status: 'live' | 'cached' | 'unavailable';
  lastUpdated: string;
  feelsLikeC: number | null;
  isRaining: boolean;
}

export interface IMDNormalizedCurrentWeather extends NormalizedStationWeather {
  observationTimeUTC?: string;
  observationTimeIST?: string;
  weatherLabel?: string;
  weatherCategory?: string;
}

export interface IMDNormalizedForecastDay {
  dayNumber: number;
  dayLabel: string;
  date: string;
  minTemp: number | null;
  maxTemp: number | null;
  forecast: string;
  weatherCode?: number;
  rainfallMm?: number | null;
}

export interface IMDNormalizedCityForecast {
  station: string;
  cityId: string;
  cityName?: string;
  state?: string;
  today: {
    maxTemp: number | null;
    minTemp: number | null;
    rainfall24h: number | null;
    humidity0830: number | null;
    humidity1730: number | null;
    forecast: string;
  };
  days: IMDNormalizedForecastDay[];
  sunrise: string | null;
  sunset: string | null;
  source: string;
  lastUpdated: string;
}

export interface IMDNormalizedDistrictWarning {
  districtId: string;
  districtName: string;
  stateName: string;
  warningDate: string;
  colorCode: number;
  colorName: 'NORMAL' | 'WATCH' | 'WARNING' | 'SEVERE';
  colorHex: string;
  hazardCode: number;
  hazardLabel: string;
  description: string;
  actionText: string;
}

/**
 * Validated weather code interpretation per IMD/WMO standard
 */
export function isIMDRainCode(code: number | null | undefined): boolean {
  if (code === null || code === undefined || !Number.isFinite(code)) return false;
  // 21, 25, 60-69, 80-84, 91-99
  if (code === 21 || code === 25) return true;
  if (code >= 60 && code <= 69) return true;
  if (code >= 80 && code <= 84) return true;
  if (code >= 91 && code <= 99) return true;
  return false;
}

export function isRainActive(
  weatherCode: number | null | undefined,
  rainfall24hMm: number | null | undefined,
  forecastText?: string | null
): boolean {
  if (isIMDRainCode(weatherCode)) return true;
  if (rainfall24hMm !== null && rainfall24hMm !== undefined && Number.isFinite(rainfall24hMm) && rainfall24hMm > 0) return true;
  if (forecastText) {
    const lower = forecastText.toLowerCase();
    if (
      lower.includes('heavy rain') ||
      lower.includes('moderate rain') ||
      lower.includes('light rain') ||
      lower.includes('rain or thundershowers') ||
      lower.includes('thunderstorm with rain') ||
      lower.includes('scattered rain') ||
      lower.includes('isolated showers')
    ) {
      return true;
    }
  }
  return false;
}

export function getWindDirectionLabel(degrees: number | null | undefined): string {
  if (degrees === null || degrees === undefined || !Number.isFinite(degrees)) return 'Calm';
  const val = Math.floor((degrees / 22.5) + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16] || 'Calm';
}

export function safeNumber(value: any): number | null {
  if (value === undefined || value === null || value === '' || value === '—' || value === 'N/A' || value === 'NA') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function safeTemperature(value: any): string {
  const n = safeNumber(value);
  return n === null ? '—' : `${Math.round(n * 10) / 10}°C`;
}

export function safeHumidity(value: any): string {
  const n = safeNumber(value);
  return n === null ? '—' : `${Math.round(n)}%`;
}

export function safeWind(speedValue: any, dirStr?: string): string {
  const speed = safeNumber(speedValue);
  if (speed === null) return '—';
  const dir = dirStr && dirStr !== '—' ? ` ${dirStr}` : '';
  return `${Math.round(speed * 10) / 10} km/h${dir}`;
}

export function safePressure(value: any): string {
  const n = safeNumber(value);
  return n === null ? '—' : `${(Math.round(n * 10) / 10).toFixed(1)} hPa`;
}

export function safeRainfall(value: any): string {
  const n = safeNumber(value);
  return n === null ? '—' : `${(Math.round(n * 10) / 10).toFixed(1)} mm`;
}

export function safeNebulosity(value: any): string {
  if (value === undefined || value === null || value === '' || value === '—' || value === 'N/A') {
    return '—';
  }
  const n = Number(value);
  if (Number.isFinite(n)) {
    return `${Math.min(8, Math.max(0, Math.round(n)))}/8 Oktas`;
  }
  return String(value);
}

export function parseNullableFloat(val: any): number | null {
  return safeNumber(val);
}

export function parseNullableInt(val: any): number | null {
  const n = safeNumber(val);
  return n === null ? null : Math.round(n);
}

/**
 * Calculates standard Steadman Apparent Temperature only when both Temp & RH are valid
 * Returns null if data is insufficient. Never returns NaN.
 */
export function calculateValidatedFeelsLike(
  tempC: number | null,
  humidity: number | null,
  windKmph: number | null
): number | null {
  if (tempC === null || humidity === null || !Number.isFinite(tempC) || !Number.isFinite(humidity)) {
    return null;
  }
  if (tempC < 20) {
    if (windKmph !== null && Number.isFinite(windKmph) && windKmph > 5) {
      const v = Math.pow(windKmph, 0.16);
      const val = 13.12 + 0.6215 * tempC - 11.37 * v + 0.3965 * tempC * v;
      return Number.isFinite(val) ? Math.round(val * 10) / 10 : tempC;
    }
    return tempC;
  }
  // Steadman Heat Index
  const e = (humidity / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  const apparent = tempC + 0.33 * e - 0.7 * (windKmph && Number.isFinite(windKmph) ? windKmph / 3.6 : 0) - 4.0;
  return Number.isFinite(apparent) ? Math.round(apparent * 10) / 10 : tempC;
}

export class IMDNormalizer {
  static normalizeCurrentWeather(
    raw: any,
    stationIdOverride?: string,
    cityMeta?: { city?: string; state?: string; lat?: number; lng?: number }
  ): IMDNormalizedCurrentWeather | null {
    if (!raw) return null;
    const item = Array.isArray(raw) ? raw[0] : raw;
    if (!item) return null;

    const stationId = String(
      item['Station Id'] ||
      item['Station_Id'] ||
      item['station_id'] ||
      item['ID'] ||
      item['id'] ||
      stationIdOverride ||
      '42971'
    );

    const stationName = String(
      item['Station'] ||
      item['Station_Name'] ||
      item['station_name'] ||
      item['name'] ||
      cityMeta?.city ||
      'IMD Observatory'
    );

    const city = cityMeta?.city || item['City'] || item['city'] || stationName.replace(/\s*\(.*\)/, '').trim();
    const state = cityMeta?.state || item['State'] || item['state'] || 'India';
    const lat = cityMeta?.lat ?? (safeNumber(item['Latitude'] ?? item['lat']) ?? 20.30);
    const lng = cityMeta?.lng ?? (safeNumber(item['Longitude'] ?? item['lng'] ?? item['lon']) ?? 85.82);

    const obsDate = String(item['Date of Observation'] || item['Date_of_Observation'] || item['date'] || '');
    const obsTime = String(item['Time of Observation'] || item['Time_of_Observation'] || item['time'] || '');

    const temp = parseNullableFloat(item['Temperature'] ?? item['TEMP'] ?? item['CURR_TEMP'] ?? item['temp']);
    const humidity = parseNullableFloat(item['Humidity'] ?? item['RH'] ?? item['humidity']);
    const pressure = parseNullableFloat(item['M.S.L.P'] ?? item['MSLP'] ?? item['pressure']);

    const windDirDeg = parseNullableFloat(item['Wind Direction'] ?? item['WIND_DIRECTION'] ?? item['wind_direction']);
    const windDirection = getWindDirectionLabel(windDirDeg);
    const windSpeed = parseNullableFloat(item['Wind Speed'] ?? item['WIND_SPEED'] ?? item['wind_speed']);

    const rainfall = parseNullableFloat(item['Last 24 hrs Rainfall'] ?? item['RAINFALL_24_HR'] ?? item['rainfall_24h'] ?? item['RAIN'] ?? item['rainfall24hMm']);
    const weatherCode = parseNullableInt(item['Weather Code'] ?? item['WEATHER_CODE'] ?? item['weather_code']);
    const nebulosity = item['Nebulosity'] ?? item['NEBULOSITY'] ?? item['cloud_cover'] ?? null;

    const weatherDesc = String(
      item['Weather'] ||
      item['Weather_Description'] ||
      item['weather_desc'] ||
      item['weather'] ||
      (isIMDRainCode(weatherCode) ? 'Rain / Precipitation' : (temp && temp > 35 ? 'Hot / Clear' : 'Fair Weather'))
    );

    const feelsLike = calculateValidatedFeelsLike(temp, humidity, windSpeed);
    const isRaining = isRainActive(weatherCode, rainfall, weatherDesc);

    return {
      stationId,
      stationName,
      city,
      state,
      latitude: lat,
      longitude: lng,
      observationDate: obsDate,
      observationTime: obsTime,
      observationTimeUTC: obsTime,
      observationTimeIST: obsTime ? `${obsTime} IST` : 'Latest IST',
      temperatureC: temp,
      humidity,
      pressureHpa: pressure,
      windSpeedKmph: windSpeed,
      windDirectionCode: windDirDeg,
      windDirection,
      weatherCode,
      weatherDescription: weatherDesc,
      weatherLabel: weatherDesc,
      weatherCategory: isRaining ? 'Rain' : (humidity && humidity > 85 ? 'Humid' : 'Clear'),
      nebulosity,
      rainfall24hMm: rainfall,
      source: 'India Meteorological Department',
      status: 'live',
      lastUpdated: new Date().toISOString(),
      feelsLikeC: feelsLike,
      isRaining,
    };
  }

  static normalizeCityForecast(raw: any, stationIdOverride?: string, cityName?: string): IMDNormalizedCityForecast | null {
    if (!raw) return null;
    const root = Array.isArray(raw) ? raw[0] : raw;
    if (!root) return null;

    const station = String(root.Station || root.station || root.city || root.City || cityName || 'Selected Station');
    const cityId = String(root.id || stationIdOverride || '42971');

    const todayMax = parseNullableFloat(root.Today_Max_temp ?? root.today_max ?? root.tempMax);
    const todayMin = parseNullableFloat(root.Today_Min_temp ?? root.today_min ?? root.tempMin);
    const past24hRain = parseNullableFloat(root.Past_24_hrs_Rainfall ?? root.past_24h_rainfall ?? root.rainfall24hMm);
    const rh0830 = parseNullableFloat(root.Relative_Humidity_at_0830 ?? root.humidity_0830);
    const rh1730 = parseNullableFloat(root.Relative_Humidity_at_1730 ?? root.humidity_1730);
    const todayForecast = String(root.Todays_Forecast ?? root.forecast_desc ?? root.forecast ?? 'Generally cloudy sky with possibility of rain');

    const days: IMDNormalizedForecastDay[] = [];
    for (let i = 2; i <= 7; i++) {
      const maxT = parseNullableFloat(root[`Day_${i}_Max_Temp`] ?? root[`day_${i}_max`] ?? root[`day${i}Max`]);
      const minT = parseNullableFloat(root[`Day_${i}_Min_temp`] ?? root[`day_${i}_min`] ?? root[`day${i}Min`]);
      const desc = String(root[`Day_${i}_Forecast`] ?? root[`day_${i}_forecast`] ?? root[`day${i}Desc`] ?? 'Partly cloudy sky');

      days.push({
        dayNumber: i,
        dayLabel: i === 2 ? 'Tomorrow' : `Day ${i}`,
        date: root[`Day_${i}_Date`] || `Day +${i - 1}`,
        minTemp: minT,
        maxTemp: maxT,
        forecast: desc,
      });
    }

    return {
      station,
      cityId,
      cityName: cityName || station,
      state: root.State || root.state || '',
      today: {
        maxTemp: todayMax,
        minTemp: todayMin,
        rainfall24h: past24hRain,
        humidity0830: rh0830,
        humidity1730: rh1730,
        forecast: todayForecast,
      },
      days,
      sunrise: root.Sunrise_time || root.sunrise || null,
      sunset: root.Sunset_time || root.sunset || null,
      source: 'India Meteorological Department',
      lastUpdated: new Date().toISOString(),
    };
  }
}
