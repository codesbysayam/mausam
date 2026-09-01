export interface RadarStation {
  id: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  band: string;
  rangeKm: number;
  model: string;
}

// Operational IMD Doppler Weather Radars (DWR) across India
export const IMD_DOPPLER_RADAR_NETWORK: RadarStation[] = [
  { id: 'DWR_BBI', city: 'Bhubaneswar / Paradip', state: 'Odisha', lat: 20.2961, lng: 85.8245, band: 'S-Band Dual-Polarization Doppler', rangeKm: 250, model: 'EEC/ISRO DWR' },
  { id: 'DWR_PDP', city: 'Paradip', state: 'Odisha', lat: 20.3164, lng: 86.6114, band: 'S-Band Dual-Polarization Doppler', rangeKm: 250, model: 'ISRO S-Band DWR' },
  { id: 'DWR_GPL', city: 'Gopalpur', state: 'Odisha', lat: 19.2612, lng: 84.9089, band: 'S-Band Doppler Radar', rangeKm: 250, model: 'IMD S-Band' },
  { id: 'DWR_KOL', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'EEC S-Band' },
  { id: 'DWR_DEL', city: 'New Delhi (Palam / Mausam Bhawan)', state: 'Delhi', lat: 28.5851, lng: 77.0864, band: 'C-Band / S-Band Dual-Pol', rangeKm: 250, model: 'Selex METEOR 1500C' },
  { id: 'DWR_MUM', city: 'Mumbai (Colaba / Veravali)', state: 'Maharashtra', lat: 18.9067, lng: 72.8147, band: 'S-Band Dual-Polarization', rangeKm: 250, model: 'ISRO DWR' },
  { id: 'DWR_CHN', city: 'Chennai (Port)', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'ISRO S-Band' },
  { id: 'DWR_HYD', city: 'Hyderabad (Begumpet)', state: 'Telangana', lat: 17.4531, lng: 78.4677, band: 'C-Band Dual-Pol Doppler', rangeKm: 250, model: 'BEL DWR' },
  { id: 'DWR_BLR', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, band: 'C-Band Doppler', rangeKm: 250, model: 'BEL DWR' },
  { id: 'DWR_PAT', city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'ISRO DWR' },
  { id: 'DWR_NAG', city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'ISRO S-Band' },
  { id: 'DWR_JAI', city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, band: 'S-Band Doppler', rangeKm: 250, model: 'EEC DWR' },
  { id: 'DWR_VSK', city: 'Visakhapatnam (Dolphin Nose)', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'ISRO DWR' },
  { id: 'DWR_MCH', city: 'Machilipatnam', state: 'Andhra Pradesh', lat: 16.1875, lng: 81.1389, band: 'S-Band Dual-Pol Doppler', rangeKm: 250, model: 'ISRO DWR' },
  { id: 'DWR_KOC', city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, band: 'C-Band Dual-Pol Doppler', rangeKm: 250, model: 'BEL DWR' },
  { id: 'DWR_BHP', city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, band: 'S-Band Doppler', rangeKm: 250, model: 'BEL DWR' },
  { id: 'DWR_SRI', city: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973, band: 'X-Band Doppler Radar', rangeKm: 100, model: 'ISRO DWR' },
  { id: 'DWR_AGT', city: 'Agartala', state: 'Tripura', lat: 23.8315, lng: 91.2868, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR' },
  { id: 'DWR_MOH', city: 'Mohanbari / Dibrugarh', state: 'Assam', lat: 27.4728, lng: 94.9120, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR' },
  { id: 'DWR_GOA', city: 'Goa (Panaji)', state: 'Goa', lat: 15.4909, lng: 73.8278, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR' },
  { id: 'DWR_LKN', city: 'Lucknow (Amausi)', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR' },
  { id: 'DWR_MRT', city: 'Mukteshwar', state: 'Uttarakhand', lat: 29.4722, lng: 79.6472, band: 'C-Band Doppler', rangeKm: 150, model: 'BEL DWR' },
  { id: 'DWR_SHL', city: 'Sohra / Cherrapunji', state: 'Meghalaya', lat: 25.2986, lng: 91.5822, band: 'S-Band Doppler', rangeKm: 250, model: 'ISRO DWR' },
];

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
