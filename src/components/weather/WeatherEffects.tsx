import React, { useEffect, useRef } from 'react';
import {
  CentralWeatherCondition,
  getConditionEffectType,
  WeatherVisualEffectType,
} from '../../services/weatherConditions';

export interface WeatherEffectsProps {
  condition: CentralWeatherCondition;
  intensity?: 'light' | 'moderate' | 'heavy';
  isDay?: boolean;
  className?: string;
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  length?: number;
  opacity: number;
  phase?: number;
  phaseSpeed?: number;
  swaySpeed?: number;
  swayAmp?: number;
}

interface Splash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

/**
 * WeatherEffects: Central Data-Driven Weather Atmospheric Visual Component
 *
 * Renders high-performance, GPU-accelerated canvas particles strictly aligned
 * with the current meteorological condition.
 *
 * Guaranteed Behavior:
 * - CLEAR_DAY / CLEAR_NIGHT: 100% ZERO RAIN.
 * - CLOUDY / FOG: 100% ZERO RAIN.
 * - RAIN / THUNDERSTORM: Data-driven precipitation.
 * - Clears canvas immediately on unmount or condition switch (prevents stale visuals).
 * - Honors 'prefers-reduced-motion' for accessibility.
 * - Pointer-events: none (never blocks clicks).
 */
