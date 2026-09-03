import { RadarStation, RadarProduct, RadarProductType, RadarProductMetadata } from '../types/radar';

export type RadarDataStatus = 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE' | 'LOADING' | 'ERROR';

export interface RadarFrame {
  time: number;
  path: string;
  formattedTime: string;
  ageMinutes: number;
}

export interface RadarApiResponse {
  status: RadarDataStatus;
  available: boolean;
  message?: string;
  host: string;
  pastFrames: RadarFrame[];
  nowcastFrames: RadarFrame[];
  currentProduct?: RadarProduct;
  lastAvailableTimestamp?: string;
  sourceAttribution: string;
  originalProvider: string;
  rawTimestamp?: number;
}

export const OFFICIAL_RADAR_STATIONS: RadarStation[] = [
  {
    id: 'DWR-GOP',
    name: 'Gopalpur Doppler Radar',
    latitude: 19.2612,
    longitude: 84.9089,
    band: 'S-Band (2.85 GHz)',
    maxRangeKm: 500,
    state: 'Odisha',
    elevationM: 45,
    frequencyGhz: 2.85,
    isCoastal: true,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Berhampur', distKm: 16, azimuthDeg: 295 },
      { name: 'Chatrapur', distKm: 24, azimuthDeg: 35 },
      { name: 'Chilika Lake', distKm: 65, azimuthDeg: 45 },
      { name: 'Srikakulam', distKm: 110, azimuthDeg: 220 },
      { name: 'Bhubaneswar', distKm: 145, azimuthDeg: 42 },
      { name: 'Bay of Bengal Sector', distKm: 180, azimuthDeg: 125, isWater: true },
    ],
  },
  {
    id: 'DWR-PDR',
    name: 'Paradip Doppler Radar',
    latitude: 20.3164,
    longitude: 86.6114,
    band: 'S-Band (2.82 GHz)',
    maxRangeKm: 500,
    state: 'Odisha',
    elevationM: 28,
    frequencyGhz: 2.82,
    isCoastal: true,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Kendrapada', distKm: 42, azimuthDeg: 320 },
      { name: 'Dhamra Port', distKm: 65, azimuthDeg: 20 },
      { name: 'Cuttack', distKm: 85, azimuthDeg: 285 },
      { name: 'Puri', distKm: 90, azimuthDeg: 225 },
      { name: 'Bhubaneswar', distKm: 95, azimuthDeg: 265 },
      { name: 'North Bay Cyclone Track', distKm: 210, azimuthDeg: 135, isWater: true },
    ],
  },
  {
    id: 'DWR-KOL',
    name: 'Kolkata Doppler Radar',
    latitude: 22.5726,
    longitude: 88.3639,
    band: 'S-Band (2.87 GHz)',
    maxRangeKm: 500,
    state: 'West Bengal',
    elevationM: 12,
    frequencyGhz: 2.87,
    isCoastal: true,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Howrah', distKm: 8, azimuthDeg: 280 },
      { name: 'Diamond Harbour', distKm: 45, azimuthDeg: 190 },
      { name: 'Haldia Port', distKm: 65, azimuthDeg: 210 },
      { name: 'Sundarbans Core', distKm: 85, azimuthDeg: 140 },
      { name: 'Kharagpur', distKm: 115, azimuthDeg: 260 },
      { name: 'Digha Coast', distKm: 130, azimuthDeg: 225 },
    ],
  },
  {
    id: 'DWR-DEL',
    name: 'New Delhi (Palam) Radar',
    latitude: 28.5851,
    longitude: 77.0864,
    band: 'C-Band (5.62 GHz)',
    maxRangeKm: 250,
    state: 'Delhi',
    elevationM: 225,
    frequencyGhz: 5.62,
    isCoastal: false,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Gurugram', distKm: 18, azimuthDeg: 215 },
      { name: 'Noida', distKm: 28, azimuthDeg: 105 },
      { name: 'Faridabad', distKm: 32, azimuthDeg: 155 },
      { name: 'Rohtak', distKm: 62, azimuthDeg: 295 },
      { name: 'Meerut', distKm: 75, azimuthDeg: 55 },
      { name: 'Panipat', distKm: 88, azimuthDeg: 345 },
    ],
  },
  {
    id: 'DWR-MUM',
    name: 'Mumbai (Colaba) Radar',
    latitude: 18.9067,
    longitude: 72.8147,
    band: 'S-Band (2.84 GHz)',
    maxRangeKm: 500,
    state: 'Maharashtra',
    elevationM: 18,
    frequencyGhz: 2.84,
    isCoastal: true,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Navi Mumbai', distKm: 26, azimuthDeg: 65 },
      { name: 'Thane', distKm: 38, azimuthDeg: 25 },
      { name: 'Alibaug Coast', distKm: 28, azimuthDeg: 165 },
      { name: 'Pune Plateau', distKm: 120, azimuthDeg: 115 },
      { name: 'Arabian Sea Shelf', distKm: 150, azimuthDeg: 260, isWater: true },
    ],
  },
  {
    id: 'DWR-CHN',
    name: 'Chennai (Port) Radar',
    latitude: 13.0827,
    longitude: 80.2707,
    band: 'S-Band (2.86 GHz)',
    maxRangeKm: 500,
    state: 'Tamil Nadu',
    elevationM: 16,
    frequencyGhz: 2.86,
    isCoastal: true,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Ennore Port', distKm: 18, azimuthDeg: 15 },
      { name: 'Tambaram', distKm: 24, azimuthDeg: 225 },
      { name: 'Mahabalipuram', distKm: 52, azimuthDeg: 185 },
      { name: 'Kanchipuram', distKm: 68, azimuthDeg: 250 },
      { name: 'Coromandel Sea', distKm: 140, azimuthDeg: 95, isWater: true },
    ],
  },
  {
    id: 'DWR-VSK',
    name: 'Visakhapatnam Radar',
    latitude: 17.6868,
    longitude: 83.2185,
    band: 'S-Band (2.85 GHz)',
    maxRangeKm: 500,
    state: 'Andhra Pradesh',
    elevationM: 145,
    frequencyGhz: 2.85,
    isCoastal: true,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Vizianagaram', distKm: 48, azimuthDeg: 15 },
      { name: 'Anakapalle', distKm: 35, azimuthDeg: 245 },
      { name: 'Kakinada', distKm: 130, azimuthDeg: 215 },
      { name: 'East Coast Deepwater', distKm: 160, azimuthDeg: 120, isWater: true },
    ],
  },
  {
    id: 'DWR-HYD',
    name: 'Hyderabad (Begumpet) Radar',
    latitude: 17.4531,
    longitude: 78.4677,
    band: 'C-Band (5.60 GHz)',
    maxRangeKm: 250,
    state: 'Telangana',
    elevationM: 535,
    frequencyGhz: 5.60,
    isCoastal: false,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Secunderabad', distKm: 6, azimuthDeg: 60 },
      { name: 'Shadnagar', distKm: 52, azimuthDeg: 195 },
      { name: 'Warangal', distKm: 135, azimuthDeg: 55 },
      { name: 'Nizamabad', distKm: 155, azimuthDeg: 345 },
    ],
  },
  {
    id: 'DWR-KOC',
    name: 'Kochi Radar',
    latitude: 9.9312,
    longitude: 76.2673,
    band: 'C-Band (5.61 GHz)',
    maxRangeKm: 250,
    state: 'Kerala',
    elevationM: 5,
    frequencyGhz: 5.61,
    isCoastal: true,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Alappuzha', distKm: 54, azimuthDeg: 175 },
      { name: 'Thrissur', distKm: 68, azimuthDeg: 15 },
      { name: 'Kottayam', distKm: 60, azimuthDeg: 140 },
      { name: 'Lakshadweep Sea', distKm: 100, azimuthDeg: 260, isWater: true },
    ],
  },
  {
    id: 'DWR-PAT',
    name: 'Patna Doppler Radar',
    latitude: 25.5941,
    longitude: 85.1376,
    band: 'S-Band (2.85 GHz)',
    maxRangeKm: 500,
    state: 'Bihar',
    elevationM: 53,
    frequencyGhz: 2.85,
    isCoastal: false,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Hajipur', distKm: 14, azimuthDeg: 20 },
      { name: 'Gaya', distKm: 98, azimuthDeg: 185 },
      { name: 'Muzaffarpur', distKm: 65, azimuthDeg: 15 },
      { name: 'Darbhanga', distKm: 110, azimuthDeg: 45 },
    ],
  },
  {
    id: 'DWR-NAG',
    name: 'Nagpur Doppler Radar',
    latitude: 21.1458,
    longitude: 79.0882,
    band: 'S-Band (2.85 GHz)',
    maxRangeKm: 500,
    state: 'Maharashtra',
    elevationM: 310,
    frequencyGhz: 2.85,
    isCoastal: false,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Wardha', distKm: 72, azimuthDeg: 215 },
      { name: 'Amravati', distKm: 145, azimuthDeg: 265 },
      { name: 'Chandrapur', distKm: 140, azimuthDeg: 165 },
      { name: 'Chhindwara', distKm: 115, azimuthDeg: 335 },
    ],
  },
  {
    id: 'DWR-JAI',
    name: 'Jaipur Doppler Radar',
    latitude: 26.9124,
    longitude: 75.7873,
    band: 'S-Band (2.85 GHz)',
    maxRangeKm: 500,
    state: 'Rajasthan',
    elevationM: 431,
    frequencyGhz: 2.85,
    isCoastal: false,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Ajmer', distKm: 130, azimuthDeg: 245 },
      { name: 'Alwar', distKm: 115, azimuthDeg: 45 },
      { name: 'Sikar', distKm: 110, azimuthDeg: 325 },
      { name: 'Tonk', distKm: 95, azimuthDeg: 175 },
    ],
  },
  {
    id: 'DWR-SRI',
    name: 'Srinagar Doppler Radar',
    latitude: 34.0837,
    longitude: 74.7973,
    band: 'X-Band (9.41 GHz)',
    maxRangeKm: 250,
    state: 'Jammu and Kashmir',
    elevationM: 1585,
    frequencyGhz: 9.41,
    isCoastal: false,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Baramulla', distKm: 52, azimuthDeg: 295 },
      { name: 'Anantnag', distKm: 55, azimuthDeg: 135 },
      { name: 'Gulmarg', distKm: 42, azimuthDeg: 260 },
      { name: 'Sonamarg', distKm: 78, azimuthDeg: 65 },
    ],
  },
  {
    id: 'DWR-SHL',
    name: 'Cherrapunji / Sohra Radar',
    latitude: 25.2986,
    longitude: 91.5822,
    band: 'S-Band (2.85 GHz)',
    maxRangeKm: 500,
    state: 'Meghalaya',
    elevationM: 1313,
    frequencyGhz: 2.85,
    isCoastal: false,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Shillong', distKm: 38, azimuthDeg: 25 },
      { name: 'Sylhet (Bangladesh)', distKm: 45, azimuthDeg: 175 },
      { name: 'Guwahati Plains', distKm: 95, azimuthDeg: 15 },
    ],
  },
  {
    id: 'DWR-GOA',
    name: 'Goa (Panaji) Radar',
    latitude: 15.4909,
    longitude: 73.8278,
    band: 'S-Band (2.85 GHz)',
    maxRangeKm: 500,
    state: 'Goa',
    elevationM: 58,
    frequencyGhz: 2.85,
    isCoastal: true,
    status: 'Operational',
    surroundingPlaces: [
      { name: 'Margao', distKm: 28, azimuthDeg: 155 },
      { name: 'Vasco da Gama', distKm: 14, azimuthDeg: 215 },
      { name: 'Karwar Coast', distKm: 85, azimuthDeg: 155 },
      { name: 'Arabian Sea Offshore', distKm: 120, azimuthDeg: 270, isWater: true },
    ],
  },
];

