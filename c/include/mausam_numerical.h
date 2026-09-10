/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * Master C Scientific Computing Header
 * ====================================================================
 */

#ifndef MAUSAM_NUMERICAL_H
#define MAUSAM_NUMERICAL_H

#include "atmospheric_math.h"
#include "rolling_statistics.h"
#include "spatial_interpolation.h"
#include "verification_metrics.h"

#define MAUSAM_C_ENGINE_VERSION_MAJOR 2
#define MAUSAM_C_ENGINE_VERSION_MINOR 1
#define MAUSAM_C_ENGINE_PATCH         0

#ifdef __cplusplus
extern "C" {
#endif

const char *mausam_get_version_string(void);

#ifdef __cplusplus
}
#endif

#endif /* MAUSAM_NUMERICAL_H */
