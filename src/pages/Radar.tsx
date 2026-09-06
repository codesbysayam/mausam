import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LocationRecord } from '../types';
import { LocatingPhase } from '../services/geolocationService';
import { CurrentLocationBanner } from '../components/location/CurrentLocationBanner';
import { WeatherMapMetric } from '../components/map/MapLayerControl';
import { StateWeatherData } from '../components/map/IndiaWeatherMap';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';
import { RadarStation, RadarProductType } from '../types/radar';
import {
  OFFICIAL_RADAR_STATIONS,
  fetchLiveRadarData,
  RadarApiResponse,
} from '../services/radarService';
import { MausamMap, MausamMapControls } from '../components/map/MausamMap';
import { MapToolbar } from '../components/map/MapToolbar';
import { MapLegendBar } from '../components/map/MapLegendBar';
import { StationObservationPanel } from '../components/radar/StationObservationPanel';
import { RadarStationNetwork } from '../components/radar/RadarStationNetwork';
import { RadarProductSelector } from '../components/radar/RadarProductSelector';
import { RadarTechnicalSpecs } from '../components/radar/RadarTechnicalSpecs';

export interface RadarPageProps {
  selectedLocation?: LocationRecord;
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  isLocating?: boolean;
  locatePhase?: LocatingPhase;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  onOpenLocationCenter?: () => void;
}

