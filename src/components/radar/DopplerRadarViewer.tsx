import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import {
  Radio,
  Layers,
  Maximize2,
  Minimize2,
  Compass,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Info,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  SunMedium,
  Moon,
  Eye,
  X,
  ExternalLink,
  ShieldCheck,
  Activity,
  Wind,
} from 'lucide-react';
import {
  RadarStation,
  RadarProduct,
  RadarProductType,
  RadarProductMetadata,
  RadarDataStatus,
} from '../../types/radar';
import {
  OFFICIAL_RADAR_STATIONS,
  fetchLiveRadarData,
  loadRadarProduct,
  RadarApiResponse,
  RadarFrame,
} from '../../services/radarService';
import {
  RADAR_PRODUCT_CONFIG,
  getImdStationCode,
} from '../../data/radarStations';

import { RadarProductAlertInfo } from './RadarProductAlert';

export type { RadarStation, RadarProduct, RadarProductType, RadarDataStatus };

// Backwards compatibility alias for existing code
export type RadarStationInfo = RadarStation & {
  code: string;
  range: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  peakPowerKw: number;
};

export const RADAR_STATIONS_DATA: RadarStationInfo[] = OFFICIAL_RADAR_STATIONS.map((st) => ({
  ...st,
  code: st.id,
  range: `${st.maxRangeKm} km`,
  lat: st.latitude,
  lng: st.longitude,
  elevationMeters: st.elevationM || 25,
  peakPowerKw: 500,
}));

interface DopplerRadarViewerProps {
  selectedStation?: RadarStation | RadarStationInfo;
  productType?: RadarProductType;
  onProductChange?: (product: RadarProductType) => void;
  onSelectStation?: (station: RadarStationInfo) => void;
  onProductFetchStatus?: (status: RadarProductAlertInfo | null) => void;
  refreshTrigger?: number;
}

/**
 * Calculates geographical destination point from lat, lng, distance and bearing.
 * Uses great circle geodesic mathematics.
 */
function getDestinationLatLng(
  lat: number,
  lng: number,
  distanceKm: number,
  bearingDeg: number
): [number, number] {
  const R = 6371; // Earth radius in km
  const dByR = distanceKm / R;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const brngRad = (bearingDeg * Math.PI) / 180;

  const destLatRad = Math.asin(
    Math.sin(latRad) * Math.cos(dByR) +
      Math.cos(latRad) * Math.sin(dByR) * Math.cos(brngRad)
  );
  const destLngRad =
    lngRad +
    Math.atan2(
      Math.sin(brngRad) * Math.sin(dByR) * Math.cos(latRad),
      Math.cos(dByR) - Math.sin(latRad) * Math.sin(destLatRad)
    );

  return [(destLatRad * 180) / Math.PI, (destLngRad * 180) / Math.PI];
}

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

const PRODUCT_LIST: { key: RadarProductType; label: string; tooltip: string }[] = [
  { key: 'MAXZ', label: 'MAX Z', tooltip: 'MAX(Z) Column-Maximum Reflectivity (0–65+ dBZ)' },
  { key: 'PPZ', label: 'PPZ / Reflectivity', tooltip: 'PPI 0.5° Base Reflectivity Surface Echoes' },
  { key: 'PPV', label: 'PPV / Velocity', tooltip: 'PPI Radial Doppler Hydrometeor Velocity (-48 to +48 m/s)' },
  { key: 'SRI', label: 'SRI / Rainfall', tooltip: 'Surface Rainfall Intensity (0–100 mm/hr)' },
  { key: 'PAC', label: 'PAC / Accumulation', tooltip: 'Precipitation Accumulation (0–150 mm)' },
  { key: 'VVP2', label: 'VVP2 / Wind', tooltip: 'Volume Velocity Processing Wind Profile' },
];

/**
 * 2. MapResizeHandler: Uses ResizeObserver on the Leaflet container
 * to dynamically invalidate size whenever the container size changes.
 */
function MapResizeHandler({ onReady }: { onReady?: () => void }) {
  const map = useMap();

  useEffect(() => {
    onReady?.();
    const container = map.getContainer();

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        map.invalidateSize({
          animate: false,
          pan: false,
        });
      });
    });

    resizeObserver.observe(container);

    const handleWindowResize = () => {
      requestAnimationFrame(() => {
        map.invalidateSize({ animate: false, pan: false });
      });
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [map, onReady]);

  return null;
}

/**
 * 3. StationViewController: Smooth controlled movement on station switch
 * without unmounting or recreating the MapContainer.
 */
function StationViewController({
  station,
  selectedRangeKm,
}: {
  station: RadarStationInfo;
  selectedRangeKm: number;
}) {
  const map = useMap();
  const prevRef = useRef<string>('');

  useEffect(() => {
    const key = `${station.code || station.id}_${station.lat}_${station.lng}_${selectedRangeKm}`;
    if (prevRef.current === key) return;
    prevRef.current = key;

    const targetZoom = selectedRangeKm > 250 ? 7 : 8;
    map.setView([station.lat, station.lng], targetZoom, {
      animate: false,
    });
    requestAnimationFrame(() => {
      map.invalidateSize({ animate: false, pan: false });
    });
  }, [map, station.code, station.id, station.lat, station.lng, selectedRangeKm]);

  return null;
}

/**
 * 4. BasemapThemeController: Switches dark meteorological scope vs standard OSM
 * by toggling the CSS filter class on the tilePane without dropping cached tiles.
 */
function BasemapThemeController({ style }: { style: 'meteorological' | 'standard' }) {
  const map = useMap();
  useEffect(() => {
    const pane = map.getPane('tilePane');
    if (pane) {
      if (style === 'meteorological') {
        pane.classList.add('osm-meteorological-tiles');
      } else {
        pane.classList.remove('osm-meteorological-tiles');
      }
    }
  }, [map, style]);
  return null;
}

/**
 * 5. RadarLayerController: Cleanly manages the official IMD image overlay or
 * fallback composite layer without destroying the basemap or causing tile shift.
 */
