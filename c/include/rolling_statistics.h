/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * C Scientific Computing Engine: High-Performance Rolling Statistics
 * ====================================================================
 */

#ifndef MAUSAM_ROLLING_STATISTICS_H
#define MAUSAM_ROLLING_STATISTICS_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double mean;
    double variance;
    double std_dev;
    double min_val;
    double max_val;
    size_t count;
} MausamSummaryStats;

/**
 * Computes descriptive statistics for an array of meteorological observations
 * using Welford's algorithm for numerically stable variance calculation.
 */
int mausam_calculate_summary_stats(const double *data, size_t length, MausamSummaryStats *out_stats);

/**
 * Computes centered or backward rolling moving average for time-series array.
 * data: Input array of length n
 * n: Number of elements
 * window: Sliding window size (must be >= 1 and <= n)
 * out: Pre-allocated buffer of length (n - window + 1)
 */
int mausam_rolling_mean(const double *data, size_t n, size_t window, double *out);

/**
 * Computes Exponential Moving Average (EMA) on atmospheric time series.
 * alpha: Smoothing factor between 0.0 and 1.0 (typically 2 / (window + 1))
 * out: Pre-allocated buffer of length n
 */
int mausam_exponential_moving_average(const double *data, size_t n, double alpha, double *out);

/**
 * Clips atmospheric sensor outliers based on dynamic interquartile range or z-score thresholds.
 * values: input/output array modified in-place
 * n: length of array
 * z_threshold: standard deviations (e.g., 3.5)
 * replaced_count: output count of replaced outlier values
 */
int mausam_clip_sensor_outliers(double *values, size_t n, double z_threshold, size_t *replaced_count);

#ifdef __cplusplus
}
#endif

#endif /* MAUSAM_ROLLING_STATISTICS_H */
