/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * C Scientific Computing Engine: 2D Spatial & Grid Interpolation
 * ====================================================================
 */

#ifndef MAUSAM_SPATIAL_INTERPOLATION_H
#define MAUSAM_SPATIAL_INTERPOLATION_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double latitude;
    double longitude;
    double value;
} MausamPointObservation;

/**
 * Calculates great-circle Haversine distance in kilometers between two coordinates.
 */
double mausam_haversine_distance_km(double lat1, double lon1, double lat2, double lon2);

/**
 * Performs Inverse Distance Weighting (IDW) interpolation for target coordinate
 * based on a network of station observations.
 * 
 * target_lat, target_lon: Query location coordinates
 * stations: Array of observed station values
 * num_stations: Number of observing stations
 * power: Distance decay parameter (typically 2.0)
 * max_radius_km: Search radius threshold in kilometers (0.0 for unlimited)
 * out_interpolated: Pointer to receive interpolated scalar value
 * 
 * Returns 0 on success, non-zero if no stations found within radius.
 */
int mausam_idw_interpolate_point(
    double target_lat,
    double target_lon,
    const MausamPointObservation *stations,
    size_t num_stations,
    double power,
    double max_radius_km,
    double *out_interpolated
);

/**
 * Interpolates an irregular station network onto a regular 2D grid
 * (e.g. for radar reflectivity grid or heat wave contouring).
 */
int mausam_idw_grid(
    const MausamPointObservation *stations,
    size_t num_stations,
    double min_lat, double max_lat, size_t lat_steps,
    double min_lon, double max_lon, size_t lon_steps,
    double power,
    double *out_grid
);

#ifdef __cplusplus
}
#endif

#endif /* MAUSAM_SPATIAL_INTERPOLATION_H */