function RadarLayerController({
  productMetadata,
  station,
  radarOpacity,
  basemapReady,
  onRadarError,
}: {
  productMetadata: RadarProductMetadata | null;
  station: RadarStationInfo;
  radarOpacity: number;
  basemapReady: boolean;
  onRadarError?: (errorMsg: string | null) => void;
}) {
  const map = useMap();
  const currentLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    // 1. remove old radar layer
    if (currentLayerRef.current) {
      map.removeLayer(currentLayerRef.current);
      currentLayerRef.current = null;
    }

    // 2. Do not add radar layers until the base map is ready
    if (!basemapReady || !productMetadata?.available) {
      return;
    }

    try {
      if (productMetadata.imageUrl) {
        const radiusKm = station.maxRangeKm || 250;
        const dLat = radiusKm / 111.0;
        const dLng = radiusKm / (111.0 * Math.cos((station.lat * Math.PI) / 180));
        const bounds: L.LatLngBoundsExpression = [
          [station.lat - dLat, station.lng - dLng],
          [station.lat + dLat, station.lng + dLng],
        ];

        const imgOverlay = L.imageOverlay(productMetadata.imageUrl, bounds, {
          opacity: radarOpacity,
          zIndex: 350,
          interactive: false,
        });

        imgOverlay.on('error', () => {
          onRadarError?.('Radar imagery unavailable');
        });

        imgOverlay.on('load', () => {
          onRadarError?.(null);
        });

        imgOverlay.addTo(map);
        currentLayerRef.current = imgOverlay;

        // Invalidate size immediately
        requestAnimationFrame(() => {
          map.invalidateSize({
            animate: false,
            pan: false,
          });
        });
      } else if (productMetadata.tileUrl) {
        const tileLayer = L.tileLayer(productMetadata.tileUrl, {
          opacity: radarOpacity,
          zIndex: 350,
          maxNativeZoom: 7,
          minZoom: 4,
          maxZoom: 12,
          keepBuffer: 2,
          attribution: productMetadata.sourceAttribution,
        });

        tileLayer.on('tileerror', () => {
          onRadarError?.('Radar imagery unavailable');
        });

        tileLayer.on('load', () => {
          onRadarError?.(null);
        });

        tileLayer.addTo(map);
        currentLayerRef.current = tileLayer;

        requestAnimationFrame(() => {
          map.invalidateSize({
            animate: false,
            pan: false,
          });
        });
      }
    } catch {
      onRadarError?.('Radar imagery unavailable');
    }

    return () => {
      if (currentLayerRef.current) {
        map.removeLayer(currentLayerRef.current);
        currentLayerRef.current = null;
      }
    };
  }, [map, productMetadata, station.lat, station.lng, station.maxRangeKm, basemapReady, onRadarError]);

  // Adjust opacity smoothly without rebuilding layer
  useEffect(() => {
    if (!currentLayerRef.current) return;
    const layer = currentLayerRef.current as any;
    if (typeof layer.setOpacity === 'function') {
      layer.setOpacity(radarOpacity);
    }
  }, [radarOpacity]);

  return null;
}

/**
 * 6. TacticalOverlaysController: Manages geodesic range rings, 30° radials,
 * lat/lng graticule, surrounding sectors and antenna reticle on a stable sub-layer.
 */
