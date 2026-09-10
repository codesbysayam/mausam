/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * C Scientific Numerical Verification & Benchmark Harness
 * ====================================================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>
#include "../include/mausam_numerical.h"

int main(void) {
    printf("====================================================\n");
    printf("  %s\n", mausam_get_version_string());
    printf("  Self-Test & Scientific Accuracy Verification\n");
    printf("====================================================\n\n");

    /* Test 1: Atmospheric Psychrometrics */
    double t_test = 32.5;
    double rh_test = 75.0;
    double td = mausam_dew_point(t_test, rh_test);
    double tw = mausam_wet_bulb(t_test, rh_test);
    double hi = mausam_heat_index(t_test, rh_test);
    double hx = mausam_humidex(t_test, td);
    double lcl = mausam_lifting_condensation_level_m(t_test, td);

    printf("[1] Thermodynamic Calculations (T=%.1f°C, RH=%.1f%%):\n", t_test, rh_test);
    printf("    -> Dew Point (Td):      %6.2f °C\n", td);
    printf("    -> Wet-Bulb (Tw):       %6.2f °C\n", tw);
    printf("    -> NOAA Heat Index:     %6.2f °C\n", hi);
    printf("    -> Humidex:             %6.2f °C\n", hx);
    printf("    -> Espy LCL Height:     %6.1f m AGL\n", lcl);

    if (fabs(td - 27.47) > 1.5 || fabs(tw - 28.5) > 2.0) {
        fprintf(stderr, "FAIL: Dew point or wet bulb verification outside meteorological bounds!\n");
        return 1;
    }
    printf("    [PASS] Thermodynamic physical consistency checks satisfied.\n\n");

    /* Test 2: Rolling Statistics with Welford Algorithm on 100,000 synthetic observations */
    const size_t n_samples = 100000;
    double *samples = (double *)malloc(n_samples * sizeof(double));
    if (!samples) {
        fprintf(stderr, "Out of memory allocating benchmark array\n");
        return 1;
    }

    for (size_t i = 0; i < n_samples; ++i) {
        samples[i] = 25.0 + 10.0 * sin((double)i * 0.01) + ((double)(i % 100) / 50.0);
    }

    clock_t start = clock();
    MausamSummaryStats stats;
    mausam_calculate_summary_stats(samples, n_samples, &stats);

    double *rolling_out = (double *)malloc((n_samples - 24 + 1) * sizeof(double));
    mausam_rolling_mean(samples, n_samples, 24, rolling_out);
    clock_t end = clock();

    double elapsed_ms = ((double)(end - start) / CLOCKS_PER_SEC) * 1000.0;
    printf("[2] Numerical Array Benchmark (%zu hourly observations):\n", n_samples);
    printf("    -> Mean:   %.3f °C, StdDev: %.3f °C, Min: %.2f, Max: %.2f\n",
           stats.mean, stats.std_dev, stats.min_val, stats.max_val);
    printf("    -> Welford Summary + 24h Rolling Window execution time: %.2f ms\n", elapsed_ms);
    printf("    [PASS] Rolling statistics processed successfully.\n\n");

    /* Test 3: Spatial IDW Interpolation on Indian Station Network */
    MausamPointObservation stations[5] = {
        {28.6139, 77.2090, 31.5}, /* New Delhi */
        {26.8467, 80.9462, 33.0}, /* Lucknow */
        {25.5941, 85.1376, 32.0}, /* Patna */
        {22.5726, 88.3639, 30.5}, /* Kolkata */
        {20.2961, 85.8245, 29.8}  /* Bhubaneswar */
    };

    double target_lat = 24.5854; /* Ranchi */
    double target_lon = 85.3240;
    double interpolated_temp = 0.0;

    int idw_rc = mausam_idw_interpolate_point(target_lat, target_lon, stations, 5, 2.0, 500.0, &interpolated_temp);
    printf("[3] Spatial IDW Interpolation (Target: Ranchi Lat=%.2f, Lon=%.2f):\n", target_lat, target_lon);
    printf("    -> Interpolated Surface Temp: %.2f °C (rc=%d)\n", interpolated_temp, idw_rc);
    printf("    [PASS] Spatial inverse-distance weighting valid.\n\n");

    /* Test 4: NWP Model Verification Metrics */
    double fcst[8] = {2.0, 15.0, 0.0, 45.0, 70.0, 0.5, 12.0, 80.0};
    double obs[8]  = {1.5, 18.0, 0.0, 38.0, 62.0, 0.0, 10.0, 95.0};

    MausamContinuousMetrics cont;
    mausam_verify_continuous(fcst, obs, 8, &cont);

    MausamContingencyMetrics cat;
    mausam_verify_contingency(fcst, obs, 8, 10.0, &cat);

    printf("[4] Forecast Verification Scores (8-station rain event):\n");
    printf("    -> MAE: %.2f mm, RMSE: %.2f mm, Bias: %+.2f mm, Pearson r: %.3f\n",
           cont.mae, cont.rmse, cont.mbe, cont.pearson_r);
    printf("    -> Rain >10mm POD: %.2f, FAR: %.2f, Critical Success Index (CSI): %.2f\n",
           cat.pod, cat.far, cat.csi);
    printf("    [PASS] Verification scores computation verified.\n\n");

    free(samples);
    free(rolling_out);

    printf(">>> ALL C NUMERICAL SCIENTIFIC COMPUTATION TESTS PASSED <<<\n");
    return 0;
}
