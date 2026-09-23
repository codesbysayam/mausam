import {
  PrecipLevelId,
  PRECIP_INTERVALS,
  WIND_INTERVALS,
} from '../components/radar/RadarMapLegendPanel';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';

export interface RadarCsvExportOptions {
  activePrecipLevels: PrecipLevelId[];
  precipUnit?: 'dBZ' | 'mm/h' | 'in/h';
  windUnit?: 'km/h' | 'kt' | 'mph';
  metricMode?: 'all' | 'precipitation' | 'wind';
  sectorName?: string;
  stationName?: string;
  timestamp?: string | number;
}

/**
 * Standard RFC 4180 CSV cell formatter.
 * Handles numbers cleanly for spreadsheets and escapes text with commas/quotes.
 */
function formatCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number') {
    if (isNaN(value)) return '';
    if (Number.isInteger(value)) return value.toString();
    // Preserve precision up to 2 decimals for values like 0.02, 0.16, 0.5
    return parseFloat(value.toFixed(2)).toString();
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  const str = String(value).trim();
  // Escape double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

function buildCsvRow(cells: (string | number | boolean | null | undefined)[]): string {
  return cells.map(formatCsvCell).join(',');
}

function getSeverityCategory(id: PrecipLevelId): string {
  switch (id) {
    case 'trace':
      return 'Non-Convective / Trace';
    case 'light':
      return 'Stratiform / Light';
    case 'moderate':
      return 'Moderate Convection';
    case 'heavy':
      return 'Deep Convective Storm Core';
    case 'intense':
      return 'Severe Squall / Cloudburst';
    case 'extreme':
      return 'Violent Convective Core / Hail';
  }
}

function getFloodRiskCategory(id: PrecipLevelId): string {
  switch (id) {
    case 'trace':
      return 'None / Minimal';
    case 'light':
      return 'Low';
    case 'moderate':
      return 'Moderate (Minor roadway pooling)';
    case 'heavy':
      return 'Elevated (Localized urban waterlogging)';
    case 'intense':
      return 'High (Severe flash flood potential)';
    case 'extreme':
      return 'Catastrophic (Flash flood & torrential runoff)';
  }
}

function getOperationalAdvisory(id: PrecipLevelId): string {
  switch (id) {
    case 'trace':
      return 'Normal operations; minimal road surface spray; no flight restrictions.';
    case 'light':
      return 'Standard precautionary operations; wet road surfaces; maintain safe stopping distance.';
    case 'moderate':
      return 'Reduced visibility; slow vehicle transit speeds; avoid open water marine recreation.';
    case 'heavy':
      return 'Flash flood watch in low-lying underpasses; avoid waterlogged roadways; active convective downdraft caution.';
    case 'intense':
      return 'Imminent flash flood danger; high risk of urban inundation; squall line with severe downdrafts; halt outdoor transit.';
    case 'extreme':
      return 'Dangerous convective core; large destructive hail and severe microbursts possible; seek solid shelter immediately.';
  }
}

/**
 * Generates an RFC 4180 compliant, UTF-8 BOM encoded CSV string
 * containing the currently filtered precipitation intensity levels,
 * calibration intervals, and matching regional synoptic observations.
 */
