export type RadarProductType = 'MAXZ' | 'PPZ' | 'PPV' | 'SRI' | 'PAC' | 'VVP2' | 'PVV';

export type RadarDataStatus = 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE' | 'LOADING' | 'ERROR';

export interface RadarProductMetadata {
  product: RadarProductType;
  label: string;
  fullName: string;
  description: string;
  unit: string;
  source: string;
  sourceAttribution: string;
  status: RadarDataStatus;
  available: boolean;
  observed?: string | null;
  observedFormatted?: string | null;
  imageUrl?: string | null;
  tileUrl?: string | null;
  directUrl?: string | null;
  isFallback?: boolean;
  message?: string;
  reason?: string;
  rangeKm?: number;
  elevationAngle?: string;
  stationId?: string;
  stationName?: string;
}

export interface RadarStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  band: string;
  maxRangeKm: number;
  state?: string;
  elevationM?: number;
  frequencyGhz?: number;
  isCoastal?: boolean;
  status?: 'Operational' | 'Calibrating';
  surroundingPlaces?: { name: string; distKm: number; azimuthDeg: number; isWater?: boolean }[];
}

export interface RadarProduct {
  type: RadarProductType;
  timestamp: string;
  imageUrl?: string;
  tileUrl?: string;
  data?: unknown;
}

export interface RadarSweepParameters {
  scanFrequencyMin: number;
  elevationAngles: string;
  beamWidthDeg: number;
  pulseWidthUs: number;
  azimuthResolutionDeg: number;
  unambiguousRangeKm: number;
  maxVelocityMs: number;
}