function TacticalOverlaysController({
  station,
  selectedRangeKm,
  showRangeRings,
  showAzimuths,
  showLatLngGrid,
  showCities,
  showCoverageMask,
}: {
  station: RadarStationInfo;
  selectedRangeKm: number;
  showRangeRings: boolean;
  showAzimuths: boolean;
  showLatLngGrid: boolean;
  showCities: boolean;
  showCoverageMask: boolean;
}) {
  const map = useMap();
  const groupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!groupRef.current) {
      groupRef.current = L.layerGroup().addTo(map);
    }
    const group = groupRef.current;
    group.clearLayers();

    const centerLat = station.lat;
    const centerLng = station.lng;
    const maxRange = selectedRangeKm;

    // 1. Station Coverage Boundary Ring
    if (showCoverageMask) {
      const coverageCircle = L.circle([centerLat, centerLng], {
        radius: maxRange * 1000,
        color: '#1499E8',
        weight: 1.8,
        opacity: 0.85,
        dashArray: '6, 4',
        fill: false,
      });
      group.addLayer(coverageCircle);
    }

    // 2. Concentric Range Rings
    if (showRangeRings) {
      const step = maxRange <= 250 ? 50 : 100;
      for (let r = step; r <= maxRange; r += step) {
        const ring = L.circle([centerLat, centerLng], {
          radius: r * 1000,
          color: r === maxRange ? '#1499E8' : 'rgba(67, 199, 244, 0.45)',
          weight: r === maxRange ? 1.5 : 1.0,
          dashArray: r === maxRange ? undefined : '3, 4',
          fill: false,
          interactive: false,
        });
        group.addLayer(ring);

        // Distance label along North-North-East radial (~18° bearing)
        const [labelLat, labelLng] = getDestinationLatLng(centerLat, centerLng, r, 18);
        const labelMarker = L.marker([labelLat, labelLng], {
          icon: L.divIcon({
            className: 'radar-leaflet-label',
            html: `<div style="color:#43C7F4; font-family:monospace; font-size:10px; font-weight:700; text-shadow:0 1px 3px #000; background:rgba(7,16,24,0.85); padding:1px 4px; border-radius:3px; border:1px solid rgba(67,199,244,0.3); transform:translate(-50%,-50%); white-space:nowrap;">${r} km</div>`,
          }),
          interactive: false,
        });
        group.addLayer(labelMarker);
      }
    }

    // 3. Geodesic Bearing / Azimuth Radials
    if (showAzimuths) {
      for (let az = 0; az < 360; az += 30) {
        const [endLat, endLng] = getDestinationLatLng(centerLat, centerLng, maxRange, az);
        const radialLine = L.polyline(
          [
            [centerLat, centerLng],
            [endLat, endLng],
          ],
          {
            color: az % 90 === 0 ? 'rgba(67, 199, 244, 0.5)' : 'rgba(67, 199, 244, 0.22)',
            weight: az % 90 === 0 ? 1.2 : 0.8,
            dashArray: az % 90 === 0 ? undefined : '2, 4',
            interactive: false,
          }
        );
        group.addLayer(radialLine);

        // Bearing label at perimeter
        const [textLat, textLng] = getDestinationLatLng(centerLat, centerLng, maxRange * 1.04, az);
        const cardinalName =
          az === 0
            ? '000° N'
            : az === 90
            ? '090° E'
            : az === 180
            ? '180° S'
            : az === 270
            ? '270° W'
            : `${az.toString().padStart(3, '0')}°`;

        const azMarker = L.marker([textLat, textLng], {
          icon: L.divIcon({
            className: 'radar-azimuth-label',
            html: `<div style="color:${
              az % 90 === 0 ? '#43C7F4' : '#93A4B8'
            }; font-family:monospace; font-size:9px; font-weight:700; text-shadow:0 1px 2px #000; background:rgba(7,16,24,0.85); padding:1px 3px; border-radius:2px; border:1px solid rgba(22,35,49,0.9); transform:translate(-50%,-50%); white-space:nowrap;">${cardinalName}</div>`,
          }),
          interactive: false,
        });
        group.addLayer(azMarker);
      }
    }

    // 4. Latitude / Longitude Graticule
    if (showLatLngGrid) {
      const latMin = Math.floor(centerLat - (maxRange / 111) * 1.2);
      const latMax = Math.ceil(centerLat + (maxRange / 111) * 1.2);
      const lngMin = Math.floor(centerLng - (maxRange / 90) * 1.2);
      const lngMax = Math.ceil(centerLng + (maxRange / 90) * 1.2);

      for (let lat = latMin; lat <= latMax; lat += 1) {
        const latLine = L.polyline(
          [
            [lat, lngMin],
            [lat, lngMax],
          ],
          {
            color: 'rgba(147, 164, 184, 0.12)',
            weight: 0.6,
            dashArray: '2, 6',
            interactive: false,
          }
        );
        group.addLayer(latLine);
      }

      for (let lng = lngMin; lng <= lngMax; lng += 1) {
        const lngLine = L.polyline(
          [
            [latMin, lng],
            [latMax, lng],
          ],
          {
            color: 'rgba(147, 164, 184, 0.12)',
            weight: 0.6,
            dashArray: '2, 6',
            interactive: false,
          }
        );
        group.addLayer(lngLine);
      }
    }

    // 5. Surrounding Places / Sectors
    if (showCities && station.surroundingPlaces) {
      for (const place of station.surroundingPlaces) {
        if (place.distKm <= maxRange) {
          const [pLat, pLng] = getDestinationLatLng(
            centerLat,
            centerLng,
            place.distKm,
            place.azimuthDeg
          );
          const cityMarker = L.marker([pLat, pLng], {
            icon: L.divIcon({
              className: 'radar-city-label',
              html: `<div style="display:flex; align-items:center; gap:3px; transform:translate(-50%,-50%);">
                <span style="width:4px; height:4px; border-radius:50%; background:${
                  place.isWater ? '#00D9FF' : '#FFC857'
                }; box-shadow:0 0 4px ${place.isWater ? '#00D9FF' : '#FFC857'};"></span>
                <span style="color:${
                  place.isWater ? '#A5F3FC' : '#E2E8F0'
                }; font-size:9px; font-weight:600; text-shadow:0 1px 2px #000; background:rgba(7,16,24,0.7); padding:1px 3px; border-radius:2px; white-space:nowrap;">${
                place.name
              }</span>
              </div>`,
            }),
            interactive: false,
          });
          group.addLayer(cityMarker);
        }
      }
    }

    // 6. Antenna Origin Reticle Marker
    const centerIcon = L.divIcon({
      className: 'radar-center-marker',
      html: `
        <div style="position:relative; width:22px; height:22px; transform:translate(-50%,-50%);">
          <div style="position:absolute; inset:0; border:2px solid #22C7A0; border-radius:50%; animation:pulse 2s infinite; opacity:0.8;"></div>
          <div style="position:absolute; inset:3px; border:1px solid #1499E8; border-radius:50%;"></div>
          <div style="position:absolute; top:50%; left:0; width:100%; height:1px; background:#22C7A0;"></div>
          <div style="position:absolute; left:50%; top:0; height:100%; width:1px; background:#22C7A0;"></div>
          <div style="position:absolute; top:50%; left:50%; width:4px; height:4px; background:#FFFFFF; border-radius:50%; transform:translate(-50%,-50%); box-shadow:0 0 6px #22C7A0;"></div>
        </div>
      `,
    });

    const centerMarker = L.marker([centerLat, centerLng], { icon: centerIcon, zIndexOffset: 1000 });
    centerMarker.bindPopup(`
      <div style="font-family:sans-serif; color:#0B141E; padding:4px;">
        <h4 style="margin:0; font-weight:bold; font-size:13px;">${station.name}</h4>
        <div style="font-size:11px; color:#475569; margin-top:2px;">Station Code: <strong>${station.code}</strong> • Band: ${station.band}</div>
        <div style="font-size:10px; color:#64748B; margin-top:4px;">Coordinates: ${station.lat.toFixed(4)}°N, ${station.lng.toFixed(4)}°E</div>
        <div style="font-size:10px; color:#1499E8; margin-top:2px;">Surveillance Baseline: ${station.range}</div>
      </div>
    `);
    group.addLayer(centerMarker);
  }, [
    map,
    station,
    selectedRangeKm,
    showRangeRings,
    showAzimuths,
    showLatLngGrid,
    showCities,
    showCoverageMask,
  ]);

  useEffect(() => {
    return () => {
      if (groupRef.current) {
        groupRef.current.remove();
        groupRef.current = null;
      }
    };
  }, []);

  return null;
}

