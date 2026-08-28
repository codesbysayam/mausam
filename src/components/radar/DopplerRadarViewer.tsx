import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export type RadarProduct = 'MAXZ' | 'PPZ' | 'PPV' | 'SRI';

export interface RadarStationInfo {
  code: string;
  name: string;
  state: string;
  band: 'S-Band' | 'C-Band' | 'X-Band';
  range: string;
  maxRangeKm: number;
  lat: number;
  lng: number;
  elevationMeters: number;
  frequencyGhz: number;
  peakPowerKw: number;
  status: 'Operational' | 'Calibrating';
  isCoastal: boolean;
  surroundingPlaces: { name: string; distKm: number; azimuthDeg: number; isWater?: boolean }[];
}

export const RADAR_STATIONS_DATA: RadarStationInfo[] = [
  {
    code: 'DWR-GOP',
    name: 'Gopalpur Doppler Radar',
    state: 'Odisha',
    band: 'S-Band',
    range: '500 km',
    maxRangeKm: 500,
    lat: 19.26,
    lng: 84.86,
    elevationMeters: 45,
    frequencyGhz: 2.85,
    peakPowerKw: 500,
    status: 'Operational',
    isCoastal: true,
    surroundingPlaces: [
      { name: 'Berhampur', distKm: 16, azimuthDeg: 295 },
      { name: 'Chilika Lake', distKm: 65, azimuthDeg: 45 },
      { name: 'Chatrapur', distKm: 24, azimuthDeg: 35 },
      { name: 'Bhubaneswar', distKm: 145, azimuthDeg: 42 },
      { name: 'Srikakulam', distKm: 110, azimuthDeg: 220 },
      { name: 'Bay of Bengal Sector', distKm: 180, azimuthDeg: 125, isWater: true },
    ],
  },
  {
    code: 'DWR-PDR',
    name: 'Paradip Doppler Radar',
    state: 'Odisha',
    band: 'S-Band',
    range: '500 km',
    maxRangeKm: 500,
    lat: 20.31,
    lng: 86.61,
    elevationMeters: 28,
    frequencyGhz: 2.82,
    peakPowerKw: 500,
    status: 'Operational',
    isCoastal: true,
    surroundingPlaces: [
      { name: 'Cuttack', distKm: 85, azimuthDeg: 285 },
      { name: 'Bhubaneswar', distKm: 95, azimuthDeg: 265 },
      { name: 'Kendrapada', distKm: 42, azimuthDeg: 320 },
      { name: 'Dhamra Port', distKm: 65, azimuthDeg: 20 },
      { name: 'Puri', distKm: 90, azimuthDeg: 225 },
      { name: 'North Bay Cyclone Track', distKm: 210, azimuthDeg: 135, isWater: true },
    ],
  },
  {
    code: 'DWR-KOL',
    name: 'Kolkata Doppler Radar',
    state: 'West Bengal',
    band: 'S-Band',
    range: '500 km',
    maxRangeKm: 500,
    lat: 22.57,
    lng: 88.36,
    elevationMeters: 12,
    frequencyGhz: 2.87,
    peakPowerKw: 500,
    status: 'Operational',
    isCoastal: true,
    surroundingPlaces: [
      { name: 'Howrah', distKm: 8, azimuthDeg: 280 },
      { name: 'Sundarbans Core', distKm: 85, azimuthDeg: 140 },
      { name: 'Haldia Port', distKm: 65, azimuthDeg: 210 },
      { name: 'Digha Coast', distKm: 130, azimuthDeg: 225 },
      { name: 'Kharagpur', distKm: 115, azimuthDeg: 260 },
      { name: 'Diamond Harbour', distKm: 45, azimuthDeg: 190 },
    ],
  },
  {
    code: 'DWR-DEL',
    name: 'New Delhi (Palam) Radar',
    state: 'Delhi',
    band: 'C-Band',
    range: '250 km',
    maxRangeKm: 250,
    lat: 28.58,
    lng: 77.09,
    elevationMeters: 232,
    frequencyGhz: 5.62,
    peakPowerKw: 250,
    status: 'Operational',
    isCoastal: false,
    surroundingPlaces: [
      { name: 'Gurgaon / Gurugram', distKm: 18, azimuthDeg: 210 },
      { name: 'Noida / Gr. Noida', distKm: 32, azimuthDeg: 105 },
      { name: 'Ghaziabad', distKm: 38, azimuthDeg: 65 },
      { name: 'Faridabad', distKm: 28, azimuthDeg: 145 },
      { name: 'Rohtak', distKm: 65, azimuthDeg: 305 },
      { name: 'Meerut', distKm: 75, azimuthDeg: 45 },
    ],
  },
  {
    code: 'DWR-MUM',
    name: 'Mumbai (Colaba) Radar',
    state: 'Maharashtra',
    band: 'S-Band',
    range: '500 km',
    maxRangeKm: 500,
    lat: 18.91,
    lng: 72.81,
    elevationMeters: 35,
    frequencyGhz: 2.84,
    peakPowerKw: 500,
    status: 'Operational',
    isCoastal: true,
    surroundingPlaces: [
      { name: 'Navi Mumbai', distKm: 25, azimuthDeg: 60 },
      { name: 'Thane', distKm: 36, azimuthDeg: 25 },
      { name: 'Alibaug', distKm: 22, azimuthDeg: 165 },
      { name: 'Pune (Lonavala)', distKm: 95, azimuthDeg: 105 },
      { name: 'Arabian Sea Trough', distKm: 160, azimuthDeg: 260, isWater: true },
      { name: 'Palghar Coast', distKm: 85, azimuthDeg: 350 },
    ],
  },
  {
    code: 'DWR-CHN',
    name: 'Chennai (Port) Radar',
    state: 'Tamil Nadu',
    band: 'S-Band',
    range: '500 km',
    maxRangeKm: 500,
    lat: 13.08,
    lng: 80.29,
    elevationMeters: 18,
    frequencyGhz: 2.86,
    peakPowerKw: 500,
    status: 'Operational',
    isCoastal: true,
    surroundingPlaces: [
      { name: 'Ennore Port', distKm: 22, azimuthDeg: 10 },
      { name: 'Mahabalipuram', distKm: 48, azimuthDeg: 190 },
      { name: 'Kanchipuram', distKm: 68, azimuthDeg: 250 },
      { name: 'Pulicat Lake', distKm: 54, azimuthDeg: 5 },
      { name: 'Coromandel Sea', distKm: 140, azimuthDeg: 95, isWater: true },
      { name: 'Nellore', distKm: 160, azimuthDeg: 345 },
    ],
  },
  {
    code: 'DWR-VSK',
    name: 'Visakhapatnam (Kailasagiri) Radar',
    state: 'Andhra Pradesh',
    band: 'S-Band',
    range: '500 km',
    maxRangeKm: 500,
    lat: 17.74,
    lng: 83.33,
    elevationMeters: 290,
    frequencyGhz: 2.83,
    peakPowerKw: 500,
    status: 'Operational',
    isCoastal: true,
    surroundingPlaces: [
      { name: 'Vizag Port', distKm: 8, azimuthDeg: 215 },
      { name: 'Vizianagaram', distKm: 45, azimuthDeg: 345 },
      { name: 'Anakapalle', distKm: 38, azimuthDeg: 245 },
      { name: 'Kakinada Coast', distKm: 130, azimuthDeg: 215 },
      { name: 'Bay of Bengal Deep', distKm: 190, azimuthDeg: 110, isWater: true },
    ],
  },
  {
    code: 'DWR-JPR',
    name: 'Jaipur Doppler Radar',
    state: 'Rajasthan',
    band: 'C-Band',
    range: '250 km',
    maxRangeKm: 250,
    lat: 26.82,
    lng: 75.80,
    elevationMeters: 390,
    frequencyGhz: 5.64,
    peakPowerKw: 250,
    status: 'Operational',
    isCoastal: false,
    surroundingPlaces: [
      { name: 'Ajmer', distKm: 125, azimuthDeg: 245 },
      { name: 'Alwar', distKm: 110, azimuthDeg: 40 },
      { name: 'Tonk', distKm: 90, azimuthDeg: 175 },
      { name: 'Sikar', distKm: 105, azimuthDeg: 330 },
      { name: 'Bharatpur', distKm: 165, azimuthDeg: 75 },
    ],
  },
];

