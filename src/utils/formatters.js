/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * High-Performance Atmospheric Unit & Date Formatters
 * ====================================================================
 */

/**
 * Formats Celsius temperature with degree symbol.
 * @param {number|null|undefined} temp
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatTemperature(temp, decimals = 0) {
  if (temp === null || temp === undefined || isNaN(temp)) return "--°C";
  return `${Number(temp).toFixed(decimals)}°C`;
}

/**
 * Formats pressure with unit (hPa).
 * @param {number|null|undefined} hpa
 * @returns {string}
 */
export function formatPressure(hpa) {
  if (hpa === null || hpa === undefined || isNaN(hpa)) return "-- hPa";
  return `${Math.round(hpa)} hPa`;
}

/**
 * Formats wind speed and direction into standard meteorological readout.
 * @param {number|null|undefined} speedKmh
 * @param {number|null|undefined} dirDeg
 * @returns {string}
 */
export function formatWind(speedKmh, dirDeg) {
  if (speedKmh === null || speedKmh === undefined || isNaN(speedKmh)) return "-- km/h";
  const speedStr = `${Math.round(speedKmh)} km/h`;
  if (dirDeg === null || dirDeg === undefined || isNaN(dirDeg)) return speedStr;

  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(((dirDeg % 360) / 22.5)) % 16;
  return `${speedStr} ${directions[index]} (${Math.round(dirDeg)}°)`;
}

/**
 * Formats rainfall accumulation in millimeters.
 * @param {number|null|undefined} mm
 * @returns {string}
 */
export function formatRainfall(mm) {
  if (mm === null || mm === undefined || isNaN(mm)) return "0.0 mm";
  return `${Number(mm).toFixed(1)} mm`;
}

/**
 * Formats UTC or ISO timestamp into Indian Standard Time (IST, UTC+5:30).
 * @param {string|Date} dateInput
 * @param {boolean} [includeSeconds=false]
 * @returns {string}
 */
export function formatISTDateTime(dateInput, includeSeconds = false) {
  if (!dateInput) return "--:-- IST";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "--:-- IST";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: true
  }).format(d);
}

/**
 * Formats Air Quality Index with color and advisory severity.
 * @param {number} aqi
 * @returns {{ category: string, colorClass: string, badgeBg: string }}
 */
export function formatAQIClass(aqi) {
  if (aqi <= 50) return { category: "Good", colorClass: "text-emerald-400", badgeBg: "bg-emerald-500/10 border-emerald-500/30" };
  if (aqi <= 100) return { category: "Satisfactory", colorClass: "text-lime-400", badgeBg: "bg-lime-500/10 border-lime-500/30" };
  if (aqi <= 200) return { category: "Moderate", colorClass: "text-amber-400", badgeBg: "bg-amber-500/10 border-amber-500/30" };
  if (aqi <= 300) return { category: "Poor", colorClass: "text-orange-400", badgeBg: "bg-orange-500/10 border-orange-500/30" };
  if (aqi <= 400) return { category: "Very Poor", colorClass: "text-red-400", badgeBg: "bg-red-500/10 border-red-500/30" };
  return { category: "Severe", colorClass: "text-rose-600", badgeBg: "bg-rose-950/30 border-rose-600/40" };
}