export const RadarPage: React.FC<RadarPageProps> = ({
  selectedLocation,
  onDetectLocation,
  isLocating = false,
  locatePhase = 'idle',
  locationSource = 'MANUAL_SEARCH',
  onOpenLocationCenter,
}) => {
  const mapWorkspaceRef = useRef<HTMLDivElement>(null);
  const [mapControls, setMapControls] = useState<MausamMapControls | null>(null);

  // Mode Selection: 'synoptic' (All-India Synoptic Map) or 'radar' (Radar Station View)
  const [viewMode, setViewMode] = useState<'synoptic' | 'radar'>('synoptic');

  // Active Map Layer Metric in Synoptic Mode
  const [activeMetric, setActiveMetric] = useState<WeatherMapMetric>('rainfall');

  // Active Radar Product
  const [selectedProduct, setSelectedProduct] = useState<RadarProductType | 'PRECIP'>('PRECIP');

  // Selected Radar Station
  const [selectedStation, setSelectedStation] = useState<RadarStation>(() => {
    return (
      OFFICIAL_RADAR_STATIONS.find((s) => s.id === 'DWR-MUM') ||
      OFFICIAL_RADAR_STATIONS[0]
    );
  });

  // Selected State in Synoptic Mode
  const [selectedStateName, setSelectedStateName] = useState<string>('Odisha');

  // Live Radar Feed State (RainViewer precipitation radar)
  const [radarData, setRadarData] = useState<RadarApiResponse | null>(null);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(false);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [isPlayingRadar, setIsPlayingRadar] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<string>('Loading live data...');

  // Match state data from registry
  const selectedStateData = useMemo<StateWeatherData>(() => {
    const clean = selectedStateName.toLowerCase().trim();
    const found = INDIA_WEATHER_DATA.find(
      (s) =>
        s.name.toLowerCase() === clean ||
        s.id.toLowerCase() === clean ||
        clean.includes(s.name.toLowerCase())
    );
    return found || INDIA_WEATHER_DATA[0];
  }, [selectedStateName]);

  // Load real radar metadata from RainViewer
  const loadLiveRadar = useCallback(async (force = false) => {
    setIsLoadingRadar(true);
    try {
      const result = await fetchLiveRadarData('MAXZ', force);
      setRadarData(result);
      if (result.pastFrames && result.pastFrames.length > 0) {
        setActiveFrameIndex(result.pastFrames.length - 1);
      }
      const now = new Date();
      setLastFetchTime(
        now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ', ' +
          now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) +
          ' IST'
      );
    } catch (err) {
      console.warn('Radar fetch error:', err);
    } finally {
      setIsLoadingRadar(false);
    }
  }, []);

  useEffect(() => {
    loadLiveRadar();
  }, [loadLiveRadar]);

  // Sync selected location with radar station and state
  useEffect(() => {
    if (!selectedLocation) return;
    setSelectedStateName(selectedLocation.state);

    // Look for station matching city or state
    const exactMatch = OFFICIAL_RADAR_STATIONS.find(
      (st) =>
        st.name.toLowerCase().includes(selectedLocation.city.toLowerCase()) ||
        st.id.toLowerCase().includes(selectedLocation.city.toLowerCase()) ||
        st.surroundingPlaces?.some((p) =>
          p.name.toLowerCase().includes(selectedLocation.city.toLowerCase())
        )
    );

    if (exactMatch) {
      setSelectedStation(exactMatch);
      return;
    }

    const stateMatch = OFFICIAL_RADAR_STATIONS.find(
      (st) => st.state && st.state.toLowerCase() === selectedLocation.state.toLowerCase()
    );
    if (stateMatch) {
      setSelectedStation(stateMatch);
    }
  }, [selectedLocation]);

  // Frame animation timer for radar playback
  useEffect(() => {
    if (!isPlayingRadar || !radarData?.pastFrames || radarData.pastFrames.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveFrameIndex((prev) => {
        const next = prev + 1;
        if (next >= radarData.pastFrames.length) {
          return 0;
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlayingRadar, radarData]);

  // Active radar tile url based on current frame
  const currentTileUrl = useMemo<string | null>(() => {
    if (!radarData || !radarData.available || !radarData.pastFrames.length) {
      return null;
    }
    const frame = radarData.pastFrames[activeFrameIndex] || radarData.pastFrames[radarData.pastFrames.length - 1];
    if (!frame || !radarData.host) return null;
    return `${radarData.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
  }, [radarData, activeFrameIndex]);

  // Observation timestamp display
  const currentObsTimestamp = useMemo<string>(() => {
    if (viewMode === 'radar') {
      if (radarData?.pastFrames?.[activeFrameIndex]) {
        return radarData.pastFrames[activeFrameIndex].formattedTime;
      }
      return lastFetchTime;
    }
    return selectedStateData?.updatedAt ? `${selectedStateData.updatedAt}, 06 Sep 2026` : lastFetchTime;
  }, [viewMode, radarData, activeFrameIndex, lastFetchTime, selectedStateData]);

  // Data status for display
  const currentDataStatus = useMemo<'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE'>(() => {
    if (viewMode === 'radar') {
      if (radarData?.status === 'LIVE') return 'LIVE';
      if (radarData?.status === 'RECENT') return 'RECENT';
      if (radarData?.status === 'STALE') return 'STALE';
      return 'UNAVAILABLE';
    }
    return 'RECENT';
  }, [viewMode, radarData]);

  // Handler for selecting radar station from directory
  const handleSelectStationFromDirectory = useCallback((station: RadarStation) => {
    setSelectedStation(station);
    setViewMode('radar');
    // Smooth scroll to map workspace
    mapWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Map control callbacks
  const handleZoomIn = () => mapControls?.zoomIn();
  const handleZoomOut = () => mapControls?.zoomOut();
  const handleResetView = () => mapControls?.resetView();
  const handleMyLocation = () => {
    if (selectedLocation?.lat && selectedLocation?.lng) {
      mapControls?.flyTo(
        selectedLocation.lat,
        selectedLocation.lng,
        8
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1560px] mx-auto text-[#F5F9FC]">
      {/* ==================================================
          1. HEADER & TOP RADAR CONTROLS
      ================================================== */}
      <section className="bg-[#0B263D] border border-[#1D5278] rounded-lg p-4 sm:p-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1D5278]">
          {/* Left Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#F5F9FC] uppercase">
                RADAR &amp; MAPS
              </h1>
              <span className="bg-[#1565C0]/20 text-[#38BDF8] text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-[#1565C0]/40">
                OFFICIAL WORKSTATION
              </span>
            </div>
            <p className="text-xs text-[#AFC4D8]">
              National radar imagery, synoptic observations and Doppler weather radar coverage
            </p>
          </div>

          {/* Right Status, Last Updated & Refresh Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#102D44] border border-[#1D5278] text-xs">
              <span className="text-[#8A94A6]">Data Status:</span>
              {currentDataStatus === 'LIVE' ? (
                <span className="flex items-center gap-1 text-[#00C897] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C897] animate-pulse"></span>
                  LIVE
                </span>
              ) : currentDataStatus === 'RECENT' ? (
                <span className="flex items-center gap-1 text-[#38BDF8] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
                  RECENT
                </span>
              ) : currentDataStatus === 'STALE' ? (
                <span className="text-[#F59E0B] font-bold">STALE</span>
              ) : (
                <span className="text-[#EF4444] font-bold">UNAVAILABLE</span>
              )}
            </div>

            {/* Last Updated */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#102D44] border border-[#1D5278] text-xs text-[#AFC4D8]">
              <span className="text-[#8A94A6]">Last Updated:</span>
              <span className="font-mono text-[#F5F9FC] text-[11px]">{lastFetchTime}</span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => loadLiveRadar(true)}
              disabled={isLoadingRadar}
              className="px-3 py-1 rounded bg-[#1565C0] hover:bg-[#0B3D91] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60 shadow-sm"
              title="Refresh radar feed &amp; observations"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isLoadingRadar ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
              <span>{isLoadingRadar ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Two Clear Mode Buttons (Only selected mode highlighted) */}
        <div className="pt-4 flex items-center gap-2">
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('synoptic')}
              className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                viewMode === 'synoptic'
                  ? 'bg-[#1565C0] text-white shadow-md ring-1 ring-[#38BDF8]'
                  : 'bg-[#102D44] text-[#AFC4D8] hover:text-white border border-[#1D5278]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">public</span>
              <span>ALL-INDIA SYNOPTIC MAP</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('radar')}
              className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                viewMode === 'radar'
                  ? 'bg-[#1565C0] text-white shadow-md ring-1 ring-[#38BDF8]'
                  : 'bg-[#102D44] text-[#AFC4D8] hover:text-white border border-[#1D5278]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">radar</span>
              <span>RADAR STATION VIEW</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. LOCATION / OBSERVATION BAR
      ================================================== */}
      {selectedLocation && (
        <section>
          <CurrentLocationBanner
            location={selectedLocation}
            locationSource={locationSource}
            source={locationSource}
            isLocating={isLocating}
            onDetectLocation={onDetectLocation ? () => onDetectLocation(true) : undefined}
            onOpenLocationCenter={onOpenLocationCenter}
            onChangeLocationClick={onOpenLocationCenter}
          />
        </section>
      )}

      {/* ==================================================
          3. PRIMARY MAP WORKSPACE (Approx 70% Map / 30% Panel)
      ================================================== */}
      <section ref={mapWorkspaceRef} className="flex flex-col shadow-lg">
        {/* Workspace Title Indicator */}
        <div className="bg-[#061A2B] px-1 py-1 flex items-center justify-between text-xs text-[#AFC4D8]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#F5F9FC]">
              {viewMode === 'synoptic'
                ? 'National Synoptic Meteorological Map'
                : `Doppler Weather Radar Station Scope (${selectedStation.name} • ${selectedStation.id})`}
            </span>
            <span className="text-[11px] text-[#8A94A6] hidden sm:inline">
              {viewMode === 'synoptic'
                ? 'All India State & Union Territory observations'
                : 'RainViewer precipitation radar overlay mapped across IMD Doppler station network'}
            </span>
          </div>

          {viewMode === 'radar' && (
            <span className="text-[10px] text-[#38BDF8] font-mono bg-[#1565C0]/20 px-2 py-0.5 rounded border border-[#1565C0]/40">
              RainViewer precipitation radar
            </span>
          )}
        </div>

        {/* Map Toolbar directly above the map */}
        <MapToolbar
          activeMetric={activeMetric}
          onSelectMetric={setActiveMetric}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onMyLocation={handleMyLocation}
          hasUserLocation={!!(selectedLocation?.lat && selectedLocation?.lng)}
        />

        {/* 70% / 30% Grid: Map Workspace + Information Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-0 border-x border-[#1D5278] bg-[#061A2B]">
          {/* Map Area (Approx 70% on Desktop) */}
          <div className="lg:col-span-7 relative min-h-[440px] md:min-h-[520px] lg:min-h-[620px]">
            <MausamMap
              viewMode={viewMode}
              activeMetric={activeMetric}
              selectedState={selectedStateName}
              onSelectState={(state) => setSelectedStateName(state.name)}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
              radarTileUrl={currentTileUrl}
              userCoords={
                selectedLocation?.lat && selectedLocation?.lng
                  ? {
                      lat: selectedLocation.lat,
                      lng: selectedLocation.lng,
                    }
                  : null
              }
              onControlsReady={setMapControls}
              heightClass="h-full min-h-[440px] md:min-h-[520px] lg:min-h-[620px]"
            />

            {/* Radar Time Scrubber & Frame Player Overlay in Radar Mode */}
            {viewMode === 'radar' && radarData?.pastFrames && radarData.pastFrames.length > 0 && (
              <div className="absolute bottom-3 left-3 right-3 z-10 bg-[#0B263D]/95 backdrop-blur-md border border-[#1D5278] rounded-md p-2.5 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlayingRadar(!isPlayingRadar)}
                    className="px-2.5 py-1 rounded bg-[#1565C0] hover:bg-[#0B3D91] text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isPlayingRadar ? 'pause' : 'play_arrow'}
                    </span>
                    <span>{isPlayingRadar ? 'Pause' : 'Play Loop'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveFrameIndex((prev) => (prev > 0 ? prev - 1 : radarData.pastFrames.length - 1))
                    }
                    className="w-7 h-7 rounded bg-[#102D44] hover:bg-[#1D5278] text-[#AFC4D8] hover:text-white flex items-center justify-center border border-[#1D5278]"
                    title="Previous frame"
                  >
                    <span className="material-symbols-outlined text-[16px]">skip_previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveFrameIndex((prev) =>
                        prev < radarData.pastFrames.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="w-7 h-7 rounded bg-[#102D44] hover:bg-[#1D5278] text-[#AFC4D8] hover:text-white flex items-center justify-center border border-[#1D5278]"
                    title="Next frame"
                  >
                    <span className="material-symbols-outlined text-[16px]">skip_next</span>
                  </button>
                </div>

                {/* Timeline Scrubber */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-[#8A94A6] shrink-0 font-mono">
                    {radarData.pastFrames[0]?.formattedTime.split(',')[0]}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={radarData.pastFrames.length - 1}
                    value={activeFrameIndex}
                    onChange={(e) => {
                      setIsPlayingRadar(false);
                      setActiveFrameIndex(Number(e.target.value));
                    }}
                    className="w-full accent-[#38BDF8] cursor-pointer h-1.5 bg-[#102D44] rounded"
                  />
                  <span className="text-[10px] text-[#38BDF8] shrink-0 font-mono font-bold">
                    {radarData.pastFrames[radarData.pastFrames.length - 1]?.formattedTime.split(',')[0]}
                  </span>
                </div>

                {/* Current Timestamp */}
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-[#F5F9FC] block">
                    {radarData.pastFrames[activeFrameIndex]?.formattedTime || 'Current'}
                  </span>
                  <span className="text-[10px] text-[#AFC4D8]">
                    {radarData.pastFrames[activeFrameIndex]?.ageMinutes === 0
                      ? 'Live Scan'
                      : `${radarData.pastFrames[activeFrameIndex]?.ageMinutes}m ago`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Observation Panel (Approx 30% on Desktop) */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-[#1D5278] p-3 flex flex-col justify-between">
            <StationObservationPanel
              viewMode={viewMode}
              station={selectedStation}
              stateData={selectedStateData}
              observationTime={currentObsTimestamp}
              dataStatus={currentDataStatus}
            />
          </div>
        </div>

        {/* Legend / Source / Timestamp immediately below the map */}
        <MapLegendBar
          viewMode={viewMode}
          activeMetric={activeMetric}
          sourceName={
            viewMode === 'radar'
              ? 'RainViewer Global Radar Composite / IMD DWR Reference'
              : selectedStateData?.dataSource || 'IMD Regional Meteorological Centres'
          }
          observationTime={currentObsTimestamp}
          dataStatus={currentDataStatus}
        />
      </section>

      {/* ==================================================
          4. RADAR STATION DIRECTORY ("RADAR STATION NETWORK")
      ================================================== */}
      <section>
        <RadarStationNetwork
          selectedStationId={selectedStation.id}
          onSelectStation={handleSelectStationFromDirectory}
        />
      </section>

      {/* ==================================================
          5. RADAR DATA / PRODUCT INFORMATION
      ================================================== */}
      <section>
        <RadarProductSelector
          selectedProduct={selectedProduct}
          onSelectProduct={setSelectedProduct}
          radarSourceLabel="RainViewer precipitation radar"
          isRadarMode={viewMode === 'radar'}
        />
      </section>

      {/* ==================================================
          6. TECHNICAL DETAILS (COLLAPSIBLE: [ Radar Technical Information ▾ ], closed by default)
      ================================================== */}
      <section>
        <RadarTechnicalSpecs
          station={selectedStation}
          radarSourceLabel="RainViewer precipitation radar / IMD Doppler Network"
        />
      </section>
    </div>
  );
};

export default RadarPage;
