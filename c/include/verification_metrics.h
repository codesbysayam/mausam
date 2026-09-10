/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * C Scientific Computing Engine: NWP Forecast Verification & Accuracy Metrics
 * ====================================================================
 */

#ifndef MAUSAM_VERIFICATION_METRICS_H
#define MAUSAM_VERIFICATION_METRICS_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    double mae;                /* Mean Absolute Error */
    double rmse;               /* Root Mean Square Error */
    double mbe;                /* Mean Bias Error (Forecast - Observed) */
    double pearson_r;          /* Pearson Correlation Coefficient */
    double max_error;          /* Maximum absolute discrepancy */
    size_t sample_count;
} MausamContinuousMetrics;

typedef struct {
    size_t hits;               /* Event forecasted, event observed */
    size_t false_alarms;       /* Event forecasted, event NOT observed */
    size_t misses;             /* Event NOT forecasted, event observed */
    size_t correct_negatives;  /* Event NOT forecasted, event NOT observed */
    double pod;                /* Probability of Detection: H / (H + M) */
    double far;                /* False Alarm Ratio: FA / (H + FA) */
    double csi;                /* Critical Success Index: H / (H + FA + M) */
    double bias_score;         /* Frequency Bias: (H + FA) / (H + M) */
    double hss;                /* Heidke Skill Score */
} MausamContingencyMetrics;

/**
 * Computes continuous statistical verification scores (RMSE, MAE, Bias, Pearson r)
 * between forecast predictions and observed ground truths.
 */
int mausam_verify_continuous(
    const double *forecasts,
    const double *observations,
    size_t length,
    MausamContinuousMetrics *out_metrics
);

/**
 * Computes 2x2 dichotomous categorical contingency verification for rain or storm thresholds.
 * threshold: e.g., 2.5 mm for rain event, 64.5 mm for heavy rain.
 */
int mausam_verify_contingency(
    const double *forecasts,
    const double *observations,
    size_t length,
    double threshold,
    MausamContingencyMetrics *out_metrics
);

#ifdef __cplusplus
}
#endif

#endif /* MAUSAM_VERIFICATION_METRICS_H */
