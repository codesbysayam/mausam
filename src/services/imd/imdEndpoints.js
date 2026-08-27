/**
 * Central IMD API Endpoint Configuration
 * Reference: https://api.imd.gov.in/api/v1
 */

export const IMD_ENDPOINTS = {
  cityForecast: '/cityforecast',
  cityForecastLocation: '/cityforecastloc',
  currentWeather: '/current_wx',
  districtNowcast: '/districtnowcast',
  stationNowcast: '/stationnowcast',
  districtRainfall: '/districtrainfall',
  districtWarning: '/districtwarning',
  stateRainfall: '/staterainfall',
  subdivisionWarning: '/subdivisionwarning',
  sunMoon: '/sunmoon',
  awsData: '/aws_data',
  awsMapping: '/aws_data_mapping',
  basinQPF: '/basinqpf',
  portWarning: '/portwarning',
  seaBulletin: '/seabulletin',
  coastalBulletin: '/coastalbulletin',
  subdivisionRainfallForecast: '/subdivision_rainfall_forecast',
  stateDistrictRainfallForecast: '/state_district_rainfall_forecast',
  cycloneTrack: '/cyclone_track',
  cycloneWind: '/cyclone_wind',
  cycloneCone: '/cyclone_cou',
};

export default IMD_ENDPOINTS;
