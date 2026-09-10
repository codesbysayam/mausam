/**
 * ====================================================================
 * MAUSAM - Atmospheric Intelligence Platform
 * Standalone Doppler Weather Radar (DWR) HTML5 Canvas Raster Engine
 * ====================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RadarAnimationEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // IMD Standard DWR Reflectivity (dBZ) Color Palette
  const DBZ_PALETTE = [
    { dbz: 5,  color: [160, 230, 255, 0.4] },  // Very light cloud
    { dbz: 15, color: [75, 170, 255, 0.6] },   // Drizzle
    { dbz: 25, color: [40, 200, 70, 0.8] },    // Light rain
    { dbz: 35, color: [255, 235, 50, 0.9] },   // Moderate rain
    { dbz: 45, color: [255, 140, 0, 0.95] },   // Heavy rain
    { dbz: 55, color: [230, 20, 20, 1.0] },    // Severe storm
    { dbz: 65, color: [200, 0, 200, 1.0] },    // Extreme hail
  ];

  class RadarAnimationEngine {
    constructor(canvasElement, options = {}) {
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext('2d');
      this.frames = [];
      this.currentFrameIndex = 0;
      this.isPlaying = false;
      this.fps = options.fps || 2;
      this.timerId = null;
      this.onFrameChange = options.onFrameChange || null;
      this.rangeRingsKm = [50, 100, 150, 200, 250];
      this.maxRangeKm = 250;
    }

    loadFrames(frames) {
      this.frames = frames || [];
      this.currentFrameIndex = 0;
      this.renderCurrentFrame();
    }

    play() {
      if (this.isPlaying || this.frames.length <= 1) return;
      this.isPlaying = true;
      const interval = 1000 / this.fps;
      this.timerId = setInterval(() => {
        this.nextFrame();
      }, interval);
    }

    pause() {
      this.isPlaying = false;
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }

    nextFrame() {
      if (this.frames.length === 0) return;
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
      this.renderCurrentFrame();
    }

    prevFrame() {
      if (this.frames.length === 0) return;
      this.currentFrameIndex = (this.currentFrameIndex - 1 + this.frames.length) % this.frames.length;
      this.renderCurrentFrame();
    }

    renderCurrentFrame() {
      const { width, height } = this.canvas;
      this.ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadiusPx = Math.min(centerX, centerY) * 0.92;

      // 1. Draw Range Rings & Azimuth Spoke Grid
      this.drawRangeGrid(centerX, centerY, maxRadiusPx);

      // 2. Render Synthetic or Real Reflectivity Echoes
      const currentFrame = this.frames[this.currentFrameIndex];
      if (currentFrame && currentFrame.echoes) {
        this.renderEchoes(currentFrame.echoes, centerX, centerY, maxRadiusPx);
      }

      // 3. Center Radar Station Crosshair
      this.drawCrosshair(centerX, centerY);

      if (typeof this.onFrameChange === 'function') {
        this.onFrameChange(this.currentFrameIndex, currentFrame);
      }
    }

    drawRangeGrid(cx, cy, maxR) {
      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      this.rangeRingsKm.forEach((km) => {
        const r = (km / this.maxRangeKm) * maxR;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.font = '10px monospace';
        ctx.fillText(`${km}km`, cx + 4, cy - r + 12);
      });

      // Azimuth lines (every 45 degrees)
      for (let deg = 0; deg < 360; deg += 45) {
        const rad = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * maxR, cy + Math.sin(rad) * maxR);
        ctx.stroke();
      }

      ctx.restore();
    }

    renderEchoes(echoes, cx, cy, maxR) {
      const ctx = this.ctx;
      echoes.forEach((echo) => {
        const x = cx + (echo.x / this.maxRangeKm) * maxR;
        const y = cy + (echo.y / this.maxRangeKm) * maxR;
        const radius = (echo.radiusKm / this.maxRangeKm) * maxR;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const col = this.getColorForDbz(echo.dbz);
        grad.addColorStop(0, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${col[3]})`);
        grad.addColorStop(0.7, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${col[3] * 0.5})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    getColorForDbz(dbz) {
      for (let i = DBZ_PALETTE.length - 1; i >= 0; i--) {
        if (dbz >= DBZ_PALETTE[i].dbz) return DBZ_PALETTE[i].color;
      }
      return [160, 230, 255, 0.2];
    }

    drawCrosshair(cx, cy) {
      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  return RadarAnimationEngine;
}));
