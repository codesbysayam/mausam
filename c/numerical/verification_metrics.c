/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * Implementation: NWP Model Verification & Statistical Error in C
 * ====================================================================
 */

#include "../include/verification_metrics.h"
#include <math.h>

int mausam_verify_continuous(
    const double *forecasts,
    const double *observations,
    size_t length,
    MausamContinuousMetrics *out_metrics
) {
    if (!forecasts || !observations || length == 0 || !out_metrics) {
        return -1;
    }

    double sum_abs_err = 0.0;
    double sum_sq_err = 0.0;
    double sum_bias = 0.0;
    double max_err = 0.0;

    double sum_f = 0.0;
    double sum_o = 0.0;

    for (size_t i = 0; i < length; ++i) {
        double f = forecasts[i];
        double o = observations[i];
        double err = f - o;
        double abs_err = fabs(err);

        sum_abs_err += abs_err;
        sum_sq_err += err * err;
        sum_bias += err;
        if (abs_err > max_err) max_err = abs_err;

        sum_f += f;
        sum_o += o;
    }

    double mean_f = sum_f / (double)length;
    double mean_o = sum_o / (double)length;

    /* Pearson correlation r calculation */
    double numerator = 0.0;
    double denom_f = 0.0;
    double denom_o = 0.0;

    for (size_t i = 0; i < length; ++i) {
        double df = forecasts[i] - mean_f;
        double do_obs = observations[i] - mean_o;
        numerator += df * do_obs;
        denom_f += df * df;
        denom_o += do_obs * do_obs;
    }

    double pearson_r = 0.0;
    double denom = sqrt(denom_f * denom_o);
    if (denom > 1e-12) {
        pearson_r = numerator / denom;
    }

    out_metrics->sample_count = length;
    out_metrics->mae = sum_abs_err / (double)length;
    out_metrics->rmse = sqrt(sum_sq_err / (double)length);
    out_metrics->mbe = sum_bias / (double)length;
    out_metrics->max_error = max_err;
    out_metrics->pearson_r = pearson_r;

    return 0;
}

int mausam_verify_contingency(
    const double *forecasts,
    const double *observations,
    size_t length,
    double threshold,
    MausamContingencyMetrics *out_metrics
) {
    if (!forecasts || !observations || length == 0 || !out_metrics) {
        return -1;
    }

    size_t h = 0;   /* Hits */
    size_t fa = 0;  /* False Alarms */
    size_t m = 0;   /* Misses */
    size_t cn = 0;  /* Correct Negatives */

    for (size_t i = 0; i < length; ++i) {
        int f_event = (forecasts[i] >= threshold);
        int o_event = (observations[i] >= threshold);

        if (f_event && o_event) h++;
        else if (f_event && !o_event) fa++;
        else if (!f_event && o_event) m++;
        else cn++;
    }

    out_metrics->hits = h;
    out_metrics->false_alarms = fa;
    out_metrics->misses = m;
    out_metrics->correct_negatives = cn;

    /* Probability of Detection: POD = H / (H + M) */
    out_metrics->pod = (h + m > 0) ? (double)h / (double)(h + m) : 0.0;

    /* False Alarm Ratio: FAR = FA / (H + FA) */
    out_metrics->far = (h + fa > 0) ? (double)fa / (double)(h + fa) : 0.0;

    /* Critical Success Index (Threat Score): CSI = H / (H + FA + M) */
    out_metrics->csi = (h + fa + m > 0) ? (double)h / (double)(h + fa + m) : 0.0;

    /* Frequency Bias: (H + FA) / (H + M) */
    out_metrics->bias_score = (h + m > 0) ? (double)(h + fa) / (double)(h + m) : 1.0;

    /* Heidke Skill Score: HSS = 2*(H*CN - FA*M) / ((H+M)*(M+CN) + (H+FA)*(FA+CN)) */
    double n_total = (double)length;
    double expected_correct = ((double)(h + m) * (double)(h + fa) + (double)(fa + cn) * (double)(m + cn)) / n_total;
    double denom_hss = n_total - expected_correct;
    if (denom_hss > 1e-6) {
        out_metrics->hss = ((double)(h + cn) - expected_correct) / denom_hss;
    } else {
        out_metrics->hss = 0.0;
    }

    return 0;
}