export const WeatherEffects: React.FC<WeatherEffectsProps> = ({
  condition,
  intensity = 'moderate',
  isDay = false,
  className = '',
  opacity = 1,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check user accessibility preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const effectType: WeatherVisualEffectType = getConditionEffectType(condition);

    // If condition is 'none' (UNKNOWN) or user requested reduced motion, wipe canvas and exit
    if (effectType === 'none' || prefersReducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const particles: Particle[] = [];
    const splashes: Splash[] = [];

    // Lightning state for THUNDERSTORM effect
    let nextLightningTime = Date.now() + 3000 + Math.random() * 4000;
    let lightningDuration = 0;
    let lightningAlpha = 0;

    const initParticles = () => {
      particles.length = 0;
      splashes.length = 0;
      if (width <= 0 || height <= 0) return;

      const densityMultiplier =
        intensity === 'heavy' ? 1.3 : intensity === 'light' ? 0.7 : 1.0;

      switch (effectType) {
        case 'stars': {
          // Delicate twinkling stars for CLEAR_NIGHT (Strictly NO rain)
          const count = Math.round(Math.min(50, Math.max(25, (width * height) / 18000)) * densityMultiplier);
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * width,
              y: Math.random() * (height * 0.85),
              speedX: 0,
              speedY: 0,
              size: 0.8 + Math.random() * 1.5,
              opacity: 0.2 + Math.random() * 0.7,
              phase: Math.random() * Math.PI * 2,
              phaseSpeed: 0.02 + Math.random() * 0.03,
            });
          }
          break;
        }

        case 'sun_glow': {
          // Floating golden dust motes for CLEAR_DAY (Strictly NO rain)
          const count = Math.round(Math.min(22, Math.max(12, (width * height) / 32000)) * densityMultiplier);
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              speedX: (Math.random() - 0.5) * 0.2,
              speedY: -0.15 - Math.random() * 0.35,
              size: 1.5 + Math.random() * 2.2,
              opacity: 0.15 + Math.random() * 0.35,
              phase: Math.random() * Math.PI * 2,
              phaseSpeed: 0.015,
            });
          }
          break;
        }

        case 'clouds': {
          // Translucent cloud puffs for CLOUDY / PARTLY CLOUDY (Strictly NO rain)
          const count = Math.round(Math.min(7, Math.max(4, width / 200)));
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * width,
              y: Math.random() * (height * 0.6),
              speedX: 0.12 + Math.random() * 0.2,
              speedY: (Math.random() - 0.5) * 0.05,
              size: 60 + Math.random() * 100,
              opacity: 0.04 + Math.random() * 0.07,
            });
          }
          break;
        }

        case 'fog': {
          // Broad horizontal mist bands for FOG (Strictly NO rain)
          const count = Math.round(Math.min(6, Math.max(3, height / 80)));
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * width,
              y: (i / count) * height + Math.random() * 30,
              speedX: 0.15 + Math.random() * 0.2,
              speedY: 0,
              size: 45 + Math.random() * 60,
              opacity: 0.05 + Math.random() * 0.08,
            });
          }
          break;
        }

        case 'drizzle': {
          // Fine light drizzle streaks
          const count = Math.round(Math.min(60, Math.max(30, width / 20)) * densityMultiplier);
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * (width + 100),
              y: Math.random() * height,
              speedX: -1.2 + (Math.random() - 0.5) * 0.5,
              speedY: 7 + Math.random() * 4,
              length: 6 + Math.random() * 6,
              size: 0.8,
              opacity: 0.2 + Math.random() * 0.25,
            });
          }
          break;
        }

        case 'rain': {
          // Active standard rain streaks
          const count = Math.round(Math.min(90, Math.max(45, width / 14)) * densityMultiplier);
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * (width + 150),
              y: Math.random() * height,
              speedX: -2.5 + (Math.random() - 0.5) * 0.8,
              speedY: 14 + Math.random() * 8,
              length: 12 + Math.random() * 14,
              size: 1.2,
              opacity: 0.3 + Math.random() * 0.35,
            });
          }
          break;
        }

        case 'heavy_rain':
        case 'thunderstorm': {
          // Dense fast rain streaks with ground splash feedback
          const count = Math.round(Math.min(140, Math.max(70, width / 9)) * densityMultiplier);
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * (width + 200),
              y: Math.random() * height,
              speedX: -3.8 + (Math.random() - 0.5) * 1.2,
              speedY: 20 + Math.random() * 10,
              length: 18 + Math.random() * 18,
              size: 1.5,
              opacity: 0.35 + Math.random() * 0.4,
            });
          }
          break;
        }

        case 'snow': {
          // Soft floating snow flakes with sinusoidal horizontal drift
          const count = Math.round(Math.min(65, Math.max(30, width / 20)) * densityMultiplier);
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * width,
              y: Math.random() * height,
              speedX: (Math.random() - 0.5) * 0.6,
              speedY: 1.2 + Math.random() * 1.6,
              size: 1.8 + Math.random() * 2.8,
              opacity: 0.35 + Math.random() * 0.45,
              phase: Math.random() * Math.PI * 2,
              swaySpeed: 0.02 + Math.random() * 0.02,
              swayAmp: 0.8 + Math.random() * 1.2,
            });
          }
          break;
        }

        case 'sleet': {
          // Mixed ice pellets and cold drizzle
          const count = Math.round(Math.min(75, Math.max(35, width / 16)) * densityMultiplier);
          for (let i = 0; i < count; i++) {
            particles.push({
              x: Math.random() * (width + 120),
              y: Math.random() * height,
              speedX: -2.0 + Math.random(),
              speedY: 12 + Math.random() * 6,
              length: 8 + Math.random() * 8,
              size: 1.4,
              opacity: 0.3 + Math.random() * 0.35,
            });
          }
          break;
        }
      }
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      initParticles();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    handleResize();

    // Render loop
    const render = () => {
      if (width <= 0 || height <= 0) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const now = Date.now();

      // THUNDERSTORM: Lightning flash effect
      if (effectType === 'thunderstorm') {
        if (now > nextLightningTime) {
          lightningDuration = 120 + Math.random() * 100; // ms
          lightningAlpha = 0.28 + Math.random() * 0.22;
          nextLightningTime = now + 5000 + Math.random() * 8000;
        }

        if (lightningDuration > 0) {
          lightningDuration -= 16;
          // Flickering illumination
          const currentAlpha = Math.random() > 0.3 ? lightningAlpha : lightningAlpha * 0.3;
          ctx.fillStyle = `rgba(220, 238, 255, ${currentAlpha * opacity})`;
          ctx.fillRect(0, 0, width, height);
        }
      }

      // RENDER SPECIFIC EFFECTS
      switch (effectType) {
        case 'stars': {
          // Twinkling stars (CLEAR_NIGHT)
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.phase = (p.phase || 0) + (p.phaseSpeed || 0.02);
            const twinkle = 0.5 + 0.5 * Math.sin(p.phase);
            const alpha = p.opacity * twinkle * opacity;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(230, 242, 255, ${alpha})`;
            ctx.fill();

            // Subtle cross diffraction spike for larger stars
            if (p.size > 1.8 && twinkle > 0.7) {
              ctx.strokeStyle = `rgba(230, 242, 255, ${alpha * 0.4})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(p.x - 3, p.y);
              ctx.lineTo(p.x + 3, p.y);
              ctx.moveTo(p.x, p.y - 3);
              ctx.lineTo(p.x, p.y + 3);
              ctx.stroke();
            }
          }
          break;
        }

        case 'sun_glow': {
          // Gentle drifting sun dust & atmospheric bloom (CLEAR_DAY)
          // Soft radial ambient bloom in upper corner
          const sunGrad = ctx.createRadialGradient(
            width * 0.85,
            height * 0.15,
            0,
            width * 0.85,
            height * 0.15,
            width * 0.55
          );
          sunGrad.addColorStop(0, `rgba(255, 220, 140, ${0.12 * opacity})`);
          sunGrad.addColorStop(0.5, `rgba(255, 200, 100, ${0.04 * opacity})`);
          sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
          ctx.fillStyle = sunGrad;
          ctx.fillRect(0, 0, width, height);

          // Golden floating particles
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y += p.speedY;
            p.x += p.speedX;
            p.phase = (p.phase || 0) + (p.phaseSpeed || 0.015);

            if (p.y < -10) {
              p.y = height + 10;
              p.x = Math.random() * width;
            }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;

            const pulse = 0.7 + 0.3 * Math.sin(p.phase);
            const alpha = p.opacity * pulse * opacity;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 120, ${alpha})`;
            ctx.fill();
          }
          break;
        }

        case 'clouds': {
          // Slow drifting soft cloud puffs
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.speedX;
            if (p.x - p.size > width) {
              p.x = -p.size;
              p.y = Math.random() * (height * 0.6);
            }

            const cloudGrad = ctx.createRadialGradient(
              p.x,
              p.y,
              p.size * 0.1,
              p.x,
              p.y,
              p.size
            );
            const baseColor = isDay ? '210, 225, 240' : '90, 115, 145';
            cloudGrad.addColorStop(0, `rgba(${baseColor}, ${p.opacity * 1.5 * opacity})`);
            cloudGrad.addColorStop(0.6, `rgba(${baseColor}, ${p.opacity * 0.8 * opacity})`);
            cloudGrad.addColorStop(1, `rgba(${baseColor}, 0)`);

            ctx.fillStyle = cloudGrad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'fog': {
          // Horizontal mist bands
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.speedX;
            if (p.x > width + 200) {
              p.x = -200;
            }

            const mistGrad = ctx.createLinearGradient(p.x - 150, p.y, p.x + 150, p.y);
            mistGrad.addColorStop(0, 'rgba(180, 200, 220, 0)');
            mistGrad.addColorStop(0.5, `rgba(180, 200, 220, ${p.opacity * opacity})`);
            mistGrad.addColorStop(1, 'rgba(180, 200, 220, 0)');

            ctx.fillStyle = mistGrad;
            ctx.fillRect(0, p.y - p.size / 2, width, p.size);
          }
          break;
        }

        case 'drizzle':
        case 'rain':
        case 'heavy_rain':
        case 'thunderstorm':
        case 'sleet': {
          // Diagonal falling streaks
          const rainColor =
            effectType === 'drizzle'
              ? '160, 210, 250'
              : effectType === 'sleet'
              ? '210, 235, 255'
              : '130, 200, 255';

          ctx.lineWidth = effectType === 'drizzle' ? 0.9 : effectType === 'heavy_rain' ? 1.5 : 1.2;
          ctx.lineCap = 'round';

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;

            // When streak hits bottom, spawn splash ring if heavy rain or thunderstorm
            if (p.y > height) {
              if ((effectType === 'heavy_rain' || effectType === 'thunderstorm') && Math.random() < 0.25) {
                splashes.push({
                  x: p.x,
                  y: height - 4 + Math.random() * 4,
                  radius: 1,
                  maxRadius: 6 + Math.random() * 8,
                  opacity: 0.45 * opacity,
                });
              }

              p.y = -20 - Math.random() * 20;
              p.x = Math.random() * (width + 100);
            }

            const len = p.length || 14;
            const streakGrad = ctx.createLinearGradient(
              p.x,
              p.y,
              p.x + p.speedX * (len / p.speedY),
              p.y + len
            );
            streakGrad.addColorStop(0, `rgba(${rainColor}, 0)`);
            streakGrad.addColorStop(1, `rgba(${rainColor}, ${p.opacity * opacity})`);

            ctx.strokeStyle = streakGrad;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.speedX * (len / p.speedY), p.y + len);
            ctx.stroke();
          }

          // Render bottom ground splashes
          for (let s = splashes.length - 1; s >= 0; s--) {
            const splash = splashes[s];
            splash.radius += 0.8;
            splash.opacity *= 0.88;

            if (splash.opacity < 0.05 || splash.radius >= splash.maxRadius) {
              splashes.splice(s, 1);
              continue;
            }

            ctx.strokeStyle = `rgba(${rainColor}, ${splash.opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.ellipse(
              splash.x,
              splash.y,
              splash.radius * 1.8,
              splash.radius * 0.6,
              0,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          }
          break;
        }

        case 'snow': {
          // Floating soft snow flakes
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.phase = (p.phase || 0) + (p.swaySpeed || 0.02);
            p.x += p.speedX + Math.sin(p.phase) * (p.swayAmp || 1);
            p.y += p.speedY;

            if (p.y > height + 10) {
              p.y = -10;
              p.x = Math.random() * width;
            }
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(240, 248, 255, ${p.opacity * opacity})`;
            ctx.fill();
          }
          break;
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [condition, intensity, isDay, opacity]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
