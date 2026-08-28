import React, { useState, useRef, useEffect, useCallback } from 'react';
import { STATIONS } from '../data/weatherData';
import { WeatherStation, RadarLayer } from '../types';
import { tokens } from '../theme/tokens';

interface DynamicIndiaMapProps {
  onSelectStation?: (station: WeatherStation) => void;
  selectedStationId?: string;
}

export const DynamicIndiaMap: React.FC<DynamicIndiaMapProps> = ({
  onSelectStation,
  selectedStationId = 'imd-bhubaneswar',
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState<RadarLayer>('radar');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeIndex, setTimeIndex] = useState<number>(2); // 0 = 14:00, 1 = 15:00, 2 = 16:00 (NOW), 3 = 17:00, 4 = 18:00
  const [hoveredStation, setHoveredStation] = useState<WeatherStation | null>(null);
  const [selectedStation, setSelectedStation] = useState<WeatherStation>(
    () => STATIONS.find((s) => s.id === selectedStationId) || STATIONS[0]
  );
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureMessage, setCaptureMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timeLabels = ['14:00 (Observed)', '15:00 (Observed)', '16:00 (Live Now)', '17:00 (Nowcast +1h)', '18:00 (Nowcast +2h)'];

  // Convert Indian Latitude/Longitude to SVG coordinate space
  // India approx bbox: Lat 8°N to 37°N, Lng 68°E to 98°E
  const projectCoordinates = (lat: number, lng: number): { x: number; y: number } => {
    const minLng = 67.0;
    const maxLng = 98.0;
    const minLat = 7.0;
    const maxLat = 37.5;

    const width = 800;
    const height = 900;

    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = ((maxLat - lat) / (maxLat - minLat)) * height;

    return { x, y };
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.7));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 0.7), 3.5));
  };

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeIndex((prev) => (prev + 1) % timeLabels.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying, timeLabels.length]);

  const handleStationClick = useCallback((station: WeatherStation) => {
    setSelectedStation(station);
    if (onSelectStation) {
      onSelectStation(station);
    }
  }, [onSelectStation]);

  /**
   * CAPTURE RADAR OVERLAY AS IMAGE & TRIGGER BROWSER DOWNLOAD
   */
  const handleCaptureRadarImage = async () => {
    if (isCapturing || !svgRef.current) return;
    setIsCapturing(true);

    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);

      const image = new Image();
      image.crossOrigin = 'anonymous';

      image.onload = () => {
        // High-resolution Canvas
        const canvas = document.createElement('canvas');
        const width = 1200;
        const height = 1000;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          window.URL.revokeObjectURL(blobURL);
          setIsCapturing(false);
          return;
        }

        // 1. Dark Theme Background Fill
        ctx.fillStyle = '#0F141A';
        ctx.fillRect(0, 0, width, height);

        // 2. Subtle Grid overlay
        ctx.strokeStyle = 'rgba(225, 230, 235, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // 3. Draw Header Bar
        ctx.fillStyle = '#1E2733';
        ctx.fillRect(0, 0, width, 80);
        ctx.strokeStyle = 'rgba(225, 230, 235, 0.15)';
        ctx.beginPath();
        ctx.moveTo(0, 80);
        ctx.lineTo(width, 80);
        ctx.stroke();

        // MAUSAM Logo / Header text
        ctx.fillStyle = '#0B72B9';
        ctx.font = 'bold 22px "Noto Sans", sans-serif';
        ctx.fillText('MAUSAM', 32, 45);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 16px "Noto Sans", sans-serif';
        ctx.fillText('• Doppler Weather Radar (DWR) Live Mosaic', 135, 45);

        // Layer and Timestamp Badges
        ctx.fillStyle = '#4FA8E0';
        ctx.font = '500 14px "Noto Sans", sans-serif';
        const layerTitle = activeLayer === 'radar' 
          ? 'Doppler Echoes' 
          : activeLayer === 'satellite' 
          ? 'INSAT Satellite' 
          : activeLayer === 'wind' 
          ? 'Wind Streamlines' 
          : activeLayer === 'temp' 
          ? 'Surface Temperature' 
          : 'Air Quality (PM2.5)';
        ctx.fillText(`Layer: ${layerTitle} | Time: ${timeLabels[timeIndex]}`, 32, 68);

        // Selected Station HUD in top right of header
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 14px "Noto Sans", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${selectedStation.name} (${selectedStation.code}) • ${selectedStation.temp}°C`, width - 32, 45);
        ctx.fillStyle = '#8A94A6';
        ctx.font = '400 12px "Noto Sans", sans-serif';
        ctx.fillText(`Reflectivity: ${selectedStation.reflectivityDbz || 40} dBZ | State: ${selectedStation.state}`, width - 32, 66);
        ctx.textAlign = 'left';

        // 4. Draw SVG Map Image in Center
        const mapX = (width - 800) / 2;
        const mapY = 90;
        ctx.drawImage(image, mapX, mapY, 800, 820);

        // 5. Draw Footer Bar & Attribution
        ctx.fillStyle = '#1E2733';
        ctx.fillRect(0, height - 60, width, 60);
        ctx.strokeStyle = 'rgba(225, 230, 235, 0.15)';
        ctx.beginPath();
        ctx.moveTo(0, height - 60);
        ctx.lineTo(width, height - 60);
        ctx.stroke();

        // Footer Metadata details
        ctx.fillStyle = '#8A94A6';
        ctx.font = '500 12px "Noto Sans", sans-serif';
        ctx.fillText('MAUSAM Atmospheric Intelligence • India Meteorological Department • Radar Composite', 32, height - 26);

        // Reflectivity Legend on Footer Right
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 12px "Noto Sans", sans-serif';
        ctx.fillText('Reflectivity: [15 dBZ Light] ── [30 dBZ Moderate] ── [45 dBZ Heavy] ── [60+ dBZ Severe]', width - 32, height - 26);
        ctx.textAlign = 'left';

        // 6. Trigger Browser Download
        const dataUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        const cleanStation = selectedStation.name.replace(/[^a-zA-Z0-9]/g, '_');
        const cleanLayer = activeLayer.toUpperCase();
        const timeClean = timeLabels[timeIndex].replace(/[^a-zA-Z0-9]/g, '_');
        downloadLink.download = `MAUSAM_Radar_${cleanLayer}_${cleanStation}_${timeClean}.png`;
        downloadLink.href = dataUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        window.URL.revokeObjectURL(blobURL);
        setIsCapturing(false);
        setCaptureMessage('Radar snapshot downloaded!');
        setTimeout(() => setCaptureMessage(null), 3500);
      };

      image.onerror = (err) => {
        console.error('Failed to render radar snapshot:', err);
        window.URL.revokeObjectURL(blobURL);
        setIsCapturing(false);
      };

      image.src = blobURL;
    } catch (err) {
      console.error('Capture error:', err);
      setIsCapturing(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#0F141A] card-border rounded-xl shadow-xl overflow-hidden select-none relative font-sans">
      {/* Top Map Toolbar */}
      <div className="p-4 card-header-divider bg-[#1E2733] flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[22px]">
              radar
            </span>
          </div>
          <div>
            <h3 className="text-sm text-[#FFFFFF] font-bold flex items-center gap-2">
              Pan-India Dynamic Doppler Weather Radar (DWR)
              <span className="px-2 py-0.5 rounded bg-[#2ECC71]/20 text-[#2ECC71] text-[11px] border border-[#2ECC71]/30 font-semibold">
                Live Mosaic
              </span>
            </h3>
            <p className="text-xs text-[#8A94A6]">
              Drag to pan • Scroll or buttons to zoom • Click radar stations for telemetry
            </p>
          </div>
        </div>

        {/* Toolbar Actions: Layer Switcher & Snapshot Download */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Layer Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#0F141A] rounded-lg card-border">
            {(
              [
                { key: 'radar', label: 'Doppler Echoes', icon: 'radar' },
                { key: 'satellite', label: 'INSAT Satellite', icon: 'satellite_alt' },
                { key: 'wind', label: 'Wind Streamlines', icon: 'air' },
                { key: 'temp', label: 'Surface Temp', icon: 'thermostat' },
                { key: 'aqi', label: 'AQI PM2.5', icon: 'grain' },
              ] as const
            ).map((layer) => (
              <button
                key={layer.key}
                onClick={() => setActiveLayer(layer.key as RadarLayer)}
                className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                  activeLayer === layer.key
                    ? 'bg-[#0B72B9] text-[#FFFFFF] font-semibold shadow-sm'
                    : 'text-[#8A94A6] hover:text-[#FFFFFF] hover:bg-[#1E2733]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{layer.icon}</span>
                <span className="hidden sm:inline">{layer.label}</span>
              </button>
            ))}
          </div>

          {/* CAPTURE RADAR SNAPSHOT BUTTON */}
          <button
            onClick={handleCaptureRadarImage}
            disabled={isCapturing}
            title="Capture current radar view as an image and download to share"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0B72B9] hover:bg-[#0A5A94] text-[#FFFFFF] text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isCapturing ? 'hourglass_top' : 'photo_camera'}
            </span>
            <span>{isCapturing ? 'Capturing...' : 'Capture Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Snapshot Toast Confirmation */}
      {captureMessage && (
        <div className="absolute top-18 right-6 z-40 bg-[#2ECC71] text-[#0F141A] px-4 py-2 rounded-lg font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {captureMessage}
        </div>
      )}

      {/* Interactive Map Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="relative h-[520px] w-full bg-[#0A0F14] overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        {/* Ambient Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, #4A5568 1px, transparent 1px), linear-gradient(to bottom, #4A5568 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        {/* Zoom & Navigation Floating Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-[#1E2733]/95 backdrop-blur-md p-1.5 rounded-lg card-border shadow-2xl">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-8 h-8 rounded bg-[#0F141A] hover:bg-[#0B72B9] hover:text-[#FFFFFF] text-[#F4F7FA] flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-8 h-8 rounded bg-[#0F141A] hover:bg-[#0B72B9] hover:text-[#FFFFFF] text-[#F4F7FA] flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button
            onClick={handleReset}
            title="Reset Map View"
            className="w-8 h-8 rounded bg-[#0F141A] hover:bg-[#0B72B9] hover:text-[#FFFFFF] text-[#F4F7FA] flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>
          <button
            onClick={handleCaptureRadarImage}
            title="Download Radar Image"
            className="w-8 h-8 rounded bg-[#0B72B9]/20 text-[#4FA8E0] hover:bg-[#0B72B9] hover:text-[#FFFFFF] flex items-center justify-center transition-all cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
        </div>

        {/* Floating Active Station HUD */}
        <div className="absolute top-4 left-4 z-20 bg-[#1E2733]/95 backdrop-blur-md p-3.5 rounded-lg card-border shadow-2xl max-w-xs pointer-events-auto">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#4FA8E0]">
              {selectedStation.code}
            </span>
            <span className="px-2 py-0.5 rounded bg-[#2ECC71]/20 text-[#2ECC71] text-[10px] font-semibold">
              {selectedStation.radarType || 'S-Band'}
            </span>
          </div>
          <h4 className="font-h4 text-sm font-bold text-[#FFFFFF]">
            {selectedStation.name}
          </h4>
          <p className="text-[12px] text-[#8A94A6] mt-0.5">
            {selectedStation.state} • Elev: {selectedStation.elevation}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[rgba(225,230,235,0.12)] text-center">
            <div className="bg-[#0F141A] p-1.5 rounded card-border">
              <span className="text-[10px] text-[#8A94A6] block">Temp</span>
              <span className="text-sm font-bold text-[#FFFFFF]">
                {selectedStation.temp}°C
              </span>
            </div>
            <div className="bg-[#0F141A] p-1.5 rounded card-border">
              <span className="text-[10px] text-[#8A94A6] block">Reflectivity</span>
              <span className="text-sm font-bold text-[#4FA8E0]">
                {selectedStation.reflectivityDbz || 40} dBZ
              </span>
            </div>
            <div className="bg-[#0F141A] p-1.5 rounded card-border">
              <span className="text-[10px] text-[#8A94A6] block">AQI PM2.5</span>
              <span
                className="text-sm font-bold"
                style={{
                  color: selectedStation.pm25 > 100 ? '#F1C40F' : '#2ECC71',
                }}
              >
                {selectedStation.pm25}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Vector Map Canvas */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="w-[800px] h-[900px] relative pointer-events-auto"
        >
          <svg
            ref={svgRef}
            viewBox="0 0 800 900"
            className="w-full h-full drop-shadow-2xl overflow-visible"
          >
            <defs>
              {/* Radial gradient for Radar Station Echoes */}
              <radialGradient id="radarSweepGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4FA8E0" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#2ECC71" stopOpacity="0.55" />
                <stop offset="75%" stopColor="#F1C40F" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#E74C3C" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="indiaLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E2733" />
                <stop offset="50%" stopColor="#18202B" />
                <stop offset="100%" stopColor="#121820" />
              </linearGradient>

              <linearGradient id="monsoonPlume" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4FA8E0" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#0B72B9" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2C2A38" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Indian Subcontinent Boundary Contour Polygon */}
            <path
              d="M 230 80 
                 C 250 50, 310 40, 350 70 
                 C 380 90, 420 120, 430 160 
                 C 480 180, 520 200, 570 210 
                 C 640 220, 710 240, 730 290 
                 C 740 330, 690 360, 650 350 
                 C 620 380, 580 390, 560 430 
                 C 530 460, 540 510, 500 560 
                 C 470 600, 430 670, 390 750 
                 C 370 790, 340 840, 330 860 
                 C 310 830, 270 730, 250 670 
                 C 220 590, 210 520, 200 480 
                 C 160 450, 110 420, 100 370 
                 C 100 320, 140 270, 160 220 
                 C 180 160, 210 110, 230 80 Z"
              fill="url(#indiaLandGradient)"
              stroke="#4A5568"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="transition-all"
            />

            {/* Regional Coastlines & Border contours */}
            {/* Gujarat Kathiawar Peninsula */}
            <path
              d="M 100 370 Q 70 410 110 430 Q 150 435 170 400"
              fill="#1E2733"
              stroke="#4FA8E0"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />

            {/* Sri Lanka Outline */}
            <path
              d="M 370 820 C 390 820, 410 850, 400 880 C 380 900, 360 870, 370 820 Z"
              fill="#18202B"
              stroke="#4A5568"
              strokeWidth="1.5"
            />

            {/* Andaman & Nicobar Islands */}
            <g stroke="#4FA8E0" strokeWidth="1.5" fill="#18202B" opacity="0.8">
              <ellipse cx="680" cy="680" rx="6" ry="18" />
              <ellipse cx="690" cy="730" rx="5" ry="15" />
              <ellipse cx="700" cy="780" rx="7" ry="20" />
            </g>

            {/* Lakshadweep Archipelago */}
            <g stroke="#4FA8E0" strokeWidth="1.5" fill="#18202B" opacity="0.8">
              <circle cx="210" cy="740" r="4" />
              <circle cx="215" cy="760" r="3" />
              <circle cx="220" cy="790" r="4" />
            </g>

            {/* Dynamic Active Layers */}
            {/* 1. Doppler Radar Convective Echoes */}
            {activeLayer === 'radar' && (
              <g className="animate-pulse duration-1000">
                {/* Active Monsoon Squall Line (Western Coast & Northern Plains) */}
                <ellipse
                  cx="260"
                  cy="320"
                  rx={80 + timeIndex * 15}
                  ry={60 + timeIndex * 8}
                  fill="url(#radarSweepGradient)"
                  opacity="0.7"
                  transform={`rotate(${timeIndex * 6}, 260, 320)`}
                />
                <circle
                  cx="210"
                  cy="490"
                  r={70 + timeIndex * 10}
                  fill="url(#radarSweepGradient)"
                  opacity="0.75"
                />
                <circle
                  cx="540"
                  cy="380"
                  r={65 + timeIndex * 6}
                  fill="url(#radarSweepGradient)"
                  opacity="0.65"
                />
                <circle
                  cx="370"
                  cy="680"
                  r={50 + timeIndex * 5}
                  fill="url(#radarSweepGradient)"
                  opacity="0.6"
                />
              </g>
            )}

            {/* 2. INSAT Satellite Cloud Layer */}
            {activeLayer === 'satellite' && (
              <g opacity="0.75">
                <path
                  d="M 120 280 Q 300 180 520 240 T 720 380 Q 560 520 340 600 T 120 280 Z"
                  fill="url(#monsoonPlume)"
                  filter="blur(18px)"
                />
                <circle
                  cx="380"
                  cy="420"
                  r="120"
                  fill="#ffffff"
                  opacity="0.25"
                  filter="blur(25px)"
                />
                <circle
                  cx="220"
                  cy="520"
                  r="90"
                  fill="#4FA8E0"
                  opacity="0.35"
                  filter="blur(20px)"
                />
              </g>
            )}

            {/* 3. Wind Streamlines */}
            {activeLayer === 'wind' && (
              <g stroke="#4FA8E0" strokeWidth="2" strokeDasharray="6,6" opacity="0.8" fill="none">
                <path d="M 100 600 Q 250 520 400 480 T 600 380" />
                <path d="M 80 500 Q 220 440 380 390 T 580 300" />
                <path d="M 120 700 Q 280 620 440 560 T 650 480" />
                <path d="M 180 340 Q 320 280 480 240 T 680 180" />
                <path d="M 220 240 Q 340 180 460 160 T 620 120" />
              </g>
            )}

            {/* 4. Temperature Heatmap Overlay */}
            {activeLayer === 'temp' && (
              <g opacity="0.4">
                {/* Thar Desert Hot Zone */}
                <circle cx="210" cy="300" r="90" fill="#E74C3C" filter="blur(30px)" />
                {/* Deccan Warm Zone */}
                <circle cx="340" cy="540" r="110" fill="#FFB703" filter="blur(35px)" />
                {/* Himalayan Cool Zone */}
                <ellipse cx="320" cy="110" rx="140" ry="40" fill="#4FA8E0" filter="blur(25px)" />
              </g>
            )}

            {/* 5. AQI PM2.5 Grid Overlay */}
            {activeLayer === 'aqi' && (
              <g opacity="0.45">
                {/* Indo-Gangetic Plains Inversion Belt */}
                <ellipse cx="330" cy="270" rx="160" ry="50" fill="#E74C3C" filter="blur(25px)" />
                <circle cx="210" cy="490" r="70" fill="#F1C40F" filter="blur(25px)" />
                <circle cx="370" cy="680" r="60" fill="#2ECC71" filter="blur(25px)" />
              </g>
            )}

            {/* IMD Doppler Weather Radar Stations Pins & Sweep Beams */}
            {STATIONS.map((station) => {
              const pos = projectCoordinates(station.lat, station.lng);
              const isSelected = selectedStation.id === station.id;
              const isHovered = hoveredStation?.id === station.id;

              return (
                <g
                  key={station.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => handleStationClick(station)}
                  onMouseEnter={() => setHoveredStation(station)}
                  onMouseLeave={() => setHoveredStation(null)}
                >
                  {/* Radar Coverage Range Ring */}
                  <circle
                    r="45"
                    fill="none"
                    stroke={isSelected ? '#4FA8E0' : '#4A5568'}
                    strokeWidth={isSelected ? '1.5' : '1'}
                    strokeDasharray={isSelected ? '3,3' : '2,2'}
                    opacity={isSelected ? '0.95' : '0.4'}
                  />

                  {/* Rotating Radar Sweep Pulse for Active Station */}
                  {isSelected && (
                    <circle
                      r="45"
                      fill="#0B72B9"
                      opacity="0.2"
                      className="animate-ping duration-1000"
                    />
                  )}

                  {/* Station Marker Node */}
                  <circle
                    r={isSelected || isHovered ? '7' : '5'}
                    fill={isSelected ? '#0B72B9' : '#2ECC71'}
                    stroke="#0F141A"
                    strokeWidth="2"
                    className="transition-all"
                  />

                  {/* Station Label */}
                  <text
                    x="12"
                    y="4"
                    fill={isSelected ? '#4FA8E0' : '#FFFFFF'}
                    fontSize={isSelected ? '12' : '10'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="Noto Sans, system-ui, sans-serif"
                    className="drop-shadow-md select-none pointer-events-none"
                  >
                    {station.district} ({station.temp}°C)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Interactive Legend Box */}
        <div className="absolute bottom-4 left-4 z-20 bg-[#1E2733]/95 backdrop-blur-md p-3 rounded-lg card-border shadow-2xl flex flex-col gap-1.5">
          <span className="text-[10px] uppercase text-[#4FA8E0] font-bold">
            Reflectivity Scale (dBZ)
          </span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2.5 rounded-xs bg-[#4FA8E0]" title="Light Rain (15-25 dBZ)"></div>
            <span className="text-[9px] text-[#8A94A6]">15</span>
            <div className="w-4 h-2.5 rounded-xs bg-[#2ECC71]" title="Moderate Rain (25-35 dBZ)"></div>
            <span className="text-[9px] text-[#8A94A6]">30</span>
            <div className="w-4 h-2.5 rounded-xs bg-[#F1C40F]" title="Heavy Rain (35-45 dBZ)"></div>
            <span className="text-[9px] text-[#8A94A6]">45</span>
            <div className="w-4 h-2.5 rounded-xs bg-[#E74C3C]" title="Severe Hail/Storm (>50 dBZ)"></div>
            <span className="text-[9px] text-[#8A94A6]">60+</span>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Playback Bar */}
      <div className="p-4 card-header-divider bg-[#1E2733] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0B72B9] hover:bg-[#0A5A94] text-[#FFFFFF] text-xs font-semibold transition-all cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            {isPlaying ? 'Pause Loop' : 'Play Loop'}
          </button>

          <span className="text-xs text-[#4FA8E0] font-semibold bg-[#0F141A] px-3 py-1.5 rounded-lg card-border">
            {timeLabels[timeIndex]}
          </span>
        </div>

        {/* Timeline step scrubbers */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto flex-1 max-w-md">
          {timeLabels.map((lbl, idx) => (
            <button
              key={lbl}
              onClick={() => {
                setTimeIndex(idx);
                setIsPlaying(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded text-xs transition-all cursor-pointer text-center font-medium ${
                timeIndex === idx
                  ? 'bg-[#0B72B9] text-[#FFFFFF] font-semibold shadow'
                  : 'bg-[#0F141A] text-[#8A94A6] hover:text-[#FFFFFF] hover:bg-[#18202B]'
              }`}
            >
              {lbl.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
