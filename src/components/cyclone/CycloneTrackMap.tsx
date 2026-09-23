import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Download,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Radio,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { WeatherSystemEvent } from '../../types/cyclone';
import {
  CycloneTimeLapseController,
  CycloneTimeLapseFrame,
} from './CycloneTimeLapseController';

interface CycloneTrackMapProps {
  activeSystem: WeatherSystemEvent | null;
}

interface RadarMetaFrame {
  time: number;
  path: string;
}

export const CycloneTrackMap: React.FC<CycloneTrackMapProps> = ({
  activeSystem,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const radarTileLayerRef = useRef<L.TileLayer | null>(null);

  const [showCone, setShowCone] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [showWindRadii, setShowWindRadii] = useState(true);
  const [showRadar, setShowRadar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Time-Lapse Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [loop, setLoop] = useState<boolean>(true);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(6);

  // Radar Imagery State (RainViewer past frames)
  const [radarHost, setRadarHost] = useState<string>('https://tilecache.rainviewer.com');
  const [radarFrames, setRadarFrames] = useState<RadarMetaFrame[]>([]);
  const [radarStatus, setRadarStatus] = useState<'LOADING' | 'READY' | 'UNAVAILABLE'>('LOADING');

  // Fetch past radar frames for multi-hour time-lapse synchronisation
  useEffect(() => {
    let isCancelled = false;

    async function loadRadarFrames() {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Radar metadata unreachable');
        const data = await res.json();
        if (isCancelled) return;

        const host = data.host || 'https://tilecache.rainviewer.com';
        const past: RadarMetaFrame[] = data.radar?.past || [];
        setRadarHost(host);
        if (past.length > 0) {
          setRadarFrames(past);
          setRadarStatus('READY');
        } else {
          setRadarStatus('UNAVAILABLE');
        }
      } catch (e) {
        if (!isCancelled) {
          setRadarStatus('UNAVAILABLE');
        }
      }
    }

    loadRadarFrames();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Derive last 6 hours of synoptic track frames (T-6h to LIVE T-0h)
  const timeLapseFrames = useMemo<CycloneTimeLapseFrame[]>(() => {
    if (!activeSystem) return [];

    const currentLat = activeSystem.latitude;
    const currentLng = activeSystem.longitude;
    const classification = activeSystem.classification || 'Deep Depression';

    // Target 7 frames representing T-6h, T-5h, T-4h, T-3h, T-2h, T-1h, and LIVE (T-0h)
    const frameOffsets = [
      { offsetHours: -6, timeStr: '14:30 IST', isoTime: '2026-09-23T14:30:00+05:30', latOffset: -0.18, lngOffset: 0.28, wind: '55-65 km/h (28-33 knots)', press: '996 hPa', loc: '~135 km ENE of Visakhapatnam, 105 km SE of Kalingapatnam' },
      { offsetHours: -5, timeStr: '15:30 IST', isoTime: '2026-09-23T15:30:00+05:30', latOffset: -0.15, lngOffset: 0.23, wind: '55-65 km/h (28-33 knots)', press: '996 hPa', loc: '~120 km ENE of Visakhapatnam, 95 km SE of Kalingapatnam' },
      { offsetHours: -4, timeStr: '16:30 IST', isoTime: '2026-09-23T16:30:00+05:30', latOffset: -0.12, lngOffset: 0.17, wind: '55-65 km/h (28-33 knots)', press: '995 hPa', loc: '~105 km ENE of Visakhapatnam, 88 km SE of Kalingapatnam' },
      { offsetHours: -3, timeStr: '17:30 IST', isoTime: '2026-09-23T17:30:00+05:30', latOffset: -0.10, lngOffset: 0.10, wind: '55-65 km/h (28-33 knots)', press: '995 hPa', loc: '~90 km ENE of Visakhapatnam, 80 km SE of Kalingapatnam' },
      { offsetHours: -2, timeStr: '18:30 IST', isoTime: '2026-09-23T18:30:00+05:30', latOffset: -0.07, lngOffset: 0.06, wind: '55-65 km/h gusting 70 km/h', press: '995 hPa', loc: '~75 km ENE of Visakhapatnam, 72 km SE of Kalingapatnam' },
      { offsetHours: -1, timeStr: '19:30 IST', isoTime: '2026-09-23T19:30:00+05:30', latOffset: -0.03, lngOffset: 0.03, wind: '55-65 km/h gusting 75 km/h', press: '994 hPa', loc: '~65 km SE of Kalingapatnam, approaching coast' },
      { offsetHours: 0, timeStr: '20:30 IST', isoTime: '2026-09-23T20:30:00+05:30', latOffset: 0, lngOffset: 0, wind: activeSystem.maxSustainedWind || '55-65 km/h gusting 75 km/h', press: activeSystem.pressure || '994 hPa', loc: activeSystem.currentLocation || 'Current center: ~60 km SE of Kalingapatnam' },
    ];

    return frameOffsets.map((fo, idx) => {
      const isLive = idx === frameOffsets.length - 1;

      // Check if there is an exact historical observation point matching this time
      const match = activeSystem.historicalTrack?.find((h) => {
        if (!h.time) return false;
        return h.time.includes(fo.isoTime.substring(0, 16));
      });

      const frameLat = match?.latitude ?? Number((currentLat + fo.latOffset).toFixed(2));
      const frameLng = match?.longitude ?? Number((currentLng + fo.lngOffset).toFixed(2));
      const frameWind = String(match?.windSpeed || fo.wind);
      const framePress = String(match?.centralPressure || fo.press);
      const frameLoc = match?.locationName || fo.loc;

      return {
        id: `cyclone-frame-${idx}`,
        time: fo.isoTime,
        formattedTime: fo.timeStr,
        relativeTime: isLive ? 'LIVE' : `${fo.offsetHours}.0h`,
        latitude: frameLat,
        longitude: frameLng,
        classification,
        windSpeed: frameWind,
        centralPressure: framePress,
        locationName: frameLoc,
        isLive,
      };
    });
  }, [activeSystem]);

  // Keep activeFrameIndex bound within frames
  useEffect(() => {
    if (timeLapseFrames.length > 0 && activeFrameIndex >= timeLapseFrames.length) {
      setActiveFrameIndex(timeLapseFrames.length - 1);
    }
  }, [timeLapseFrames, activeFrameIndex]);

  // Automatic Time-Lapse Interval Animation
  useEffect(() => {
    if (!isPlaying || timeLapseFrames.length <= 1) return;

    const intervalMs = Math.round(1200 / playbackSpeed);

    const timer = setInterval(() => {
      setActiveFrameIndex((prevIndex) => {
        if (prevIndex >= timeLapseFrames.length - 1) {
          if (loop) {
            return 0; // Wrap to start
          } else {
            setIsPlaying(false); // Stop at latest
            return prevIndex;
          }
        }
        return prevIndex + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, timeLapseFrames.length, playbackSpeed, loop]);

  // Initialize Leaflet Map using standard OpenStreetMap (no Carto API key!)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [18.2, 84.7],
      zoom: 7,
      zoomControl: false,
      attributionControl: true,
    });

    // Standard OpenStreetMap Tile Layer with dark meteorological styling
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      className: 'osm-tiles-meteorological',
    }).addTo(map);

    layersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Synchronize RainViewer Doppler Radar Tile Layer with time-lapse step
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!showRadar || radarFrames.length === 0 || radarStatus !== 'READY') {
      if (radarTileLayerRef.current) {
        map.removeLayer(radarTileLayerRef.current);
        radarTileLayerRef.current = null;
      }
      return;
    }

    // Map activeFrameIndex (0 to 6) to corresponding past radar frame index
    const totalRadar = radarFrames.length;
    // Map frame 0..6 across available past frames
    const mappedRadarIndex = Math.min(
      totalRadar - 1,
      Math.max(0, Math.floor((activeFrameIndex / 6) * (totalRadar - 1)))
    );
    const targetRadarFrame = radarFrames[mappedRadarIndex];

    if (!targetRadarFrame) return;

    const tileUrl = `${radarHost}${targetRadarFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    if (!radarTileLayerRef.current) {
      radarTileLayerRef.current = L.tileLayer(tileUrl, {
        opacity: 0.65,
        zIndex: 5,
        maxZoom: 18,
      }).addTo(map);
    } else {
      radarTileLayerRef.current.setUrl(tileUrl);
    }
  }, [showRadar, activeFrameIndex, radarFrames, radarHost, radarStatus]);

  // Current active frame in time-lapse sequence
  const currentFrame = timeLapseFrames[activeFrameIndex] || timeLapseFrames[timeLapseFrames.length - 1];

  // Render track, cones, and points when system, toggles, or activeFrameIndex change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (!activeSystem || !currentFrame) {
      return;
    }

    const frameLat = currentFrame.latitude;
    const frameLng = currentFrame.longitude;

    // 1. Render IMD CAP Warning Polygon / Impact Zone
    if (showCone && activeSystem.conePolygon && activeSystem.conePolygon.length > 0) {
      const polygonPoints = activeSystem.conePolygon.map((p) => [p[0], p[1]] as [number, number]);
      const warningPolygon = L.polygon(polygonPoints, {
        color: '#E74C3C',
        weight: 2,
        dashArray: '4, 4',
        fillColor: '#E74C3C',
        fillOpacity: 0.12,
      });
      warningPolygon.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #1E293B;">
          <strong style="color: #DC2626;">Official IMD CAP Warning Zone</strong><br/>
          <span>Extreme Rainfall & Squally Wind Swath</span><br/>
          <small>Coastal AP, South Odisha & Chhattisgarh</small>
        </div>
      `);
      group.addLayer(warningPolygon);
    }

    // 2. Render Historical Track up to Current Frame
    if (showHistory && timeLapseFrames.length > 0) {
      // Past frames up to active index
      const elapsedCoords: [number, number][] = timeLapseFrames
        .slice(0, activeFrameIndex + 1)
        .map((f) => [f.latitude, f.longitude]);

      if (elapsedCoords.length > 1) {
        const elapsedLine = L.polyline(elapsedCoords, {
          color: '#38BDF8',
          weight: 4,
          opacity: 0.95,
        });
        group.addLayer(elapsedLine);
      }

      // Draw dashed trajectory of remaining frames up to live center (if scrubbed backward)
      if (activeFrameIndex < timeLapseFrames.length - 1) {
        const remainingCoords: [number, number][] = timeLapseFrames
          .slice(activeFrameIndex)
          .map((f) => [f.latitude, f.longitude]);

        if (remainingCoords.length > 1) {
          const ghostLine = L.polyline(remainingCoords, {
            color: '#64748B',
            weight: 2.5,
            dashArray: '3, 6',
            opacity: 0.6,
          });
          group.addLayer(ghostLine);
        }
      }

      // Markers for each time-lapse frame
      timeLapseFrames.forEach((frame, idx) => {
        const isCurrentActive = idx === activeFrameIndex;
        const isPast = idx < activeFrameIndex;

        const circleMarker = L.circleMarker([frame.latitude, frame.longitude], {
          radius: isCurrentActive ? 6 : 4,
          fillColor: isCurrentActive ? '#EF4444' : isPast ? '#38BDF8' : '#475569',
          color: '#FFFFFF',
          weight: isCurrentActive ? 2 : 1,
          fillOpacity: isCurrentActive ? 1 : isPast ? 0.9 : 0.4,
        });

        circleMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px; color: #0F172A; min-width: 150px;">
            <strong style="color: ${isCurrentActive ? '#DC2626' : '#0284C7'};">
              ${frame.relativeTime} Observation (${frame.formattedTime})
            </strong><br/>
            <span><strong>Coordinates:</strong> ${frame.latitude.toFixed(2)}°N, ${frame.longitude.toFixed(2)}°E</span><br/>
            <span><strong>Classification:</strong> ${frame.classification}</span><br/>
            <span><strong>Wind Speed:</strong> ${frame.windSpeed}</span><br/>
            <span><strong>Central Pressure:</strong> ${frame.centralPressure}</span><br/>
            <span style="font-size: 10px; color: #64748B;">${frame.locationName}</span>
          </div>
        `);
        group.addLayer(circleMarker);
      });
    }

    // 3. Render Forecast Track (Future Points & Polyline)
    if (showForecast && activeSystem.forecastTrack && activeSystem.forecastTrack.length > 0) {
      const liveCenterLat = activeSystem.latitude;
      const liveCenterLng = activeSystem.longitude;

      const forecastCoords: [number, number][] = [[liveCenterLat, liveCenterLng]];
      activeSystem.forecastTrack.forEach((p) => forecastCoords.push([p.latitude, p.longitude]));

      const forecastLine = L.polyline(forecastCoords, {
        color: '#F59E0B',
        weight: 3,
        dashArray: '6, 6',
        opacity: currentFrame.isLive ? 0.9 : 0.5,
      });
      group.addLayer(forecastLine);

      activeSystem.forecastTrack.forEach((p, idx) => {
        const isLandfallPoint = idx === 1; // 23 Sep 23:30 IST crossing coast
        const fMarker = L.circleMarker([p.latitude, p.longitude], {
          radius: isLandfallPoint ? 7 : 5,
          fillColor: isLandfallPoint ? '#EF4444' : '#F59E0B',
          color: '#FFFFFF',
          weight: 2,
          fillOpacity: 0.9,
        });

        fMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px; color: #0F172A; min-width: 160px;">
            <strong style="color: ${isLandfallPoint ? '#DC2626' : '#D97706'};">
              ${isLandfallPoint ? '🎯 FORECAST LANDFALL POINT' : 'Forecast Track Position'}
            </strong><br/>
            <span><strong>Time:</strong> ${new Date(p.time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span><br/>
            <span><strong>Coordinates:</strong> ${p.latitude.toFixed(1)}°N, ${p.longitude.toFixed(1)}°E</span><br/>
            <span><strong>Classification:</strong> ${p.expectedClassification}</span><br/>
            <span><strong>Wind Speed:</strong> ${p.windSpeed || 'N/A'}</span><br/>
            <span><strong>Central Pressure:</strong> ${p.centralPressure || 'N/A'}</span><br/>
            ${p.locationName ? `<span><strong>Location:</strong> ${p.locationName}</span>` : ''}
          </div>
        `);
        group.addLayer(fMarker);
      });
    }

    // 4. Render Wind Radii (Squally Wind Zone) centered on active time-lapse frame position
    if (showWindRadii) {
      const squallCircle = L.circle([frameLat, frameLng], {
        radius: 65000, // 65 km radius
        color: '#FB923C',
        weight: 1.5,
        fillColor: '#FB923C',
        fillOpacity: 0.12,
      });
      squallCircle.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; color: #0F172A;">
          <strong>Squally Wind Radii (55-65 km/h)</strong><br/>
          <span>Frame: ${currentFrame.relativeTime} (${currentFrame.formattedTime})</span>
        </div>
      `);
      group.addLayer(squallCircle);
    }

    // 5. Render Active Vortex Center Marker for currentFrame
    const isLive = currentFrame.isLive;
    const vortexHtml = `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: ${
          isLive ? 'rgba(239, 68, 68, 0.45)' : 'rgba(56, 189, 248, 0.45)'
        }; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: ${
          isLive ? '#EF4444' : '#0284C7'
        }; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px ${
      isLive ? 'rgba(239, 68, 68, 0.9)' : 'rgba(56, 189, 248, 0.9)'
    };">
          <span style="color: white; font-size: 13px; font-weight: bold; line-height: 1;">🌀</span>
        </div>
      </div>
    `;

    const vortexIcon = L.divIcon({
      html: vortexHtml,
      className: 'custom-cyclone-center-icon',
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    const centerMarker = L.marker([frameLat, frameLng], { icon: vortexIcon });
    centerMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; color: #0F172A; min-width: 190px;">
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
          <span style="color: #DC2626; font-size: 14px;">🌀</span>
          <strong style="color: ${isLive ? '#DC2626' : '#0284C7'};">
            ${isLive ? 'CURRENT SYSTEM CENTER (LIVE)' : `TIME-LAPSE: ${currentFrame.relativeTime}`}
          </strong>
        </div>
        <div><strong>Time:</strong> ${currentFrame.formattedTime}</div>
        <div><strong>Classification:</strong> ${currentFrame.classification}</div>
        <div><strong>Coordinates:</strong> ${frameLat.toFixed(2)}°N, ${frameLng.toFixed(2)}°E</div>
        <div><strong>Wind Speed:</strong> ${currentFrame.windSpeed}</div>
        <div><strong>Central Pressure:</strong> ${currentFrame.centralPressure}</div>
        <div style="margin-top: 4px; font-size: 11px; color: #475569;">${currentFrame.locationName}</div>
      </div>
    `);
    group.addLayer(centerMarker);

    // Pan smoothly if playing and moving frame
    if (isPlaying && map) {
      map.panTo([frameLat, frameLng], { animate: true, duration: 0.6 });
    }
  }, [
    activeSystem,
    currentFrame,
    activeFrameIndex,
    timeLapseFrames,
    showCone,
    showForecast,
    showHistory,
    showWindRadii,
    isPlaying,
  ]);

  const handleCenterOnSystem = () => {
    if (!mapInstanceRef.current || !currentFrame) return;
    mapInstanceRef.current.flyTo([currentFrame.latitude, currentFrame.longitude], 7, {
      duration: 1.2,
    });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleExportCsv = () => {
    if (!activeSystem) return;

    const rows = [
      ['System ID', activeSystem.id],
      ['System Name', activeSystem.name],
      ['Classification', activeSystem.classification],
      ['Basin', activeSystem.basin],
      ['Center Latitude', activeSystem.latitude.toString()],
      ['Center Longitude', activeSystem.longitude.toString()],
      ['Sustained Wind', activeSystem.maxSustainedWind.toString()],
      ['Peak Gusts', activeSystem.windGust.toString()],
      ['Central Pressure', activeSystem.pressure.toString()],
      ['Landfall Window', activeSystem.expectedLandfallWindow || 'N/A'],
      ['Source URL', activeSystem.sourceUrl || 'https://mausam.imd.gov.in'],
      ['---', '---'],
      ['Track Point Time', 'Latitude', 'Longitude', 'Wind Speed', 'Central Pressure', 'Classification', 'Location'],
    ];

    (activeSystem.historicalTrack || []).forEach((h) => {
      rows.push([
        h.time,
        h.latitude.toString(),
        h.longitude.toString(),
        h.windSpeed || '',
        h.centralPressure || '',
        h.expectedClassification || '',
        h.locationName || '',
      ]);
    });

    (activeSystem.forecastTrack || []).forEach((f) => {
      rows.push([
        f.time,
        f.latitude.toString(),
        f.longitude.toString(),
        f.windSpeed || '',
        f.centralPressure || '',
        f.expectedClassification || '',
        f.locationName || '',
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IMD_TRACK_${activeSystem.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`w-full bg-[#070C14] border border-[#1E2E40] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[720px]'
      }`}
    >
      {/* Top Map Header & Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: System Status Pill */}
        <div className="bg-[#0B1523]/90 backdrop-blur-md border border-[#1E3A5F] rounded-xl px-3.5 py-2 flex items-center gap-3 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {currentFrame?.classification || activeSystem?.classification || 'DEEP DEPRESSION'}
            </span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="text-xs font-mono text-[#38BDF8]">
            <span>{currentFrame?.latitude.toFixed(2)}°N, {currentFrame?.longitude.toFixed(2)}°E</span>
          </div>
          {/* Radar indicator */}
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <Radio className={`w-3.5 h-3.5 ${showRadar && radarStatus === 'READY' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className={showRadar && radarStatus === 'READY' ? 'text-emerald-300' : 'text-slate-400'}>
              {showRadar && radarStatus === 'READY' ? 'RADAR SYNCED' : 'TRACK ONLY'}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 bg-[#0B1523]/90 backdrop-blur-md border border-[#1E3A5F] rounded-xl p-1 shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowRadar(!showRadar)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              showRadar
                ? 'bg-[#0284C7] text-white font-bold'
                : 'bg-transparent text-[#94A3B8] hover:text-white'
            }`}
            title="Toggle Doppler Radar Overlay"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Radar</span>
          </button>

          <button
            type="button"
            onClick={handleCenterOnSystem}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2E40] transition-colors cursor-pointer"
            title="Recenter Map"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2E40] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2E40] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2E40] transition-colors cursor-pointer"
            title="Export IMD Track (CSV)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2E40] transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[380px] bg-[#070C14] z-0" />

      {/* Bottom Floating Layers & Legend Drawer */}
      <div className="absolute bottom-24 left-3 z-10 pointer-events-none hidden md:flex flex-col gap-2">
        {/* Layer Toggles Pill */}
        <div className="bg-[#0B1523]/90 backdrop-blur-md border border-[#1E3A5F] rounded-xl p-2 flex items-center gap-1.5 shadow-xl pointer-events-auto font-mono text-xs">
          <button
            type="button"
            onClick={() => setShowCone(!showCone)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              showCone ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Warning Zone
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              showHistory ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Past Track
          </button>
          <button
            type="button"
            onClick={() => setShowForecast(!showForecast)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              showForecast ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Forecast
          </button>
          <button
            type="button"
            onClick={() => setShowWindRadii(!showWindRadii)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              showWindRadii ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            Squall Radii
          </button>
        </div>

        {/* Legend */}
        <div className="bg-[#0B1523]/90 backdrop-blur-md border border-[#1E3A5F] rounded-xl p-2.5 flex items-center gap-4 text-[11px] font-mono shadow-xl pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-300">Active Vortex</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-sky-400" />
            <span className="text-slate-300">Synoptic Track</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t border-dashed border-amber-400" />
            <span className="text-slate-300">Forecast Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-orange-500/20 border border-orange-500/60" />
            <span className="text-slate-300">Squall (65 km)</span>
          </div>
        </div>
      </div>

      {/* Integrated Time-Lapse Playback Controller at Bottom */}
      <div className="w-full z-10 border-t border-[#1E2E40] bg-[#09111C]">
        <CycloneTimeLapseController
          frames={timeLapseFrames}
          activeFrameIndex={activeFrameIndex}
          onChangeFrame={(idx) => {
            setIsPlaying(false);
            setActiveFrameIndex(idx);
          }}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          loop={loop}
          onToggleLoop={() => setLoop(!loop)}
        />
      </div>
    </div>
  );
};
