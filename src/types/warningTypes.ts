export type AlertSeverity = 'red' | 'orange' | 'yellow' | 'green' | 'purple';

export type HazardCategory =
  | 'heavy_rain'
  | 'thunderstorm'
  | 'cyclone'
  | 'flood'
  | 'heatwave'
  | 'cold_wave'
  | 'dense_fog'
  | 'strong_wind'
  | 'coastal_warning'
  | 'agromet_advisory';

export type WarningValidityPeriod = 'active_now' | 'next_24h' | 'next_48h' | 'next_5d' | 'all';

export type IndiaMetRegion =
  | 'all'
  | 'north'
  | 'east'
  | 'west'
  | 'south'
  | 'central'
  | 'northeast'
  | 'coastal';

export interface ExpectedConditions {
  rainfall?: string;
  rainfallCategory?: string;
  windSpeed?: string;
  windGusts?: string;
  visibility?: string;
  temperature?: string;
  waveHeight?: string;
  lightningProbability?: string;
  pressureDrop?: string;
}

export interface WarningTimelineEvent {
  time: string;
  date: string;
  stage: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface WarningRecord {
  id: string;
  bulletinNo: string;
  title: string;
  severity: AlertSeverity;
  severityLabel: string;
  hazardCategory: HazardCategory;
  hazardLabel: string;
  hazardIcon: string;
  state: string;
  stateCode: string; // e.g. 'in-od', 'in-dl'
  subdivision: string;
  region: IndiaMetRegion;
  affectedDistricts: string[];
  affectedAreaText: string;
  issuedAt: string;
  validFrom: string;
  validUntil: string;
  validityTimestamp?: number;
  description: string;
  meteorologicalSynopsys?: string;
  impacts: string[];
  recommendedActions: string[];
  expectedConditions: ExpectedConditions;
  timeline: WarningTimelineEvent[];
  source: string;
  authorityAgency: string;
  emergencyContact: {
    title: string;
    number: string;
    description: string;
  };
  radarTrackingStation?: string;
  isRedAlert?: boolean;
}

export interface StateWarningSummary {
  stateCode: string;
  stateName: string;
  capital: string;
  highestSeverity: AlertSeverity;
  activeCount: number;
  primaryHazard: HazardCategory;
  primaryHazardLabel: string;
  representativeStation: string;
  bulletinHeadline: string;
  validityRange: string;
}

export interface WarningFilterState {
  region: IndiaMetRegion;
  state: string;
  hazard: HazardCategory | 'all';
  severity: AlertSeverity | 'all';
  validity: WarningValidityPeriod;
  searchQuery: string;
}

export interface WarningStats {
  totalActive: number;
  statesAffected: number;
  severeRed: number;
  moderateOrange: number;
  advisoryYellow: number;
  infoPurple: number;
  greenNormalStates: number;
  lastUpdatedIst: string;
}

export interface EmergencyHelpline {
  id: string;
  name: string;
  number: string;
  secondaryNumber?: string;
  description: string;
  agency: string;
  type: 'national' | 'disaster' | 'state' | 'met' | 'marine';
  isClickableTel: boolean;
  stateCode?: string;
}

export interface SafetyGuidanceCategory {
  hazard: HazardCategory;
  title: string;
  icon: string;
  summary: string;
  dos: string[];
  donts: string[];
  emergencyKitList: string[];
}