let cachedRadarData: RadarApiResponse | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

/**
 * Fetches genuine real meteorological radar metadata from public API
 * If offline or unavailable, returns clean unavailable status without fake echoes.
 */
export async function fetchLiveRadarData(
  productType: RadarProductType = 'MAXZ',
  forceRefresh = false
): Promise<RadarApiResponse> {
  const now = Date.now();
  if (!forceRefresh && cachedRadarData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedRadarData;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Radar API responded with HTTP ${res.status}`);
    }

    const data = await res.json();
    const host = data.host || 'https://tilecache.rainviewer.com';
    const past = data.radar?.past || [];
    const nowcast = data.radar?.nowcast || [];

    if (!past || past.length === 0) {
      return {
        status: 'UNAVAILABLE',
        available: false,
        message: 'No radar frames currently provided by service',
        host: '',
        pastFrames: [],
        nowcastFrames: [],
        sourceAttribution: 'Weather radar data by RainViewer',
        originalProvider: 'Global weather radar composite network',
      };
    }

    const formatTimestamp = (unixSeconds: number): string => {
      const d = new Date(unixSeconds * 1000);
      return (
        d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }) +
        ' IST, ' +
        d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    const nowSeconds = Math.floor(now / 1000);

    const pastFrames: RadarFrame[] = past.map((item: any) => {
      const ageMinutes = Math.max(0, Math.round((nowSeconds - item.time) / 60));
      return {
        time: item.time,
        path: item.path,
        formattedTime: formatTimestamp(item.time),
        ageMinutes,
      };
    });

    const nowcastFrames: RadarFrame[] = nowcast.map((item: any) => {
      const ageMinutes = Math.round((nowSeconds - item.time) / 60);
      return {
        time: item.time,
        path: item.path,
        formattedTime: formatTimestamp(item.time),
        ageMinutes,
      };
    });

    const latestFrame = pastFrames[pastFrames.length - 1];
    const latestAgeMinutes = latestFrame.ageMinutes;

    // Truthful operational status based on real feed freshness
    let status: RadarDataStatus = 'LIVE';
    if (latestAgeMinutes > 120) {
      status = 'STALE';
    } else if (latestAgeMinutes > 25) {
      status = 'RECENT';
    } else {
      status = 'LIVE';
    }

    // Direct radar tile URL using verified RainViewer format
    const tileUrl = `${host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    const currentProduct: RadarProduct = {
      type: productType,
      timestamp: latestFrame.formattedTime,
      tileUrl,
    };

    const result: RadarApiResponse = {
      status,
      available: true,
      host,
      pastFrames,
      nowcastFrames,
      currentProduct,
      lastAvailableTimestamp: latestFrame.formattedTime,
      sourceAttribution: 'Weather radar data by RainViewer',
      originalProvider: 'Global weather radar composite network',
      rawTimestamp: latestFrame.time * 1000,
    };

    cachedRadarData = result;
    lastFetchTime = now;
    return result;
  } catch (err: any) {
    return {
      status: 'ERROR',
      available: false,
      message: 'Radar data temporarily unavailable from source',
      host: '',
      pastFrames: [],
      nowcastFrames: [],
      sourceAttribution: 'Weather radar data by RainViewer',
      originalProvider: 'Global weather radar composite network',
    };
  }
}

const clientRadarCache = new Map<string, { timestamp: number; data: RadarProductMetadata }>();
const CLIENT_RADAR_CACHE_TTL = 90 * 1000; // 90s client cache

/**
 * Load verified radar product (MAXZ, PPZ, PPV, SRI, PAC, VVP2) from official IMD or verified fallback
 */
export async function loadRadarProduct(
  stationId: string,
  product: RadarProductType = 'MAXZ',
  signal?: AbortSignal
): Promise<RadarProductMetadata> {
  const cacheKey = `${stationId}_${product}`;
  const cached = clientRadarCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CLIENT_RADAR_CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(
      `/api/radar?station=${encodeURIComponent(stationId)}&product=${encodeURIComponent(product)}`,
      { signal }
    );
    if (!res.ok) {
      throw new Error(`Radar service responded with HTTP ${res.status}`);
    }
    const data: RadarProductMetadata = await res.json();
    clientRadarCache.set(cacheKey, { timestamp: now, data });
    return data;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw err;
    }
    // If cached data exists even if expired, return it as fallback
    if (cached) {
      return cached.data;
    }
    return {
      product,
      label: product,
      fullName: product,
      description: 'Atmospheric Doppler radar observation data',
      unit: '',
      source: 'India Meteorological Department (IMD)',
      sourceAttribution: 'IMD Doppler Weather Radar Network',
      status: 'UNAVAILABLE',
      available: false,
      message: 'UNAVAILABLE — NO VERIFIED FREE PUBLIC SOURCE',
      reason: err?.message || 'Network request failed or radar server offline',
    };
  }
}
