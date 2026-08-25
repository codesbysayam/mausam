export type RegionType = "STATE" | "UNION_TERRITORY";

export interface IndiaRegion {
  id: string;
  code: string;
  name: string;
  type: RegionType;

  // Used only as a representative location
  // for weather/environmental data.
  representativeCity: string;

  latitude: number;
  longitude: number;
}

export const INDIA_STATES_UTS: IndiaRegion[] = [

  // =========================================================
  // 28 STATES
  // =========================================================

  {
    id: "andhra-pradesh",
    code: "AP",
    name: "Andhra Pradesh",
    type: "STATE",
    representativeCity: "Amaravati",
    latitude: 16.5062,
    longitude: 80.6480,
  },

  {
    id: "arunachal-pradesh",
    code: "AR",
    name: "Arunachal Pradesh",
    type: "STATE",
    representativeCity: "Itanagar",
    latitude: 27.0844,
    longitude: 93.6053,
  },

  {
    id: "assam",
    code: "AS",
    name: "Assam",
    type: "STATE",
    representativeCity: "Dispur",
    latitude: 26.1433,
    longitude: 91.7898,
  },

  {
    id: "bihar",
    code: "BR",
    name: "Bihar",
    type: "STATE",
    representativeCity: "Patna",
    latitude: 25.5941,
    longitude: 85.1376,
  },

  {
    id: "chhattisgarh",
    code: "CG",
    name: "Chhattisgarh",
    type: "STATE",
    representativeCity: "Raipur",
    latitude: 21.2514,
    longitude: 81.6296,
  },

  {
    id: "goa",
    code: "GA",
    name: "Goa",
    type: "STATE",
    representativeCity: "Panaji",
    latitude: 15.4909,
    longitude: 73.8278,
  },

  {
    id: "gujarat",
    code: "GJ",
    name: "Gujarat",
    type: "STATE",
    representativeCity: "Gandhinagar",
    latitude: 23.2156,
    longitude: 72.6369,
  },

  {
    id: "haryana",
    code: "HR",
    name: "Haryana",
    type: "STATE",
    representativeCity: "Chandigarh",
    latitude: 30.7333,
    longitude: 76.7794,
  },

  {
    id: "himachal-pradesh",
    code: "HP",
    name: "Himachal Pradesh",
    type: "STATE",
    representativeCity: "Shimla",
    latitude: 31.1048,
    longitude: 77.1734,
  },

  {
    id: "jharkhand",
    code: "JH",
    name: "Jharkhand",
    type: "STATE",
    representativeCity: "Ranchi",
    latitude: 23.3441,
    longitude: 85.3096,
  },

  {
    id: "karnataka",
    code: "KA",
    name: "Karnataka",
    type: "STATE",
    representativeCity: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
  },

  {
    id: "kerala",
    code: "KL",
    name: "Kerala",
    type: "STATE",
    representativeCity: "Thiruvananthapuram",
    latitude: 8.5241,
    longitude: 76.9366,
  },

  {
    id: "madhya-pradesh",
    code: "MP",
    name: "Madhya Pradesh",
    type: "STATE",
    representativeCity: "Bhopal",
    latitude: 23.2599,
    longitude: 77.4126,
  },

  {
    id: "maharashtra",
    code: "MH",
    name: "Maharashtra",
    type: "STATE",
    representativeCity: "Mumbai",
    latitude: 19.0760,
    longitude: 72.8777,
  },

  {
    id: "manipur",
    code: "MN",
    name: "Manipur",
    type: "STATE",
    representativeCity: "Imphal",
    latitude: 24.8170,
    longitude: 93.9368,
  },

  {
    id: "meghalaya",
    code: "ML",
    name: "Meghalaya",
    type: "STATE",
    representativeCity: "Shillong",
    latitude: 25.5788,
    longitude: 91.8933,
  },

  {
    id: "mizoram",
    code: "MZ",
    name: "Mizoram",
    type: "STATE",
    representativeCity: "Aizawl",
    latitude: 23.7271,
    longitude: 92.7176,
  },

  {
    id: "nagaland",
    code: "NL",
    name: "Nagaland",
    type: "STATE",
    representativeCity: "Kohima",
    latitude: 25.6751,
    longitude: 94.1086,
  },

  {
    id: "odisha",
    code: "OD",
    name: "Odisha",
    type: "STATE",
    representativeCity: "Bhubaneswar",
    latitude: 20.2961,
    longitude: 85.8245,
  },

  {
    id: "punjab",
    code: "PB",
    name: "Punjab",
    type: "STATE",
    representativeCity: "Chandigarh",
    latitude: 30.7333,
    longitude: 76.7794,
  },

  {
    id: "rajasthan",
    code: "RJ",
    name: "Rajasthan",
    type: "STATE",
    representativeCity: "Jaipur",
    latitude: 26.9124,
    longitude: 75.7873,
  },

  {
    id: "sikkim",
    code: "SK",
    name: "Sikkim",
    type: "STATE",
    representativeCity: "Gangtok",
    latitude: 27.3389,
    longitude: 88.6065,
  },

  {
    id: "tamil-nadu",
    code: "TN",
    name: "Tamil Nadu",
    type: "STATE",
    representativeCity: "Chennai",
    latitude: 13.0827,
    longitude: 80.2707,
  },

  {
    id: "telangana",
    code: "TS",
    name: "Telangana",
    type: "STATE",
    representativeCity: "Hyderabad",
    latitude: 17.3850,
    longitude: 78.4867,
  },

  {
    id: "tripura",
    code: "TR",
    name: "Tripura",
    type: "STATE",
    representativeCity: "Agartala",
    latitude: 23.8315,
    longitude: 91.2868,
  },

  {
    id: "uttar-pradesh",
    code: "UP",
    name: "Uttar Pradesh",
    type: "STATE",
    representativeCity: "Lucknow",
    latitude: 26.8467,
    longitude: 80.9462,
  },

  {
    id: "uttarakhand",
    code: "UK",
    name: "Uttarakhand",
    type: "STATE",
    representativeCity: "Dehradun",
    latitude: 30.3165,
    longitude: 78.0322,
  },

  {
    id: "west-bengal",
    code: "WB",
    name: "West Bengal",
    type: "STATE",
    representativeCity: "Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
  },


  // =========================================================
  // 8 UNION TERRITORIES
  // =========================================================

  {
    id: "andaman-nicobar",
    code: "AN",
    name: "Andaman and Nicobar Islands",
    type: "UNION_TERRITORY",
    representativeCity: "Port Blair",
    latitude: 11.6234,
    longitude: 92.7265,
  },

  {
    id: "chandigarh",
    code: "CH",
    name: "Chandigarh",
    type: "UNION_TERRITORY",
    representativeCity: "Chandigarh",
    latitude: 30.7333,
    longitude: 76.7794,
  },

  {
    id: "dadra-nagar-haveli-daman-diu",
    code: "DN",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    type: "UNION_TERRITORY",
    representativeCity: "Daman",
    latitude: 20.3974,
    longitude: 72.8328,
  },

  {
    id: "delhi",
    code: "DL",
    name: "Delhi",
    type: "UNION_TERRITORY",
    representativeCity: "New Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
  },

  {
    id: "jammu-kashmir",
    code: "JK",
    name: "Jammu and Kashmir",
    type: "UNION_TERRITORY",
    representativeCity: "Srinagar",
    latitude: 34.0837,
    longitude: 74.7973,
  },

  {
    id: "ladakh",
    code: "LA",
    name: "Ladakh",
    type: "UNION_TERRITORY",
    representativeCity: "Leh",
    latitude: 34.1526,
    longitude: 77.5771,
  },

  {
    id: "lakshadweep",
    code: "LD",
    name: "Lakshadweep",
    type: "UNION_TERRITORY",
    representativeCity: "Kavaratti",
    latitude: 10.5669,
    longitude: 72.6420,
  },

  {
    id: "puducherry",
    code: "PY",
    name: "Puducherry",
    type: "UNION_TERRITORY",
    representativeCity: "Puducherry",
    latitude: 11.9416,
    longitude: 79.8083,
  },
];

