/**
 * IMD Data Normalizer - Translates raw IMD API structures into standard MAUSAM formats
 */

import { getIMDWeatherCode } from './imdWeatherCodes';
import { getIMDWarningColor, getIMDHazardCode, getIMDRainfallCategory, degreesToWindDirection } from './imdWarningCodes';

export interface NormalizedCurrentWeather {
  stationId: string;
  stationName: string;
  observationDate: string;
  observationTimeUTC: string;
  observationTimeIST: string;
  pressureHpa: number | null;
  windDirectionDegrees: number | null;
  windDirectionLabel: string;
  windSpeedKmph: number | null;
  temperatureC: number | null;
  weatherCode: number | null;
  weatherLabel: string;
  weatherCategory: string;
  cloudCoverage: string | number | null;
  humidityPercent: number | null;
  rainfall24hMm: number | null;
}

export interface NormalizedCityForecastDay {
  date: string;
  dayLabel: string;
  minTempC: number | null;
  maxTempC: number | null;
  weatherDescription: string;
  weatherCode?: number;
  rainfallMm?: number | null;
  humidityPercent?: number | null;
}

export interface NormalizedCityForecast {
  cityId: string;
  cityName: string;
  state?: string;
  forecastDate?: string;
  days: NormalizedCityForecastDay[];
  todayObservedMaxC?: number | null;
  todayObservedMinC?: number | null;
  past24hRainfallMm?: number | null;
  relativeHumidity?: number | null;
  sunrise?: string;
  sunset?: string;
}

export interface NormalizedDistrictWarning {
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

export interface NormalizedAWSStation {
  stationId: string;
  callSign: string;
  district: string;
  state: string;
  station: string;
  date: string;
  time: string;
  temperatureC: number | null;
  dewPointC: number | null;
  humidityPercent: number | null;
  windDirectionDegrees: number | null;
  windDirectionLabel: string;
  windSpeedKmph: number | null;
  pressureHpa: number | null;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  latitude: number | null;
  longitude: number | null;
  weatherCode: number | null;
  weatherLabel: string;
  nebulosity: string | number | null;
  feelsLikeC: number | null;
}

export interface NormalizedRainfallRecord {
  id: string;
  name: string;
  state?: string;
  actualMm: number | null;
  normalMm: number | null;
  departurePercent: number | null;
  categoryCode: string;
  categoryLabel: string;
  categoryColor: string;
  date?: string;
}

export interface NormalizedSunMoon {
  latitude: number;
  longitude: number;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  timezone: string;
}

export class IMDNormalizer {
  static normalizeCurrentWeather(raw: any): NormalizedCurrentWeather | null {
    if (!raw) return null;
    const item = Array.isArray(raw) ? raw[0] : raw;
    if (!item) return null;

    const stationId = String(item['Station Id'] || item['Station_Id'] || item['station_id'] || item['id'] || item['ID'] || '');
    const stationName = String(item['Station'] || item['Station_Name'] || item['station_name'] || item['name'] || 'IMD Observatory');
    const obsDate = String(item['Date of Observation'] || item['Date_of_Observation'] || item['date'] || '');
    const obsTime = String(item['Time of Observation'] || item['Time_of_Observation'] || item['time'] || '');

    const tempRaw = item['Temperature'] ?? item['TEMP'] ?? item['CURR_TEMP'] ?? item['temp'];
    const temp = tempRaw !== undefined && tempRaw !== null && tempRaw !== '' ? parseFloat(tempRaw) : null;

    const humRaw = item['Humidity'] ?? item['RH'] ?? item['humidity'];
    const humidity = humRaw !== undefined && humRaw !== null && humRaw !== '' ? parseFloat(humRaw) : null;

    const pressRaw = item['M.S.L.P'] ?? item['MSLP'] ?? item['pressure'];
    const pressure = pressRaw !== undefined && pressRaw !== null && pressRaw !== '' ? parseFloat(pressRaw) : null;

    const windDirRaw = item['Wind Direction'] ?? item['WIND_DIRECTION'] ?? item['wind_direction'];
    const windDir = windDirRaw !== undefined && windDirRaw !== null && windDirRaw !== '' ? parseFloat(windDirRaw) : 0;
    const windInfo = degreesToWindDirection(windDir);

    const windSpdRaw = item['Wind Speed'] ?? item['WIND_SPEED'] ?? item['wind_speed'];
    const windSpeed = windSpdRaw !== undefined && windSpdRaw !== null && windSpdRaw !== '' ? parseFloat(windSpdRaw) : null;

    const rainRaw = item['Last 24 hrs Rainfall'] ?? item['RAINFALL_24_HR'] ?? item['rainfall_24h'] ?? item['RAIN'];
    const rainfall = rainRaw !== undefined && rainRaw !== null && rainRaw !== '' ? parseFloat(rainRaw) : null;

    const wxCodeRaw = item['Weather Code'] ?? item['WEATHER_CODE'] ?? item['weather_code'];
    const weatherCode = wxCodeRaw !== undefined && wxCodeRaw !== null && wxCodeRaw !== '' ? parseInt(wxCodeRaw, 10) : null;
    const weatherInfo = getIMDWeatherCode(weatherCode);

    const cloudCoverage = item['Nebulosity'] ?? item['NEBULOSITY'] ?? item['cloud_cover'] ?? null;

    return {
      stationId,
      stationName,
      observationDate: obsDate,
      observationTimeUTC: obsTime,
      observationTimeIST: obsTime ? `${obsTime} IST` : 'Latest IST',
      pressureHpa: pressure,
      windDirectionDegrees: windInfo.degrees,
      windDirectionLabel: windInfo.label,
      windSpeedKmph: windSpeed,
      temperatureC: temp,
      weatherCode: weatherInfo.code,
      weatherLabel: weatherInfo.description || weatherInfo.label,
      weatherCategory: weatherInfo.category,
      cloudCoverage,
      humidityPercent: humidity,
      rainfall24hMm: rainfall,
    };
  }

