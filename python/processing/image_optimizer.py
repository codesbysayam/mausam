#!/usr/bin/env python3
"""
MAUSAM Atmospheric Intelligence Platform
Asset Generation & Image Optimization Tool
Feature #7, #8, #11 Implementation
Uses Python standard library (zlib, struct, math, os) with zero external dependencies.
"""

import os
import struct
import zlib
import math

def create_png(width, height, get_pixel_func, output_path):
    """
    Generates a valid RGBA PNG using Python standard library struct and zlib.
    get_pixel_func(x, y) returns (r, g, b, a) where each is 0-255.
    """
    raw_scanlines = bytearray()
    for y in range(height):
        raw_scanlines.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y)
            raw_scanlines.extend((
                max(0, min(255, int(r))),
                max(0, min(255, int(g))),
                max(0, min(255, int(b))),
                max(0, min(255, int(a)))
            ))

    compressed_idat = zlib.compress(bytes(raw_scanlines), level=9)

    png_data = bytearray(b'\x89PNG\r\n\x1a\n')

    def write_chunk(chunk_type, chunk_payload):
        png_data.extend(struct.pack('>I', len(chunk_payload)))
        chunk_core = chunk_type + chunk_payload
        png_data.extend(chunk_core)
        crc = zlib.crc32(chunk_core) & 0xffffffff
        png_data.extend(struct.pack('>I', crc))

    # IHDR
    ihdr_payload = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    write_chunk(b'IHDR', ihdr_payload)

    # IDAT
    write_chunk(b'IDAT', compressed_idat)

    # IEND
    write_chunk(b'IEND', b'')

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(png_data)
    print(f"Generated PNG: {output_path} ({width}x{height}, {len(png_data):,} bytes)")

def generate_favicon_svg(output_path):
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B3D91" />
      <stop offset="100%" stop-color="#071A2D" />
    </linearGradient>
    <linearGradient id="sun" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EF4444" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#bg)" stroke="#1E3A5F" stroke-width="2"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#1E3A5F" stroke-width="1.5" stroke-dasharray="3 3"/>
  <circle cx="32" cy="32" r="14" fill="none" stroke="#38BDF8" stroke-width="1.5" opacity="0.6"/>
  <circle cx="32" cy="32" r="7" fill="url(#sun)" />
  <path d="M32 10 L32 16 M32 48 L32 54 M10 32 L16 32 M48 32 L54 32" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="2" fill="#FFFFFF" />