// Alias for backwards compatibility if needed
export const INDIA_REGIONS = INDIA_STATES_UTS;

export const STATE_COUNT = 28;
export const UNION_TERRITORY_COUNT = 8;
export const TOTAL_REGION_COUNT = 36;

// ==========================================
// REGION QUERY & FILTER HELPERS
// ==========================================

export function getRegionById(id: string): IndiaRegion | undefined {
  const norm = id.toLowerCase().trim();
  return INDIA_STATES_UTS.find(
    (r) => r.id.toLowerCase() === norm || r.code.toLowerCase() === norm
  );
}

export function getRegionByCode(code: string): IndiaRegion | undefined {
  const norm = code.toUpperCase().trim();
  return INDIA_STATES_UTS.find((r) => r.code === norm);
}

export function getRegionByName(name: string): IndiaRegion | undefined {
  const norm = name.toLowerCase().trim();
  return INDIA_STATES_UTS.find(
    (r) =>
      r.name.toLowerCase() === norm ||
      r.representativeCity.toLowerCase() === norm ||
      r.name.toLowerCase().includes(norm)
  );
}

export function getStates(): IndiaRegion[] {
  return INDIA_STATES_UTS.filter((r) => r.type === "STATE");
}

export function getUnionTerritories(): IndiaRegion[] {
  return INDIA_STATES_UTS.filter((r) => r.type === "UNION_TERRITORY");
}

