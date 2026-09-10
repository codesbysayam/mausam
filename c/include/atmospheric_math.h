/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * C Scientific Computing Engine: Core Psychrometric & Thermodynamic Math
 * ====================================================================
 */

#ifndef MAUSAM_ATMOSPHERIC_MATH_H
#define MAUSAM_ATMOSPHERIC_MATH_H

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Calculates Saturation Vapor Pressure (e_s) in hPa given temperature in Celsius.
 * Uses the Magnus-Tetens approximation (Murray 1967 formulation).
 * Range: -40°C to +50°C.
 */
double mausam_saturation_vapor_pressure(double temp_c);

/**
 * Calculates Dew Point Temperature (T_d) in Celsius from Temperature and Relative Humidity.
 * T_c: dry-bulb temperature in °C
 * rh_percent: relative humidity in % (0.0 - 100.0)
 */
double mausam_dew_point(double temp_c, double rh_percent);

/**
 * Calculates Wet-Bulb Temperature (T_w) in Celsius using Stull's empirical formula (2011).
 * High-precision formulation valid across sea level to moderate altitudes.
 */
double mausam_wet_bulb(double temp_c, double rh_percent);

/**
 * Calculates Virtual Temperature (T_v) in Kelvin.
 * temp_c: Temperature in °C
 * pressure_hpa: Atmospheric station pressure in hPa
 * vapor_pressure_hpa: Actual vapor pressure in hPa
 */
double mausam_virtual_temperature_k(double temp_c, double pressure_hpa, double vapor_pressure_hpa);

/**
 * Calculates Potential Temperature (theta) in Kelvin.
 * Assumes Poisson's equation with p0 = 1000.0 hPa and R/cp = 0.286.
 */
double mausam_potential_temperature_k(double temp_c, double pressure_hpa);

/**
 * Calculates Lifting Condensation Level (LCL) height in meters above ground level (AGL).
 * Espy's approximation: z_lcl ≈ 125 * (T - T_d)
 */
double mausam_lifting_condensation_level_m(double temp_c, double dew_point_c);

/**
 * Calculates NOAA Heat Index in Celsius using Rothfusz regression equation.
 * Valid when T >= 27°C and RH >= 40%.
 */
double mausam_heat_index(double temp_c, double rh_percent);

/**
 * Calculates Canadian Humidex in Celsius.
 * Humidex = T + 5/9 * (e - 10) where e is vapor pressure in hPa.
 */
double mausam_humidex(double temp_c, double dew_point_c);

/**
 * Calculates Wind Chill Index in Celsius (JAG/TI standard).
 * Valid for T <= 10°C and Wind >= 4.8 km/h.
 */
double mausam_wind_chill(double temp_c, double wind_speed_kmh);

/**
 * Maps wind speed in km/h to Beaufort Scale number (0 to 12).
 */
int mausam_beaufort_number(double wind_speed_kmh);

/**
 * Converts wind speed (km/h) and meteorological direction (degrees from true north)
 * into zonal (u) and meridional (v) wind components in m/s.
 */
void mausam_wind_components(double speed_kmh, double dir_deg, double *u_ms, double *v_ms);

#ifdef __cplusplus
}
#endif

#endif /* MAUSAM_ATMOSPHERIC_MATH_H */
