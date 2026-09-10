/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * Master C Engine Entry Point & Version Export
 * ====================================================================
 */

#include "../include/mausam_numerical.h"
#include <stdio.h>

static char g_version_str[64];

const char *mausam_get_version_string(void) {
    snprintf(
        g_version_str,
        sizeof(g_version_str),
        "MAUSAM C-Engine v%d.%d.%d (Accelerated Numerical Core)",
        MAUSAM_C_ENGINE_VERSION_MAJOR,
        MAUSAM_C_ENGINE_VERSION_MINOR,
        MAUSAM_C_ENGINE_PATCH
    );
    return g_version_str;
}