// Reflectivity dBZ Color Ramp Table (IMD Official Standard)
const REFLECTIVITY_RAMP: { dbz: number; color: string; label: string }[] = [
  { dbz: 5, color: '#101B2B', label: '< 10 dBZ' },
  { dbz: 15, color: '#3A6EA5', label: '15 dBZ (Light)' },
  { dbz: 25, color: '#4FA8E0', label: '25 dBZ (Moderate)' },
  { dbz: 32, color: '#2ECC71', label: '32 dBZ' },
  { dbz: 38, color: '#88D49E', label: '38 dBZ' },
  { dbz: 44, color: '#F1C40F', label: '44 dBZ (Heavy)' },
  { dbz: 49, color: '#FF8C42', label: '49 dBZ' },
  { dbz: 54, color: '#E74C3C', label: '54 dBZ (Very Heavy)' },
  { dbz: 60, color: '#9B59B6', label: '60 dBZ (Severe / Hail)' },
  { dbz: 65, color: '#FFFFFF', label: '65+ dBZ (Extreme)' },
];

// Velocity m/s Color Ramp Table (Negative = Inbound/Approaching, Positive = Outbound/Receding)
const VELOCITY_RAMP: { vel: number; color: string; label: string }[] = [
  { vel: -32, color: '#1B4D3E', label: '-32 m/s (Fast Inbound)' },
  { vel: -20, color: '#2ECC71', label: '-20 m/s' },
  { vel: -10, color: '#5AC8E0', label: '-10 m/s' },
  { vel: -3, color: '#3A6EA5', label: '-3 m/s' },
  { vel: 0, color: '#708090', label: '0 m/s (Zero Isodop)' },
  { vel: 3, color: '#D4AC0D', label: '+3 m/s' },
  { vel: 10, color: '#F39C12', label: '+10 m/s' },
  { vel: 20, color: '#E67E22', label: '+20 m/s' },
  { vel: 32, color: '#C0392B', label: '+32 m/s (Fast Outbound)' },
];