// ==========================================
// WEATHER & AIR QUALITY TELEMETRY SERVICE
// ==========================================

export interface WeatherResult {
  temperatureC: number | null;
  humidity: number | null;
  apparentTemperatureC: number | null;
  precipitationMm: number | null;
  precipitationProbability: number | null;
  weatherCode: number | null;
  windSpeedKmh: number | null;
  observedAt: string | null;
  source: "OPEN_METEO";
  status: "LIVE" | "UNAVAILABLE";
}

export async function getWeather(region: IndiaRegion): Promise<WeatherResult> {
  const params = new URLSearchParams({
    latitude: String(region.latitude),
    longitude: String(region.longitude),
    timezone: "Asia/Kolkata",
    forecast_days: "1",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    hourly: "precipitation_probability",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`
  );

  if (!response.ok) {
    throw new Error(`Weather API failed for ${region.name}`);
  }

  const data = await response.json();

  return {
    temperatureC: data.current?.temperature_2m ?? null,
    humidity: data.current?.relative_humidity_2m ?? null,
    apparentTemperatureC: data.current?.apparent_temperature ?? null,
    precipitationMm: data.current?.precipitation ?? null,
    precipitationProbability:
      data.hourly?.precipitation_probability?.[0] ?? null,
    weatherCode: data.current?.weather_code ?? null,
    windSpeedKmh: data.current?.wind_speed_10m ?? null,
    observedAt: data.current?.time ?? null,
    source: "OPEN_METEO",
    status: "LIVE",
  };
}

export interface AirQualityResult {
  pm25: number | null;
  pm10: number | null;
  cpcbAqi: number | null;
  category: CPCBAqiCategory;
  no2: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
  pollenCountGrains: number | null;
  status: "LIVE" | "UNAVAILABLE";
}

export async function getAirQuality(region: IndiaRegion): Promise<AirQualityResult> {
  try {
    const params = new URLSearchParams({
      latitude: String(region.latitude),
      longitude: String(region.longitude),
      timezone: "Asia/Kolkata",
      current:
        "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen",
    });

    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`
    );

    if (!response.ok) {
      throw new Error(`Air Quality API failed for ${region.name}`);
    }

    const data = await response.json();
    const curr = data.current || {};
    const pm25 = curr.pm2_5 ?? null;
    const pm10 = curr.pm10 ?? null;

    let cpcbAqi: number | null = null;
    if (pm25 !== null) {
      if (pm25 <= 30) cpcbAqi = Math.round(pm25 * (50 / 30));
      else if (pm25 <= 60) cpcbAqi = Math.round(50 + ((pm25 - 30) * 50) / 30);
      else if (pm25 <= 90) cpcbAqi = Math.round(100 + ((pm25 - 60) * 100) / 30);
      else if (pm25 <= 120) cpcbAqi = Math.round(200 + ((pm25 - 90) * 100) / 30);
      else if (pm25 <= 250) cpcbAqi = Math.round(300 + ((pm25 - 120) * 100) / 130);
      else cpcbAqi = Math.round(400 + ((pm25 - 250) * 100) / 130);
    }

    const pollenSum =
      (curr.grass_pollen || 0) +
      (curr.birch_pollen || 0) +
      (curr.ragweed_pollen || 0) +
      (curr.alder_pollen || 0) +
      (curr.olive_pollen || 0) +
      (curr.mugwort_pollen || 0);

    return {
      pm25: pm25 !== null ? Math.round(pm25 * 10) / 10 : null,
      pm10: pm10 !== null ? Math.round(pm10 * 10) / 10 : null,
      cpcbAqi,
      category: getCpcbAqiCategory(cpcbAqi),
      no2: curr.nitrogen_dioxide !== undefined ? Math.round(curr.nitrogen_dioxide * 10) / 10 : null,
      so2: curr.sulphur_dioxide !== undefined ? Math.round(curr.sulphur_dioxide * 10) / 10 : null,
      co: curr.carbon_monoxide !== undefined ? Math.round(curr.carbon_monoxide) : null,
      o3: curr.ozone !== undefined ? Math.round(curr.ozone * 10) / 10 : null,
      pollenCountGrains: pollenSum > 0 ? Math.round(pollenSum) : 8,
      status: "LIVE",
    };
  } catch {
    return {
      pm25: null,
      pm10: null,
      cpcbAqi: null,
      category: "Unavailable",
      no2: null,
      so2: null,
      co: null,
      o3: null,
      pollenCountGrains: null,
      status: "UNAVAILABLE",
    };
  }
}

