#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Atmospheric Parcel Thermodynamics & Sounding Profile Calculations
====================================================================
"""

import math
from typing import Dict, Any, List, Optional


class AtmosphericThermodynamics:
    """
    Atmospheric sounding parcel theory, lapse rates, and potential temperatures.
    """

    # Physical constants
    RD = 287.058   # Gas constant for dry air (J/(kg*K))
    RV = 461.5     # Gas constant for water vapor (J/(kg*K))
    CP = 1005.0    # Specific heat of dry air at constant pressure (J/(kg*K))
    EPSILON = RD / RV  # ~0.622
    P0 = 1000.0    # Reference pressure in hPa
    GAMMA_D = 9.8  # Dry adiabatic lapse rate (K/km)

    @classmethod
    def potential_temperature(cls, temp_c: float, pressure_hpa: float) -> float:
        """
        Calculates Potential Temperature theta (K) via Poisson's equation.
        """
        tk = temp_c + 273.15
        if pressure_hpa <= 0:
            return tk
        theta = tk * ((cls.P0 / pressure_hpa) ** (cls.RD / cls.CP))
        return round(theta, 2)

    @classmethod
    def virtual_temperature(cls, temp_c: float, pressure_hpa: float, relative_humidity: float) -> float:
        """
        Calculates Virtual Temperature T_v (°C).
        Virtual temperature accounts for the buoyancy effect of moisture.
        """
        tk = temp_c + 273.15
        es = 6.112 * math.exp((17.67 * temp_c) / (temp_c + 243.5))
        e = es * (max(0.0, min(100.0, relative_humidity)) / 100.0)
        
        # Mixing ratio w ≈ 0.622 * e / (p - e)
        denom = max(1.0, pressure_hpa - e)
        w = cls.EPSILON * (e / denom)
        
        tv_k = tk * (1.0 + 0.61 * w)
        return round(tv_k - 273.15, 2)

    @classmethod
    def equivalent_potential_temperature(cls, temp_c: float, pressure_hpa: float, relative_humidity: float) -> float:
        """
        Calculates Equivalent Potential Temperature theta_e (K) using Bolton's (1980) formula.
        Fundamental metric for convective instability during Indian monsoon.
        """
        tk = temp_c + 273.15
        es = 6.112 * math.exp((17.67 * temp_c) / (temp_c + 243.5))
        e = es * (max(0.01, min(100.0, relative_humidity)) / 100.0)
        
        # Mixing ratio in g/kg
        w = 1000.0 * cls.EPSILON * (e / max(1.0, pressure_hpa - e))
        
        # Dew point
        alpha = ((17.27 * temp_c) / (237.7 + temp_c)) + math.log(max(0.001, relative_humidity / 100.0))
        td = (237.7 * alpha) / (17.27 - alpha)
        td_k = td + 273.15
        
        # Temperature at LCL (Bolton 1980)
        t_lcl = (1.0 / ((1.0 / (td_k - 56.0)) + (math.log(tk / td_k) / 800.0))) + 56.0
        
        # Potential temperature
        theta_m = tk * ((1000.0 / pressure_hpa) ** (0.2854 * (1.0 - 0.28 * 1e-3 * w)))
        
        theta_e = theta_m * math.exp(((3376.0 / t_lcl) - 2.54) * (w * 1e-3) * (1.0 + 0.81 * 1e-3 * w))
        return round(theta_e, 2)

    @classmethod
    def moist_adiabatic_lapse_rate(cls, temp_c: float, pressure_hpa: float) -> float:
        """
        Calculates Moist (Saturated) Adiabatic Lapse Rate Gamma_s in K/km.
        Varies from ~4 K/km in warm tropical monsoon air to ~9 K/km in cold upper troposphere.
        """
        tk = temp_c + 273.15
        es = 6.112 * math.exp((17.67 * temp_c) / (temp_c + 243.5))
        lv = 2.501e6 - 2370.0 * temp_c  # Latent heat of vaporization (J/kg)
        
        # Saturation mixing ratio r_s
        rs = cls.EPSILON * (es / max(1.0, pressure_hpa - es))
        
        num = 1.0 + ((lv * rs) / (cls.RD * tk))
        den = 1.0 + ((lv * lv * rs * cls.EPSILON) / (cls.CP * cls.RD * tk * tk))
        
        gamma_s = cls.GAMMA_D * (num / den)
        return round(gamma_s, 2)
