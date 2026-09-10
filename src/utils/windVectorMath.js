/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * Wind Vector Decomposition & Streamline Particle Dynamics
 * ====================================================================
 */

/**
 * Decomposes meteorological wind speed and direction into Cartesian u (zonal, West-East)
 * and v (meridional, South-North) vectors in meters per second.
 * Note: Meteorological direction is where the wind originates (0° = North, 90° = East).
 * @param {number} speedKmh
 * @param {number} dirDeg
 * @returns {{ u: number, v: number, speedMs: number }}
 */
export function decomposeWindVector(speedKmh, dirDeg) {
  const speedMs = (speedKmh || 0) / 3.6;
  const rad = ((270.0 - (dirDeg || 0)) * Math.PI) / 180.0;

  const u = speedMs * Math.cos(rad);
  const v = speedMs * Math.sin(rad);

  return {
    u: Number(u.toFixed(2)),
    v: Number(v.toFixed(2)),
    speedMs: Number(speedMs.toFixed(2))
  };
}

/**
 * Reconstructs wind speed (km/h) and meteorological direction (degrees) from (u, v) vectors.
 * @param {number} u
 * @param {number} v
 * @returns {{ speedKmh: number, directionDeg: number }}
 */
export function reconstructWindVector(u, v) {
  const speedMs = Math.hypot(u, v);
  const speedKmh = speedMs * 3.6;

  let angleRad = Math.atan2(-u, -v);
  let dirDeg = (angleRad * 180.0) / Math.PI;
  if (dirDeg < 0) dirDeg += 360.0;

  return {
    speedKmh: Number(speedKmh.toFixed(1)),
    directionDeg: Number(dirDeg.toFixed(1))
  };
}

/**
 * Computes true wind from ship or mobile weather station's course, speed, and apparent wind.
 * Essential for marine AWS on Indian coastal patrol and research vessels (ORV Sagar Nidhi).
 * @param {number} vesselSpeedKmh
 * @param {number} vesselCourseDeg
 * @param {number} appWindSpeedKmh
 * @param {number} appWindDirDeg
 * @returns {{ trueSpeedKmh: number, trueDirectionDeg: number }}
 */
export function calculateTrueWind(vesselSpeedKmh, vesselCourseDeg, appWindSpeedKmh, appWindDirDeg) {
  const vessel = decomposeWindVector(vesselSpeedKmh, vesselCourseDeg);
  const app = decomposeWindVector(appWindSpeedKmh, appWindDirDeg);

  // True wind vector is apparent wind minus vessel velocity
  const trueU = app.u - vessel.u;
  const trueV = app.v - vessel.v;

  return reconstructWindVector(trueU, trueV);
}