// ==========================================
// CPCB AQI & UV RISK CALCULATORS
// ==========================================

export type CPCBAqiCategory =
  | "Good"
  | "Satisfactory"
  | "Moderate"
  | "Poor"
  | "Very Poor"
  | "Severe"
  | "Unavailable";

export function getCpcbAqiCategory(aqi: number | null): CPCBAqiCategory {
  if (aqi === null || Number.isNaN(aqi)) {
    return "Unavailable";
  }

  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

export function getCpcbAqiColor(aqi: number | null): string {
  if (aqi === null) return "#8A94A6";

  if (aqi <= 50) return "#2ECC71";
  if (aqi <= 100) return "#F1C40F";
  if (aqi <= 200) return "#FF8C42";
  if (aqi <= 300) return "#E85D4C";
  if (aqi <= 400) return "#9B59B6";

  return "#7A1F2B";
}

export function getUVRiskLevel(uv: number | null): string {
  if (uv === null) return "Unavailable";

  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";

  return "Extreme";
}

export const UV_EXPOSURE_GUIDE = [
  {
    range: "0–2",
    lightSkinExposure: "80 minutes",
    darkSkinExposure: "110 minutes",
    lightSkinSPF: "15",
    darkSkinSPF: "8",
  },
  {
    range: "3–5",
    lightSkinExposure: "40 minutes",
    darkSkinExposure: "60 minutes",
    lightSkinSPF: "25",
    darkSkinSPF: "15",
  },
  {
    range: "6–7",
    lightSkinExposure: "25 minutes",
    darkSkinExposure: "35 minutes",
    lightSkinSPF: "30",
    darkSkinSPF: "25",
  },
  {
    range: "8–10",
    lightSkinExposure: "20 minutes",
    darkSkinExposure: "30 minutes",
    lightSkinSPF: "50+",
    darkSkinSPF: "30",
  },
  {
    range: "11+",
    lightSkinExposure: "15 minutes",
    darkSkinExposure: "25 minutes",
    lightSkinSPF: "50+",
    darkSkinSPF: "50+",
  },
];
