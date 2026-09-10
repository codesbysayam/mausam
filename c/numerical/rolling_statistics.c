/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * Implementation: Rolling Statistics & Outlier Filtering in C
 * ====================================================================
 */

#include "../include/rolling_statistics.h"
#include <math.h>

int mausam_calculate_summary_stats(const double *data, size_t length, MausamSummaryStats *out_stats) {
    if (!data || length == 0 || !out_stats) {
        return -1;
    }

    double count = 0.0;
    double mean = 0.0;
    double M2 = 0.0;
    double min_val = data[0];
    double max_val = data[0];

    /* Welford's algorithm for numerically stable online variance calculation */
    for (size_t i = 0; i < length; ++i) {
        double x = data[i];
        count += 1.0;
        double delta = x - mean;
        mean += delta / count;
        double delta2 = x - mean;
        M2 += delta * delta2;

        if (x < min_val) min_val = x;
        if (x > max_val) max_val = x;
    }

    out_stats->count = length;
    out_stats->mean = mean;
    out_stats->min_val = min_val;
    out_stats->max_val = max_val;

    if (length > 1) {
        out_stats->variance = M2 / (count - 1.0);
        out_stats->std_dev = sqrt(out_stats->variance);
    } else {
        out_stats->variance = 0.0;
        out_stats->std_dev = 0.0;
    }

    return 0;
}

int mausam_rolling_mean(const double *data, size_t n, size_t window, double *out) {
    if (!data || !out || window == 0 || window > n) {
        return -1;
    }

    /* Initial window sum */
    double current_sum = 0.0;
    for (size_t i = 0; i < window; ++i) {
        current_sum += data[i];
    }

    size_t out_count = n - window + 1;
    out[0] = current_sum / (double)window;

    /* Sliding window updates in O(1) per step */
    for (size_t i = 1; i < out_count; ++i) {
        current_sum += data[i + window - 1] - data[i - 1];
        out[i] = current_sum / (double)window;
    }

    return 0;
}

int mausam_exponential_moving_average(const double *data, size_t n, double alpha, double *out) {
    if (!data || !out || n == 0 || alpha <= 0.0 || alpha > 1.0) {
        return -1;
    }

    out[0] = data[0];
    for (size_t i = 1; i < n; ++i) {
        out[i] = (alpha * data[i]) + ((1.0 - alpha) * out[i - 1]);
    }

    return 0;
}

int mausam_clip_sensor_outliers(double *values, size_t n, double z_threshold, size_t *replaced_count) {
    if (!values || n < 3 || z_threshold <= 0.0) {
        if (replaced_count) *replaced_count = 0;
        return -1;
    }

    MausamSummaryStats stats;
    if (mausam_calculate_summary_stats(values, n, &stats) != 0) {
        return -1;
    }

    size_t replaced = 0;
    if (stats.std_dev <= 1e-6) {
        if (replaced_count) *replaced_count = 0;
        return 0;
    }

    double lower_bound = stats.mean - (z_threshold * stats.std_dev);
    double upper_bound = stats.mean + (z_threshold * stats.std_dev);

    for (size_t i = 0; i < n; ++i) {
        if (values[i] < lower_bound) {
            values[i] = lower_bound;
            replaced++;
        } else if (values[i] > upper_bound) {
            values[i] = upper_bound;
            replaced++;
        }
    }

    if (replaced_count) {
        *replaced_count = replaced;
    }

    return 0;
}
