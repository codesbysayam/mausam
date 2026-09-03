export interface RadarStation {
  id: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  band: string;
  rangeKm: number;
  model: string;
  imdCode?: string;
}

// Operational IMD Doppler Weather Radars (DWR) across India with verified IMD image codes
export const IMD_DOPPLER_RADAR_NETWORK: RadarStation[] = [
  { id: 'DWR_BBI', city: 'Bhubaneswar / Gopalpur', state: 'Odisha', lat: 20.2961, lng: 85.8245, band: 'S-Band Dual-Polarization Doppler', rangeKm: 250, model: 'EEC/ISRO DWR', imdCode: 'gop' },
  { id: 'DWR_PDP', city: 'Paradip', state: 'Odisha', lat: 20.3164, lng: 86.6114, band: 'S-Band Dual-Polarization Doppler', rangeKm: 250, model: 'ISRO S-Band DWR', imdCode: 'pdp' },
  { id: 'DWR_GPL', city: 'Gopalpur', state: 'Odisha', lat: 19.2612, lng: 84.9089, band: 'S-Band Doppler Radar', rangeKm: 250, model: 'IMD S-Band', imdCode: 'gop' },
  { id: 'DWR_KOL', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'EEC S-Band', imdCode: 'kol' },
  { id: 'DWR_DEL', city: 'New Delhi (Palam / Mausam Bhawan)', state: 'Delhi', lat: 28.5851, lng: 77.0864, band: 'C-Band / S-Band Dual-Pol', rangeKm: 250, model: 'Selex METEOR 1500C', imdCode: 'delhi' },
  { id: 'DWR_MUM', city: 'Mumbai (Colaba / Veravali)', state: 'Maharashtra', lat: 18.9067, lng: 72.8147, band: 'S-Band Dual-Polarization', rangeKm: 250, model: 'ISRO DWR', imdCode: 'mum' },
  { id: 'DWR_CHN', city: 'Chennai (Port)', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'ISRO S-Band', imdCode: 'cni' },
  { id: 'DWR_HYD', city: 'Hyderabad (Begumpet)', state: 'Telangana', lat: 17.4531, lng: 78.4677, band: 'C-Band Dual-Pol Doppler', rangeKm: 250, model: 'BEL DWR', imdCode: 'hyd' },
  { id: 'DWR_BLR', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, band: 'C-Band Doppler', rangeKm: 250, model: 'BEL DWR' },
  { id: 'DWR_PAT', city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'ptn' },
  { id: 'DWR_NAG', city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'ISRO S-Band', imdCode: 'ngp' },
  { id: 'DWR_JAI', city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, band: 'S-Band Doppler', rangeKm: 250, model: 'EEC DWR', imdCode: 'jpr' },
  { id: 'DWR_VSK', city: 'Visakhapatnam (Dolphin Nose)', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'vsk' },
  { id: 'DWR_MCH', city: 'Machilipatnam', state: 'Andhra Pradesh', lat: 16.1875, lng: 81.1389, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'mpt' },
  { id: 'DWR_KOC', city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, band: 'C-Band Dual-Pol Doppler', rangeKm: 250, model: 'BEL DWR', imdCode: 'koc' },
  { id: 'DWR_BHP', city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, band: 'S-Band Doppler', rangeKm: 250, model: 'BEL DWR', imdCode: 'bhp' },
  { id: 'DWR_SRI', city: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973, band: 'X-Band Doppler Radar', rangeKm: 100, model: 'ISRO DWR', imdCode: 'srn' },
  { id: 'DWR_AGT', city: 'Agartala', state: 'Tripura', lat: 23.8315, lng: 91.2868, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'agt' },
  { id: 'DWR_MOH', city: 'Mohanbari / Dibrugarh', state: 'Assam', lat: 27.4728, lng: 94.9120, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'mbr' },
  { id: 'DWR_GOA', city: 'Goa (Panaji)', state: 'Goa', lat: 15.4909, lng: 73.8278, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'goa' },
  { id: 'DWR_LKN', city: 'Lucknow (Amausi)', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'lkn' },
  { id: 'DWR_MRT', city: 'Mukteshwar', state: 'Uttarakhand', lat: 29.4722, lng: 79.6472, band: 'C-Band Doppler', rangeKm: 150, model: 'BEL DWR', imdCode: 'mks' },
  { id: 'DWR_SHL', city: 'Sohra / Cherrapunji', state: 'Meghalaya', lat: 25.2986, lng: 91.5822, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'cpj' },
  { id: 'DWR_TVM', city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366, band: 'C-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'tvm' },
  { id: 'DWR_BHJ', city: 'Bhuj', state: 'Gujarat', lat: 23.2420, lng: 69.6669, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'bhj' },
  { id: 'DWR_SLP', city: 'Solapur', state: 'Maharashtra', lat: 17.6599, lng: 75.9064, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'slp' },
  { id: 'DWR_PTL', city: 'Patiala', state: 'Punjab', lat: 30.3398, lng: 76.3869, band: 'C-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'ptl' },
  { id: 'DWR_LEH', city: 'Leh', state: 'Ladakh', lat: 34.1526, lng: 77.5771, band: 'X-Band Doppler', rangeKm: 100, model: 'ISRO DWR', imdCode: 'leh' },
  { id: 'DWR_JMU', city: 'Jammu', state: 'Jammu and Kashmir', lat: 32.7266, lng: 74.8570, band: 'X-Band Doppler', rangeKm: 100, model: 'ISRO DWR', imdCode: 'jmu' },
  { id: 'DWR_TEZ', city: 'Tezpur', state: 'Assam', lat: 26.6528, lng: 92.7926, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'tez' },
  { id: 'DWR_SHR', city: 'Sriharikota', state: 'Andhra Pradesh', lat: 13.7259, lng: 80.2266, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'shr' },
  { id: 'DWR_RPR', city: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lng: 81.6296, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'rpr' },
  { id: 'DWR_MLR', city: 'Mangaluru', state: 'Karnataka', lat: 12.9141, lng: 74.8560, band: 'C-Band Doppler', rangeKm: 250, model: 'ISRO DWR', imdCode: 'mlr' },
];

export const RADAR_PRODUCT_CONFIG = {
  MAXZ: {
    label: 'MAX Z',
    fullName: 'MAX(Z) Maximum Reflectivity Composite',
    description: 'Column-maximum radar reflectivity (0–65+ dBZ) indicating deep convective cores, precipitation intensity, and hail potential.',
    unit: 'dBZ',
    filePrefixes: ['caz_', 'max_'],
    source: 'India Meteorological Department (IMD)',
    elevationAngle: 'Volumetric Maximum',
    scaleMin: -10,
    scaleMax: 70,
  },
  PPZ: {
    label: 'PPZ / Reflectivity',
    fullName: 'PPI (Plan Position Indicator) Reflectivity (Z)',
    description: 'Low-elevation (0.5°) conical radar scan detecting surface hydrometeor precipitation echoes across the surveillance radius.',
    unit: 'dBZ',
    filePrefixes: ['ppz_', 'ppi_'],
    source: 'India Meteorological Department (IMD)',
    elevationAngle: '0.5° Base Tilt',
    scaleMin: -10,
    scaleMax: 70,
  },
  PPV: {
    label: 'PPV / Velocity',
    fullName: 'PPI Radial Doppler Hydrometeor Velocity (V)',
    description: 'Mean radial velocity of precipitation particles relative to the antenna. Cool/Green shades indicate motion towards radar (inbound); Warm/Red shades indicate motion away (outbound).',
    unit: 'm/s',
    filePrefixes: ['ppv_'],
    source: 'India Meteorological Department (IMD)',
    elevationAngle: '0.5° Velocity Cut',
    scaleMin: -48,
    scaleMax: 48,
  },
  SRI: {
    label: 'SRI / Rainfall Intensity',
    fullName: 'Surface Rainfall Intensity (SRI)',
    description: 'Instantaneous ground-level rainfall rate derived via calibrated Marshall-Palmer Z-R reflectivity relations.',
    unit: 'mm/hr',
    filePrefixes: ['sri_'],
    source: 'India Meteorological Department (IMD)',
    elevationAngle: 'Surface Projection',
    scaleMin: 0,
    scaleMax: 100,
  },
  PAC: {
    label: 'PAC / Accumulation',
    fullName: 'Precipitation Accumulation (PAC)',
    description: 'Integrated rainfall volume accumulated over the operational radar surveillance cycle.',
    unit: 'mm',
    filePrefixes: ['pac_'],
    source: 'India Meteorological Department (IMD)',
    elevationAngle: 'Integrated Column',
    scaleMin: 0,
    scaleMax: 150,
  },
  VVP2: {
    label: 'VVP2 / Wind',
    fullName: 'Volume Velocity Processing (VVP2) Wind Profile',
    description: 'Vertical profile of horizontal wind vectors, boundary layer shear, and steering currents derived from multi-elevation Doppler volume scans.',
    unit: 'm/s vs Alt',
    filePrefixes: ['vp2_', 'vvp2_', 'vvp_'],
    source: 'India Meteorological Department (IMD)',
    elevationAngle: 'Multi-Tilt Volume',
    scaleMin: 0,
    scaleMax: 60,
  },
} as const;

/**
 * Normalizes station identifier (e.g. DWR-MUM, DWR_MUM, Mumbai, mum) to official IMD radar filename code.
 */
export function getImdStationCode(stationIdentifier: string): string | null {
  if (!stationIdentifier) return null;
  const clean = stationIdentifier.trim().toLowerCase().replace(/[-_]/g, '');

  const directMap: Record<string, string> = {
    dwrmum: 'mum',
    mum: 'mum',
    mumbai: 'mum',
    colaba: 'mum',
    veravali: 'vrv',
    dwrvrv: 'vrv',
    dwrdel: 'delhi',
    del: 'delhi',
    delhi: 'delhi',
    palam: 'delhi',
    aya: 'aya',
    ayanagar: 'aya',
    dwrkol: 'kol',
    kol: 'kol',
    kolkata: 'kol',
    dwrchn: 'cni',
    chn: 'cni',
    cni: 'cni',
    chennai: 'cni',
    dwrhyd: 'hyd',
    hyd: 'hyd',
    hyderabad: 'hyd',
    begumpet: 'hyd',
    dwrgop: 'gop',
    dwrgpl: 'gop',
    gop: 'gop',
    gopalpur: 'gop',
    dwrpdr: 'pdp',
    dwrpdp: 'pdp',
    pdp: 'pdp',
    paradip: 'pdp',
    dwrbbi: 'gop',
    bhubaneswar: 'gop',
    dwrpat: 'ptn',
    dwrptn: 'ptn',
    pat: 'ptn',
    patna: 'ptn',
    dwrnag: 'ngp',
    dwrngp: 'ngp',
    nag: 'ngp',
    nagpur: 'ngp',
    dwrjai: 'jpr',
    dwrjpr: 'jpr',
    jai: 'jpr',
    jaipur: 'jpr',
    dwrvsk: 'vsk',
    vsk: 'vsk',
    visakhapatnam: 'vsk',
    vizag: 'vsk',
    dwrmch: 'mpt',
    dwrmpt: 'mpt',
    mpt: 'mpt',
    machilipatnam: 'mpt',
    dwrkoc: 'koc',
    koc: 'koc',
    kochi: 'koc',
    cochin: 'koc',
    dwrbhp: 'bhp',
    bhp: 'bhp',
    bhopal: 'bhp',
    dwrsri: 'srn',
    dwrsrn: 'srn',
    sri: 'srn',
    srinagar: 'srn',
    dwragt: 'agt',
    agt: 'agt',
    agartala: 'agt',
    dwrmoh: 'mbr',
    dwrmbr: 'mbr',
    mbr: 'mbr',
    mohanbari: 'mbr',
    dibrugarh: 'mbr',
    dwrgoa: 'goa',
    goa: 'goa',
    panaji: 'goa',
    dwrlkn: 'lkn',
    lkn: 'lkn',
    lucknow: 'lkn',
    dwrmrt: 'mks',
    dwrmks: 'mks',
    mks: 'mks',
    mukteshwar: 'mks',
    dwrshl: 'cpj',
    dwrcpj: 'cpj',
    cpj: 'cpj',
    sohra: 'cpj',
    cherrapunji: 'cpj',
    shillong: 'cpj',
    dwrtvm: 'tvm',
    tvm: 'tvm',
    thiruvananthapuram: 'tvm',
    trivandrum: 'tvm',
    dwrbhj: 'bhj',
    bhj: 'bhj',
    bhuj: 'bhj',
    dwrslp: 'slp',
    slp: 'slp',
    solapur: 'slp',
    dwrptl: 'ptl',
    ptl: 'ptl',
    patiala: 'ptl',
    dwrleh: 'leh',
    leh: 'leh',
    dwrjmu: 'jmu',
    jmu: 'jmu',
    jammu: 'jmu',
    dwrtez: 'tez',
    tez: 'tez',
    tezpur: 'tez',
    dwrshr: 'shr',
    shr: 'shr',
    sriharikota: 'shr',
    dwrrpr: 'rpr',
    rpr: 'rpr',
    raipur: 'rpr',
    dwrmlr: 'mlr',
    mlr: 'mlr',
    mangaluru: 'mlr',
    mangalore: 'mlr',
    kufri: 'kuf',
    kuf: 'kuf',
    jot: 'jot',
    murari: 'mur',
    mur: 'mur',
    surkandaji: 'sur',
    sur: 'sur',
    lansdowne: 'ldn',
    ldn: 'ldn',
    sambalpur: 'sbp',
    sbp: 'sbp',
    belonia: 'bln',
    bln: 'bln',
  };

  if (directMap[clean]) return directMap[clean];

  // Try finding in array
  const found = IMD_DOPPLER_RADAR_NETWORK.find(
    (s) =>
      s.id.toLowerCase().replace(/[-_]/g, '') === clean ||
      s.city.toLowerCase().includes(stationIdentifier.toLowerCase()) ||
      (s.imdCode && s.imdCode.toLowerCase() === clean)
  );

  return found?.imdCode || null;
}

export function findNearestRadarStation(lat: number, lon: number): {
  station: RadarStation;
  distanceKm: number;
  isWithinCoverage: boolean;
} {
  const R = 6371; // Earth radius in km
  let nearest = IMD_DOPPLER_RADAR_NETWORK[0];
  let minDistance = Infinity;

  for (const radar of IMD_DOPPLER_RADAR_NETWORK) {
    const dLat = ((radar.lat - lat) * Math.PI) / 180;
    const dLon = ((radar.lng - lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((radar.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.round(R * c * 10) / 10;

    if (dist < minDistance) {
      minDistance = dist;
      nearest = radar;
    }
  }

  return {
    station: nearest,
    distanceKm: minDistance,
    isWithinCoverage: minDistance <= nearest.rangeKm,
  };
}