export const DopplerRadarViewer: React.FC<DopplerRadarViewerProps> = ({
  selectedStation: propStation,
  productType: initialProduct = 'MAXZ',
  onProductChange,
  onSelectStation,
  onProductFetchStatus,
  refreshTrigger = 0,
}) => {
  // Active Station
  const station: RadarStationInfo = useMemo(() => {
    if (!propStation) return RADAR_STATIONS_DATA[0];
    const match = RADAR_STATIONS_DATA.find(
      (s) => s.id === (propStation as any).id || s.code === (propStation as any).code
    );
    return (
      match || {
        ...propStation,
        code: (propStation as any).code || propStation.id,
        range: `${propStation.maxRangeKm} km`,
        lat: (propStation as any).lat || propStation.latitude,
        lng: (propStation as any).lng || propStation.longitude,
        elevationMeters: propStation.elevationM || 25,
        peakPowerKw: 500,
      }
    );
  }, [propStation]);

  // Radar Controls State
  const [activeProduct, setActiveProduct] = useState<RadarProductType>(
    initialProduct === 'PVV' ? 'PPV' : initialProduct
  );
  const [productMetadata, setProductMetadata] = useState<RadarProductMetadata | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(true);

  // Synchronize activeProduct whenever the parent productType changes
  useEffect(() => {
    if (initialProduct) {
      const normalized = initialProduct === 'PVV' ? 'PPV' : initialProduct;
      setActiveProduct(normalized);
    }
  }, [initialProduct]);

  const [selectedRangeKm, setSelectedRangeKm] = useState<number>(station.maxRangeKm || 250);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.82);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [basemapStyle, setBasemapStyle] = useState<'meteorological' | 'standard'>('meteorological');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Overlay toggles
  const [showRangeRings, setShowRangeRings] = useState<boolean>(true);
  const [showAzimuths, setShowAzimuths] = useState<boolean>(true);
  const [showLatLngGrid, setShowLatLngGrid] = useState<boolean>(true);
  const [showCities, setShowCities] = useState<boolean>(true);
  const [showCoverageMask, setShowCoverageMask] = useState<boolean>(true);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  // Leaflet Map Reference and Layer State
  const mapRef = useRef<L.Map | null>(null);
  const [basemapReady, setBasemapReady] = useState<boolean>(false);
  const [basemapError, setBasemapError] = useState<boolean>(false);
  const [radarError, setRadarError] = useState<string | null>(null);

  // Sync range if station max range is smaller
  useEffect(() => {
    if (selectedRangeKm > station.maxRangeKm) {
      setSelectedRangeKm(station.maxRangeKm);
    }
  }, [station, selectedRangeKm]);

  // Fetch real radar product data from verified backend proxy
  const fetchActiveProductData = useCallback(
    async (stationId: string, prod: RadarProductType, signal?: AbortSignal) => {
      setIsLoadingProduct(true);

      try {
        const meta = await loadRadarProduct(stationId, prod, signal);
        setProductMetadata(meta);

        // Notify parent RadarPage about failure, fallback, or recovery
        if (!meta.available || meta.status === 'UNAVAILABLE') {
          onProductFetchStatus?.({
            product: prod,
            productLabel: meta.label || prod,
            stationName: station.name,
            stationCode: station.code || station.id,
            reason: meta.reason || meta.message || 'Direct IMD Doppler feed is currently offline or undergoing calibration.',
            isFallbackActive: meta.isFallback,
            fallbackSource: meta.source,
            timestamp: meta.observed || undefined,
          });
        } else if (meta.isFallback) {
          onProductFetchStatus?.({
            product: prod,
            productLabel: meta.label || prod,
            stationName: station.name,
            stationCode: station.code || station.id,
            reason: 'Station-specific scan unavailable; displaying verified open composite radar overlay.',
            isFallbackActive: true,
            fallbackSource: meta.source,
            timestamp: meta.observed || undefined,
          });
        } else {
          // Operational success - clear any failure alert
          onProductFetchStatus?.(null);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return;
        }
        setProductMetadata({
          product: prod,
          label: prod,
          fullName: prod,
          description: 'Atmospheric Doppler radar observation data',
          unit: '',
          source: 'India Meteorological Department (IMD)',
          sourceAttribution: 'IMD Doppler Weather Radar Network',
          status: 'UNAVAILABLE',
          available: false,
          message: 'UNAVAILABLE — NO VERIFIED FREE PUBLIC SOURCE',
          reason: err?.message || 'Network request failed or radar server offline',
        });
        onProductFetchStatus?.({
          product: prod,
          productLabel: prod,
          stationName: station.name,
          stationCode: station.code || station.id,
          reason: err?.message || 'Network connection failed while fetching radar product from server.',
          isFallbackActive: false,
        });
      } finally {
        if (!signal?.aborted) {
          setIsLoadingProduct(false);
        }
      }
    },
    [station.name, station.code, station.id, onProductFetchStatus]
  );

  // Trigger fetch when station, active product, or external refreshTrigger changes
  useEffect(() => {
    const controller = new AbortController();
    fetchActiveProductData(station.code || station.id, activeProduct, controller.signal);
    return () => {
      controller.abort();
    };
  }, [station.code, station.id, activeProduct, refreshTrigger, fetchActiveProductData]);

  // Handle product tab click
  const handleProductSelect = (p: RadarProductType) => {
    const target = p === 'PVV' ? 'PPV' : p;
    setActiveProduct(target);
    if (onProductChange) onProductChange(target);
  };

  // Recenter view on station using single controlled movement
  const handleRecenter = () => {
    if (!mapRef.current) return;
    mapRef.current.setView([station.lat, station.lng], selectedRangeKm > 250 ? 7 : 8, {
      animate: false,
    });
    requestAnimationFrame(() => {
      mapRef.current?.invalidateSize({ animate: false, pan: false });
    });
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
      requestAnimationFrame(() => {
        mapRef.current?.invalidateSize({ animate: false, pan: false });
      });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
      requestAnimationFrame(() => {
        mapRef.current?.invalidateSize({ animate: false, pan: false });
      });
    }
  };

  // Status configuration
  const currentStatus: RadarDataStatus = isLoadingProduct
    ? 'LOADING'
    : productMetadata?.status || 'UNAVAILABLE';

  const statusConfig = {
    LIVE: {
      dot: 'bg-[#22C7A0] animate-pulse',
      badge: 'bg-[#22C7A0]/15 text-[#22C7A0] border-[#22C7A0]/30',
      label: 'LIVE',
    },
    RECENT: {
      dot: 'bg-[#43C7F4]',
      badge: 'bg-[#43C7F4]/15 text-[#43C7F4] border-[#43C7F4]/30',
      label: 'RECENT',
    },
    STALE: {
      dot: 'bg-[#FFC857]',
      badge: 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/30',
      label: 'STALE',
    },
    UNAVAILABLE: {
      dot: 'bg-[#EF4444]',
      badge: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
      label: 'UNAVAILABLE',
    },
    LOADING: {
      dot: 'bg-[#43C7F4] animate-ping',
      badge: 'bg-[#43C7F4]/15 text-[#43C7F4] border-[#43C7F4]/30',
      label: 'LOADING',
    },
    ERROR: {
      dot: 'bg-[#EF4444]',
      badge: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
      label: 'ERROR',
    },
  }[currentStatus];

  const currentProdConfig =
    RADAR_PRODUCT_CONFIG[activeProduct as keyof typeof RADAR_PRODUCT_CONFIG] ||
    RADAR_PRODUCT_CONFIG.MAXZ;

  return (
    <div
      id="professional-meteorological-radar"
      className={`rounded-2xl bg-[#0B141E] border border-[#162331] shadow-2xl overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* 1. Radar Station Scope Header & Real Operational Telemetry */}
      <div className="bg-[#071018] px-4 py-3 border-b border-[#162331] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1499E8]/20 border border-[#1499E8]/40 flex items-center justify-center text-[#43C7F4]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F4F7FA]">{station.name}</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-[#1499E8]/20 text-[#43C7F4] border border-[#1499E8]/30">
                {station.code}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-[#22C7A0]/20 text-[#22C7A0]">
                {station.state}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#93A4B8] mt-0.5">
              <span>{station.band}</span>
              <span>•</span>
              <span>Elevation: {station.elevationMeters}m ASL</span>
              <span>•</span>
              <span className="font-mono">
                {station.lat.toFixed(4)}°N, {station.lng.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>

        {/* Live Status & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 font-bold font-mono px-2.5 py-1 rounded text-xs border ${statusConfig.badge}`}
              title={`Radar product status: ${statusConfig.label}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              ● {statusConfig.label}
            </span>

            <small className="text-[#93A4B8] text-[11px] font-mono">
              {productMetadata?.observedFormatted ? (
                <>OBSERVED: {productMetadata.observedFormatted}</>
              ) : isLoadingProduct ? (
                <>Loading scan...</>
              ) : (
                <>No verified feed</>
              )}
            </small>
          </div>

          {/* Raw Station Scan Inspector Button (when IMD image is available) */}
          {productMetadata?.imageUrl && (
            <button
              type="button"
              onClick={() => setIsInspectorOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-[#1499E8]/15 hover:bg-[#1499E8]/25 border border-[#1499E8]/40 text-[#43C7F4] flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
              title="Inspect uncropped full-resolution IMD station radar scan"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Station Scan</span>
            </button>
          )}

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={() => fetchActiveProductData(station.code || station.id, activeProduct)}
            disabled={isLoadingProduct}
            className="px-2.5 py-1 rounded-lg bg-[#0B141E] hover:bg-[#162331] border border-[#162331] text-[#93A4B8] hover:text-[#43C7F4] flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors"
            title="Refresh radar scan data immediately"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoadingProduct ? 'animate-spin text-[#43C7F4]' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 rounded-lg bg-[#0B141E] border border-[#162331] text-[#93A4B8] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Scope'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Real Source Attribution & Active Stream Specification HUD */}
      <div className="bg-[#070D14] px-4 py-1.5 border-b border-[#162331] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8A94A6]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#D1DCE8]">PRODUCT:</span>
          <span className="font-semibold text-white">{currentProdConfig.label}</span>
          <span className="text-[#162331]">|</span>
          <span className="font-bold text-[#D1DCE8]">SOURCE:</span>
          <span className="font-semibold text-[#43C7F4]">
            {productMetadata?.source || 'India Meteorological Department (IMD)'}
          </span>
          <span className="text-[#162331]">|</span>
          <span className="font-bold text-[#D1DCE8]">STATUS:</span>
          <span
            className={`font-semibold ${
              currentStatus === 'LIVE'
                ? 'text-[#22C7A0]'
                : currentStatus === 'RECENT'
                ? 'text-[#43C7F4]'
                : currentStatus === 'UNAVAILABLE'
                ? 'text-[#EF4444]'
                : 'text-[#FFC857]'
            }`}
          >
            {currentStatus}
          </span>
          {productMetadata?.isFallback && (
            <>
              <span className="text-[#162331]">|</span>
              <span className="text-[10px] text-[#FFC857] italic">
                (Composite Reflectivity Mosaic Active)
              </span>
            </>
          )}
        </div>
        <div className="text-[10px] text-[#93A4B8] font-mono">
          Cut: {currentProdConfig.elevationAngle} • Unit: {currentProdConfig.unit}
        </div>
      </div>

      {/* 2. REAL PRODUCT BUTTON SELECTOR & SCOPE CONTROLLER */}
      <div className="bg-[#0B141E] px-4 py-2.5 border-b border-[#162331] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* All 6 Radar Products as Active Selectable Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-[#93A4B8] uppercase mr-1">Products:</span>

          {PRODUCT_LIST.map((prod) => {
            const isSelected = activeProduct === prod.key;
            return (
              <button
                key={prod.key}
                type="button"
                onClick={() => handleProductSelect(prod.key)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1499E8] text-white shadow-md'
                    : 'bg-[#071018] text-[#93A4B8] hover:text-white hover:bg-[#162331] border border-[#162331]'
                }`}
                title={prod.tooltip}
              >
                {prod.label}
              </button>
            );
          })}
        </div>

        {/* Tactical Scope Range & Layer Controls */}
        <div className="flex items-center gap-2">
          {/* Range Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-[#93A4B8] uppercase mr-0.5">Range:</span>
            {station.maxRangeKm >= 500 ? (
              <div className="flex bg-[#071018] border border-[#162331] rounded p-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedRangeKm(250)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedRangeKm === 250
                      ? 'bg-[#1499E8] text-white shadow-sm'
                      : 'text-[#93A4B8] hover:text-white'
                  }`}
                >
                  250 km
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRangeKm(500)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedRangeKm === 500
                      ? 'bg-[#1499E8] text-white shadow-sm'
                      : 'text-[#93A4B8] hover:text-white'
                  }`}
                >
                  500 km
                </button>
              </div>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#071018] text-[#43C7F4] border border-[#162331]">
                {station.maxRangeKm} km
              </span>
            )}
          </div>

          {/* Basemap Style Toggle */}
          <button
            type="button"
            onClick={() =>
              setBasemapStyle(basemapStyle === 'meteorological' ? 'standard' : 'meteorological')
            }
            className="px-2.5 py-1 rounded text-xs font-semibold bg-[#071018] text-[#93A4B8] hover:text-white border border-[#162331] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Toggle between Meteorological Scope filter and Standard OpenStreetMap"
          >
            {basemapStyle === 'meteorological' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#43C7F4]" />
                <span className="hidden sm:inline">Scope Basemap</span>
              </>
            ) : (
              <>
                <SunMedium className="w-3.5 h-3.5 text-[#FFC857]" />
                <span className="hidden sm:inline">Standard OSM</span>
              </>
            )}
          </button>

          {/* Layers Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="px-2.5 py-1 rounded text-xs font-semibold bg-[#071018] text-[#93A4B8] hover:text-white border border-[#162331] flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#43C7F4]" />
              <span className="hidden sm:inline">Overlays</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#071018] border border-[#162331] rounded-xl p-3 shadow-2xl z-50 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#93A4B8] uppercase">
                  Scope Tactical Layers
                </span>
                <label className="flex items-center gap-2 text-xs text-[#D1DCE8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRangeRings}
                    onChange={(e) => setShowRangeRings(e.target.checked)}
                    className="rounded accent-[#1499E8]"
                  />
                  <span>Range Rings</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#D1DCE8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAzimuths}
                    onChange={(e) => setShowAzimuths(e.target.checked)}
                    className="rounded accent-[#1499E8]"
                  />
                  <span>Azimuth Radials (30°)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#D1DCE8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLatLngGrid}
                    onChange={(e) => setShowLatLngGrid(e.target.checked)}
                    className="rounded accent-[#1499E8]"
                  />
                  <span>Lat/Lng Graticule</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#D1DCE8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCities}
                    onChange={(e) => setShowCities(e.target.checked)}
                    className="rounded accent-[#1499E8]"
                  />
                  <span>Surrounding Locations</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#D1DCE8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCoverageMask}
                    onChange={(e) => setShowCoverageMask(e.target.checked)}
                    className="rounded accent-[#1499E8]"
                  />
                  <span>Perimeter Boundary ({selectedRangeKm}km)</span>
                </label>

                <div className="pt-2 border-t border-[#162331] flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-[#93A4B8]">
                    <span>Radar Echo Opacity</span>
                    <span className="font-mono text-[#43C7F4]">
                      {(radarOpacity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={radarOpacity}
                    onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
                    className="w-full accent-[#1499E8] h-1 bg-[#162331] rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recenter */}
          <button
            type="button"
            onClick={handleRecenter}
            className="w-8 h-8 rounded-lg bg-[#071018] border border-[#162331] text-[#93A4B8] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Recenter Radar on Station"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Main Radar Geographic Map Container (Leaflet + OpenStreetMap) */}
      <div id="radar-map-container" className={`radar-map-container ${isFullscreen ? 'flex-1 !h-auto !min-h-0' : ''}`}>
        <MapContainer
          ref={mapRef}
          center={[station.lat, station.lng]}
          zoom={selectedRangeKm > 250 ? 7 : 8}
          minZoom={4}
          maxZoom={12}
          scrollWheelZoom={true}
          zoomControl={false}
          zoomAnimation={false}
          fadeAnimation={false}
          markerZoomAnimation={false}
          maxBounds={[
            [0.0, 60.0],
            [40.0, 105.0],
          ]}
          maxBoundsViscosity={0.8}
          style={{ width: '100%', height: '100%' }}
          whenReady={() => {
            setBasemapReady(true);
            requestAnimationFrame(() => {
              setTimeout(() => {
                mapRef.current?.invalidateSize({
                  animate: false,
                  pan: false,
                });
              }, 100);
            });
          }}
        >
          <MapResizeHandler onReady={() => setBasemapReady(true)} />
          <StationViewController station={station} selectedRangeKm={selectedRangeKm} />
          <BasemapThemeController style={basemapStyle} />
          <TileLayer
            url={OSM_TILE_URL}
            attribution={OSM_ATTRIBUTION}
            keepBuffer={2}
            minZoom={4}
            maxZoom={12}
            eventHandlers={{
              load: () => {
                setBasemapReady(true);
                setBasemapError(false);
              },
              tileerror: () => {
                setBasemapError(true);
              },
            }}
          />
          <RadarLayerController
            productMetadata={productMetadata}
            station={station}
            radarOpacity={radarOpacity}
            basemapReady={basemapReady}
            onRadarError={setRadarError}
          />
          <TacticalOverlaysController
            station={station}
            selectedRangeKm={selectedRangeKm}
            showRangeRings={showRangeRings}
            showAzimuths={showAzimuths}
            showLatLngGrid={showLatLngGrid}
            showCities={showCities}
            showCoverageMask={showCoverageMask}
          />
        </MapContainer>

        {/* Compass / True North (Top-Right) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none bg-[#071018]/90 backdrop-blur-xs border border-[#162331] rounded-xl p-2.5 shadow-xl flex flex-col items-center">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <Compass className="w-9 h-9 text-[#43C7F4]/70" />
            <div className="absolute top-0 text-[9px] font-bold text-[#FF8C42]">N</div>
          </div>
          <span className="text-[9px] font-mono text-[#93A4B8] mt-1">TRUE NORTH</span>
        </div>

        {/* Tactical Floating Zoom Controls (+ / -) */}
        <div className="absolute top-20 right-4 z-20 flex flex-col gap-1 shadow-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-[#071018]/90 hover:bg-[#162331] border border-[#162331] text-[#D1DCE8] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-[#071018]/90 hover:bg-[#162331] border border-[#162331] text-[#D1DCE8] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Station Telemetry HUD Overlay (Top-Left) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none bg-[#071018]/92 backdrop-blur-xs border border-[#162331] rounded-xl p-3 shadow-xl max-w-xs flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
            <span className="font-bold text-[#F4F7FA]">{station.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-[#93A4B8] mt-1">
            <span>Operational Band:</span>
            <span className="font-mono text-[#D1DCE8]">{station.band}</span>
            <span>Elevation:</span>
            <span className="font-mono text-[#D1DCE8]">{station.elevationMeters}m ASL</span>
            <span>Surveillance Scope:</span>
            <span className="font-mono text-[#43C7F4]">{selectedRangeKm} km</span>
            <span>Active Product:</span>
            <span className="font-mono text-[#22C7A0]">{activeProduct}</span>
            <span>Azimuth Radials:</span>
            <span className="font-mono text-[#D1DCE8]">30° Geodesic</span>
          </div>
        </div>

        {/* Non-blocking Loading State Badges */}
        {!basemapReady && (
          <div className="radar-loading">
            <div className="bg-[#0B141E]/95 backdrop-blur-md border border-[#43C7F4]/40 rounded-full px-4 py-1.5 shadow-2xl flex items-center gap-2.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#43C7F4] animate-spin" />
              <span className="text-[11px] font-semibold text-white tracking-wide">
                Loading radar map…
              </span>
              <span className="text-[9px] font-mono text-[#43C7F4] bg-[#43C7F4]/15 px-1.5 py-0.5 rounded font-bold">
                BASEMAP
              </span>
            </div>
          </div>
        )}

        {basemapReady && isLoadingProduct && (
          <div className="radar-loading">
            <div className="bg-[#0B141E]/95 backdrop-blur-md border border-[#43C7F4]/40 rounded-full px-4 py-1.5 shadow-2xl flex items-center gap-2.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#43C7F4] animate-spin" />
              <span className="text-[11px] font-semibold text-white tracking-wide">
                Loading radar imagery…
              </span>
              <span className="text-[9px] font-mono text-[#22C7A0] bg-[#22C7A0]/15 px-1.5 py-0.5 rounded font-bold">
                IMD RADAR
              </span>
            </div>
          </div>
        )}

        {/* Error Indicators */}
        {basemapError && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="bg-[#071018]/95 border border-[#EF4444]/50 rounded-lg px-3.5 py-1.5 text-xs text-[#EF4444] font-medium shadow-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Basemap temporarily unavailable</span>
            </div>
          </div>
        )}
        {radarError && !isLoadingProduct && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="bg-[#071018]/95 border border-[#FFC857]/50 rounded-lg px-3.5 py-1.5 text-xs text-[#FFC857] font-medium shadow-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Radar imagery unavailable</span>
            </div>
          </div>
        )}

        {/* Truthful Unavailable Product Notice: Displayed when product has no verified free public source */}
        {!productMetadata?.available && !isLoadingProduct && (
          <div className="absolute inset-x-4 top-24 z-30 flex justify-center pointer-events-none">
            <div className="bg-[#071018]/95 border border-[#EF4444]/40 rounded-xl px-5 py-4 shadow-2xl flex items-start gap-3.5 max-w-xl">
              <div className="w-10 h-10 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
                    {productMetadata?.message || 'UNAVAILABLE — NO VERIFIED FREE PUBLIC SOURCE'}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30">
                    {activeProduct}
                  </span>
                </div>
                <p className="text-[11px] text-[#D1DCE8] leading-tight">
                  {productMetadata?.reason ||
                    `Direct IMD feed for ${currentProdConfig.fullName} is currently offline for station ${station.code} or undergoing routine calibration.`}
                </p>
                <p className="text-[10px] text-[#93A4B8] mt-1 leading-snug">
                  In compliance with meteorological data integrity standards, synthetic or fabricated radar data is strictly prohibited. The tactical range rings, OpenStreetMap basemap, and station coordinates remain fully functional.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Calibrated Dynamic Product Color Legend (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto bg-[#071018]/92 backdrop-blur-xs border border-[#162331] rounded-xl p-2.5 shadow-xl max-w-md">
          {/* Dynamic Header based on active product */}
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#162331] text-[10px]">
            <span className="font-bold uppercase tracking-wider text-[#43C7F4]">
              {activeProduct === 'PPV'
                ? 'Radial Velocity (m/s)'
                : activeProduct === 'SRI'
                ? 'Rainfall Intensity (mm/hr)'
                : activeProduct === 'PAC'
                ? 'Precipitation Accumulation (mm)'
                : activeProduct === 'VVP2'
                ? 'Wind Profile Speed (m/s)'
                : 'Radar Reflectivity (dBZ)'}
            </span>
            <span className="text-[#93A4B8]">{currentProdConfig.unit}</span>
          </div>

          {/* Dynamic Color Bars */}
          {activeProduct === 'PPV' ? (
            // Radial Doppler Velocity scale (-48 to +48 m/s, Cool/Green inbound vs Warm/Red outbound)
            <div>
              <div className="flex h-3 w-full rounded overflow-hidden shadow-inner">
                <div style={{ backgroundColor: '#003300' }} className="flex-1" title="< -32 m/s: Extreme Inbound" />
                <div style={{ backgroundColor: '#006600' }} className="flex-1" title="-24 m/s: Strong Inbound" />
                <div style={{ backgroundColor: '#00CC00' }} className="flex-1" title="-16 m/s: Moderate Inbound" />
                <div style={{ backgroundColor: '#66FF66' }} className="flex-1" title="-8 m/s: Light Inbound" />
                <div style={{ backgroundColor: '#999999' }} className="flex-1" title="0 m/s: Cross-beam / Neutral" />
                <div style={{ backgroundColor: '#FFCC66' }} className="flex-1" title="+8 m/s: Light Outbound" />
                <div style={{ backgroundColor: '#FF9900' }} className="flex-1" title="+16 m/s: Moderate Outbound" />
                <div style={{ backgroundColor: '#FF3300' }} className="flex-1" title="+24 m/s: Strong Outbound" />
                <div style={{ backgroundColor: '#990000' }} className="flex-1" title="> +32 m/s: Extreme Outbound" />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#93A4B8] mt-1 px-0.5">
                <span className="text-[#22C7A0]">-48 Inbound</span>
                <span className="text-[#22C7A0]">-24</span>
                <span className="text-[#FFFFFF]">0</span>
                <span className="text-[#FF8C42]">+24</span>
                <span className="text-[#FF4D4D]">+48 Outbound</span>
              </div>
            </div>
          ) : activeProduct === 'SRI' ? (
            // Surface Rainfall Intensity (0 - 100+ mm/hr)
            <div>
              <div className="flex h-3 w-full rounded overflow-hidden shadow-inner">
                <div style={{ backgroundColor: '#7FE5FF' }} className="flex-1" title="0.1–1 mm/hr: Very Light" />
                <div style={{ backgroundColor: '#00B4D8' }} className="flex-1" title="1–4 mm/hr: Light Rain" />
                <div style={{ backgroundColor: '#0077B6' }} className="flex-1" title="4–10 mm/hr: Moderate" />
                <div style={{ backgroundColor: '#2EC4B6' }} className="flex-1" title="10–25 mm/hr: Heavy" />
                <div style={{ backgroundColor: '#FFBF69' }} className="flex-1" title="25–50 mm/hr: Very Heavy" />
                <div style={{ backgroundColor: '#FF6B6B' }} className="flex-1" title="50–100 mm/hr: Intense" />
                <div style={{ backgroundColor: '#D90429' }} className="flex-1" title="> 100 mm/hr: Torrential" />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#93A4B8] mt-1 px-0.5">
                <span>0.1</span>
                <span>1</span>
                <span>4</span>
                <span>10</span>
                <span>25</span>
                <span>50</span>
                <span>100+ mm/h</span>
              </div>
            </div>
          ) : activeProduct === 'PAC' ? (
            // Precipitation Accumulation (0 - 150+ mm)
            <div>
              <div className="flex h-3 w-full rounded overflow-hidden shadow-inner">
                <div style={{ backgroundColor: '#CCFBF1' }} className="flex-1" title="1–5 mm" />
                <div style={{ backgroundColor: '#5EEAD4' }} className="flex-1" title="5–15 mm" />
                <div style={{ backgroundColor: '#14B8A6' }} className="flex-1" title="15–30 mm" />
                <div style={{ backgroundColor: '#0F766E' }} className="flex-1" title="30–60 mm" />
                <div style={{ backgroundColor: '#FDE047' }} className="flex-1" title="60–100 mm" />
                <div style={{ backgroundColor: '#EA580C' }} className="flex-1" title="100–150 mm" />
                <div style={{ backgroundColor: '#991B1B' }} className="flex-1" title="> 150 mm" />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#93A4B8] mt-1 px-0.5">
                <span>1</span>
                <span>5</span>
                <span>15</span>
                <span>30</span>
                <span>60</span>
                <span>100</span>
                <span>150+ mm</span>
              </div>
            </div>
          ) : activeProduct === 'VVP2' ? (
            // Volume Velocity Processing Wind Profile
            <div>
              <div className="flex h-3 w-full rounded overflow-hidden shadow-inner">
                <div style={{ backgroundColor: '#38BDF8' }} className="flex-1" title="0–5 m/s: Light" />
                <div style={{ backgroundColor: '#34D399' }} className="flex-1" title="5–15 m/s: Moderate" />
                <div style={{ backgroundColor: '#FBBF24' }} className="flex-1" title="15–25 m/s: Strong" />
                <div style={{ backgroundColor: '#F97316' }} className="flex-1" title="25–35 m/s: Gale" />
                <div style={{ backgroundColor: '#EF4444' }} className="flex-1" title="35–50 m/s: Storm" />
                <div style={{ backgroundColor: '#A855F7' }} className="flex-1" title="> 50 m/s: Hurricane" />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#93A4B8] mt-1 px-0.5">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50+ m/s</span>
              </div>
            </div>
          ) : (
            // Default MAXZ and PPZ Reflectivity (dBZ)
            <div>
              <div className="flex h-3 w-full rounded overflow-hidden shadow-inner">
                <div style={{ backgroundColor: '#00ECEC' }} className="flex-1" title="10-20 dBZ: Light Rain" />
                <div style={{ backgroundColor: '#01A0F6' }} className="flex-1" title="20-30 dBZ: Moderate Rain" />
                <div style={{ backgroundColor: '#00FF00' }} className="flex-1" title="30-35 dBZ: Steady Rain" />
                <div style={{ backgroundColor: '#00C800' }} className="flex-1" title="35-40 dBZ: Heavy Rain" />
                <div style={{ backgroundColor: '#FFFF00' }} className="flex-1" title="40-45 dBZ: Very Heavy Rain" />
                <div style={{ backgroundColor: '#FF9000' }} className="flex-1" title="45-50 dBZ: Intense Downpour" />
                <div style={{ backgroundColor: '#FF0000' }} className="flex-1" title="50-55 dBZ: Severe Convection" />
                <div style={{ backgroundColor: '#D40000' }} className="flex-1" title="55-60 dBZ: Extreme Squall" />
                <div style={{ backgroundColor: '#FF00FF' }} className="flex-1" title="60-65 dBZ: Severe Hail / Core" />
                <div style={{ backgroundColor: '#FFFFFF' }} className="flex-1" title=">65 dBZ: Violent Core" />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#93A4B8] mt-1 px-0.5">
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50</span>
                <span>60</span>
                <span>65+ dBZ</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Verified Metadata & Station Specifications Footer */}
      <div className="bg-[#071018] px-4 py-3 border-t border-[#162331] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331]">
          <span className="text-[10px] text-[#93A4B8] uppercase block">Selected Product</span>
          <span className="text-xs font-bold text-[#F4F7FA]">{currentProdConfig.label}</span>
          <span className="text-[10px] text-[#43C7F4] block mt-0.5">
            {currentProdConfig.elevationAngle}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331]">
          <span className="text-[10px] text-[#93A4B8] uppercase block">Source Feed</span>
          <span className="text-xs font-bold text-[#F4F7FA]">
            {productMetadata?.source || 'IMD DWR Network'}
          </span>
          <span className="text-[10px] text-[#22C7A0] block mt-0.5">
            {productMetadata?.available ? 'Active Meteorological Stream' : 'Feed Offline / Scheduled Maintenance'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331]">
          <span className="text-[10px] text-[#93A4B8] uppercase block">Map Projection</span>
          <span className="text-xs font-bold text-[#F4F7FA]">OpenStreetMap WGS 84</span>
          <span className="text-[10px] text-[#43C7F4] block mt-0.5">
            Zoom Bound: 4 – 12
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#0B141E] border border-[#162331]">
          <span className="text-[10px] text-[#93A4B8] uppercase block">Radar Coverage</span>
          <span className="text-xs font-bold text-[#F4F7FA]">
            {selectedRangeKm} km Surveillance Radius
          </span>
          <span className="text-[10px] text-[#93A4B8] block mt-0.5">
            Geodesic Reticle &amp; Rings
          </span>
        </div>
      </div>

      {/* 5. Full-Resolution IMD Station Scan Inspector Modal */}
      {isInspectorOpen && productMetadata?.imageUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B141E] border border-[#162331] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#071018] px-5 py-3.5 border-b border-[#162331] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1499E8]/20 border border-[#1499E8]/40 flex items-center justify-center text-[#43C7F4]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    IMD Official Radar Scan Graphic — {station.name} ({station.code})
                  </h3>
                  <div className="text-[11px] text-[#93A4B8]">
                    Product: <strong>{currentProdConfig.fullName}</strong> • Observed: {productMetadata.observedFormatted}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {productMetadata.directUrl && (
                  <a
                    href={productMetadata.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#162331] hover:bg-[#1E2E40] text-[#93A4B8] hover:text-[#43C7F4] text-xs flex items-center gap-1 transition-colors"
                    title="Open direct IMD origin file in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">IMD Origin</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(false)}
                  className="p-1.5 rounded-lg bg-[#162331] hover:bg-[#1E2E40] text-[#93A4B8] hover:text-white transition-colors cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Full Resolution Radar Graphic */}
            <div className="p-4 overflow-auto flex items-center justify-center bg-[#070C14] min-h-[420px]">
              <img
                src={productMetadata.imageUrl}
                alt={`${station.name} - ${activeProduct} Doppler Radar Scan`}
                className="max-w-full max-h-[68vh] object-contain rounded-lg border border-[#162331] shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-[#071018] px-5 py-3 border-t border-[#162331] flex flex-wrap items-center justify-between text-xs text-[#93A4B8]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22C7A0]" />
                <span>Verified Official India Meteorological Department Radar Feed</span>
              </div>
              <div className="font-mono text-[11px]">
                Origin: mausam.imd.gov.in • Resolution: 1078 × 770 px
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