</svg>'''
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Generated SVG Favicon: {output_path}")

def generate_favicon_png(output_path, size=32):
    center = size / 2.0
    radius_outer = size * 0.44
    radius_sun = size * 0.18

    def pixel_fn(x, y):
        dx = x - center
        dy = y - center
        dist = math.hypot(dx, dy)
        
        # Rounded box
        if abs(dx) > center - 2 or abs(dy) > center - 2:
            corner_dx = max(0, abs(dx) - (center - 6))
            corner_dy = max(0, abs(dy) - (center - 6))
            if math.hypot(corner_dx, corner_dy) > 6:
                return (0, 0, 0, 0)

        # Background gradient
        t = (x + y) / (size * 2)
        r = int(11 * (1 - t) + 7 * t)
        g = int(61 * (1 - t) + 26 * t)
        b = int(145 * (1 - t) + 45 * t)

        # Outer ring
        if abs(dist - radius_outer) < 1.0:
            return (56, 189, 248, 200)

        # Center sun
        if dist < radius_sun:
            return (245, 158, 11, 255)
        if dist < radius_sun + 1.2:
            return (56, 189, 248, 255)

        # Crosshairs
        if (abs(dx) < 1.0 or abs(dy) < 1.0) and dist < radius_outer:
            return (56, 189, 248, 180)

        return (r, g, b, 255)

    create_png(size, size, pixel_fn, output_path)

def generate_og_image(output_path):
    width = 1200
    height = 630

    def pixel_fn(x, y):
        # Deep navy meteorological gradient background
        nx = x / width
        ny = y / height
        
        base_r = int(7 + 10 * (1 - ny))
        base_g = int(24 + 18 * (1 - ny))
        base_b = int(45 + 35 * (1 - ny))

        # Concentric radar grid on the right side
        rcx, rcy = 880, 315
        rdist = math.hypot(x - rcx, y - rcy)

        # Radar range rings at 80, 160, 240, 320 px
        for ring_r in (80, 160, 240, 320):
            if abs(rdist - ring_r) < 1.4:
                return (30, 70, 115, 255)

        # Radar sweep angle
        angle = (math.atan2(y - rcy, x - rcx) + math.pi) / (2 * math.pi)
        if rdist < 320:
            sweep = (angle - 0.25) % 1.0
            if sweep < 0.15:
                intensity = int((1.0 - (sweep / 0.15)) * 40)
                base_r += int(intensity * 0.2)
                base_g += int(intensity * 0.8)
                base_b += int(intensity * 1.0)

        # Top border accent line (Saffron, White, Green subtle hint or Sky Blue)
        if y < 6:
            return (56, 189, 248, 255)
        if y == 6:
            return (11, 61, 145, 255)

        # Header area separation line
        if y == 560:
            return (30, 58, 95, 255)

        return (min(255, base_r), min(255, base_g), min(255, base_b), 255)

    create_png(width, height, pixel_fn, output_path)

def generate_og_image_svg(output_path):
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071A2D" />
      <stop offset="50%" stop-color="#0B233D" />
      <stop offset="100%" stop-color="#05101F" />
    </linearGradient>
    <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Top Status Strip -->
  <rect x="0" y="0" width="1200" height="6" fill="#38BDF8" />

  <!-- Radar Rings Graphic (Right side) -->
  <g transform="translate(880, 315)">
    <circle r="260" fill="none" stroke="#1E3A5F" stroke-width="1.5" stroke-dasharray="6 6"/>
    <circle r="190" fill="none" stroke="#1E3A5F" stroke-width="1.5"/>
    <circle r="120" fill="none" stroke="#254F7A" stroke-width="2"/>
    <circle r="50" fill="none" stroke="#38BDF8" stroke-width="2" opacity="0.6"/>
    <circle r="8" fill="#F59E0B"/>
    <line x1="-280" y1="0" x2="280" y2="0" stroke="#1E3A5F" stroke-width="1"/>
    <line x1="0" y1="-280" x2="0" y2="280" stroke="#1E3A5F" stroke-width="1"/>
    <!-- Radar beam sweep simulation -->
    <path d="M 0 0 L 130 -160 A 210 210 0 0 1 200 -70 Z" fill="#38BDF8" opacity="0.12"/>
    <text x="0" y="295" text-anchor="middle" fill="#64748B" font-family="system-ui, sans-serif" font-size="12" font-weight="600" letter-spacing="2">DOPPLER RADAR NETWORK • 500KM RANGE</text>
  </g>

  <!-- Left Content Box -->
  <g transform="translate(90, 110)">
    <!-- Government Badge -->
    <rect x="0" y="0" width="460" height="34" rx="6" fill="#132740" stroke="#1E3A5F" stroke-width="1"/>
    <circle cx="18" cy="17" r="5" fill="#10B981"/>
    <text x="32" y="22" fill="#38BDF8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">NATIONAL METEOROLOGICAL INTELLIGENCE</text>

    <!-- Brand Name -->
    <text x="0" y="125" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="76" font-weight="800" letter-spacing="2">MAUSAM</text>
    <text x="395" y="75" fill="#F59E0B" font-family="system-ui, sans-serif" font-size="18" font-weight="700">मौसम</text>

    <!-- Subtitle -->
    <text x="0" y="175" fill="#E2E8F0" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600">
      Atmospheric Telemetry &amp; Agromet Advisory Platform
    </text>
    <text x="0" y="210" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="400">
      Real-time observations across 36 States &amp; UTs • NDMA SACHET disaster warnings
    </text>

    <!-- 4 Capability Badges -->
    <g transform="translate(0, 260)">
      <!-- Card 1 -->
      <rect x="0" y="0" width="130" height="60" rx="8" fill="#0D1E33" stroke="#1E3A5F" stroke-width="1"/>
      <text x="14" y="26" fill="#38BDF8" font-family="system-ui" font-size="11" font-weight="700" letter-spacing="1">RADAR</text>
      <text x="14" y="47" fill="#F8FAFC" font-family="system-ui" font-size="14" font-weight="600">Doppler Live</text>

      <!-- Card 2 -->
      <rect x="145" y="0" width="130" height="60" rx="8" fill="#0D1E33" stroke="#1E3A5F" stroke-width="1"/>
      <text x="159" y="26" fill="#10B981" font-family="system-ui" font-size="11" font-weight="700" letter-spacing="1">ALERTS</text>
      <text x="159" y="47" fill="#F8FAFC" font-family="system-ui" font-size="14" font-weight="600">NDMA CAP</text>

      <!-- Card 3 -->
      <rect x="290" y="0" width="130" height="60" rx="8" fill="#0D1E33" stroke="#1E3A5F" stroke-width="1"/>
      <text x="304" y="26" fill="#F59E0B" font-family="system-ui" font-size="11" font-weight="700" letter-spacing="1">AIR QUALITY</text>
      <text x="304" y="47" fill="#F8FAFC" font-family="system-ui" font-size="14" font-weight="600">CPCB NAQI</text>

      <!-- Card 4 -->
      <rect x="435" y="0" width="130" height="60" rx="8" fill="#0D1E33" stroke="#1E3A5F" stroke-width="1"/>
      <text x="449" y="26" fill="#A855F7" font-family="system-ui" font-size="11" font-weight="700" letter-spacing="1">AGROMET</text>
      <text x="449" y="47" fill="#F8FAFC" font-family="system-ui" font-size="14" font-weight="600">GKMS Crops</text>
    </g>
  </g>

  <!-- Footer Banner -->
  <g transform="translate(90, 565)">
    <text x="0" y="16" fill="#64748B" font-family="system-ui, sans-serif" font-size="13" font-weight="500">
      Zero-Key Core Mode • High-Precision Station Mesh • https://mausamgovt.vercel.app
    </text>
    <text x="1020" y="16" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="13" font-weight="600">
      INDIA • 2026
    </text>
  </g>
</svg>'''
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Generated SVG OG Card: {output_path}")

def run_image_audit():
    print("\n--- Running Asset & Image Audit ---")
    targets = ['public', 'public/assets', 'src/assets/images']
    found = 0
    for t in targets:
        if not os.path.exists(t):
            continue
        for f in os.listdir(t):
            p = os.path.join(t, f)
            if os.path.isfile(p) and f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp')):
                size = os.path.getsize(p)
                print(f"  Asset: {p} ({size:,} bytes)")
                found += 1
    print(f"Total image assets audited: {found}")

def main():
    print("=== MAUSAM Image Optimization & Asset Pipeline ===")
    
    # 1. Favicon SVG
    generate_favicon_svg('public/favicon.svg')
    
    # 2. Favicon 32x32 PNG
    generate_favicon_png('public/favicon-32x32.png', size=32)
    
    # 3. Apple Touch Icon 180x180 PNG
    generate_favicon_png('public/apple-touch-icon.png', size=180)
    
    # 4. OpenGraph Social Card SVG & PNG
    generate_og_image_svg('public/og-image.svg')
    generate_og_image('public/og-image.png')
    
    # 5. Image Audit
    run_image_audit()
    print("=== Asset Pipeline Completed Successfully ===")

if __name__ == '__main__':
    main()
