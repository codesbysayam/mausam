import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LocationRecord, CurrentWeather } from '../../types';
import { 
  Sun, 
  Sunrise, 
  Sunset, 
  Clock, 
  Compass, 
  Globe2, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  Timer, 
  CheckCircle2, 
  SunMedium
} from 'lucide-react';
import { calculateSolarEphemeris, SolarEphemeris } from '../../utils/solarCalculator';

interface SolarDynamicsProps {
  location: LocationRecord;
  weather?: CurrentWeather;
}

interface FetchedSolarData {
  sunriseIso: string;
  sunsetIso: string;
  solarNoonIso: string;
  dayLengthSeconds: number;
  civilTwilightBegin: string;
  civilTwilightEnd: string;
  source: 'API_REALTIME' | 'NOAA_ALGORITHM';
  fetchedAt: Date;
}

export const SolarDynamics: React.FC<SolarDynamicsProps> = ({
  location,
  weather,
}) => {
  const lat = typeof location.lat === 'number' ? location.lat : 20.2961;
  const lng = typeof location.lng === 'number' ? location.lng : 85.8245;

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [fetchedData, setFetchedData] = useState<FetchedSolarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastFetchError, setLastFetchError] = useState<string | null>(null);

  // Real-time ticking clock for seconds countdown and solar position
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real-time solar data from public astronomical API
  const fetchRealtimeSolarData = useCallback(async () => {
    setIsLoading(true);
    setLastFetchError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      // Free public astronomical solar endpoint (WGS-84 coordinates)
      const res = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&formatted=0`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.status === 'OK' && json.results) {
        setFetchedData({
          sunriseIso: json.results.sunrise,
          sunsetIso: json.results.sunset,
          solarNoonIso: json.results.solar_noon,
          dayLengthSeconds: json.results.day_length,
          civilTwilightBegin: json.results.civil_twilight_begin,
          civilTwilightEnd: json.results.civil_twilight_end,
          source: 'API_REALTIME',
          fetchedAt: new Date(),
        });
      } else {
        throw new Error(json.status || 'Invalid response');
      }
    } catch (err: any) {
      // Graceful fallback to precision NOAA ephemeris mathematical model
      setLastFetchError(err.message || 'Network fallback to NOAA');
      setFetchedData({
        sunriseIso: '',
        sunsetIso: '',
        solarNoonIso: '',
        dayLengthSeconds: 0,
        civilTwilightBegin: '',
        civilTwilightEnd: '',
        source: 'NOAA_ALGORITHM',
        fetchedAt: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [lat, lng]);

  // Fetch whenever coordinates change
  useEffect(() => {
    fetchRealtimeSolarData();
  }, [fetchRealtimeSolarData]);

  // Calculate local NOAA mathematical solar ephemeris as baseline & real-time position
  const noaaEphemeris: SolarEphemeris = useMemo(() => {
    return calculateSolarEphemeris(lat, lng, currentTime);
  }, [lat, lng, currentTime]);

  // Format real-time API time in Indian Standard Time / Local Time
  const formatTimeStr = (isoString?: string, fallbackStr?: string): string => {
    if (isoString) {
      try {
        const d = new Date(isoString);
        if (!isNaN(d.getTime())) {
          return new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata',
          }).format(d);
        }
      } catch {
        // use fallback
      }
    }
    return fallbackStr || '--:--';
  };

  // Determine final times
  const sunriseTimeDisplay = useMemo(() => {
    if (fetchedData?.source === 'API_REALTIME' && fetchedData.sunriseIso) {
      return formatTimeStr(fetchedData.sunriseIso, noaaEphemeris.sunriseStr);
    }
    return weather?.sunrise || noaaEphemeris.sunriseStr;
  }, [fetchedData, noaaEphemeris, weather]);

  const sunsetTimeDisplay = useMemo(() => {
    if (fetchedData?.source === 'API_REALTIME' && fetchedData.sunsetIso) {
      return formatTimeStr(fetchedData.sunsetIso, noaaEphemeris.sunsetStr);
    }
    return weather?.sunset || noaaEphemeris.sunsetStr;
  }, [fetchedData, noaaEphemeris, weather]);

  const solarNoonTimeDisplay = useMemo(() => {
    if (fetchedData?.source === 'API_REALTIME' && fetchedData.solarNoonIso) {
      return formatTimeStr(fetchedData.solarNoonIso, noaaEphemeris.solarNoonStr);
    }
    return weather?.solarNoon || noaaEphemeris.solarNoonStr;
  }, [fetchedData, noaaEphemeris, weather]);

  const dayLengthDisplay = useMemo(() => {
    if (fetchedData?.source === 'API_REALTIME' && fetchedData.dayLengthSeconds) {
      const hrs = Math.floor(fetchedData.dayLengthSeconds / 3600);
      const mins = Math.floor((fetchedData.dayLengthSeconds % 3600) / 60);
      return `${hrs}h ${mins}m`;
    }
    return weather?.dayLength || noaaEphemeris.dayLengthStr;
  }, [fetchedData, noaaEphemeris, weather]);

  const civilDawnDisplay = useMemo(() => {
    if (fetchedData?.source === 'API_REALTIME' && fetchedData.civilTwilightBegin) {
      return formatTimeStr(fetchedData.civilTwilightBegin, noaaEphemeris.civilDawnStr);
    }
    return noaaEphemeris.civilDawnStr;
  }, [fetchedData, noaaEphemeris]);

  const civilDuskDisplay = useMemo(() => {
    if (fetchedData?.source === 'API_REALTIME' && fetchedData.civilTwilightEnd) {
      return formatTimeStr(fetchedData.civilTwilightEnd, noaaEphemeris.civilDuskStr);
    }
    return noaaEphemeris.civilDuskStr;
  }, [fetchedData, noaaEphemeris]);

  // Solar progress percentage across the day
  const progressPercent = Math.min(100, Math.max(0, noaaEphemeris.progressPercent));
  const isDay = noaaEphemeris.isDaytime;

  // Golden hour calculation approximations
  const morningGoldenHour = `${civilDawnDisplay} – ${sunriseTimeDisplay}`;
  const eveningGoldenHour = `${sunsetTimeDisplay} – ${civilDuskDisplay}`;

  return (
    <div
      id="solar-dynamics-component"
      className="mausam-panel border border-[#162331] bg-[#0A1017] rounded-xl p-4 sm:p-6 flex flex-col gap-5 shadow-lg relative overflow-hidden"
    >
      {/* Background Solar Radial Glow */}
      <div 
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: isDay
            ? 'radial-gradient(circle, #F1C40F 0%, rgba(241,196,15,0) 70%)'
            : 'radial-gradient(circle, #1499E8 0%, rgba(20,153,232,0) 70%)'
        }}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#162331] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F1C40F]/15 border border-[#F1C40F]/30 flex items-center justify-center text-[#F1C40F] shrink-0">
            <Sun className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#F4F7FA] uppercase tracking-tight">
                Solar Dynamics &amp; Ephemeris
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1499E8]/15 text-[#43C7F4] border border-[#1499E8]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#43C7F4] animate-ping" />
                REAL-TIME DATA
              </span>
            </div>
            <p className="text-xs text-[#93A4B8] flex items-center gap-1.5 mt-0.5">
              <Globe2 className="w-3.5 h-3.5 text-[#1499E8]" />
              <span>
                Coordinates: <strong className="text-[#D1DCE8] font-mono">{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</strong>
              </span>
              <span>•</span>
              <span>{location.city || location.name}</span>
            </p>
          </div>
        </div>

        {/* Live Status & Refresh Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#111C27] border border-[#162331] text-[#8A94A6] flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#22C7A0]" />
            <span>
              {fetchedData?.source === 'API_REALTIME' ? 'ASTRONOMICAL API' : 'NOAA EPHEMERIS'}
            </span>
          </div>

          <button
            type="button"
            onClick={fetchRealtimeSolarData}
            disabled={isLoading}
            className="p-1.5 rounded-md bg-[#111C27] hover:bg-[#162331] border border-[#162331] text-[#93A4B8] hover:text-[#F4F7FA] transition-colors"
            title="Refresh solar astronomical data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#43C7F4]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Three Primary Highlight Metrics: Sunrise, Solar Noon, Sunset */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 relative z-10">
        {/* 1. Sunrise */}
        <div className="mausam-panel-subtle bg-[#111C27]/90 border border-[#162331] rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-[#F1C40F]/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F39C12]/15 border border-[#F39C12]/30 flex items-center justify-center text-[#F39C12] shrink-0">
              <Sunrise className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider block">
                Sunrise
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#F4F7FA] tracking-tight">
                {sunriseTimeDisplay}
              </span>
            </div>
          </div>
          <div className="text-right text-[10px] text-[#8A94A6]">
            <span>Dawn</span>
            <span className="block font-mono text-[#D1DCE8]">{civilDawnDisplay}</span>
          </div>
        </div>

        {/* 2. Solar Noon (Peak Sun Elevation) */}
        <div className="mausam-panel-subtle bg-[#111C27]/90 border border-[#162331] rounded-xl p-3.5 flex items-center justify-between gap-3 border-[#F1C40F]/25 bg-[#F1C40F]/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F1C40F]/20 border border-[#F1C40F]/40 flex items-center justify-center text-[#F1C40F] shrink-0 shadow-sm">
              <SunMedium className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#F1C40F] uppercase tracking-wider block">
                  Solar Noon
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F1C40F]/20 text-[#F1C40F] font-semibold">
                  ZENITH
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#F4F7FA] tracking-tight">
                {solarNoonTimeDisplay}
              </span>
            </div>
          </div>
          <div className="text-right text-[10px] text-[#8A94A6]">
            <span>Elevation</span>
            <span className="block font-mono text-[#F1C40F] font-bold">
              {noaaEphemeris.solarElevationDeg > 0 ? `+${noaaEphemeris.solarElevationDeg.toFixed(1)}°` : `${noaaEphemeris.solarElevationDeg.toFixed(1)}°`}
            </span>
          </div>
        </div>

        {/* 3. Sunset */}
        <div className="mausam-panel-subtle bg-[#111C27]/90 border border-[#162331] rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-[#E67E22]/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E67E22]/15 border border-[#E67E22]/30 flex items-center justify-center text-[#E67E22] shrink-0">
              <Sunset className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider block">
                Sunset
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#F4F7FA] tracking-tight">
                {sunsetTimeDisplay}
              </span>
            </div>
          </div>
          <div className="text-right text-[10px] text-[#8A94A6]">
            <span>Dusk</span>
            <span className="block font-mono text-[#D1DCE8]">{civilDuskDisplay}</span>
          </div>
        </div>
      </div>

      {/* Visual Solar Arc & Daylight Progress Tracker */}
      <div className="bg-[#111C27] border border-[#162331] rounded-xl p-4 sm:p-5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#43C7F4]" />
            <span className="text-xs font-bold text-[#D1DCE8] uppercase tracking-wider">
              {noaaEphemeris.nextEventName} Countdown
            </span>
            <span className="text-xs font-mono font-bold text-[#43C7F4] bg-[#1499E8]/15 px-2 py-0.5 rounded border border-[#1499E8]/30">
              {noaaEphemeris.countdownFormatted}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#93A4B8]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F1C40F]" />
              Daylight: <strong className="text-[#F4F7FA] font-mono">{dayLengthDisplay}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#1499E8]" />
              Azimuth: <strong className="text-[#F4F7FA] font-mono">{noaaEphemeris.solarAzimuthDeg.toFixed(1)}°</strong>
            </span>
          </div>
        </div>

        {/* Daylight Arc & Linear Progress Bar */}
        <div className="space-y-2">
          <div className="relative w-full h-3 bg-[#0A1017] rounded-full overflow-hidden border border-[#162331]">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: isDay
                  ? 'linear-gradient(90deg, #F39C12 0%, #F1C40F 50%, #E67E22 100%)'
                  : 'linear-gradient(90deg, #1499E8 0%, #22C7A0 100%)',
              }}
            />
            {/* Live Sun Marker */}
            {isDay && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#F1C40F] shadow-lg shadow-[#F1C40F]/60 -ml-2 transition-all duration-1000"
                style={{ left: `${progressPercent}%` }}
                title={`Sun position: ${progressPercent.toFixed(1)}% of daylight elapsed`}
              />
            )}
          </div>

          <div className="flex justify-between text-[11px] font-mono text-[#8A94A6] pt-1">
            <span>Sunrise: {sunriseTimeDisplay}</span>
            <span className="text-[#F1C40F] font-semibold">Zenith: {solarNoonTimeDisplay}</span>
            <span>Sunset: {sunsetTimeDisplay}</span>
          </div>
        </div>
      </div>

      {/* Secondary Astronomical Ephemeris Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs relative z-10">
        <div className="bg-[#111C27]/70 border border-[#162331] rounded-lg p-2.5">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Solar Altitude</span>
          <span className="text-sm font-bold font-mono text-[#F4F7FA]">
            {noaaEphemeris.solarElevationDeg.toFixed(2)}°
          </span>
          <span className="text-[10px] text-[#93A4B8] block mt-0.5">
            {isDay ? 'Above Horizon' : 'Below Horizon'}
          </span>
        </div>

        <div className="bg-[#111C27]/70 border border-[#162331] rounded-lg p-2.5">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Solar Azimuth</span>
          <span className="text-sm font-bold font-mono text-[#F4F7FA]">
            {noaaEphemeris.solarAzimuthDeg.toFixed(1)}°
          </span>
          <span className="text-[10px] text-[#93A4B8] block mt-0.5">
            {noaaEphemeris.solarAzimuthDeg >= 0 && noaaEphemeris.solarAzimuthDeg < 90
              ? 'Northeast'
              : noaaEphemeris.solarAzimuthDeg >= 90 && noaaEphemeris.solarAzimuthDeg < 180
              ? 'Southeast'
              : noaaEphemeris.solarAzimuthDeg >= 180 && noaaEphemeris.solarAzimuthDeg < 270
              ? 'Southwest'
              : 'Northwest'}
          </span>
        </div>

        <div className="bg-[#111C27]/70 border border-[#162331] rounded-lg p-2.5">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Morning Golden Hour</span>
          <span className="text-xs font-bold font-mono text-[#F39C12] block">
            {civilDawnDisplay} – {sunriseTimeDisplay}
          </span>
          <span className="text-[10px] text-[#93A4B8] block mt-0.5">
            Soft Warm Daylight
          </span>
        </div>

        <div className="bg-[#111C27]/70 border border-[#162331] rounded-lg p-2.5">
          <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">Evening Golden Hour</span>
          <span className="text-xs font-bold font-mono text-[#E67E22] block">
            {sunsetTimeDisplay} – {civilDuskDisplay}
          </span>
          <span className="text-[10px] text-[#93A4B8] block mt-0.5">
            Civil Dusk Twilight
          </span>
        </div>
      </div>
    </div>
  );
};