  static normalizeCityForecast(raw: any, cityId: string = ''): NormalizedCityForecast | null {
    if (!raw) return null;
    const root = Array.isArray(raw) ? raw[0] : raw;
    if (!root) return null;

    const cityName = root.city || root.City || root.Station || root.station || 'Selected City';
    const state = root.state || root.State || '';
    const daysRaw = Array.isArray(root.forecast) ? root.forecast : (Array.isArray(raw) ? raw : [root]);

    const days: NormalizedCityForecastDay[] = daysRaw.map((dayItem: any, index: number) => {
      const date = dayItem.date || dayItem.Date || dayItem.forecast_date || `Day ${index + 1}`;
      const minTemp = dayItem.min_temp !== undefined ? parseFloat(dayItem.min_temp) : (dayItem.Min_Temp !== undefined ? parseFloat(dayItem.Min_Temp) : null);
      const maxTemp = dayItem.max_temp !== undefined ? parseFloat(dayItem.max_temp) : (dayItem.Max_Temp !== undefined ? parseFloat(dayItem.Max_Temp) : null);
      const weatherDesc = dayItem.weather_desc || dayItem.Weather_Desc || dayItem.description || dayItem.forecast_desc || 'Generally cloudy sky with possibility of rain';

      return {
        date,
        dayLabel: index === 0 ? 'Today' : (index === 1 ? 'Tomorrow' : `Day ${index + 1}`),
        minTempC: minTemp,
        maxTempC: maxTemp,
        weatherDescription: weatherDesc,
      };
    });

    return {
      cityId: String(root.id || cityId),
      cityName,
      state,
      days,
      todayObservedMaxC: root.today_max ? parseFloat(root.today_max) : null,
      todayObservedMinC: root.today_min ? parseFloat(root.today_min) : null,
      past24hRainfallMm: root.past_24h_rainfall ? parseFloat(root.past_24h_rainfall) : null,
      relativeHumidity: root.humidity ? parseFloat(root.humidity) : null,
      sunrise: root.sunrise,
      sunset: root.sunset,
    };
  }

  static normalizeDistrictWarnings(raw: any): NormalizedDistrictWarning[] {
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : [raw];

    return list.map((item: any) => {
      const districtId = String(item.district_id || item.District_Id || item.id || '');
      const districtName = String(item.district_name || item.District_Name || item.district || item.District || 'District');
      const stateName = String(item.state_name || item.State_Name || item.state || item.State || 'India');
      const warningDate = String(item.date || item.Date || item.warning_date || new Date().toISOString().split('T')[0]);

      const colorCode = item.color_code || item.Color_Code || item.warning_color || item.color || 1;
      const colorInfo = getIMDWarningColor(colorCode);

      const hazardCode = item.hazard_code || item.Hazard_Code || item.warning_code || 1;
      const hazardInfo = getIMDHazardCode(hazardCode);

      const desc = item.description || item.Description || item.warning_text || `${hazardInfo.label} alert for ${districtName}`;

      return {
        districtId,
        districtName,
        stateName,
        warningDate,
        colorCode: colorInfo.code,
        colorName: colorInfo.name,
        colorHex: colorInfo.colorHex,
        hazardCode: hazardInfo.code,
        hazardLabel: hazardInfo.label,
        description: desc,
        actionText: colorInfo.actionText,
      };
    });
  }

