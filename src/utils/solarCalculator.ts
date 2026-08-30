/**
 * Solar Astronomical Ephemeris & Timer Calculator
 * Computes exact sunrise, sunset, solar noon, daylight duration,
 * solar elevation, azimuth, and real-time countdown timers
 * based on NOAA Solar Position Equations.
 */

export interface SolarEphemeris {
  sunriseDate: Date;
  sunsetDate: Date;
  solarNoonDate: Date;
  civilDawnDate: Date;
  civilDuskDate: Date;
  sunriseStr: string;
  sunsetStr: string;
  solarNoonStr: string;
  civilDawnStr: string;
  civilDuskStr: string;
  dayLengthStr: string;
  dayLengthMinutes: number;
  solarElevationDeg: number;
  solarAzimuthDeg: number;
  isDaytime: boolean;
  progressPercent: number;
  nextEvent: 'sunrise' | 'sunset' | 'next_sunrise';
  nextEventName: string;
  nextEventTimeStr: string;
  secondsToNextEvent: number;
  countdownFormatted: string; // e.g. "04h 23m 15s"
}

// Convert degrees to radians and vice versa
const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Calculates day of year (1-366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Calculate solar times for a given lat, lng, and date
 */
export function calculateSolarEphemeris(
  lat: number = 20.2961,
  lng: number = 85.8245,
  now: Date = new Date()
): SolarEphemeris {
  const dayOfYear = getDayOfYear(now);
  const year = now.getFullYear();

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (now.getUTCHours() - 12) / 24);

  // Equation of time in minutes
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination angle in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  // Solar zenith for standard sunrise/sunset = 90.833° (accounting for atmospheric refraction)
  const zenithSunrise = degToRad(90.833);
  const zenithCivilTwilight = degToRad(96.0);

  const latRad = degToRad(lat);

  // Hour angle calculation: cos(ha) = (cos(zenith) - sin(lat)*sin(decl)) / (cos(lat)*cos(decl))
  const cosHaSunrise =
    (Math.cos(zenithSunrise) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));

  const cosHaDawn =
    (Math.cos(zenithCivilTwilight) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));

  // Clamp to [-1, 1] to prevent NaN near poles
  const clampedCosHa = Math.max(-1, Math.min(1, cosHaSunrise));
  const haSunriseRad = Math.acos(clampedCosHa);
  const haSunriseDeg = radToDeg(haSunriseRad);

  const clampedCosDawn = Math.max(-1, Math.min(1, cosHaDawn));
  const haDawnDeg = radToDeg(Math.acos(clampedCosDawn));

  // Solar noon in UTC minutes from midnight: 720 - 4*lng - eqtime
  const solarNoonUtcMinutes = 720 - 4 * lng - eqtime;
  const sunriseUtcMinutes = solarNoonUtcMinutes - haSunriseDeg * 4;
  const sunsetUtcMinutes = solarNoonUtcMinutes + haSunriseDeg * 4;
  const civilDawnUtcMinutes = solarNoonUtcMinutes - haDawnDeg * 4;
  const civilDuskUtcMinutes = solarNoonUtcMinutes + haDawnDeg * 4;

  // Build Date objects for today's UTC midnight
  const midnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

  const sunriseDate = new Date(midnightUtc.getTime() + sunriseUtcMinutes * 60000);
  const sunsetDate = new Date(midnightUtc.getTime() + sunsetUtcMinutes * 60000);
  const solarNoonDate = new Date(midnightUtc.getTime() + solarNoonUtcMinutes * 60000);
  const civilDawnDate = new Date(midnightUtc.getTime() + civilDawnUtcMinutes * 60000);
  const civilDuskDate = new Date(midnightUtc.getTime() + civilDuskUtcMinutes * 60000);

  // Next day's sunrise (approx +24h with slight day-of-year adjustment)
  const nextSunriseDate = new Date(sunriseDate.getTime() + 24 * 60 * 60 * 1000);

  // Format strings in local station time (Asia/Kolkata default for India or local Intl)
  const isIndia = lat >= 6 && lat <= 38 && lng >= 68 && lng <= 98;
  const timeZone = isIndia ? 'Asia/Kolkata' : undefined;

  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const sunriseStr = timeFormatter.format(sunriseDate);
  const sunsetStr = timeFormatter.format(sunsetDate);
  const solarNoonStr = timeFormatter.format(solarNoonDate);
  const civilDawnStr = timeFormatter.format(civilDawnDate);
  const civilDuskStr = timeFormatter.format(civilDuskDate);

  // Day length calculation
  const dayLengthMs = Math.max(0, sunsetDate.getTime() - sunriseDate.getTime());
  const dayLengthMinutes = Math.round(dayLengthMs / 60000);
  const dayHours = Math.floor(dayLengthMinutes / 60);
  const dayMins = dayLengthMinutes % 60;
  const dayLengthStr = `${dayHours}h ${dayMins}m`;

  // Determine current position in cycle and countdown
  const nowMs = now.getTime();
  const sunriseMs = sunriseDate.getTime();
  const sunsetMs = sunsetDate.getTime();

  let isDaytime = false;
  let progressPercent = 0;
  let nextEvent: 'sunrise' | 'sunset' | 'next_sunrise' = 'sunrise';
  let nextEventName = 'Sunrise';
  let nextEventTimeStr = sunriseStr;
  let targetMs = sunriseMs;

  if (nowMs < sunriseMs) {
    // Pre-dawn
    isDaytime = false;
    progressPercent = 0;
    nextEvent = 'sunrise';
    nextEventName = 'Sunrise';
    nextEventTimeStr = sunriseStr;
    targetMs = sunriseMs;
  } else if (nowMs >= sunriseMs && nowMs <= sunsetMs) {
    // Daytime
    isDaytime = true;
    const elapsed = nowMs - sunriseMs;
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / dayLengthMs) * 100)));
    nextEvent = 'sunset';
    nextEventName = 'Sunset';
    nextEventTimeStr = sunsetStr;
    targetMs = sunsetMs;
  } else {
    // Post-sunset / night
    isDaytime = false;
    progressPercent = 100;
    nextEvent = 'next_sunrise';
    nextEventName = 'Next Sunrise';
    nextEventTimeStr = timeFormatter.format(nextSunriseDate);
    targetMs = nextSunriseDate.getTime();
  }

  const diffMs = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(diffMs / 1000);
  const remHours = Math.floor(totalSeconds / 3600);
  const remMins = Math.floor((totalSeconds % 3600) / 60);
  const remSecs = totalSeconds % 60;

  const countdownFormatted = `${String(remHours).padStart(2, '0')}h ${String(remMins).padStart(2, '0')}m ${String(remSecs).padStart(2, '0')}s`;

  // Approximate solar elevation & azimuth
  const currentUtcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60;
  const trueSolarTimeMin = (currentUtcMinutes + 4 * lng + eqtime) % 1440;
  const hourAngleDeg = (trueSolarTimeMin / 4) - 180;
  const hourAngleRad = degToRad(hourAngleDeg);

  // Solar zenith angle cos(zenith) = sin(lat)*sin(decl) + cos(lat)*cos(decl)*cos(ha)
  const cosZenith =
    Math.sin(latRad) * Math.sin(decl) +
    Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngleRad);
  const zenithRad = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  const solarElevationDeg = Math.round((90 - radToDeg(zenithRad)) * 10) / 10;

  // Solar azimuth angle
  const cosAzimuth =
    (Math.sin(decl) - Math.sin(latRad) * Math.cos(zenithRad)) /
    (Math.cos(latRad) * Math.sin(zenithRad));
  let azimuthDeg = radToDeg(Math.acos(Math.max(-1, Math.min(1, cosAzimuth))));
  if (hourAngleDeg > 0) {
    azimuthDeg = 360 - azimuthDeg;
  }
  const solarAzimuthDeg = Math.round(azimuthDeg * 10) / 10;

  return {
    sunriseDate,
    sunsetDate,
    solarNoonDate,
    civilDawnDate,
    civilDuskDate,
    sunriseStr,
    sunsetStr,
    solarNoonStr,
    civilDawnStr,
    civilDuskStr,
    dayLengthStr,
    dayLengthMinutes,
    solarElevationDeg,
    solarAzimuthDeg,
    isDaytime,
    progressPercent,
    nextEvent,
    nextEventName,
    nextEventTimeStr,
    secondsToNextEvent: totalSeconds,
    countdownFormatted,
  };
}
