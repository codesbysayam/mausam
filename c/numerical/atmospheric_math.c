/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * Implementation: Psychrometric & Thermodynamic Math in C
 * ====================================================================
 */

#include "../include/atmospheric_math.h"
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

double mausam_saturation_vapor_pressure(double temp_c) {
    /* Magnus-Tetens formula: e_s = 6.1078 * exp((17.27 * T) / (T + 237.3)) */
    double exponent = (17.27 * temp_c) / (temp_c + 237.3);
    return 6.1078 * exp(exponent);
}

double mausam_dew_point(double temp_c, double rh_percent) {
    if (rh_percent <= 0.0) {
        return -50.0;
    }
    if (rh_percent > 100.0) {
        rh_percent = 100.0;
    }

    const double a = 17.27;
    const double b = 237.3;
    double alpha = ((a * temp_c) / (b + temp_c)) + log(rh_percent / 100.0);
    return (b * alpha) / (a - alpha);
}

double mausam_wet_bulb(double temp_c, double rh_percent) {
    if (rh_percent < 0.0) rh_percent = 0.0;
    if (rh_percent > 100.0) rh_percent = 100.0;

    /* Roland Stull (2011) empirical psychrometric wet-bulb temperature formula:
     * Tw = T * atan(0.151977 * (rh + 8.313659)^0.5)
     *    + atan(T + rh) - atan(rh - 1.676331)
     *    + 0.00391838 * (rh^1.5) * atan(0.023101 * rh)
     *    - 4.686035
     */
    double term1 = temp_c * atan(0.151977 * sqrt(rh_percent + 8.313659));
    double term2 = atan(temp_c + rh_percent);
    double term3 = atan(rh_percent - 1.676331);
    double term4 = 0.00391838 * pow(rh_percent, 1.5) * atan(0.023101 * rh_percent);

    return term1 + term2 - term3 + term4 - 4.686035;
}

double mausam_virtual_temperature_k(double temp_c, double pressure_hpa, double vapor_pressure_hpa) {
    double temp_k = temp_c + 273.15;
    if (pressure_hpa <= 0.0) return temp_k;
    /* Tv = T * (1 + (1 - epsilon)/epsilon * (e / p)) where epsilon = 0.622, (1-eps)/eps ~ 0.378 */
    double mixing_ratio_factor = 0.378 * (vapor_pressure_hpa / pressure_hpa);
    return temp_k / (1.0 - mixing_ratio_factor);
}

double mausam_potential_temperature_k(double temp_c, double pressure_hpa) {
    double temp_k = temp_c + 273.15;
    if (pressure_hpa <= 0.0) return temp_k;
    /* Poisson's equation: theta = T * (1000 / P)^0.286 */
    return temp_k * pow(1000.0 / pressure_hpa, 0.286);
}

double mausam_lifting_condensation_level_m(double temp_c, double dew_point_c) {
    double depression = temp_c - dew_point_c;
    if (depression < 0.0) depression = 0.0;
    /* Espy's empirical constant: 125 meters per degree Celsius of dew point depression */
    return 125.0 * depression;
}

double mausam_heat_index(double temp_c, double rh_percent) {
    double temp_f = temp_c * 1.8 + 32.0;

    if (temp_f < 80.0 || rh_percent < 40.0) {
        return temp_c;
    }

    /* Rothfusz regression equation for Steadman's Heat Index */
    double c1 = -42.379;
    double c2 = 2.04901523;
    double c3 = 10.14333127;
    double c4 = -0.22475541;
    double c5 = -6.83783e-3;
    double c6 = -5.481717e-2;
    double c7 = 1.22874e-3;
    double c8 = 8.5282e-4;
    double c9 = -1.99e-6;

    double t = temp_f;
    double r = rh_percent;

    double hi_f = c1 + (c2 * t) + (c3 * r) + (c4 * t * r) +
                  (c5 * t * t) + (c6 * r * r) + (c7 * t * t * r) +
                  (c8 * t * r * r) + (c9 * t * t * r * r);

    /* Low humidity adjustment */
    if (r < 13.0 && t >= 80.0 && t <= 112.0) {
        double adj = ((13.0 - r) / 4.0) * sqrt((17.0 - fabs(t - 95.0)) / 17.0);
        hi_f -= adj;
    }
    /* High humidity adjustment */
    else if (r > 85.0 && t >= 80.0 && t <= 87.0) {
        double adj = ((r - 85.0) / 10.0) * ((87.0 - t) / 5.0);
        hi_f += adj;
    }

    return (hi_f - 32.0) / 1.8;
}

double mausam_humidex(double temp_c, double dew_point_c) {
    /* e = 6.11 * exp(5417.7530 * (1/273.16 - 1/(273.15 + Td))) */
    double kelvin_td = dew_point_c + 273.15;
    double e = 6.11 * exp(5417.7530 * ((1.0 / 273.16) - (1.0 / kelvin_td)));
    return temp_c + (5.0 / 9.0) * (e - 10.0);
}

double mausam_wind_chill(double temp_c, double wind_speed_kmh) {
    if (temp_c > 10.0 || wind_speed_kmh < 4.8) {
        return temp_c;
    }
    double v016 = pow(wind_speed_kmh, 0.16);
    return 13.12 + (0.6215 * temp_c) - (11.37 * v016) + (0.3965 * temp_c * v016);
}

int mausam_beaufort_number(double wind_speed_kmh) {
    if (wind_speed_kmh < 1.0) return 0;
    if (wind_speed_kmh < 6.0) return 1;
    if (wind_speed_kmh < 12.0) return 2;
    if (wind_speed_kmh < 20.0) return 3;
    if (wind_speed_kmh < 29.0) return 4;
    if (wind_speed_kmh < 39.0) return 5;
    if (wind_speed_kmh < 50.0) return 6;
    if (wind_speed_kmh < 62.0) return 7;
    if (wind_speed_kmh < 75.0) return 8;
    if (wind_speed_kmh < 89.0) return 9;
    if (wind_speed_kmh < 103.0) return 10;
    if (wind_speed_kmh < 118.0) return 11;
    return 12;
}

void mausam_wind_components(double speed_kmh, double dir_deg, double *u_ms, double *v_ms) {
    double speed_ms = speed_kmh / 3.6;
    /* In meteorology: 0° is North (wind from North blowing South) */
    double rad = (270.0 - dir_deg) * (M_PI / 180.0);
    *u_ms = speed_ms * cos(rad);
    *v_ms = speed_ms * sin(rad);
}
