/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * Implementation: 2D Spatial & Inverse Distance Interpolation in C
 * ====================================================================
 */

#include "../include/spatial_interpolation.h"
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

double mausam_haversine_distance_km(double lat1, double lon1, double lat2, double lon2) {
    const double r_earth_km = 6371.0;
    double dlat = (lat2 - lat1) * (M_PI / 180.0);
    double dlon = (lon2 - lon1) * (M_PI / 180.0);

    double phi1 = lat1 * (M_PI / 180.0);
    double phi2 = lat2 * (M_PI / 180.0);

    double a = sin(dlat / 2.0) * sin(dlat / 2.0) +
               cos(phi1) * cos(phi2) * sin(dlon / 2.0) * sin(dlon / 2.0);
    double c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a));

    return r_earth_km * c;
}

int mausam_idw_interpolate_point(
    double target_lat,
    double target_lon,
    const MausamPointObservation *stations,
    size_t num_stations,
    double power,
    double max_radius_km,
    double *out_interpolated
) {
    if (!stations || num_stations == 0 || !out_interpolated || power <= 0.0) {
        return -1;
    }

    double weight_sum = 0.0;
    double weighted_value_sum = 0.0;
    size_t contributing = 0;

    for (size_t i = 0; i < num_stations; ++i) {
        double dist = mausam_haversine_distance_km(
            target_lat, target_lon,
            stations[i].latitude, stations[i].longitude
        );

        /* Exact station match check (within 10 meters) */
        if (dist < 0.01) {
            *out_interpolated = stations[i].value;
            return 0;
        }

        if (max_radius_km > 0.0 && dist > max_radius_km) {
            continue;
        }

        double w = 1.0 / pow(dist, power);
        weight_sum += w;
        weighted_value_sum += w * stations[i].value;
        contributing++;
    }

    if (contributing == 0 || weight_sum <= 1e-12) {
        return -2; /* No stations within radius */
    }

    *out_interpolated = weighted_value_sum / weight_sum;
    return 0;
}

int mausam_idw_grid(
    const MausamPointObservation *stations,
    size_t num_stations,
    double min_lat, double max_lat, size_t lat_steps,
    double min_lon, double max_lon, size_t lon_steps,
    double power,
    double *out_grid
) {
    if (!stations || num_stations == 0 || !out_grid || lat_steps == 0 || lon_steps == 0) {
        return -1;
    }

    double dlat = (lat_steps > 1) ? (max_lat - min_lat) / (double)(lat_steps - 1) : 0.0;
    double dlon = (lon_steps > 1) ? (max_lon - min_lon) / (double)(lon_steps - 1) : 0.0;

    for (size_t r = 0; r < lat_steps; ++r) {
        double curr_lat = min_lat + (r * dlat);
        for (size_t c = 0; c < lon_steps; ++c) {
            double curr_lon = min_lon + (c * dlon);
            double val = 0.0;
            if (mausam_idw_interpolate_point(curr_lat, curr_lon, stations, num_stations, power, 0.0, &val) == 0) {
                out_grid[r * lon_steps + c] = val;
            } else {
                out_grid[r * lon_steps + c] = 0.0;
            }
        }
    }

    return 0;
}
