/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * Geodetic & Spatial Vector Utilities (JavaScript Runtime Engine)
 * ====================================================================
 */

/**
 * Calculates great-circle Haversine distance in kilometers between two geographic coordinates.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in kilometers
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0; // Earth mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180.0);
  const dLon = (lon2 - lon1) * (Math.PI / 180.0);

  const phi1 = lat1 * (Math.PI / 180.0);
  const phi2 = lat2 * (Math.PI / 180.0);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Calculates initial true compass bearing in degrees (0 - 360°) from point 1 to point 2.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Bearing in degrees
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const phi1 = lat1 * (Math.PI / 180.0);
  const phi2 = lat2 * (Math.PI / 180.0);
  const dLon = (lon2 - lon1) * (Math.PI / 180.0);

  const y = Math.sin(dLon) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);

  const theta = Math.atan2(y, x);
  const deg = (theta * 180.0) / Math.PI;
  return Number(((deg + 360.0) % 360.0).toFixed(1));
}

/**
 * Generates a bounding box [minLat, minLon, maxLat, maxLon] around a center coordinate.
 * @param {number} lat Center latitude
 * @param {number} lon Center longitude
 * @param {number} radiusKm Search radius in km
 * @returns {{ minLat: number, minLon: number, maxLat: number, maxLon: number }}
 */
export function computeBoundingBox(lat, lon, radiusKm) {
  const dLat = radiusKm / 111.0;
  const dLon = radiusKm / (111.0 * Math.cos(lat * (Math.PI / 180.0)));

  return {
    minLat: Number((lat - dLat).toFixed(4)),
    maxLat: Number((lat + dLat).toFixed(4)),
    minLon: Number((lon - dLon).toFixed(4)),
    maxLon: Number((lon + dLon).toFixed(4))
  };
}

/**
 * Approximates solar elevation and zenith angle for diurnal radiation modeling.
 * @param {number} lat
 * @param {number} dayOfYear (1 - 365)
 * @param {number} solarHour (0 - 24)
 * @returns {{ elevationDeg: number, zenithDeg: number }}
 */
export function approximateSolarZenith(lat, dayOfYear, solarHour) {
  const phi = (lat * Math.PI) / 180.0;
  const declination = 0.409 * Math.sin((2 * Math.PI * dayOfYear) / 365 - 1.39);
  const hourAngle = ((solarHour - 12) * 15 * Math.PI) / 180.0;

  const sinElevation =
    Math.sin(phi) * Math.sin(declination) +
    Math.cos(phi) * Math.cos(declination) * Math.cos(hourAngle);

  const elevationRad = Math.asin(Math.max(-1.0, Math.min(1.0, sinElevation)));
  const elevationDeg = (elevationRad * 180.0) / Math.PI;
  const zenithDeg = 90.0 - elevationDeg;

  return {
    elevationDeg: Number(elevationDeg.toFixed(2)),
    zenithDeg: Number(zenithDeg.toFixed(2))
  };
}
