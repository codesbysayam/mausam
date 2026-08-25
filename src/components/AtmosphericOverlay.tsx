import React, { useEffect, useRef } from 'react';
import { WeatherConditionType } from '../types';

interface AtmosphericOverlayProps {
  weatherType: WeatherConditionType;
  isRainingNow?: boolean;
}

export const AtmosphericOverlay: React.FC<AtmosphericOverlayProps> = ({
  weatherType,
  isRainingNow = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine effective rendering mode
  const effectiveMode =
    weatherType === 'thunderstorm'
      ? 'thunderstorm'
      : weatherType === 'rain' && isRainingNow
      ? 'rain'
      : weatherType === 'fog'
      ? 'fog'
      : weatherType === 'duststorm'
      ? 'duststorm'
      : 'sunny';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle definitions based on weatherType
    interface Particle {
      x: number;
      y: number;
      speedY: number;
      speedX: number;
      length: number;
      size: number;
      opacity: number;
      angle?: number;
    }

    const particles: Particle[] = [];
    let particleCount = 70;

    if (effectiveMode === 'rain') {
      particleCount = 100;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speedY: 10 + Math.random() * 8,
          speedX: -1.5 - Math.random() * 1.5,
          length: 12 + Math.random() * 14,
          size: 1.2 + Math.random() * 0.8,
          opacity: 0.25 + Math.random() * 0.45,
        });
      }
    } else if (effectiveMode === 'thunderstorm') {
      particleCount = 130;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speedY: 14 + Math.random() * 10,
          speedX: -2.5 - Math.random() * 2.5,
          length: 16 + Math.random() * 16,
          size: 1.4 + Math.random() * 0.9,
          opacity: 0.35 + Math.random() * 0.45,
        });
      }
    } else if (effectiveMode === 'duststorm') {
      particleCount = 80;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speedY: 0.5 + Math.random() * 1.5,
          speedX: 4 + Math.random() * 6,
          length: 4 + Math.random() * 6,
          size: 2 + Math.random() * 3.5,
          opacity: 0.2 + Math.random() * 0.4,
        });
      }
    } else if (effectiveMode === 'fog') {
      particleCount = 35;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speedY: -0.1 + Math.random() * 0.2,
          speedX: 0.3 + Math.random() * 0.7,
          length: 80 + Math.random() * 120,
          size: 60 + Math.random() * 100,
          opacity: 0.04 + Math.random() * 0.08,
        });
      }
    } else {
      // Sunny / Clear: subtle ambient sun glimmer
      particleCount = 25;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speedY: -0.2 - Math.random() * 0.4,
          speedX: -0.2 + Math.random() * 0.4,
          length: 2,
          size: 1.5 + Math.random() * 2,
          opacity: 0.12 + Math.random() * 0.2,
        });
      }
    }

    let lightningTimer = 0;
    let isFlashing = false;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Thunderstorm Lightning flash
      if (effectiveMode === 'thunderstorm') {
        lightningTimer++;
        if (lightningTimer > 180 && Math.random() < 0.02) {
          isFlashing = true;
          lightningTimer = 0;
          setTimeout(() => {
            isFlashing = false;
          }, 70 + Math.random() * 100);
        }

        if (isFlashing) {
          ctx.fillStyle = 'rgba(218, 226, 253, 0.12)';
          ctx.fillRect(0, 0, width, height);
        }
      }

      // Draw and move particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (effectiveMode === 'rain' || effectiveMode === 'thunderstorm') {
          ctx.strokeStyle =
            effectiveMode === 'thunderstorm'
              ? `rgba(180, 210, 255, ${p.opacity})`
              : `rgba(56, 189, 248, ${p.opacity})`;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 1.5, p.y + p.length);
          ctx.stroke();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) {
            p.x = width + 10;
          }
        } else if (effectiveMode === 'duststorm') {
          ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x > width + 20) {
            p.x = -20;
            p.y = Math.random() * height;
          }
          if (p.y > height) {
            p.y = 0;
          }
        } else if (effectiveMode === 'fog') {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          gradient.addColorStop(0, `rgba(200, 220, 235, ${p.opacity})`);
          gradient.addColorStop(1, 'rgba(200, 220, 235, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.x > width + p.size) {
            p.x = -p.size;
            p.y = Math.random() * height;
          }
        } else {
          // Sunny
          ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effectiveMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Dynamic Ambient Gradient Vignette */}
      {effectiveMode === 'rain' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#031326]/40 via-transparent to-[#020b17]/60"></div>
      )}
      {effectiveMode === 'thunderstorm' && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#12072b]/50 via-transparent to-[#080214]/70"></div>
      )}
      {effectiveMode === 'duststorm' && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#2e1808]/35 via-[#1c0f05]/20 to-[#2e1808]/40"></div>
      )}
      {effectiveMode === 'fog' && (
        <div className="absolute inset-0 backdrop-blur-[0.5px] bg-[#0c1820]/35"></div>
      )}
      {effectiveMode === 'sunny' && (
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#fbbf24]/10 rounded-full blur-3xl"></div>
      )}

      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />
    </div>
  );
};
