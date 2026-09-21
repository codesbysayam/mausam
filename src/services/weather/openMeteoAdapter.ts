// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Open-Meteo Meteorological Adapter (Authoritative Public Fallback)
// Never claims Open-Meteo is IMD; accurately flags provider & live status
// ====================================================================

import {
  CurrentWeatherContext,
  DailyForecastContext,
  HourlyForecastContext,
  ForecastContext,
  DataSourceContext,
} from '../../types/askMausam';

// WMO Weather interpretation table
export function decodeWmoCode(code: number, isDay = true): string {
  switch (code) {
    case 0:
      return isDay ? 'Clear Sky' : 'Clear Night';
    case 1:
      return isDay ? 'Mainly Clear' : 'Mainly Clear Night';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Fog / Depositing Rime Fog';
    case 51:
    case 53:
    case 55:
      return 'Drizzle';
    case 56:
    case 57:
      return 'Freezing Drizzle';
    case 61:
      return 'Slight Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rain';
    case 66:
    case 67:
      return 'Freezing Rain';
    case 71:
    case 73:
    case 75:
      return 'Snowfall';
    case 77:
      return 'Snow Grains';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 85:
    case 86:
      return 'Snow Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with Hail';
    default:
      return 'Fair Weather';
  }
}

export function degreesToCompass(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5);
  return directions[index % 16];
}

export interface OpenMeteoBundle {
  current?: CurrentWeatherContext;
  forecast?: ForecastContext;
  source: DataSourceContext;
  soilMoisture?: number;
  soilTemperature?: number;
  evapotranspiration?: number;
}

export async function fetchOpenMeteoBundle(
  latitude: number,
  longitude: number
): Promise<OpenMeteoBundle> {
  const retrievedAt = new Date().toISOString();
  try {
    const weatherQuery = [
      `latitude=${latitude}`,
      `longitude=${longitude}`,
      'current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,dew_point_2m,visibility',
      'hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,soil_moisture_0_to_1cm,soil_temperature_0cm,et0_fao_evapotranspiration',
      'daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      'timezone=Asia%2FKolkata',
      'forecast_days=7',
    ].join('&');

    const url = `https://api.open-meteo.com/v1/forecast?${weatherQuery}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }

    const data = await res.json();
    const cur = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    const condition = decodeWmoCode(cur.weather_code, Boolean(cur.is_day));
    const windDir = degreesToCompass(cur.wind_direction_10m);

    const currentContext: CurrentWeatherContext = {
      temperatureC: Math.round((cur.temperature_2m ?? 0) * 10) / 10,
      feelsLikeC: Math.round((cur.apparent_temperature ?? cur.temperature_2m ?? 0) * 10) / 10,
      humidity: Math.round(cur.relative_humidity_2m ?? 0),
      windSpeedKmh: Math.round((cur.wind_speed_10m ?? 0) * 10) / 10,
      windDirection: `${windDir} (${cur.wind_direction_10m ?? 0}°)`,
      windGustsKmh: cur.wind_gusts_10m ? Math.round(cur.wind_gusts_10m * 10) / 10 : undefined,
      precipitationMm: Math.round((cur.precipitation ?? 0) * 10) / 10,
      precipitationProbability: hourly?.precipitation_probability?.[0] ?? 0,
      weatherCode: cur.weather_code,
      condition,
      isDay: Boolean(cur.is_day),
      pressureHpa: Math.round(cur.pressure_msl ?? cur.surface_pressure ?? 1013),
      dewPointC: cur.dew_point_2m ? Math.round(cur.dew_point_2m * 10) / 10 : undefined,
      visibilityKm: cur.visibility ? Math.round(cur.visibility / 100) / 10 : undefined,
      observedAt: cur.time ? `${cur.time}+05:30` : retrievedAt,
    };

    // Build 7-day forecast
    const dailyItems: DailyForecastContext[] = [];
    if (daily && Array.isArray(daily.time)) {
      daily.time.forEach((dateStr: string, idx: number) => {
        const d = new Date(dateStr);
        const dayName = d.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' });
        dailyItems.push({
          date: dateStr,
          dayName: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : dayName,
          maxTempC: Math.round(daily.temperature_2m_max?.[idx] ?? 0),
          minTempC: Math.round(daily.temperature_2m_min?.[idx] ?? 0),
          precipitationMm: Math.round((daily.precipitation_sum?.[idx] ?? 0) * 10) / 10,
          precipitationProbability: Math.round(daily.precipitation_probability_max?.[idx] ?? 0),
          condition: decodeWmoCode(daily.weather_code?.[idx] ?? 0, true),
          weatherCode: daily.weather_code?.[idx] ?? 0,
          windSpeedKmh: Math.round(daily.wind_speed_10m_max?.[idx] ?? 0),
          uvIndexMax: daily.uv_index_max?.[idx] ? Math.round(daily.uv_index_max[idx] * 10) / 10 : undefined,
        });
      });
    }

    // Build next 24 hours
    const hourlyItems: HourlyForecastContext[] = [];
    if (hourly && Array.isArray(hourly.time)) {
      const maxHours = Math.min(24, hourly.time.length);
      for (let i = 0; i < maxHours; i++) {
        const timeStr = hourly.time[i];
        const dateObj = new Date(timeStr);
        const hourLabel = dateObj.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        });
        hourlyItems.push({
          time: hourLabel,
          temperatureC: Math.round((hourly.temperature_2m?.[i] ?? 0) * 10) / 10,
          precipitationMm: Math.round((hourly.precipitation?.[i] ?? 0) * 10) / 10,
          precipitationProbability: Math.round(hourly.precipitation_probability?.[i] ?? 0),
          condition: decodeWmoCode(hourly.weather_code?.[i] ?? 0, true),
          weatherCode: hourly.weather_code?.[i],
          humidity: Math.round(hourly.relative_humidity_2m?.[i] ?? 0),
        });
      }
    }

    const forecastContext: ForecastContext = {
      daily: dailyItems,
      hourly: hourlyItems,
      synopsis: dailyItems.length > 0
        ? `7-Day Outlook: Peak temperatures around ${dailyItems[0]?.maxTempC}°C with lows near ${dailyItems[0]?.minTempC}°C. Rain probability is ${dailyItems[0]?.precipitationProbability}%.`
        : undefined,
    };

    return {
      current: currentContext,
      forecast: forecastContext,
      source: {
        provider: 'Open-Meteo',
        status: 'LIVE',
        retrievedAt,
        observedAt: currentContext.observedAt,
        isOfficialIMD: false,
        details: 'High-resolution numerical weather prediction (WMO ECMWF/ICON normalized fallback)',
      },
      soilMoisture: hourly?.soil_moisture_0_to_1cm?.[0] ?? undefined,
      soilTemperature: hourly?.soil_temperature_0cm?.[0] ?? undefined,
      evapotranspiration: hourly?.et0_fao_evapotranspiration?.[0] ?? undefined,
    };
  } catch (err: any) {
    return {
      source: {
        provider: 'Open-Meteo',
        status: 'UNAVAILABLE',
        retrievedAt,
        details: err?.message || 'Network unreachable',
      },
    };
  }
}
