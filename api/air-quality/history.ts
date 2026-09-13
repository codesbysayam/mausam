import { sendJson } from '../helpers';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const query = Object.fromEntries(urlObj.searchParams.entries());

    let lat = parseFloat(query.lat || query.latitude || '20.2961');
    let lon = parseFloat(query.lon || query.lng || query.longitude || '85.8245');
    if (isNaN(lat)) lat = 20.2961;
    if (isNaN(lon)) lon = 85.8245;

    const locationName = query.location || query.city || query.state || 'Selected Location';
    const targetDateStr = query.date || query.end || new Date().toISOString().split('T')[0];
    const targetDate = new Date(`${targetDateStr}T00:00:00`);
    const validEndDate = isNaN(targetDate.getTime()) ? new Date() : targetDate;
    const endDateStr = validEndDate.toISOString().split('T')[0];

    let startDateStr = query.start;
    if (!startDateStr) {
      const startD = new Date(validEndDate);
      startD.setDate(startD.getDate() - 6);
      startDateStr = startD.toISOString().split('T')[0];
    }

    const airHistoryUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,grass_pollen,birch_pollen,alder_pollen,ragweed_pollen,mugwort_pollen,olive_pollen&timezone=Asia%2FKolkata`;

    const response = await fetch(airHistoryUrl, {
      headers: { 'User-Agent': 'Mausam-AirQuality-Proxy/1.0' },
    });

    if (!response.ok) {
      return sendJson(res, response.status, {
        status: 'error',
        error: `Upstream air quality history returned HTTP ${response.status}`,
      });
    }

    const data = await response.json();
    return sendJson(res, 200, {
      status: 'success',
      source: 'Open-Meteo Air Quality & CPCB Calibration Engine',
      location: locationName,
      coordinates: { lat, lon },
      data,
    });
  } catch (err: any) {
    return sendJson(res, 500, {
      status: 'error',
      error: err.message || 'Failed to fetch air quality history',
    });
  }
}
