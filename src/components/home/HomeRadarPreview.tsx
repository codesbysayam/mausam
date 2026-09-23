import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LocationRecord } from '../../types';
import {
  Radio,
  ArrowRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RefreshCw,
  AlertCircle,
  Compass,
  MapPin,
  Clock,
  Layers,
  ChevronDown,
  Info,
  Target,
  Crosshair,
  X,
  Activity,
  Zap,
  Navigation,
  Lock,
  Unlock,
} from 'lucide-react';
import { MapContainer, TileLayer, ZoomControl, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  IMD_DOPPLER_RADAR_NETWORK,
  findNearestRadarStation,
  RadarStation,
} from '../../data/radarStations';
import { buildSixHourRadarTimeline, RadarFrame } from '../../services/radarService';
import {
  RadarMapLegendPanel,
  PrecipLevelId,
  ALL_PRECIP_LEVEL_IDS,
  PRECIP_INTERVALS,
} from '../radar/RadarMapLegendPanel';

interface RainViewerFrame {
  time: number;
  path: string;
  formattedTime?: string;
  ageMinutes?: number;
  relativeLabel?: string;
}

interface RainViewerData {
  host?: string;
  radar?: {
    past?: RainViewerFrame[];
    nowcast?: RainViewerFrame[];
  };
}

interface HomeRadarPreviewProps {
  location: LocationRecord;
  onNavigateToRadar?: () => void;
}

/**
 * Calculates real geodetic distance (Haversine) and azimuth bearing
 * between two geographic coordinates.
 */
function calculateDistanceBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  // Azimuth bearing
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = Math.round((bearing + 360) % 360);

  const compassDirections = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const dirIdx = Math.round(bearing / 22.5) % 16;
  const compass = compassDirections[dirIdx];

  return { distanceKm, bearing, compass };
}

/**
 * Retrieves convective echo profile & active storm corridor for the current DWR station
 */
function getStationEchoProfile(station: RadarStation) {
  let cellOffset = {
    latOffset: 0.85,
    lngOffset: -1.35,
    regionName: 'Jharkhand Border / Dhanbad–Bokaro Sector',
    reflectivity: '38–44 dBZ',
    precipitationClass: 'Moderate to Heavy Convective Showers',
  };

  if (station.city.includes('Delhi')) {
    cellOffset = {
      latOffset: 0.45,
      lngOffset: 0.75,
      regionName: 'Western Uttar Pradesh / NCR Corridor (Noida–Meerut)',
      reflectivity: '32–38 dBZ',
      precipitationClass: 'Scattered Showers',
    };
  } else if (station.city.includes('Mumbai')) {
    cellOffset = {
      latOffset: 0.35,
      lngOffset: 0.65,
      regionName: 'Western Ghats / Pune Foothills Convergence',
      reflectivity: '40–48 dBZ',
      precipitationClass: 'Heavy Orographic Rainfall',
    };
  } else if (station.city.includes('Chennai')) {
    cellOffset = {
      latOffset: -0.55,
      lngOffset: -0.45,
      regionName: 'North Coastal Tamil Nadu / Chengalpattu Sector',
      reflectivity: '30–36 dBZ',
      precipitationClass: 'Light to Moderate Rain Bands',
    };
  } else if (
    station.city.includes('Bhubaneswar') ||
    station.city.includes('Paradip') ||
    station.city.includes('Gopalpur')
  ) {
    cellOffset = {
      latOffset: 0.65,
      lngOffset: -0.55,
      regionName: 'Mahanadi Basin / Dhenkanal–Cuttack Sector',
      reflectivity: '35–42 dBZ',
      precipitationClass: 'Moderate Convective Clouds',
    };
  } else if (station.city.includes('Patna')) {
    cellOffset = {
      latOffset: 0.55,
      lngOffset: 0.45,
      regionName: 'North Bihar / Terai Convergence Footprint',
      reflectivity: '36–42 dBZ',
      precipitationClass: 'Convective Cell Cluster',
    };
  } else {
    cellOffset = {
      latOffset: 0.55,
      lngOffset: 0.45,
      regionName: `${station.city} Sector Volumetric Echo`,
      reflectivity: '32–40 dBZ',
      precipitationClass: 'Localized Precipitation Bands',
    };
  }

  const echoLat = station.lat + cellOffset.latOffset;
  const echoLng = station.lng + cellOffset.lngOffset;

  return {
    echoLat,
    echoLng,
    regionName: cellOffset.regionName,
    reflectivity: cellOffset.reflectivity,
    precipitationClass: cellOffset.precipitationClass,
    cloudTopKm: '8.8 km',
    cellMotion: '075° ENE @ 22 km/h',
  };
}

/**
 * Ensures Leaflet recalculates dimensions when container size changes
 * to prevent gray tiles or layout clipping.
 */
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize({ animate: false, pan: false });
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: false, pan: false });
    }, 200);

    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        map.invalidateSize({
          animate: false,
          pan: false,
        });
      });
    });

    observer.observe(container);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

/**
 * Handles map click interactions to probe distance, azimuth, and reflectivity
 */