  static normalizeAWSData(raw: any): NormalizedAWSStation[] {
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : [raw];

    return list.map((item: any) => {
      const stationId = String(item.ID || item.id || item.station_id || '');
      const callSign = String(item.CALL_SIGN || item.call_sign || '');
      const district = String(item.DISTRICT || item.district || '');
      const state = String(item.STATE || item.state || '');
      const station = String(item.STATION || item.station || 'AWS Observatory');
      const date = String(item.DATE || item.date || '');
      const time = String(item.TIME || item.time || '');

      const temp = item.CURR_TEMP !== undefined && item.CURR_TEMP !== null ? parseFloat(item.CURR_TEMP) : null;
      const dewPoint = item.DEW_POINT_TEMP !== undefined && item.DEW_POINT_TEMP !== null ? parseFloat(item.DEW_POINT_TEMP) : null;
      const humidity = item.RH !== undefined && item.RH !== null ? parseFloat(item.RH) : null;

      const windDirDeg = item.WIND_DIRECTION !== undefined && item.WIND_DIRECTION !== null ? parseFloat(item.WIND_DIRECTION) : 0;
      const windInfo = degreesToWindDirection(windDirDeg);

      const windSpeed = item.WIND_SPEED !== undefined && item.WIND_SPEED !== null ? parseFloat(item.WIND_SPEED) : null;
      const pressure = item.MSLP !== undefined && item.MSLP !== null ? parseFloat(item.MSLP) : null;
      const minTemp = item.MIN_TEMP !== undefined && item.MIN_TEMP !== null ? parseFloat(item.MIN_TEMP) : null;
      const maxTemp = item.MAX_TEMP !== undefined && item.MAX_TEMP !== null ? parseFloat(item.MAX_TEMP) : null;

      const lat = item.Latitude !== undefined && item.Latitude !== null ? parseFloat(item.Latitude) : (item.lat ? parseFloat(item.lat) : null);
      const lon = item.Longitude !== undefined && item.Longitude !== null ? parseFloat(item.Longitude) : (item.lon ? parseFloat(item.lon) : null);

      const wxCode = item.WEATHER_CODE !== undefined ? parseInt(item.WEATHER_CODE, 10) : 0;
      const wxInfo = getIMDWeatherCode(wxCode);

      const nebulosity = item.NEBULOSITY ?? null;
      const feelsLike = item['Feel Like'] !== undefined ? parseFloat(item['Feel Like']) : null;

      return {
        stationId,
        callSign,
        district,
        state,
        station,
        date,
        time,
        temperatureC: temp,
        dewPointC: dewPoint,
        humidityPercent: humidity,
        windDirectionDegrees: windInfo.degrees,
        windDirectionLabel: windInfo.label,
        windSpeedKmph: windSpeed,
        pressureHpa: pressure,
        minTemperatureC: minTemp,
        maxTemperatureC: maxTemp,
        latitude: lat,
        longitude: lon,
        weatherCode: wxInfo.code,
        weatherLabel: wxInfo.description || wxInfo.label,
        nebulosity,
        feelsLikeC: feelsLike,
      };
    });
  }

  static normalizeRainfall(raw: any): NormalizedRainfallRecord[] {
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : [raw];

    return list.map((item: any) => {
      const id = String(item.id || item.district_id || item.state_id || item.ID || '');
      const name = String(item.district_name || item.state_name || item.name || item.DISTRICT || item.STATE || 'Region');
      const state = item.state || item.STATE;
      const actual = item.actual !== undefined ? parseFloat(item.actual) : (item.ACTUAL !== undefined ? parseFloat(item.ACTUAL) : null);
      const normal = item.normal !== undefined ? parseFloat(item.normal) : (item.NORMAL !== undefined ? parseFloat(item.NORMAL) : null);
      const departure = item.departure !== undefined ? parseFloat(item.departure) : (item.DEPARTURE !== undefined ? parseFloat(item.DEPARTURE) : null);

      const catCode = String(item.category || item.CATEGORY || item.category_code || 'ND');
      const catInfo = getIMDRainfallCategory(catCode);

      return {
        id,
        name,
        state,
        actualMm: actual,
        normalMm: normal,
        departurePercent: departure,
        categoryCode: catInfo.code,
        categoryLabel: catInfo.label,
        categoryColor: catInfo.color,
        date: item.date || item.DATE,
      };
    });
  }

  static normalizeSunMoon(raw: any, lat: number, lon: number): NormalizedSunMoon | null {
    if (!raw) return null;
    const item = Array.isArray(raw) ? raw[0] : raw;
    if (!item) return null;

    return {
      latitude: lat,
      longitude: lon,
      sunrise: item.sunrise || item.Sunrise || '05:45 IST',
      sunset: item.sunset || item.Sunset || '18:25 IST',
      moonrise: item.moonrise || item.Moonrise || '19:30 IST',
      moonset: item.moonset || item.Moonset || '06:15 IST',
      timezone: 'IST (UTC+5:30)',
    };
  }
}