export function generateRadarIntensityCsv(options: RadarCsvExportOptions): string {
  const {
    activePrecipLevels,
    precipUnit = 'dBZ',
    windUnit = 'km/h',
    metricMode = 'all',
    sectorName = 'National Doppler Radar Network (India)',
    stationName,
    timestamp,
  } = options;

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const istString = istDate.toISOString().replace('T', ' ').slice(0, 19) + ' IST';
  const obsTimeStr = timestamp
    ? typeof timestamp === 'number'
      ? new Date(timestamp > 1e11 ? timestamp : timestamp * 1000).toISOString()
      : String(timestamp)
    : now.toISOString();

  const lines: string[] = [];

  // ==========================================
  // SECTION 1: METADATA & REPORT PARAMETERS
  // ==========================================
  lines.push(buildCsvRow(['# METADATA & REPORT PARAMETERS', '']));
  lines.push(buildCsvRow(['Report Title', 'MAUSAM Doppler Radar Precipitation Intensity Layer Report']));
  lines.push(buildCsvRow(['Export Timestamp (UTC)', now.toISOString()]));
  lines.push(buildCsvRow(['Export Timestamp (IST)', istString]));
  lines.push(buildCsvRow(['Observation / Frame Timestamp', obsTimeStr]));
  lines.push(
    buildCsvRow([
      'Geographic Sector / Station',
      stationName ? `${stationName} (${sectorName})` : sectorName,
    ])
  );
  lines.push(
    buildCsvRow([
      'Active Filter Summary',
      `${activePrecipLevels.length} of ${PRECIP_INTERVALS.length} Bands Active`,
    ])
  );
  lines.push(
    buildCsvRow([
      'Filter Scope',
      activePrecipLevels.length === PRECIP_INTERVALS.length
        ? 'ALL_BANDS_ACTIVE'
        : 'FILTERED_SUBSET',
    ])
  );
  const precipUnitDisplay =
    precipUnit === 'in/h'
      ? 'in/hr (Inches per hour - Imperial)'
      : precipUnit === 'mm/h'
      ? 'mm/hr (Millimeters per hour - Metric)'
      : 'dBZ (Decibels of Reflectivity)';
  const windUnitDisplay =
    windUnit === 'mph'
      ? 'mph (Miles per hour - Imperial)'
      : windUnit === 'kt'
      ? 'kt (Knots - Aviation/Nautical)'
      : 'km/h (Kilometers per hour - Metric)';

  lines.push(buildCsvRow(['Selected Precipitation Metric', precipUnitDisplay]));
  lines.push(buildCsvRow(['Selected Velocity Metric', windUnitDisplay]));
  lines.push(buildCsvRow(['Active Display Mode', metricMode.toUpperCase()]));
  lines.push(
    buildCsvRow([
      'Data Source Attribution',
      'India Meteorological Department (IMD) DWR Network & RainViewer calibrated mosaic',
    ])
  );
  lines.push(''); // blank row separator

  // ==========================================
  // SECTION 2: CURRENTLY FILTERED INTENSITY DATA
  // ==========================================
  lines.push(buildCsvRow(['# SECTION 1: CURRENTLY FILTERED PRECIPITATION INTENSITY BANDS']));
  lines.push(
    buildCsvRow([
      'Band_Index',
      'Level_ID',
      'Intensity_Classification',
      'Short_Label',
      'Filter_Status',
      'Min_Reflectivity_dBZ',
      'Max_Reflectivity_dBZ',
      'Reflectivity_Range_dBZ',
      'Min_Rainfall_Rate_mm_h',
      'Max_Rainfall_Rate_mm_h',
      'Rainfall_Rate_Range_mm_h',
      'Min_Rainfall_Rate_in_hr',
      'Max_Rainfall_Rate_in_hr',
      'Rainfall_Rate_Range_in_hr',
      'Hex_Color',
      'Convective_Core_Severity',
      'Flash_Flood_Risk_Category',
      'Meteorological_Description',
      'Operational_IMD_Advisory',
    ])
  );

  const activeIntervals = PRECIP_INTERVALS.filter((interval) =>
    activePrecipLevels.includes(interval.id)
  );

  if (activeIntervals.length === 0) {
    lines.push(
      buildCsvRow([
        'NONE',
        'NONE',
        'No active intensity bands selected (All filtered out by user)',
        '-',
        'EXCLUDED',
        0,
        0,
        '-',
        0,
        0,
        '-',
        0,
        0,
        '-',
        '#000000',
        'None',
        'None',
        'User has temporarily filtered out all precipitation layers on the map',
        'No precipitation echoes visible',
      ])
    );
  } else {
    activeIntervals.forEach((interval, idx) => {
      const severity = getSeverityCategory(interval.id);
      const floodRisk = getFloodRiskCategory(interval.id);
      const advisory = getOperationalAdvisory(interval.id);

      lines.push(
        buildCsvRow([
          idx + 1,
          interval.id,
          interval.label,
          interval.shortLabel,
          'ACTIVE_INCLUDED',
          interval.minDbz,
          interval.maxDbz,
          interval.dbzRange,
          interval.minRateMm,
          interval.maxRateMm,
          interval.rateRange,
          interval.minRateIn,
          interval.maxRateIn,
          interval.rateRangeIn,
          interval.color,
          severity,
          floodRisk,
          interval.description,
          advisory,
        ])
      );
    });
  }

  lines.push(''); // blank row separator

  // ==========================================
  // SECTION 3: EXCLUDED INTENSITY BANDS
  // ==========================================
  const excludedIntervals = PRECIP_INTERVALS.filter(
    (interval) => !activePrecipLevels.includes(interval.id)
  );
  lines.push(buildCsvRow(['# SECTION 2: EXCLUDED INTENSITY BANDS (FILTERED OUT BY USER)']));
  lines.push(
    buildCsvRow([
      'Band_Index',
      'Level_ID',
      'Intensity_Classification',
      'Short_Label',
      'Filter_Status',
      'Reflectivity_Range_dBZ',
      'Rainfall_Rate_Range_mm_h',
      'Rainfall_Rate_Range_in_hr',
      'Hex_Color',
      'Reason_For_Exclusion',
    ])
  );

  if (excludedIntervals.length === 0) {
    lines.push(
      buildCsvRow([
        'NONE',
        'NONE',
        'All 6 intensity levels are currently active (None excluded)',
        '-',
        'NONE_EXCLUDED',
        '-',
        '-',
        '-',
        '-',
        'Full radar spectrum currently displayed on map',
      ])
    );
  } else {
    excludedIntervals.forEach((interval, idx) => {
      lines.push(
        buildCsvRow([
          idx + 1,
          interval.id,
          interval.label,
          interval.shortLabel,
          'FILTERED_OUT',
          interval.dbzRange,
          interval.rateRange,
          interval.rateRangeIn,
          interval.color,
          'Toggled off by user filter in legend panel',
        ])
      );
    });
  }

  lines.push(''); // blank row separator

  // ==========================================
  // SECTION 4: MATCHING STATE SYNOPTIC WEATHER
  // ==========================================
  lines.push(
    buildCsvRow([
      '# SECTION 3: MATCHING REGIONAL STATE OBSERVATIONS (SYNOPTIC CONTEXT)',
    ])
  );
  lines.push(
    buildCsvRow([
      'State_Code',
      'State_Name',
      'Capital_Station',
      'Observed_24h_Rainfall_mm',
      'Matched_Intensity_Band',
      'Current_Weather_Condition',
      'IMD_Warning_Color',
      'IMD_Warning_Message',
      'Data_Source',
    ])
  );

  const matchingStates = INDIA_WEATHER_DATA.filter((state) => {
    const rainfall = state.rainfall ?? 0;
    if (activePrecipLevels.length === PRECIP_INTERVALS.length) return true;
    if (rainfall < 0.5) return activePrecipLevels.includes('trace');
    if (rainfall < 4) return activePrecipLevels.includes('light');
    if (rainfall < 15) return activePrecipLevels.includes('moderate');
    if (rainfall < 50) return activePrecipLevels.includes('heavy');
    if (rainfall < 100) return activePrecipLevels.includes('intense');
    return activePrecipLevels.includes('extreme');
  });

  if (matchingStates.length === 0) {
    lines.push(
      buildCsvRow([
        'NONE',
        'None',
        'N/A',
        0,
        'No match',
        'No regional state observations currently match the selected precipitation intensity filter',
        'N/A',
        'N/A',
        'IMD Synoptic Reports',
      ])
    );
  } else {
    matchingStates.forEach((state) => {
      const rf = state.rainfall ?? 0;
      let matchedLevel = 'Trace / Drizzle';
      if (rf >= 100) matchedLevel = 'Extreme / Hail (>100 mm)';
      else if (rf >= 50) matchedLevel = 'Very Heavy Rain (50–100 mm)';
      else if (rf >= 15) matchedLevel = 'Heavy Rain (15–50 mm)';
      else if (rf >= 4) matchedLevel = 'Moderate Rain (4–15 mm)';
      else if (rf >= 0.5) matchedLevel = 'Light Rain (0.5–4 mm)';

      lines.push(
        buildCsvRow([
          state.id,
          state.name,
          state.city,
          rf,
          matchedLevel,
          state.condition,
          state.warningLevel.toUpperCase(),
          state.warningMessage,
          state.dataSource,
        ])
      );
    });
  }

  // ==========================================
  // SECTION 5: WIND VELOCITY & GALE REFERENCE
  // ==========================================
  if (metricMode === 'all' || metricMode === 'wind') {
    lines.push(''); // blank row separator
    lines.push(
      buildCsvRow([
        '# SECTION 4: DOPPLER RADIAL VELOCITY & GALE WARNING SCALE REFERENCE',
      ])
    );
    lines.push(
      buildCsvRow([
        'Velocity_Band_ID',
        'Beaufort_IMD_Category',
        'Speed_Range_km_h',
        'Speed_Range_Knots',
        'Speed_Range_mph',
        'Hex_Color',
        'Impact_And_Safety_Description',
      ])
    );
    WIND_INTERVALS.forEach((item) => {
      lines.push(
        buildCsvRow([
          item.id,
          item.label,
          item.kmhRange,
          item.ktRange,
          item.mphRange,
          item.color,
          item.description,
        ])
      );
    });
  }

  // Prepend UTF-8 Byte Order Mark (\uFEFF) for immediate Excel/Sheets compatibility
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Triggers browser download of the filtered radar intensity CSV file.
 * Returns the downloaded filename.
 */
export function downloadRadarIntensityCsv(options: RadarCsvExportOptions): string {
  const csvContent = generateRadarIntensityCsv(options);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const filename = `IMD_Radar_Intensity_Filtered_${dateStr}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}