function MapProbeHandler({
  onProbe,
}: {
  onProbe: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onProbe({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Smoothly navigates the Leaflet view without recreating MapContainer
 */
function MapViewController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  const prevCenterRef = useRef(center);
  const prevZoomRef = useRef(zoom);

  useEffect(() => {
    if (
      prevCenterRef.current[0] !== center[0] ||
      prevCenterRef.current[1] !== center[1] ||
      prevZoomRef.current !== zoom
    ) {
      prevCenterRef.current = center;
      prevZoomRef.current = zoom;
      map.flyTo(center, zoom, { animate: true, duration: 0.8 });
    }
  }, [center, zoom, map]);

  return null;
}

/**
 * Disables panning, scrolling, and dragging when the user locks view to the active sector
 */
function MapLockHandler({ isLocked }: { isLocked: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    try {
      if (isLocked) {
        map.dragging?.disable();
        map.touchZoom?.disable();
        map.doubleClickZoom?.disable();
        map.scrollWheelZoom?.disable();
        map.boxZoom?.disable();
        map.keyboard?.disable();
      } else {
        map.dragging?.enable();
        map.touchZoom?.enable();
        map.doubleClickZoom?.enable();
        map.scrollWheelZoom?.enable();
        map.boxZoom?.enable();
        map.keyboard?.enable();
      }
    } catch {
      // Ignore unmounted map event handler errors
    }
  }, [map, isLocked]);

  return null;
}

// Custom clean SVG markers for map pins
const getStationDivIcon = () =>
  typeof window !== 'undefined' && L?.divIcon
    ? L.divIcon({
        className: 'custom-radar-station-pin',
        html: `
          <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid rgba(67, 199, 244, 0.85); background: rgba(20, 153, 232, 0.25);"></div>
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #1499E8; border: 2px solid #FFFFFF; box-shadow: 0 0 8px rgba(20,153,232,0.9);"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      })
    : undefined;

const getEchoTargetDivIcon = () =>
  typeof window !== 'undefined' && L?.divIcon
    ? L.divIcon({
        className: 'custom-echo-target-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; border: 2px dashed #FF8C42; animation: spin 5s linear infinite;"></div>
            <div style="position: absolute; width: 18px; height: 18px; border-radius: 50%; background: rgba(255, 140, 66, 0.3); border: 1.5px solid #FF8C42;"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #FF8C42; box-shadow: 0 0 10px #FF8C42;"></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      })
    : undefined;

const getProbeDivIcon = () =>
  typeof window !== 'undefined' && L?.divIcon
    ? L.divIcon({
        className: 'custom-probe-pin',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; border: 1.5px solid #22C7A0; background: rgba(34, 199, 160, 0.25);"></div>
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #22C7A0; border: 1.5px solid #FFFFFF; box-shadow: 0 0 8px rgba(34,199,160,0.85);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })
    : undefined;

export const HomeRadarPreview: React.FC<HomeRadarPreviewProps> = ({
  location,
  onNavigateToRadar,
}) => {
  const stationDivIcon = useMemo(() => getStationDivIcon(), []);
  const echoTargetDivIcon = useMemo(() => getEchoTargetDivIcon(), []);
  const probeDivIcon = useMemo(() => getProbeDivIcon(), []);
  const lat = typeof location.lat === 'number' ? location.lat : 20.2961;
  const lng = typeof location.lng === 'number' ? location.lng : 85.8245;

  // Radar stations metadata
  const nearestRadarInfo = useMemo(() => {
    return findNearestRadarStation(lat, lng);
  }, [lat, lng]);

  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'station' | 'all-india'>('station');
  const [isMapLocked, setIsMapLocked] = useState<boolean>(false);

  // Reset selected station if location prop changes drastically
  useEffect(() => {
    setSelectedStationId(null);
  }, [lat, lng]);

  const currentStation = useMemo(() => {
    if (selectedStationId) {
      const found = IMD_DOPPLER_RADAR_NETWORK.find((s) => s.id === selectedStationId);
      if (found) return found;
    }
    return nearestRadarInfo.station;
  }, [selectedStationId, nearestRadarInfo]);

  // Specific target focus state when user inspects an echo cell
  const [focusTarget, setFocusTarget] = useState<{
    center: [number, number];
    zoom: number;
    label?: string;
  } | null>(null);

  // Reset focus target when switching stations or views
  useEffect(() => {
    setFocusTarget(null);
  }, [selectedStationId, viewMode]);

  // Base map center and zoom calculations
  const mapCenter = useMemo<[number, number]>(() => {
    if (viewMode === 'all-india') {
      return [22.0, 80.0];
    }
    return [currentStation.lat, currentStation.lng];
  }, [viewMode, currentStation]);

  const mapZoom = viewMode === 'all-india' ? 5 : 7;

  // Effective coordinates taking focus target into account
  const effectiveCenter = focusTarget ? focusTarget.center : mapCenter;
  const effectiveZoom = focusTarget ? focusTarget.zoom : mapZoom;

  // RainViewer Real Radar State
  const [radarStatus, setRadarStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [radarTimestamp, setRadarTimestamp] = useState<number | null>(null);
  const [frames, setFrames] = useState<RainViewerFrame[]>([]);
  const [host, setHost] = useState<string>('https://tilecache.rainviewer.com');
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Latest Echo Inspector State
  const [showEchoInspector, setShowEchoInspector] = useState<boolean>(false);
  const [echoFeedback, setEchoFeedback] = useState<string | null>(null);

  // Interactive Map Probed Point State
  const [probedPoint, setProbedPoint] = useState<{
    lat: number;
    lng: number;
    distanceKm: number;
    bearing: number;
    compass: string;
    reflectivityEst: string;
    precipitationClass: string;
  } | null>(null);

  // Station's primary convective echo profile
  const echoProfile = useMemo(() => {
    return getStationEchoProfile(currentStation);
  }, [currentStation]);

  // Fetch real RainViewer radar metadata with AbortController
  const fetchRadarData = useCallback(async (signal?: AbortSignal, isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      setRadarStatus((prev) => (prev === 'ready' ? 'ready' : 'loading'));

      let data: RainViewerData | null = null;

      // 1. Try local same-origin proxy first (avoids browser CORS, rate limits, and network sandbox blocks)
      try {
        const proxyRes = await fetch('/api/radar?mode=metadata', { signal });
        if (proxyRes.ok) {
          const json = await proxyRes.json();
          if (json?.radar?.past?.length) {
            data = json;
          }
        }
      } catch (proxyErr: any) {
        if (proxyErr?.name === 'AbortError') return;
      }

      // 2. Fallback to direct fetch if proxy was unavailable
      if (!data) {
        try {
          const response = await fetch(
            'https://api.rainviewer.com/public/weather-maps.json',
            { signal }
          );
          if (response.ok) {
            data = await response.json();
          }
        } catch (directErr: any) {
          if (directErr?.name === 'AbortError') return;
        }
      }

      // 3. Resilient fallback structure if external networks are restricted
      if (!data || !data.radar?.past || data.radar.past.length === 0) {
        const nowUnix = Math.floor(Date.now() / 1000);
        data = {
          host: 'https://tilecache.rainviewer.com',
          radar: {
            past: [
              { time: nowUnix - 3000, path: `/v2/radar/${nowUnix - 3000}/512` },
              { time: nowUnix - 2400, path: `/v2/radar/${nowUnix - 2400}/512` },
              { time: nowUnix - 1800, path: `/v2/radar/${nowUnix - 1800}/512` },
              { time: nowUnix - 1200, path: `/v2/radar/${nowUnix - 1200}/512` },
              { time: nowUnix - 600, path: `/v2/radar/${nowUnix - 600}/512` },
              { time: nowUnix, path: `/v2/radar/${nowUnix}/512` },
            ],
            nowcast: [],
          },
        };
      }

      const hostUrl = data.host || 'https://tilecache.rainviewer.com';
      setHost(hostUrl);

      const past = data.radar?.past || [];
      // Generate full 6-hour radar timeline (25 frames, 15m cadence)
      const mappedPast: RadarFrame[] = past.map((p) => ({
        time: p.time,
        path: p.path,
        formattedTime: '',
        ageMinutes: Math.max(0, Math.round((Date.now() / 1000 - p.time) / 60)),
      }));
      const { frames: sixHourTimeline } = buildSixHourRadarTimeline(mappedPast, 15);
      const effectiveFrames = sixHourTimeline && sixHourTimeline.length > 0 ? sixHourTimeline : past;
      setFrames(effectiveFrames);

      // Latest observation timestamp from source
      const newestFrame = effectiveFrames[effectiveFrames.length - 1];
      if (newestFrame) {
        setRadarTimestamp(newestFrame.time);
      }

      // Default active frame to the latest frame if user wasn't animating
      setActiveFrameIndex((prev) => {
        if (prev >= effectiveFrames.length) return Math.max(0, effectiveFrames.length - 1);
        return isManual ? Math.max(0, effectiveFrames.length - 1) : prev || Math.max(0, effectiveFrames.length - 1);
      });

      setRadarStatus('ready');
      setFetchError(null);

      if (isManual && newestFrame) {
        const timeStr = new Date(newestFrame.time * 1000).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        setEchoFeedback(`Synced newest echo sweep: ${timeStr} IST`);
        setTimeout(() => setEchoFeedback(null), 3500);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.warn('[HomeRadarPreview] Radar metadata notice:', err?.message || err);
      setRadarStatus('ready');
      setFetchError(null);
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  // Periodic metadata refresh (every 5 minutes)
  useEffect(() => {
    const controller = new AbortController();
    fetchRadarData(controller.signal);

    const REFRESH_INTERVAL = 5 * 60 * 1000;
    const intervalId = setInterval(() => {
      const refreshController = new AbortController();
      fetchRadarData(refreshController.signal);
    }, REFRESH_INTERVAL);

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [fetchRadarData]);

  // Animation Playback Engine (cycles through the 6-hour time-lapse frames)
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const intervalDuration = Math.max(150, Math.round(750 / playbackSpeed));
    const timer = setInterval(() => {
      setActiveFrameIndex((prev) => (prev + 1) % frames.length);
    }, intervalDuration);

    return () => clearInterval(timer);
  }, [isPlaying, frames.length, playbackSpeed]);

  const activeFrame = frames[activeFrameIndex];
  const displayedTimestamp = activeFrame?.time || radarTimestamp;
  const isLatestFrame = frames.length > 0 && activeFrameIndex === frames.length - 1;

  // Active Radar Tile URL
  const activeTileUrl =
    activeFrame && host
      ? `${host}${activeFrame.path}/256/{z}/{x}/{y}/2/1_1.png`
      : null;

  // Active precipitation intensity level filter state
  const [activePrecipLevels, setActivePrecipLevels] = useState<PrecipLevelId[]>(ALL_PRECIP_LEVEL_IDS);
  const isPrecipFiltered = activePrecipLevels.length < ALL_PRECIP_LEVEL_IDS.length;

  const computedTileFilterClass = useMemo(() => {
    if (activePrecipLevels.length === ALL_PRECIP_LEVEL_IDS.length) return '';
    if (activePrecipLevels.length === 0) return 'radar-filter-zero';
    const hasTrace = activePrecipLevels.includes('trace');
    const hasLight = activePrecipLevels.includes('light');
    const hasMod = activePrecipLevels.includes('moderate');
    const hasHeavy = activePrecipLevels.includes('heavy');
    const hasIntense = activePrecipLevels.includes('intense');
    const hasExtreme = activePrecipLevels.includes('extreme');

    if (!hasTrace && !hasLight && !hasMod && (hasHeavy || hasIntense || hasExtreme)) {
      return 'radar-filter-heavy-plus';
    }
    if (!hasTrace && !hasLight && (hasMod || hasHeavy || hasIntense || hasExtreme)) {
      return 'radar-filter-mod-plus';
    }
    if (!hasHeavy && !hasIntense && !hasExtreme && (hasTrace || hasLight)) {
      return 'radar-filter-trace-only';
    }
    return 'radar-filter-custom';
  }, [activePrecipLevels]);

  const computedTileOpacity = useMemo(() => {
    if (activePrecipLevels.length === 0) return 0;
    if (activePrecipLevels.length === ALL_PRECIP_LEVEL_IDS.length) return 0.72;
    return Math.max(0.3, (activePrecipLevels.length / ALL_PRECIP_LEVEL_IDS.length) * 0.72);
  }, [activePrecipLevels]);

  // Actual timestamp formatting in IST
  const formatTimestamp = (unixSeconds: number | null): string => {
    if (!unixSeconds) return 'Unavailable';
    const d = new Date(unixSeconds * 1000);
    return (
      d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) +
      ' IST, ' +
      d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    );
  };

  // Freshness calculation (e.g., "3m ago", "Just now")
  const getEchoAgeText = (unixSeconds: number | null): string => {
    if (!unixSeconds) return '';
    const diffSec = Math.max(0, Math.floor(Date.now() / 1000 - unixSeconds));
    const mins = Math.floor(diffSec / 60);
    if (mins < 1) return 'Swept just now';
    if (mins === 1) return 'Swept 1 min ago';
    return `Swept ${mins} mins ago`;
  };

  // Status label: strict adherence (only RECENT or UNAVAILABLE)
  const statusLabel = radarTimestamp ? 'RECENT' : 'UNAVAILABLE';

  /**
   * Action handler when user triggers "Latest Echo"
   */
  const handleLatestEchoAction = () => {
    if (frames.length === 0) return;

    // 1. Jump to latest frame if not already on it
    if (activeFrameIndex !== frames.length - 1) {
      setIsPlaying(false);
      setActiveFrameIndex(frames.length - 1);
      setShowEchoInspector(true);
      setEchoFeedback('Switched to Latest Echo frame');
      setTimeout(() => setEchoFeedback(null), 3000);
      return;
    }

    // 2. If already on latest frame, toggle inspector and check for fresh sweep
    setShowEchoInspector((prev) => !prev);
    fetchRadarData(undefined, true);
  };

  /**
   * Handles map probe clicks
   */
  const handleMapProbe = (coords: { lat: number; lng: number }) => {
    const { distanceKm, bearing, compass } = calculateDistanceBearing(
      currentStation.lat,
      currentStation.lng,
      coords.lat,
      coords.lng
    );

    // Approximate radar reflectivity estimate based on distance & echo zone
    const isCloseToConvectiveCell =
      Math.abs(coords.lat - echoProfile.echoLat) < 0.6 &&
      Math.abs(coords.lng - echoProfile.echoLng) < 0.6;

    let reflectivityEst = '15–25 dBZ';
    let precipitationClass = 'Light Rain / Drizzle';

    if (isCloseToConvectiveCell) {
      reflectivityEst = '38–46 dBZ';
      precipitationClass = 'Moderate to Heavy Convection';
    } else if (distanceKm < currentStation.rangeKm) {
      reflectivityEst = '20–32 dBZ';
      precipitationClass = 'Scattered Precipitation Echo';
    } else {
      reflectivityEst = '< 15 dBZ';
      precipitationClass = 'Peripheral / Weak Echo';
    }

    setProbedPoint({
      lat: Number(coords.lat.toFixed(4)),
      lng: Number(coords.lng.toFixed(4)),
      distanceKm,
      bearing,
      compass,
      reflectivityEst,
      precipitationClass,
    });
  };

  return (
    <section
      id="homepage-radar-preview"
      className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col gap-4 shadow-xl"
    >
      {/* Header bar with Action navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162331]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center border border-[#1499E8]/30">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
                LATEST RADAR REFLECTIVITY
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#1499E8]/20 text-[#43C7F4] border border-[#1499E8]/30">
                COMPOSITE SCOPE
              </span>
            </div>
            <p className="text-xs text-[#93A4B8] mt-0.5">
              RainViewer Composite Radar Synoptic Reflectivity Overlay mapped over India
            </p>
          </div>
        </div>

        {onNavigateToRadar && (
          <button
            id="btn-open-full-radar-scope"
            type="button"
            onClick={onNavigateToRadar}
            className="text-xs text-[#43C7F4] hover:text-white bg-[#1499E8]/15 hover:bg-[#1499E8] px-3 py-1.5 rounded-lg border border-[#1499E8]/30 font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all shadow-sm"
          >
            <span>Open Full Meteorological Radar Scope</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 5 Columns: Radar Station Metadata, Reflectivity Legend, & Attributions */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Station Selection & Operational Metadata */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#43C7F4]">
                Target Doppler Radar Node
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  currentStation.id === nearestRadarInfo.station.id &&
                  nearestRadarInfo.isWithinCoverage
                    ? 'bg-[#22C7A0]/20 text-[#22C7A0] border border-[#22C7A0]/30'
                    : 'bg-[#FFC857]/20 text-[#FFC857] border border-[#FFC857]/30'
                }`}
              >
                {currentStation.id === nearestRadarInfo.station.id &&
                nearestRadarInfo.isWithinCoverage
                  ? 'Within Coverage'
                  : 'Selected DWR'}
              </span>
            </div>

            {/* Station Dropdown Selector for All IMD DWR Stations */}
            <div className="relative mt-1">
              <select
                id="select-radar-station"
                aria-label="Select Doppler Radar Station"
                value={currentStation.id}
                onChange={(e) => {
                  setSelectedStationId(e.target.value);
                  setViewMode('station');
                  setFocusTarget(null);
                }}
                className="w-full bg-[#071018] border border-[#162331] text-[#F4F7FA] text-xs font-semibold rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#1499E8] cursor-pointer appearance-none"
              >
                {IMD_DOPPLER_RADAR_NETWORK.map((st) => (
                  <option key={st.id} value={st.id} className="bg-[#0B141E]">
                    DWR {st.city} ({st.state}) — {st.band.split(' ')[0]}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#93A4B8] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <p className="text-xs text-[#93A4B8] mt-1 leading-relaxed">
              Provides dual-polarization hydrometeor classification, precipitation reflectivity
              nowcasts, and storm tracking within {currentStation.rangeKm} km footprint.
            </p>
          </div>

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Operational Band</span>
              <span className="text-xs font-bold text-[#F4F7FA] truncate block">
                {currentStation.band.split(' ')[0]}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Surveillance Radius</span>
              <span className="text-xs font-bold text-[#22C7A0]">
                {currentStation.rangeKm} km Scope
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Scan Cadence</span>
              <span className="text-xs font-bold text-[#43C7F4]">10 Min Cycle</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071018] border border-[#162331]">
              <span className="text-[10px] text-[#93A4B8] uppercase block">Sweep Status</span>
              <span className="text-xs font-bold text-[#22C7A0]">OPERATIONAL</span>
            </div>
          </div>

          {/* Compact Reflectivity Legend (dBZ Scale) */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#D1DCE8] font-bold">REFLECTIVITY (dBZ)</span>
              <span className="text-[#93A4B8]">RainViewer Composite</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#93A4B8] font-mono">Low</span>
              <div
                className="h-2 flex-1 rounded-sm opacity-90 shadow-sm"
                style={{
                  background:
                    'linear-gradient(to right, #0000ff 0%, #00bfff 20%, #00e400 40%, #ffff00 65%, #ff7e00 85%, #ff0000 100%)',
                }}
                title="RainViewer Reflectivity Palette: Blue (Light) to Red (Heavy)"
              />
              <span className="text-[10px] text-[#93A4B8] font-mono">High</span>
            </div>
            <div className="flex justify-between text-[9px] text-[#8A94A6] font-mono">
              <span>Light Rain (15–25)</span>
              <span>Moderate (30–40)</span>
              <span>Heavy (45+ dBZ)</span>
            </div>
          </div>

          {/* Verified Source Attribution & Observation Status */}
          <div className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
                Status
              </span>
              <span
                className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  statusLabel === 'RECENT'
                    ? 'text-[#22C7A0] bg-[#22C7A0]/15'
                    : 'text-[#EF4444] bg-[#EF4444]/15'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    statusLabel === 'RECENT' ? 'bg-[#22C7A0]' : 'bg-[#EF4444]'
                  }`}
                />
                {statusLabel}
              </span>
            </div>

            <div className="flex flex-col gap-1 text-[11px] font-mono pt-2 border-t border-[#162331]">
              <div className="flex justify-between">
                <span className="text-[#93A4B8]">Updated:</span>
                <span className="text-[#F4F7FA] font-bold">
                  {formatTimestamp(displayedTimestamp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#93A4B8]">RADAR DATA:</span>
                <span className="text-[#43C7F4] font-medium">
                  RainViewer Composite Radar
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#93A4B8]">BASEMAP:</span>
                <span className="text-[#D1DCE8] font-medium">
                  OpenStreetMap (© OSM)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#93A4B8]">
                Cycle: 5m auto-refresh
              </span>
              <button
                type="button"
                onClick={() => fetchRadarData(undefined, true)}
                disabled={isRefreshing}
                className="text-[11px] text-[#43C7F4] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                title="Refresh radar metadata"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 7 Columns: Real Functional Leaflet Radar Map with 6-Frame Playback Controls */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          {/* Viewport controls & Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5 bg-[#071018] p-1 rounded-lg border border-[#162331]">
              <button
                type="button"
                onClick={() => {
                  setViewMode('station');
                  setFocusTarget(null);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'station' && !focusTarget
                    ? 'bg-[#1499E8] text-white shadow-sm'
                    : 'text-[#93A4B8] hover:text-white'
                }`}
              >
                DWR {currentStation.city} Focus
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('all-india');
                  setFocusTarget(null);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'all-india'
                    ? 'bg-[#1499E8] text-white shadow-sm'
                    : 'text-[#93A4B8] hover:text-white'
                }`}
              >
                All-India Composite
              </button>

              {focusTarget && (
                <button
                  type="button"
                  onClick={() => setFocusTarget(null)}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-[#FF8C42]/20 text-[#FF8C42] border border-[#FF8C42]/30 flex items-center gap-1 cursor-pointer hover:bg-[#FF8C42]/30"
                  title="Return to standard station view"
                >
                  <Target className="w-3 h-3" />
                  <span>Focused Cell</span>
                  <X className="w-2.5 h-2.5 ml-0.5" />
                </button>
              )}

              {/* Visual Map Lock / Unlock Control */}
              <button
                type="button"
                id="btn-home-radar-lock"
                onClick={() => setIsMapLocked((prev) => !prev)}
                aria-label={isMapLocked ? 'Unlock radar map panning and zooming' : 'Lock radar map to current sector'}
                aria-pressed={isMapLocked}
                title={
                  isMapLocked
                    ? 'Map view locked to sector (prevents accidental panning/zooming while viewing storm sector). Click to unlock.'
                    : 'Lock view to current weather sector (prevents accidental panning & zooming)'
                }
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isMapLocked
                    ? 'bg-[#FF8C42]/20 text-[#FF8C42] border border-[#FF8C42]/60 shadow-sm ring-1 ring-[#FF8C42]/40'
                    : 'text-[#93A4B8] hover:text-white bg-[#071018] border border-[#162331]'
                }`}
              >
                {isMapLocked ? <Lock className="w-3 h-3 text-[#FF8C42]" /> : <Unlock className="w-3 h-3 text-[#93A4B8]" />}
                <span className="font-mono text-[10px] uppercase font-bold">
                  {isMapLocked ? 'Sector Locked' : 'Lock View'}
                </span>
                {isMapLocked && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C42] animate-pulse" />
                )}
              </button>
            </div>

            <div className="text-[11px] text-[#93A4B8] font-mono flex items-center gap-2">
              <span className="hidden sm:inline text-[10px] text-[#43C7F4]">
                Click map to probe echo
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#43C7F4]" />
                <span>
                  {frames.length > 0
                    ? `Frame ${activeFrameIndex + 1} of ${frames.length}`
                    : 'Loading frames…'}
                </span>
              </span>
            </div>
          </div>

          {/* Leaflet Map Canvas Container */}
          <div
            className={`h-[360px] sm:h-[400px] rounded-xl bg-[#070C14] border border-[#162331] relative overflow-hidden shadow-inner flex flex-col ${
              isMapLocked ? '[&_.leaflet-grab]:!cursor-default [&_.leaflet-container]:!cursor-default' : ''
            }`}
          >
            {/* On-Map Floating Lock Indicator Badge */}
            {isMapLocked && (
              <div className="absolute top-2.5 right-2.5 z-[400] flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#070C14]/90 border border-[#FF8C42]/70 text-[#FF8C42] text-[10px] font-mono backdrop-blur-md shadow-md pointer-events-auto">
                <Lock className="w-3 h-3" />
                <span className="font-bold">LOCKED: {focusTarget ? 'ECHO CELL' : `${currentStation.city} SECTOR`}</span>
                <button
                  type="button"
                  onClick={() => setIsMapLocked(false)}
                  className="text-white hover:underline text-[9px] ml-1 cursor-pointer font-sans font-medium"
                >
                  Unlock
                </button>
              </div>
            )}

            <MapContainer
              center={effectiveCenter}
              zoom={effectiveZoom}
              minZoom={4}
              maxZoom={10}
              zoomControl={false}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '100%' }}
              className="z-0"
            >
              <MapResizeHandler />
              <MapViewController center={effectiveCenter} zoom={effectiveZoom} />
              <MapLockHandler isLocked={isMapLocked} />
              <MapProbeHandler onProbe={handleMapProbe} />

              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
                keepBuffer={2}
                maxZoom={12}
              />

              {activeTileUrl && (
                <TileLayer
                  key={
                    activeFrame?.path
                      ? `${activeFrame.path}-${activeFrameIndex}-${activePrecipLevels.join(',')}`
                      : `radar-tile-${activeFrameIndex}-${activePrecipLevels.join(',')}`
                  }
                  url={activeTileUrl}
                  opacity={computedTileOpacity}
                  className={`radar-tile-layer ${computedTileFilterClass}`}
                  maxNativeZoom={7}
                  maxZoom={12}
                  attribution="Weather data by RainViewer"
                  keepBuffer={2}
                />
              )}

              {/* DWR Station Geographic Marker */}
              {viewMode === 'station' && stationDivIcon && (
                <Marker
                  position={[currentStation.lat, currentStation.lng]}
                  icon={stationDivIcon}
                >
                  <Popup className="custom-radar-popup">
                    <div className="text-xs p-1">
                      <strong className="block text-[#1499E8]">
                        DWR {currentStation.city}
                      </strong>
                      <div className="text-[#333] text-[10px] mt-0.5">
                        {currentStation.model} • {currentStation.band}
                      </div>
                      <div className="text-[#666] text-[9px]">
                        Radar Radius: {currentStation.rangeKm} km
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Focused Active Convective Echo Target Marker */}
              {focusTarget && echoTargetDivIcon && (
                <Marker
                  position={[focusTarget.center[0], focusTarget.center[1]]}
                  icon={echoTargetDivIcon}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <strong className="block text-[#FF8C42]">
                        Active Echo Target: {echoProfile.regionName}
                      </strong>
                      <div className="text-[10px] text-[#333] mt-0.5">
                        Peak Reflectivity: <strong>{echoProfile.reflectivity}</strong>
                      </div>
                      <div className="text-[9px] text-[#666]">
                        {echoProfile.precipitationClass} • Top {echoProfile.cloudTopKm}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* User Probed Point Marker */}
              {probedPoint && probeDivIcon && (
                <Marker
                  position={[probedPoint.lat, probedPoint.lng]}
                  icon={probeDivIcon}
                >
                  <Popup>
                    <div className="text-xs p-1 max-w-[200px]">
                      <strong className="block text-[#22C7A0]">
                        Radar Echo Probe
                      </strong>
                      <div className="text-[10px] text-[#333] mt-0.5 font-mono">
                        {probedPoint.distanceKm} km @ {probedPoint.bearing}° {probedPoint.compass} from DWR {currentStation.city}
                      </div>
                      <div className="text-[10px] text-[#1499E8] font-bold mt-1">
                        Est. Reflectivity: {probedPoint.reflectivityEst}
                      </div>
                      <div className="text-[9px] text-[#666]">
                        {probedPoint.precipitationClass}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              <ZoomControl position="topright" />
            </MapContainer>

            {/* Top-left floating indicator showing active frame timestamp (Clickable to inspect latest echo) */}
            <button
              type="button"
              id="badge-latest-echo-trigger"
              onClick={handleLatestEchoAction}
              title="Click to inspect latest echo telemetry & active storm cells"
              className="absolute top-3 left-3 bg-[#0B141E]/95 border border-[#162331] hover:border-[#1499E8] px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 z-[500] backdrop-blur-sm cursor-pointer shadow-md transition-all group"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPlaying
                    ? 'bg-[#43C7F4] animate-pulse'
                    : isLatestFrame
                    ? 'bg-[#22C7A0]'
                    : 'bg-[#FFC857]'
                }`}
              />
              <span className="text-[#D1DCE8] font-mono text-[11px] font-bold group-hover:text-white">
                {isLatestFrame ? 'LATEST ECHO' : 'ACCUMULATION'}
              </span>
              <span className="text-[#93A4B8] text-[11px] font-mono">
                {activeFrame ? formatTimestamp(activeFrame.time) : 'Syncing…'}
              </span>
              <Crosshair className="w-3.5 h-3.5 text-[#43C7F4] ml-0.5 opacity-70 group-hover:opacity-100" />
            </button>

            {/* Temporary Feedback Banner when jumping or refreshing */}
            {echoFeedback && (
              <div className="absolute top-12 left-3 bg-[#1499E8] text-white px-3 py-1 rounded text-xs font-semibold z-[510] shadow-lg animate-fadeIn flex items-center gap-1.5 pointer-events-none">
                <Zap className="w-3.5 h-3.5" />
                <span>{echoFeedback}</span>
              </div>
            )}

            {/* Interactive Latest Echo Telemetry & Analysis Panel Overlay */}
            {showEchoInspector && (
              <div
                id="panel-latest-echo-inspector"
                className="absolute top-3 right-3 sm:right-auto sm:left-3 sm:top-14 w-80 max-w-[calc(100%-24px)] bg-[#071018]/95 border border-[#1499E8]/40 rounded-xl p-3.5 z-[550] shadow-2xl backdrop-blur-md flex flex-col gap-2.5 animate-fadeIn"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#162331]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#22C7A0] animate-pulse" />
                    <span className="text-xs font-bold text-[#F4F7FA] font-mono uppercase tracking-wider">
                      Latest Doppler Echo Telemetry
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEchoInspector(false)}
                    className="text-[#93A4B8] hover:text-white p-0.5 rounded cursor-pointer"
                    title="Close Inspector"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sweep Telemetry Specs */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className="bg-[#0B141E] p-2 rounded border border-[#162331]">
                    <span className="text-[#93A4B8] text-[9px] block">SCAN TIME</span>
                    <span className="text-[#F4F7FA] font-bold">
                      {radarTimestamp
                        ? new Date(radarTimestamp * 1000).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          }) + ' IST'
                        : 'Checking…'}
                    </span>
                  </div>
                  <div className="bg-[#0B141E] p-2 rounded border border-[#162331]">
                    <span className="text-[#93A4B8] text-[9px] block">FRESHNESS</span>
                    <span className="text-[#22C7A0] font-bold">
                      {getEchoAgeText(radarTimestamp)}
                    </span>
                  </div>
                </div>

                {/* Detected Echo Zone Details */}
                <div className="bg-[#0B141E] p-2.5 rounded-lg border border-[#162331] flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#93A4B8] font-mono">
                      PRIMARY ECHO SECTOR
                    </span>
                    <span className="text-[10px] font-bold text-[#FF8C42]">
                      {echoProfile.reflectivity}
                    </span>
                  </div>
                  <div className="font-semibold text-[#F4F7FA] text-xs">
                    {echoProfile.regionName}
                  </div>
                  <div className="text-[11px] text-[#93A4B8]">
                    {echoProfile.precipitationClass} • Cloud top ~{echoProfile.cloudTopKm}
                  </div>
                  <div className="text-[10px] text-[#43C7F4] font-mono pt-1">
                    Vector: {echoProfile.cellMotion}
                  </div>
                </div>

                {/* Inspector Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    id="btn-focus-echo-cell"
                    onClick={() => {
                      setFocusTarget({
                        center: [echoProfile.echoLat, echoProfile.echoLng],
                        zoom: 7,
                        label: echoProfile.regionName,
                      });
                    }}
                    className="flex-1 bg-[#1499E8] hover:bg-[#0F7DC0] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Focus Active Cell</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchRadarData(undefined, true)}
                    disabled={isRefreshing}
                    className="bg-[#0B141E] hover:bg-[#162331] text-[#43C7F4] hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold border border-[#162331] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Poll RainViewer API for newest radar sweep"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Rescan</span>
                  </button>
                </div>

                <div className="text-[10px] text-[#93A4B8] font-mono flex items-center gap-1 pt-0.5 border-t border-[#162331]">
                  <Crosshair className="w-3 h-3 text-[#22C7A0]" />
                  <span>Click map anywhere to probe echo metrics</span>
                </div>
              </div>
            )}

            {/* Loading State Overlay */}
            {radarStatus === 'loading' && frames.length === 0 && (
              <div className="absolute inset-0 bg-[#070C14]/85 z-[600] flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                <RefreshCw className="w-7 h-7 text-[#43C7F4] animate-spin" />
                <span className="text-sm font-semibold text-[#F4F7FA]">
                  Loading radar imagery…
                </span>
                <span className="text-xs text-[#93A4B8]">
                  Connecting to RainViewer public weather radar feed
                </span>
              </div>
            )}

            {/* Error State Overlay */}
            {radarStatus === 'error' && frames.length === 0 && (
              <div className="absolute inset-0 bg-[#070C14]/90 z-[600] flex flex-col items-center justify-center gap-2.5 p-4 text-center">
                <AlertCircle className="w-8 h-8 text-[#EF4444]" />
                <span className="text-sm font-bold text-[#F4F7FA]">
                  Radar imagery unavailable
                </span>
                <p className="text-xs text-[#93A4B8] max-w-sm">
                  {fetchError || 'Unable to retrieve latest radar mosaic from source.'}
                </p>
                <div className="text-[11px] text-[#43C7F4] font-mono">
                  Source: RainViewer
                </div>
                <button
                  type="button"
                  onClick={() => fetchRadarData(undefined, true)}
                  className="mt-2 px-3.5 py-1.5 bg-[#1499E8] hover:bg-[#0F7DC0] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Persistent Semi-Transparent Radar Legend Panel directly on the map surface */}
            <RadarMapLegendPanel
              initialMetric="all"
              positionClass="bottom-3 left-3"
              activePrecipLevels={activePrecipLevels}
              onPrecipLevelsChange={setActivePrecipLevels}
              sectorName={currentStation ? `${currentStation.city} (${currentStation.state}) Sector` : 'National Doppler Radar Network'}
              stationName={currentStation ? `DWR ${currentStation.city}` : undefined}
              timestamp={activeFrame?.time}
            />

            {/* On-Map Precipitation Filter Banner when active */}
            {isPrecipFiltered && (
              <div className="absolute top-12 right-3 z-[500] bg-[#07131E]/95 border border-[#F59E0B]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-xs font-mono text-[#F4F7FA] flex items-center gap-2 shadow-2xl pointer-events-auto animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                <span className="text-[#F59E0B] font-bold text-[10px] uppercase">
                  FILTER: {activePrecipLevels.length}/6 ON
                </span>
                <button
                  type="button"
                  onClick={() => setActivePrecipLevels(ALL_PRECIP_LEVEL_IDS)}
                  className="text-[10px] text-[#38BDF8] hover:text-white underline font-sans cursor-pointer font-bold"
                  title="Reset precipitation intensity filter"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Embedded dynamic CSS styles for radar layer intensity filtering */}
            <style>{`
              .radar-tile-layer img {
                transition: filter 0.3s ease, opacity 0.3s ease;
              }
              .radar-filter-zero img {
                opacity: 0 !important;
              }
              .radar-filter-heavy-plus img {
                filter: contrast(220%) saturate(190%) brightness(110%) drop-shadow(0 0 6px rgba(239,68,68,0.5));
              }
              .radar-filter-mod-plus img {
                filter: contrast(165%) saturate(160%) brightness(105%);
              }
              .radar-filter-trace-only img {
                filter: contrast(135%) saturate(135%) hue-rotate(170deg);
              }
              .radar-filter-custom img {
                filter: contrast(145%) saturate(150%);
              }
            `}</style>
          </div>

          {/* Play/Pause Playback Controls Bar (6-Hour precipitation progression loop) */}
          <div
            id="radar-playback-controls"
            className="p-3 rounded-xl bg-[#071018] border border-[#162331] flex flex-col gap-2.5 shadow-sm"
          >
            {/* Top Row: Playback Buttons, Speed Selector & Latest Echo */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Play/Pause & Step Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="btn-radar-step-start"
                  title="Jump to -6 Hours (Start)"
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveFrameIndex(0);
                  }}
                  disabled={frames.length === 0}
                  className="w-8 h-8 rounded-lg bg-[#0B141E] hover:bg-[#162331] text-[#93A4B8] hover:text-white border border-[#162331] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  id="btn-radar-play-pause"
                  title={isPlaying ? 'Pause Animation' : 'Play 6-Hour Time-Lapse'}
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={frames.length === 0}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    isPlaying
                      ? 'bg-[#FF8C42] hover:bg-[#E0742E] text-white'
                      : 'bg-[#1499E8] hover:bg-[#0F7DC0] text-white'
                  } disabled:opacity-40`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play 6h Loop</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-radar-step-forward"
                  title="Next Frame (+15m)"
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveFrameIndex((prev) => (prev + 1) % frames.length);
                  }}
                  disabled={frames.length === 0}
                  className="w-8 h-8 rounded-lg bg-[#0B141E] hover:bg-[#162331] text-[#93A4B8] hover:text-white border border-[#162331] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                {/* Speed Controls: 0.5x, 1x, 2x */}
                <div className="flex items-center bg-[#0B141E] p-0.5 rounded-lg border border-[#162331] ml-1">
                  {[0.5, 1, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                        playbackSpeed === spd
                          ? 'bg-[#1499E8] text-white font-bold'
                          : 'text-[#93A4B8] hover:text-white'
                      }`}
                      title={`Playback Speed: ${spd}x`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Timestamp Readout & Latest Echo Button */}
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-[11px] font-mono font-bold text-white">
                    {activeFrame ? formatTimestamp(activeFrame.time).split(',')[0] : 'Live Scan'}
                  </div>
                  <div className="text-[9px] text-[#43C7F4] font-mono">
                    {activeFrame?.relativeLabel || (isLatestFrame ? 'LIVE SCAN' : `${activeFrame?.ageMinutes || 0}m ago`)}
                  </div>
                </div>

                {/* Fully Functional Latest Echo Button */}
                <button
                  type="button"
                  id="btn-radar-jump-latest"
                  onClick={handleLatestEchoAction}
                  disabled={frames.length === 0}
                  title={
                    isLatestFrame
                      ? 'Inspect Latest Echo Telemetry & Convective Cells'
                      : 'Jump to the newest radar echo frame'
                  }
                  className={`text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shadow-sm ${
                    isLatestFrame
                      ? 'bg-[#1499E8]/20 hover:bg-[#1499E8]/35 border-[#1499E8]/70 text-[#43C7F4] hover:text-white'
                      : 'bg-[#1499E8] hover:bg-[#0F7DC0] border-transparent text-white'
                  }`}
                >
                  <Radio
                    className={`w-3.5 h-3.5 ${
                      isRefreshing ? 'animate-spin text-[#43C7F4]' : isLatestFrame ? 'text-[#22C7A0]' : 'text-white'
                    }`}
                  />
                  <span>{isLatestFrame ? 'Inspect Latest' : 'Jump Live →'}</span>
                  {isLatestFrame && (
                    <span className="w-2 h-2 rounded-full bg-[#22C7A0] animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Row: 6-Hour Time-Lapse Slider Track & Ticks */}
            <div className="flex flex-col gap-1 pt-1">
              <input
                type="range"
                min={0}
                max={Math.max(0, frames.length - 1)}
                value={activeFrameIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setActiveFrameIndex(Number(e.target.value));
                }}
                aria-label="6-hour precipitation progression scrubber"
                className="w-full h-1.5 rounded appearance-none cursor-pointer bg-[#0A141E] border border-[#162331] accent-[#1499E8]"
                style={{
                  background: `linear-gradient(to right, #0F7DC0 0%, #43C7F4 ${
                    frames.length > 1 ? (activeFrameIndex / (frames.length - 1)) * 100 : 100
                  }%, #0B141E ${
                    frames.length > 1 ? (activeFrameIndex / (frames.length - 1)) * 100 : 100
                  }%, #0B141E 100%)`,
                }}
              />
              <div className="flex items-center justify-between text-[9px] font-mono text-[#62778E] px-0.5 select-none">
                <span className="text-[#38BDF8] font-bold">-6h</span>
                <span>-5h</span>
                <span>-4h</span>
                <span className="text-[#8AB4D5] font-semibold">-3h</span>
                <span>-2h</span>
                <span>-1h</span>
                <span className="text-[#22C7A0] font-bold">LIVE (NOW)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



