export type RegionType = "STATE" | "UNION_TERRITORY";

export interface IndiaRegion {
  id: string;
  code: string;
  name: string;
  type: RegionType;
  representativeCity: string;
  capital: string;
  aliases: string[];
  districts?: string[];
  latitude: number;
  longitude: number;
}

export type IndianRegion = IndiaRegion;

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
    capital: "Amaravati",
    aliases: ["Andhra", "AP", "Seemandhra", "Visakhapatnam", "Vizag", "Vijayawada", "Tirupati", "Guntur"],
    districts: ["Visakhapatnam", "Vijayawada", "Guntur", "Kurnool", "Nellore", "Tirupati", "Kadapa", "Anantapur", "Kakinada", "Eluru", "Ongole"],
    latitude: 16.5062,
    longitude: 80.6480,
  },
  {
    id: "arunachal-pradesh",
    code: "AR",
    name: "Arunachal Pradesh",
    type: "STATE",
    representativeCity: "Itanagar",
    capital: "Itanagar",
    aliases: ["Arunachal", "AR", "Itanagar", "Tawang", "Pasighat", "Ziro", "Naharlagun"],
    districts: ["Papum Pare", "Tawang", "West Kameng", "East Siang", "Changlang", "Lower Subansiri"],
    latitude: 27.0844,
    longitude: 93.6053,
  },
  {
    id: "assam",
    code: "AS",
    name: "Assam",
    type: "STATE",
    representativeCity: "Dispur",
    capital: "Dispur",
    aliases: ["Asom", "AS", "Guwahati", "Dispur", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tezpur"],
    districts: ["Kamrup Metropolitan", "Dibrugarh", "Cachar", "Jorhat", "Nagaon", "Sonitpur", "Tinsukia"],
    latitude: 26.1433,
    longitude: 91.7898,
  },
  {
    id: "bihar",
    code: "BR",
    name: "Bihar",
    type: "STATE",
    representativeCity: "Patna",
    capital: "Patna",
    aliases: ["BR", "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Biharsharif"],
    districts: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Rohtas", "Vaishali"],
    latitude: 25.5941,
    longitude: 85.1376,
  },
  {
    id: "chhattisgarh",
    code: "CG",
    name: "Chhattisgarh",
    type: "STATE",
    representativeCity: "Raipur",
    capital: "Raipur",
    aliases: ["CG", "Chattisgarh", "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
    districts: ["Raipur", "Durg", "Bilaspur", "Korba", "Rajnandgaon", "Bastar", "Surguja"],
    latitude: 21.2514,
    longitude: 81.6296,
  },
  {
    id: "goa",
    code: "GA",
    name: "Goa",
    type: "STATE",
    representativeCity: "Panaji",
    capital: "Panaji",
    aliases: ["GA", "Panjim", "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    districts: ["North Goa", "South Goa"],
    latitude: 15.4909,
    longitude: 73.8278,
  },
  {
    id: "gujarat",
    code: "GJ",
    name: "Gujarat",
    type: "STATE",
    representativeCity: "Gandhinagar",
    capital: "Gandhinagar",
    aliases: ["GJ", "Ahmedabad", "Amdavad", "Surat", "Vadodara", "Baroda", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar"],
    districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Kutch"],
    latitude: 23.2156,
    longitude: 72.6369,
  },
  {
    id: "haryana",
    code: "HR",
    name: "Haryana",
    type: "STATE",
    representativeCity: "Chandigarh",
    capital: "Chandigarh",
    aliases: ["HR", "Gurugram", "Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak"],
    districts: ["Gurugram", "Faridabad", "Ambala", "Karnal", "Hisar", "Rohtak", "Panipat", "Sonipat"],
    latitude: 30.7333,
    longitude: 76.7794,
  },
  {
    id: "himachal-pradesh",
    code: "HP",
    name: "Himachal Pradesh",
    type: "STATE",
    representativeCity: "Shimla",
    capital: "Shimla",
    aliases: ["Himachal", "HP", "Shimla", "Dharamshala", "Manali", "Kullu", "Mandi", "Solan", "Spiti"],
    districts: ["Shimla", "Kangra", "Mandi", "Kullu", "Solan", "Sirmaur", "Chamba", "Lahaul and Spiti"],
    latitude: 31.1048,
    longitude: 77.1734,
  },
  {
    id: "jharkhand",
    code: "JH",
    name: "Jharkhand",
    type: "STATE",
    representativeCity: "Ranchi",
    capital: "Ranchi",
    aliases: ["JH", "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"],
    districts: ["Ranchi", "East Singhbhum", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
    latitude: 23.3441,
    longitude: 85.3096,
  },
  {
    id: "karnataka",
    code: "KA",
    name: "Karnataka",
    type: "STATE",
    representativeCity: "Bengaluru",
    capital: "Bengaluru",
    aliases: ["KA", "Bangalore", "Bengaluru", "Mysore", "Mysuru", "Mangalore", "Mangaluru", "Hubballi", "Belagavi", "Gulbarga"],
    districts: ["Bengaluru Urban", "Mysuru", "Dakshina Kannada", "Dharwad", "Belagavi", "Kalaburagi", "Tumakuru"],
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: "kerala",
    code: "KL",
    name: "Kerala",
    type: "STATE",
    representativeCity: "Thiruvananthapuram",
    capital: "Thiruvananthapuram",
    aliases: ["KL", "Trivandrum", "Thiruvananthapuram", "Kochi", "Cochin", "Kozhikode", "Calicut", "Thrissur", "Kollam", "Kannur"],
    districts: ["Thiruvananthapuram", "Ernakulam", "Kozhikode", "Thrissur", "Malappuram", "Kollam", "Palakkad", "Alappuzha"],
    latitude: 8.5241,
    longitude: 76.9366,
  },
  {
    id: "madhya-pradesh",
    code: "MP",
    name: "Madhya Pradesh",
    type: "STATE",
    representativeCity: "Bhopal",
    capital: "Bhopal",
    aliases: ["MP", "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa"],
    districts: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna"],
    latitude: 23.2599,
    longitude: 77.4126,
  },
  {
    id: "maharashtra",
    code: "MH",
    name: "Maharashtra",
    type: "STATE",
    representativeCity: "Mumbai",
    capital: "Mumbai",
    aliases: ["MH", "Mumbai", "Bombay", "Pune", "Poona", "Nagpur", "Nashik", "Aurangabad", "Chhatrapati Sambhajinagar", "Thane", "Solapur"],
    districts: ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Nashik", "Thane", "Chhatrapati Sambhajinagar", "Solapur"],
    latitude: 19.0760,
    longitude: 72.8777,
  },
  {
    id: "manipur",
    code: "MN",
    name: "Manipur",
    type: "STATE",
    representativeCity: "Imphal",
    capital: "Imphal",
    aliases: ["MN", "Imphal", "Churachandpur", "Thoubal", "Bishnupur", "Ukhrul"],
    districts: ["Imphal East", "Imphal West", "Thoubal", "Bishnupur", "Churachandpur"],
    latitude: 24.8170,
    longitude: 93.9368,
  },
  {
    id: "meghalaya",
    code: "ML",
    name: "Meghalaya",
    type: "STATE",
    representativeCity: "Shillong",
    capital: "Shillong",
    aliases: ["ML", "Shillong", "Cherrapunji", "Sohra", "Mawsynram", "Tura", "Jowai"],
    districts: ["East Khasi Hills", "West Garo Hills", "West Jaintia Hills", "Ri-Bhoi"],
    latitude: 25.5788,
    longitude: 91.8933,
  },
  {
    id: "mizoram",
    code: "MZ",
    name: "Mizoram",
    type: "STATE",
    representativeCity: "Aizawl",
    capital: "Aizawl",
    aliases: ["MZ", "Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
    districts: ["Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip"],
    latitude: 23.7271,
    longitude: 92.7176,
  },
  {
    id: "nagaland",
    code: "NL",
    name: "Nagaland",
    type: "STATE",
    representativeCity: "Kohima",
    capital: "Kohima",
    aliases: ["NL", "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
    districts: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
    latitude: 25.6751,
    longitude: 94.1086,
  },
  {
    id: "odisha",
    code: "OD",
    name: "Odisha",
    type: "STATE",
    representativeCity: "Bhubaneswar",
    capital: "Bhubaneswar",
    aliases: ["Orissa", "OD", "OR", "Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Sambalpur", "Berhampur", "Balasore", "Chandaka", "Khordha", "Paradip", "Gopalpur"],
    districts: ["Khordha", "Cuttack", "Puri", "Sundargarh", "Sambalpur", "Ganjam", "Balasore", "Bhadrak", "Mayurbhanj", "Angul", "Kendrapara", "Jagatsinghpur"],
    latitude: 20.2961,
    longitude: 85.8245,
  },
  {
    id: "punjab",
    code: "PB",
    name: "Punjab",
    type: "STATE",
    representativeCity: "Chandigarh",
    capital: "Chandigarh",
    aliases: ["PB", "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
    districts: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "SAS Nagar"],
    latitude: 31.1471,
    longitude: 75.3412,
  },
  {
    id: "rajasthan",
    code: "RJ",
    name: "Rajasthan",
    type: "STATE",
    representativeCity: "Jaipur",
    capital: "Jaipur",
    aliases: ["RJ", "Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Jaisalmer"],
    districts: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Jaisalmer"],
    latitude: 26.9124,
    longitude: 75.7873,
  },
  {
    id: "sikkim",
    code: "SK",
    name: "Sikkim",
    type: "STATE",
    representativeCity: "Gangtok",
    capital: "Gangtok",
    aliases: ["SK", "Gangtok", "Namchi", "Gyalshing", "Mangan", "Pelling"],
    districts: ["East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim"],
    latitude: 27.3389,
    longitude: 88.6065,
  },
  {
    id: "tamil-nadu",
    code: "TN",
    name: "Tamil Nadu",
    type: "STATE",
    representativeCity: "Chennai",
    capital: "Chennai",
    aliases: ["TN", "Tamilnadu", "Chennai", "Madras", "Coimbatore", "Madurai", "Tiruchirappalli", "Trichy", "Salem", "Tirunelveli"],
    districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Chengalpattu"],
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    id: "telangana",
    code: "TG",
    name: "Telangana",
    type: "STATE",
    representativeCity: "Hyderabad",
    capital: "Hyderabad",
    aliases: ["TS", "TG", "Hyderabad", "Secunderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    districts: ["Hyderabad", "Medchal-Malkajgiri", "Rangareddy", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    latitude: 17.3850,
    longitude: 78.4867,
  },
  {
    id: "tripura",
    code: "TR",
    name: "Tripura",
    type: "STATE",
    representativeCity: "Agartala",
    capital: "Agartala",
    aliases: ["TR", "Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"],
    districts: ["West Tripura", "South Tripura", "North Tripura", "Dhalai", "Gomati"],
    latitude: 23.8315,
    longitude: 91.2868,
  },
  {
    id: "uttar-pradesh",
    code: "UP",
    name: "Uttar Pradesh",
    type: "STATE",
    representativeCity: "Lucknow",
    capital: "Lucknow",
    aliases: ["UP", "Lucknow", "Kanpur", "Varanasi", "Banaras", "Kashi", "Prayagraj", "Allahabad", "Agra", "Noida", "Ghaziabad", "Meerut", "Gorakhpur", "Bareilly", "Aligarh"],
    districts: ["Lucknow", "Kanpur Nagar", "Varanasi", "Prayagraj", "Agra", "Gautam Buddha Nagar", "Ghaziabad", "Meerut", "Gorakhpur"],
    latitude: 26.8467,
    longitude: 80.9462,
  },
  {
    id: "uttarakhand",
    code: "UK",
    name: "Uttarakhand",
    type: "STATE",
    representativeCity: "Dehradun",
    capital: "Dehradun",
    aliases: ["Uttaranchal", "UK", "UA", "Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani", "Roorkee", "Mussoorie", "Almora"],
    districts: ["Dehradun", "Haridwar", "Nainital", "Udham Singh Nagar", "Pauri Garhwal", "Almora", "Chamoli"],
    latitude: 30.3165,
    longitude: 78.0322,
  },
  {
    id: "west-bengal",
    code: "WB",
    name: "West Bengal",
    type: "STATE",
    representativeCity: "Kolkata",
    capital: "Kolkata",
    aliases: ["Bengal", "Paschim Banga", "WB", "Kolkata", "Calcutta", "Howrah", "Siliguri", "Durgapur", "Asansol", "Darjeeling", "Malda", "Alipore"],
    districts: ["Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas", "Darjeeling", "Paschim Bardhaman", "Purba Medinipur"],
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
    capital: "Port Blair",
    aliases: ["Andaman", "Nicobar", "AN", "Port Blair", "Havelock", "Neil Island"],
    districts: ["South Andaman", "North and Middle Andaman", "Nicobar"],
    latitude: 11.6234,
    longitude: 92.7265,
  },
  {
    id: "chandigarh",
    code: "CH",
    name: "Chandigarh",
    type: "UNION_TERRITORY",
    representativeCity: "Chandigarh",
    capital: "Chandigarh",
    aliases: ["CH", "The City Beautiful"],
    districts: ["Chandigarh"],
    latitude: 30.7333,
    longitude: 76.7794,
  },
  {
    id: "dadra-nagar-haveli-daman-diu",
    code: "DH",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    type: "UNION_TERRITORY",
    representativeCity: "Daman",
    capital: "Daman",
    aliases: ["Daman and Diu", "Dadra and Nagar Haveli", "Daman", "Diu", "Silvassa", "DNHDD", "DD"],
    districts: ["Daman", "Diu", "Dadra and Nagar Haveli"],
    latitude: 20.3974,
    longitude: 72.8328,
  },
  {
    id: "delhi",
    code: "DL",
    name: "Delhi",
    type: "UNION_TERRITORY",
    representativeCity: "New Delhi",
    capital: "New Delhi",
    aliases: ["NCT", "DL", "New Delhi", "NCR", "National Capital", "Dilli", "Anand Vihar", "Dwarka", "Rohini", "Connaught Place", "ITO", "Okhla"],
    districts: ["New Delhi", "Central Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi"],
    latitude: 28.6139,
    longitude: 77.2090,
  },
  {
    id: "jammu-kashmir",
    code: "JK",
    name: "Jammu and Kashmir",
    type: "UNION_TERRITORY",
    representativeCity: "Srinagar",
    capital: "Srinagar",
    aliases: ["J&K", "JK", "Jammu", "Srinagar", "Kashmir", "Gulmarg", "Pahalgam", "Anantnag", "Baramulla"],
    districts: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Budgam"],
    latitude: 34.0837,
    longitude: 74.7973,
  },
  {
    id: "ladakh",
    code: "LA",
    name: "Ladakh",
    type: "UNION_TERRITORY",
    representativeCity: "Leh",
    capital: "Leh",
    aliases: ["LA", "Leh", "Kargil", "Nubra", "Zanskar", "Pangong"],
    districts: ["Leh", "Kargil"],
    latitude: 34.1526,
    longitude: 77.5771,
  },
  {
    id: "lakshadweep",
    code: "LD",
    name: "Lakshadweep",
    type: "UNION_TERRITORY",
    representativeCity: "Kavaratti",
    capital: "Kavaratti",
    aliases: ["LD", "Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott"],
    districts: ["Lakshadweep"],
    latitude: 10.5669,
    longitude: 72.6420,
  },
  {
    id: "puducherry",
    code: "PY",
    name: "Puducherry",
    type: "UNION_TERRITORY",
    representativeCity: "Puducherry",
    capital: "Puducherry",
    aliases: ["Pondicherry", "Pondi", "PY", "Auroville", "Karaikal", "Mahe", "Yanam"],
    districts: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    latitude: 11.9416,
    longitude: 79.8083,
  },
];

export const INDIA_REGIONS = INDIA_STATES_UTS;
export const STATE_COUNT = 28;
export const UNION_TERRITORY_COUNT = 8;
export const TOTAL_REGION_COUNT = 36;

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
      r.capital.toLowerCase() === norm ||
      r.aliases.some((a) => a.toLowerCase() === norm) ||
      r.name.toLowerCase().includes(norm)
  );
}

export function getStates(): IndiaRegion[] {
  return INDIA_STATES_UTS.filter((r) => r.type === "STATE");
}

export function getUnionTerritories(): IndiaRegion[] {
  return INDIA_STATES_UTS.filter((r) => r.type === "UNION_TERRITORY");
}

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
  try {
    const params = new URLSearchParams({
      latitude: String(region.latitude),
      longitude: String(region.longitude),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
      ].join(","),
      hourly: "precipitation_probability",
      timezone: "Asia/Kolkata",
    });

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`
    );

    if (!res.ok) {
      return {
        temperatureC: null,
        humidity: null,
        apparentTemperatureC: null,
        precipitationMm: null,
        precipitationProbability: null,
        weatherCode: null,
        windSpeedKmh: null,
        observedAt: null,
        source: "OPEN_METEO",
        status: "UNAVAILABLE",
      };
    }

    const data = await res.json();
    const current = data.current;
    const hourly = data.hourly;

    return {
      temperatureC: current.temperature_2m ?? null,
      humidity: current.relative_humidity_2m ?? null,
      apparentTemperatureC: current.apparent_temperature ?? null,
      precipitationMm: current.precipitation ?? null,
      precipitationProbability: hourly?.precipitation_probability?.[0] ?? null,
      weatherCode: current.weather_code ?? null,
      windSpeedKmh: current.wind_speed_10m ?? null,
      observedAt: current.time ? `${current.time}+05:30` : null,
      source: "OPEN_METEO",
      status: "LIVE",
    };
  } catch {
    return {
      temperatureC: null,
      humidity: null,
      apparentTemperatureC: null,
      precipitationMm: null,
      precipitationProbability: null,
      weatherCode: null,
      windSpeedKmh: null,
      observedAt: null,
      source: "OPEN_METEO",
      status: "UNAVAILABLE",
    };
  }
}

export interface AirQualityResult {
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  status: "LIVE" | "UNAVAILABLE";
}

export async function getAirQuality(region: IndiaRegion): Promise<AirQualityResult> {
  try {
    const params = new URLSearchParams({
      latitude: String(region.latitude),
      longitude: String(region.longitude),
      current: ["us_aqi", "pm2_5", "pm10"].join(","),
      timezone: "Asia/Kolkata",
    });

    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`
    );

    if (!res.ok) {
      return { aqi: null, pm25: null, pm10: null, status: "UNAVAILABLE" };
    }

    const data = await res.json();
    return {
      aqi: data.current.us_aqi ?? null,
      pm25: data.current.pm2_5 ?? null,
      pm10: data.current.pm10 ?? null,
      status: "LIVE",
    };
  } catch {
    return { aqi: null, pm25: null, pm10: null, status: "UNAVAILABLE" };
  }
}

export function getAqiCategory(aqi: number | null): {
  label: string;
  color: string;
} {
  if (aqi === null) return { label: "Unavailable", color: "#64748B" };
  if (aqi <= 50) return { label: "Good", color: "#10B981" };
  if (aqi <= 100) return { label: "Satisfactory", color: "#84CC16" };
  if (aqi <= 200) return { label: "Moderate", color: "#EAB308" };
  if (aqi <= 300) return { label: "Poor", color: "#F97316" };
  if (aqi <= 400) return { label: "Very Poor", color: "#EF4444" };
  return { label: "Severe", color: "#7F1D1D" };
}

export function getUvCategory(uv: number | null): string {
  if (uv === null) return "Unavailable";
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

export const UV_EXPOSURE_GUIDE = [
  { range: "0–2", lightSkinExposure: "80 minutes", darkSkinExposure: "110 minutes", lightSkinSPF: "15", darkSkinSPF: "8" },
  { range: "3–5", lightSkinExposure: "40 minutes", darkSkinExposure: "60 minutes", lightSkinSPF: "25", darkSkinSPF: "15" },
  { range: "6–7", lightSkinExposure: "25 minutes", darkSkinExposure: "35 minutes", lightSkinSPF: "30", darkSkinSPF: "25" },
  { range: "8–10", lightSkinExposure: "20 minutes", darkSkinExposure: "30 minutes", lightSkinSPF: "50+", darkSkinSPF: "30" },
  { range: "11+", lightSkinExposure: "15 minutes", darkSkinExposure: "25 minutes", lightSkinSPF: "50+", darkSkinSPF: "50+" },
];