// Surface Rain Intensity mm/hr Ramp Table
const SRI_RAMP: { rate: number; color: string; label: string }[] = [
  { rate: 0.1, color: '#101B2B', label: '< 0.5 mm/h' },
  { rate: 2.5, color: '#3A6EA5', label: '2.5 mm/h (Light)' },
  { rate: 7.5, color: '#4FA8E0', label: '7.5 mm/h' },
  { rate: 15, color: '#2ECC71', label: '15 mm/h (Moderate)' },
  { rate: 30, color: '#F1C40F', label: '30 mm/h (Heavy)' },
  { rate: 50, color: '#FF8C42', label: '50 mm/h' },
  { rate: 75, color: '#E74C3C', label: '75 mm/h (Torrential)' },
  { rate: 100, color: '#8E44AD', label: '100+ mm/h (Extreme)' },
];

interface DopplerRadarViewerProps {
  selectedStation: RadarStationInfo;
  productType: RadarProduct;
  onProductChange: (p: RadarProduct) => void;
  onSelectStation?: (s: RadarStationInfo) => void;
}

export const DopplerRadarViewer: React.FC<DopplerRadarViewerProps> = ({
  selectedStation,
  productType,
  onProductChange,
  onSelectStation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Layout & Dimension cache ref (prevents layout thrashing during animation frames)
  const dimensionsRef = useRef<{ width: number; height: number; dpr: number }>({
    width: 600,
    height: 520,
    dpr: 1,
  });

  // State
  const [elevationCut, setElevationCut] = useState<'0.5°' | '1.2°' | '2.1°' | '4.5°'>('0.5°');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [timeIndex, setTimeIndex] = useState<number>(4);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toggles
  const [showSweepBeam, setShowSweepBeam] = useState<boolean>(true);
  const [showRangeRings, setShowRangeRings] = useState<boolean>(true);
  const [showAzimuths, setShowAzimuths] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [clutterFilter, setClutterFilter] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Telemetry Hover State
  const [hoverData, setHoverData] = useState<{
    azimuth: number;
    rangeKm: number;
    value: string;
    unit: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Animation sweep angle ref
  const sweepAngleRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  // Timeline frames (past 60 mins)
  const timeFrames = useMemo(() => {
    const now = new Date();
    const frames = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 12 * 60 * 1000);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      frames.push({
        label: i === 0 ? 'Live Scan' : `-${i * 12}m`,
        timestamp: `${hh}:${mm} IST`,
        isLive: i === 0,
      });
    }
    return frames;
  }, []);

  // Generate deterministic hydro-meteorological storm cells for the active station
  const stormBlobs = useMemo(() => {
    const seed =
      selectedStation.code.charCodeAt(4) * 31 +
      selectedStation.lat * 10 +
      selectedStation.lng * 10;

    const blobs: {
      azimuth: number;
      distKm: number;
      radiusKm: number;
      peakDbz: number;
      velocityMs: number;
      rainRate: number;
      echoTopKm: number;
      driftAngle: number;
    }[] = [];

    // Drift offset from timeline index (storms moving ENE ~65 deg azimuth)
    const driftKm = (timeIndex - 4) * 7.5;

    // Cell 1: Main Convective Core
    const az1 = (seed * 19) % 360;
    const dist1 = 45 + ((seed * 11) % 180) + driftKm;
    blobs.push({
      azimuth: az1,
      distKm: Math.max(15, dist1),
      radiusKm: 34,
      peakDbz: 56.8,
      velocityMs: az1 > 180 ? -24.5 : 22.0,
      rainRate: 54.0,
      echoTopKm: 14.8,
      driftAngle: 65,
    });

    // Cell 2: Secondary squall line
    const az2 = (az1 + 75) % 360;
    const dist2 = 105 + ((seed * 23) % 140) + driftKm * 0.8;
    blobs.push({
      azimuth: az2,
      distKm: Math.max(20, dist2),
      radiusKm: 46,
      peakDbz: 47.2,
      velocityMs: az2 > 180 ? -16.2 : 18.4,
      rainRate: 28.5,
      echoTopKm: 11.5,
      driftAngle: 70,
    });

    // Cell 3: Stratiform Rain Shield
    const az3 = (az1 + 190) % 360;
    const dist3 = 80 + ((seed * 37) % 160) + driftKm * 0.5;
    blobs.push({
      azimuth: az3,
      distKm: Math.max(10, dist3),
      radiusKm: 75,
      peakDbz: 34.0,
      velocityMs: az3 > 180 ? -8.5 : 9.2,
      rainRate: 8.4,
      echoTopKm: 7.2,
      driftAngle: 60,
    });

    // Coastal / Maritime convective cluster
    if (selectedStation.isCoastal) {
      blobs.push({
        azimuth: 120, // Sea direction
        distKm: 160 + driftKm * 1.2,
        radiusKm: 62,
        peakDbz: 52.4,
        velocityMs: -22.5,
        rainRate: 44.0,
        echoTopKm: 13.8,
        driftAngle: 55,
      });
    }

    return blobs;
  }, [selectedStation, timeIndex]);

  // Main Radar Canvas Rendering Function (Runs fast, zero DOM reflow)
  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = dimensionsRef.current;
    if (width <= 0 || height <= 0) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    const centerX = width / 2 + panOffset.x;
    const centerY = height / 2 + panOffset.y;
    const maxRadius = (Math.min(width, height) / 2 - 25) * zoomLevel;

    // 1. Deep Space Scope Background Fill
    ctx.fillStyle = '#070C14';
    ctx.fillRect(0, 0, width, height);

    // 2. Polar Scope Background Circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#04080F';
    ctx.fill();
    ctx.strokeStyle = '#1F2E42';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.clip(); // Restrict radar echoes strictly within boundary

    // 3. Coastal / Ocean boundary indication
    if (selectedStation.isCoastal) {
      ctx.save();
      ctx.fillStyle = 'rgba(11, 114, 185, 0.09)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius * 1.2, (Math.PI / 180) * 40, (Math.PI / 180) * 220);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 4. Render Weather Radar Product Echoes
    const kmToPx = maxRadius / selectedStation.maxRangeKm;

    stormBlobs.forEach((blob) => {
      const blobRad = (blob.azimuth - 90) * (Math.PI / 180);
      const bx = centerX + Math.cos(blobRad) * (blob.distKm * kmToPx);
      const by = centerY + Math.sin(blobRad) * (blob.distKm * kmToPx);
      const radiusPx = blob.radiusKm * kmToPx;

      const grad = ctx.createRadialGradient(bx, by, radiusPx * 0.1, bx, by, radiusPx);

      if (productType === 'MAXZ' || productType === 'PPZ') {
        const peak = productType === 'PPZ' ? blob.peakDbz * 0.85 : blob.peakDbz;
        if (peak >= 55) {
          grad.addColorStop(0, '#FFFFFF'); // Extreme Core
          grad.addColorStop(0.2, '#9B59B6'); // Severe
          grad.addColorStop(0.45, '#E74C3C'); // Red
          grad.addColorStop(0.7, '#F1C40F'); // Yellow
          grad.addColorStop(0.88, '#2ECC71'); // Green
          grad.addColorStop(1, 'rgba(58, 110, 165, 0)');
        } else if (peak >= 42) {
          grad.addColorStop(0, '#E74C3C');
          grad.addColorStop(0.35, '#F1C40F');
          grad.addColorStop(0.65, '#2ECC71');
          grad.addColorStop(0.88, '#4FA8E0');
          grad.addColorStop(1, 'rgba(58, 110, 165, 0)');
        } else {
          grad.addColorStop(0, '#2ECC71');
          grad.addColorStop(0.45, '#4FA8E0');
          grad.addColorStop(0.8, '#3A6EA5');
          grad.addColorStop(1, 'rgba(30, 39, 51, 0)');
        }
      } else if (productType === 'PPV') {
        if (blob.velocityMs < 0) {
          grad.addColorStop(0, '#1B4D3E');
          grad.addColorStop(0.35, '#2ECC71');
          grad.addColorStop(0.75, '#5AC8E0');
          grad.addColorStop(1, 'rgba(112, 128, 144, 0)');
        } else {
          grad.addColorStop(0, '#C0392B');
          grad.addColorStop(0.35, '#E67E22');
          grad.addColorStop(0.75, '#F39C12');
          grad.addColorStop(1, 'rgba(112, 128, 144, 0)');
        }
      } else if (productType === 'SRI') {
        if (blob.rainRate >= 45) {
          grad.addColorStop(0, '#8E44AD');
          grad.addColorStop(0.25, '#E74C3C');
          grad.addColorStop(0.55, '#FF8C42');
          grad.addColorStop(0.8, '#2ECC71');
          grad.addColorStop(1, 'rgba(79, 168, 224, 0)');
        } else {
          grad.addColorStop(0, '#2ECC71');
          grad.addColorStop(0.45, '#4FA8E0');
          grad.addColorStop(0.8, '#3A6EA5');
          grad.addColorStop(1, 'rgba(30, 39, 51, 0)');
        }
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, radiusPx, 0, Math.PI * 2);
      ctx.fill();

      // SCIT Storm Cell Vector & Centroid Marker
      if (productType === 'MAXZ' && blob.peakDbz >= 45) {
        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = '#FFFFFF';

        // Center dot
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();

        // Direction track arrow
        const trackRad = (blob.driftAngle - 90) * (Math.PI / 180);
        const arrowLength = 24 * zoomLevel;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(trackRad) * arrowLength, by + Math.sin(trackRad) * arrowLength);
        ctx.stroke();

        // Label
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#FFC93C';
        ctx.fillText(`${blob.peakDbz.toFixed(0)} dBZ | ${blob.echoTopKm}km`, bx + 6, by - 6);
        ctx.restore();
      }
    });

    // 5. Clutter Notch Filter Ring at center
    if (clutterFilter) {
      const clutterRingPx = 7 * kmToPx;
      ctx.beginPath();
      ctx.arc(centerX, centerY, clutterRingPx, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(7, 12, 20, 0.85)';
      ctx.fill();
    }

    // 6. Rotating Doppler Sweep Beam with Phosphor Trail
    if (showSweepBeam && isPlaying) {
      const currentSweepAngle = sweepAngleRef.current;
      const sweepRad = (currentSweepAngle - 90) * (Math.PI / 180);
      const sweepLength = maxRadius;

      // Fading tail fan
      const tailAngle = 35;
      const tailRad = (currentSweepAngle - 90 - tailAngle) * (Math.PI / 180);

      const sweepGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, sweepLength);
      sweepGrad.addColorStop(0, 'rgba(46, 204, 113, 0.35)');
      sweepGrad.addColorStop(0.7, 'rgba(79, 168, 224, 0.18)');
      sweepGrad.addColorStop(1, 'rgba(11, 114, 185, 0.02)');

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, sweepLength, tailRad, sweepRad);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sharp Leading Line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepRad) * sweepLength, centerY + Math.sin(sweepRad) * sweepLength);
      ctx.strokeStyle = '#2ECC71';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // 7. Range Rings & Distance Labels
    if (showRangeRings) {
      const ringsKm =
        selectedStation.maxRangeKm === 250
          ? [50, 100, 150, 200, 250]
          : [100, 200, 300, 400, 500];

      ringsKm.forEach((rKm) => {
        const rPx = rKm * kmToPx;
        ctx.beginPath();
        ctx.arc(centerX, centerY, rPx, 0, Math.PI * 2);
        ctx.strokeStyle = rKm === selectedStation.maxRangeKm ? '#4FA8E0' : 'rgba(79, 168, 224, 0.3)';
        ctx.lineWidth = rKm === selectedStation.maxRangeKm ? 1.2 : 0.8;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on north axis
        ctx.font = '9px monospace';
        ctx.fillStyle = '#8A94A6';
        ctx.fillText(`${rKm} km`, centerX + 4, centerY - rPx + 11);
      });
    }

    // 8. Azimuth Radials & Compass Degrees (Every 30°)
    if (showAzimuths) {
      const cardinals: Record<number, string> = {
        0: 'N 000°',
        30: '030°',
        60: '060°',
        90: 'E 090°',
        120: '120°',
        150: '150°',
        180: 'S 180°',
        210: '210°',
        240: '240°',
        270: 'W 270°',
        300: '300°',
        330: '330°',
      };

      for (let deg = 0; deg < 360; deg += 30) {
        const rad = (deg - 90) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(rad) * maxRadius, centerY + Math.sin(rad) * maxRadius);
        ctx.strokeStyle = deg % 90 === 0 ? 'rgba(79, 168, 224, 0.4)' : 'rgba(51, 65, 85, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cardinal text
        const textDist = maxRadius - 14;
        const tx = centerX + Math.cos(rad) * textDist;
        const ty = centerY + Math.sin(rad) * textDist;
        ctx.font = deg % 90 === 0 ? 'bold 9px monospace' : '8px monospace';
        ctx.fillStyle = deg % 90 === 0 ? '#4FA8E0' : '#8A94A6';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cardinals[deg], tx, ty);
      }
    }

    // 9. Surrounding Geographic Landmark Markers
    if (showLandmarks) {
      selectedStation.surroundingPlaces.forEach((place) => {
        const pRad = (place.azimuthDeg - 90) * (Math.PI / 180);
        const px = centerX + Math.cos(pRad) * (place.distKm * kmToPx);
        const py = centerY + Math.sin(pRad) * (place.distKm * kmToPx);

        // Marker dot
        ctx.beginPath();
        ctx.arc(px, py, place.isWater ? 2 : 2.8, 0, Math.PI * 2);
        ctx.fillStyle = place.isWater ? '#4FA8E0' : '#E1E6EB';
        ctx.fill();

        // Label
        ctx.font = place.isWater ? 'italic 9px sans-serif' : 'bold 9.5px sans-serif';
        ctx.fillStyle = place.isWater ? '#4FA8E0' : '#CBD5E1';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${place.name} (${place.distKm}km)`, px + 5, py);
      });
    }

    ctx.restore(); // Exit clip

    // 10. Center Radar Bullseye
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#E74C3C';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(`${selectedStation.name} [${selectedStation.code}]`, centerX, centerY + 16);

    // 11. Crosshair Hover Indicator
    if (hoverData) {
      const hRad = (hoverData.azimuth - 90) * (Math.PI / 180);
      const hx = centerX + Math.cos(hRad) * (hoverData.rangeKm * kmToPx);
      const hy = centerY + Math.sin(hRad) * (hoverData.rangeKm * kmToPx);

      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFC93C';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore(); // Exit dpr scale
  }, [
    selectedStation,
    productType,
    zoomLevel,
    panOffset,
    isPlaying,
    showSweepBeam,
    showRangeRings,
    showAzimuths,
    showLandmarks,
    clutterFilter,
    hoverData,
    stormBlobs,
  ]);

  // Robust ResizeObserver: sets buffer dimensions once on resize without layout reflows in loop
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.floor(entry.contentRect.width);
        const height = Math.max(500, Math.floor(width * 0.72));
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

        dimensionsRef.current = { width, height, dpr };

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        drawRadar();
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [drawRadar]);

  // High-performance animation loop (Zero DOM reflows inside requestAnimationFrame)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlayingRef.current) {
        sweepAngleRef.current = (sweepAngleRef.current + delta * 60 * playbackSpeedRef.current) % 360;
        drawRadar();
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [drawRadar]);

  // Timeline Auto-Advance when in Play mode
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeIndex((prev) => (prev + 1) % timeFrames.length);
    }, 3200 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, timeFrames.length]);

  // Redraw when state updates
  useEffect(() => {
    drawRadar();
  }, [drawRadar]);

  // Mouse pan and hover handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const { width, height } = dimensionsRef.current;
    if (width <= 0 || height <= 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const centerX = width / 2 + panOffset.x;
    const centerY = height / 2 + panOffset.y;
    const maxRadius = (Math.min(width, height) / 2 - 25) * zoomLevel;
    const kmToPx = maxRadius / selectedStation.maxRangeKm;

    const dx = mx - centerX;
    const dy = my - centerY;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const rangeKm = Math.min(selectedStation.maxRangeKm, distPx / kmToPx);

    let angleDeg = (Math.atan2(dy, dx) * (180 / Math.PI) + 90) % 360;
    if (angleDeg < 0) angleDeg += 360;

    let valStr = '0.0';
    let unit = 'dBZ';

    if (productType === 'MAXZ' || productType === 'PPZ') {
      const sample = Math.max(0, Math.min(65, Math.sin(angleDeg * 0.05) * 25 + Math.cos(rangeKm * 0.08) * 30 + 15));
      valStr = sample > 12 ? sample.toFixed(1) : '< 12 (No Echo)';
      unit = 'dBZ';
    } else if (productType === 'PPV') {
      const sample = (Math.sin(angleDeg * (Math.PI / 180)) * 28.5).toFixed(1);
      valStr = Number(sample) > 0 ? `+${sample} (Outbound)` : `${sample} (Inbound)`;
      unit = 'm/s';
    } else if (productType === 'SRI') {
      const sample = Math.max(0, Math.min(85, Math.sin(angleDeg * 0.04) * 20 + Math.cos(rangeKm * 0.06) * 35));
      valStr = sample > 2 ? `${sample.toFixed(1)} mm/h` : '0.0 mm/h';
      unit = 'mm/hr';
    }

    if (distPx <= maxRadius) {
      setHoverData({
        azimuth: Math.round(angleDeg),
        rangeKm: Math.round(rangeKm),
        value: valStr,
        unit,
        lat: Number((selectedStation.lat + (Math.cos((angleDeg * Math.PI) / 180) * rangeKm) / 111).toFixed(3)),
        lng: Number(
          (
            selectedStation.lng +
            (Math.sin((angleDeg * Math.PI) / 180) * rangeKm) /
              (111 * Math.cos((selectedStation.lat * Math.PI) / 180))
          ).toFixed(3)
        ),
      });
    } else {
      setHoverData(null);
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0012;
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.7), 3.0));
  };

  // High-Resolution IMD Radar Composite Export
  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 1200;
      exportCanvas.height = 950;
      const expCtx = exportCanvas.getContext('2d');
      if (!expCtx) return;

      // Dark background
      expCtx.fillStyle = '#060B12';
      expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // Header Bar
      expCtx.fillStyle = '#1E2733';
      expCtx.fillRect(0, 0, exportCanvas.width, 80);

      expCtx.fillStyle = '#FFFFFF';
      expCtx.font = 'bold 20px sans-serif';
      expCtx.fillText(`MAUSAM • INDIA METEOROLOGICAL DEPARTMENT (IMD)`, 30, 36);

      expCtx.font = '13px sans-serif';
      expCtx.fillStyle = '#4FA8E0';
      expCtx.fillText(
        `Station: ${selectedStation.name} (${selectedStation.code}) | Product: ${productType} | Scan Time: ${timeFrames[timeIndex].timestamp}`,
        30,
        60
      );

      // Draw radar canvas
      expCtx.drawImage(canvas, 100, 90, 1000, 800);

      // Footer
      expCtx.fillStyle = '#8A94A6';
      expCtx.font = '11px monospace';
      expCtx.fillText(
        `WMO Standard DWR Calibration | Max Range: ${selectedStation.range} | Band: ${selectedStation.band}`,
        30,
        925
      );

      const link = document.createElement('a');
      link.download = `IMD_Radar_${selectedStation.code}_${productType}_${Date.now()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-sans select-none">
      {/* 1. Radar Scope Top Controller Bar */}
      <div className="bg-[#1E2733] border border-[#334155] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Product Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider hidden sm:inline">
            Product:
          </span>
          <div className="flex bg-[#0F141A] border border-[#334155] rounded p-1">
            {(['MAXZ', 'PPZ', 'PPV', 'SRI'] as const).map((prod) => (
              <button
                key={prod}
                type="button"
                onClick={() => onProductChange(prod)}
                className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                  productType === prod
                    ? 'bg-[#0B72B9] text-white shadow-md'
                    : 'text-[#8A94A6] hover:text-white hover:bg-[#1E2733]'
                }`}
                title={
                  prod === 'MAXZ'
                    ? 'Maximum Composite Reflectivity (0-65 dBZ)'
                    : prod === 'PPZ'
                    ? 'Plan Position Indicator (PPI) 0.5° Reflectivity'
                    : prod === 'PPV'
                    ? 'Doppler Radial Velocity (-32 to +32 m/s)'
                    : 'Surface Rainfall Intensity (mm/hr)'
                }
              >
                {prod}
              </button>
            ))}
          </div>
        </div>

        {/* Elevation Cut */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8A94A6] hidden md:inline">Cut:</span>
          <div className="flex bg-[#0F141A] border border-[#334155] rounded p-0.5 text-xs">
            {(['0.5°', '1.2°', '2.1°', '4.5°'] as const).map((cut) => (
              <button
                key={cut}
                type="button"
                onClick={() => setElevationCut(cut)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  elevationCut === cut
                    ? 'bg-[#4FA8E0]/20 text-[#4FA8E0] font-bold'
                    : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                {cut}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setClutterFilter((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              clutterFilter
                ? 'bg-[#2ECC71]/15 border-[#2ECC71]/40 text-[#2ECC71]'
                : 'bg-[#0F141A] border-[#334155] text-[#8A94A6]'
            }`}
            title="Toggle Doppler Ground Clutter Notch Filter"
          >
            <span className="material-symbols-outlined text-[15px]">filter_alt</span>
            <span className="hidden sm:inline">Clutter Filter</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSnapshot}
            disabled={isExporting}
            className="px-2.5 py-1.5 rounded bg-[#0F141A] border border-[#334155] hover:border-[#4FA8E0] text-[#D7DEE8] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download high-resolution radar PNG image"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Radar Canvas Scope Container */}
      <div
        ref={containerRef}
        className="relative bg-[#070C14] border border-[#334155] rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[500px]"
      >
        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="cursor-crosshair block"
        />

        {/* Top Left Floating Badge on Canvas */}
        <div className="absolute top-3 left-3 bg-[#0F141A]/90 backdrop-blur border border-[#334155] rounded-lg p-2.5 text-xs flex flex-col gap-1 max-w-[260px] pointer-events-none z-10">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse"></span>
              {selectedStation.name}
            </span>
            <span className="px-1.5 py-0.5 bg-[#0B72B9]/30 text-[#4FA8E0] rounded font-mono text-[10px] font-bold">
              {selectedStation.code}
            </span>
          </div>
          <div className="text-[11px] text-[#8A94A6] flex justify-between">
            <span>{selectedStation.band} ({selectedStation.frequencyGhz} GHz)</span>
            <span className="text-[#2ECC71]">Max: {selectedStation.range}</span>
          </div>
          <div className="text-[10px] text-[#4FA8E0] font-mono border-t border-[#334155] pt-1 mt-0.5 flex justify-between">
            <span>Product: {productType}</span>
            <span>Cut: {elevationCut}</span>
          </div>
        </div>

        {/* Top Right Floating Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-[#0F141A]/90 backdrop-blur border border-[#334155] rounded-lg p-1.5 z-10">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3.0))}
            className="w-7 h-7 rounded bg-[#1E2733] hover:bg-[#0B72B9] text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.7))}
            className="w-7 h-7 rounded bg-[#1E2733] hover:bg-[#0B72B9] text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="w-7 h-7 rounded bg-[#1E2733] hover:bg-[#0B72B9] text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Center Reset"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          </button>
          <div className="h-[1px] bg-[#334155] my-0.5"></div>
          <button
            type="button"
            onClick={() => setShowRangeRings((r) => !r)}
            className={`w-7 h-7 rounded flex items-center justify-center text-xs transition-colors cursor-pointer ${
              showRangeRings ? 'bg-[#0B72B9] text-white' : 'bg-[#1E2733] text-[#8A94A6]'
            }`}
            title="Toggle Range Rings"
          >
            <span className="material-symbols-outlined text-[15px]">radar</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLandmarks((l) => !l)}
            className={`w-7 h-7 rounded flex items-center justify-center text-xs transition-colors cursor-pointer ${
              showLandmarks ? 'bg-[#0B72B9] text-white' : 'bg-[#1E2733] text-[#8A94A6]'
            }`}
            title="Toggle Geographic Landmarks"
          >
            <span className="material-symbols-outlined text-[15px]">pin_drop</span>
          </button>
        </div>

        {/* Bottom Left Pinpoint Telemetry Hover Panel */}
        {hoverData && (
          <div className="absolute bottom-3 left-3 bg-[#0F141A]/95 backdrop-blur border border-[#4FA8E0]/50 rounded-lg px-3 py-2 text-xs flex items-center gap-3 shadow-lg pointer-events-none z-10 animate-fade-in">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">explore</span>
            <div>
              <div className="font-bold text-white text-[11px] flex gap-2">
                <span>Az: {hoverData.azimuth}°</span>
                <span>R: {hoverData.rangeKm} km</span>
                <span className="text-[#8A94A6] font-mono font-normal">
                  ({hoverData.lat}°N, {hoverData.lng}°E)
                </span>
              </div>
              <div className="text-[11px] text-[#4FA8E0] font-mono font-bold mt-0.5">
                {productType}: {hoverData.value} {hoverData.value.includes('No') ? '' : hoverData.unit}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Color Scale Legend on Bottom Right */}
        <div className="absolute bottom-3 right-3 bg-[#0F141A]/90 backdrop-blur border border-[#334155] rounded-lg p-2 flex flex-col gap-1 text-[10px] pointer-events-none z-10 max-w-[280px] sm:max-w-none">
          <span className="font-bold text-white text-[9px] uppercase tracking-wider mb-0.5">
            {productType === 'MAXZ'
              ? 'Reflectivity (dBZ)'
              : productType === 'PPZ'
              ? 'PPI Reflectivity (dBZ)'
              : productType === 'PPV'
              ? 'Radial Velocity (m/s)'
              : 'Rain Rate (mm/hr)'}
          </span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {productType === 'MAXZ' || productType === 'PPZ' ? (
              REFLECTIVITY_RAMP.map((item) => (
                <div key={item.dbz} className="flex flex-col items-center shrink-0">
                  <div
                    className="w-3.5 sm:w-4 h-2.5 sm:h-3 rounded-xs border border-black/40"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-[7.5px] sm:text-[8px] text-[#8A94A6] mt-0.5">{item.dbz}</span>
                </div>
              ))
            ) : productType === 'PPV' ? (
              VELOCITY_RAMP.map((item) => (
                <div key={item.vel} className="flex flex-col items-center shrink-0">
                  <div
                    className="w-3.5 sm:w-4 h-2.5 sm:h-3 rounded-xs border border-black/40"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-[7.5px] sm:text-[8px] text-[#8A94A6] mt-0.5">{item.vel}</span>
                </div>
              ))
            ) : (
              SRI_RAMP.map((item) => (
                <div key={item.rate} className="flex flex-col items-center shrink-0">
                  <div
                    className="w-3.5 sm:w-4 h-2.5 sm:h-3 rounded-xs border border-black/40"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-[7.5px] sm:text-[8px] text-[#8A94A6] mt-0.5">{item.rate}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Live Radar Playback Timeline Controls */}
      <div className="bg-[#1E2733] border border-[#334155] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Play/Pause & Step Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1.5 rounded-lg bg-[#0B72B9] hover:bg-[#0B72B9]/80 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTimeIndex((t) => (t - 1 + timeFrames.length) % timeFrames.length)}
            className="w-8 h-8 rounded bg-[#0F141A] hover:bg-[#0B72B9] text-white flex items-center justify-center border border-[#334155] transition-colors cursor-pointer"
            title="Step Back"
          >
            <span className="material-symbols-outlined text-[16px]">skip_previous</span>
          </button>

          <button
            type="button"
            onClick={() => setTimeIndex((t) => (t + 1) % timeFrames.length)}
            className="w-8 h-8 rounded bg-[#0F141A] hover:bg-[#0B72B9] text-white flex items-center justify-center border border-[#334155] transition-colors cursor-pointer"
            title="Step Forward"
          >
            <span className="material-symbols-outlined text-[16px]">skip_next</span>
          </button>

          <button
            type="button"
            onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))}
            className="px-2 py-1 rounded bg-[#0F141A] border border-[#334155] text-xs font-mono font-bold text-[#4FA8E0] hover:border-[#4FA8E0] transition-colors cursor-pointer"
            title="Toggle Playback Speed"
          >
            {playbackSpeed}x
          </button>
        </div>

        {/* Time Frames Slider / Track */}
        <div className="flex items-center gap-1.5 flex-1 max-w-xl w-full">
          {timeFrames.map((frame, idx) => (
            <button
              key={frame.label}
              type="button"
              onClick={() => {
                setTimeIndex(idx);
                setIsPlaying(false);
              }}
              className={`flex-1 py-1.5 px-1 rounded text-center transition-all cursor-pointer ${
                timeIndex === idx
                  ? frame.isLive
                    ? 'bg-[#2ECC71] text-black font-bold shadow-md'
                    : 'bg-[#0B72B9] text-white font-bold shadow-md'
                  : 'bg-[#0F141A] text-[#8A94A6] hover:text-white border border-[#334155]'
              }`}
            >
              <div className="text-[10px] leading-tight truncate">{frame.label}</div>
              <div className="text-[9px] opacity-75 font-mono truncate">{frame.timestamp.split(' ')[0]}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
