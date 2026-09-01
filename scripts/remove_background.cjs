const sharp = require('sharp');
const fs = require('fs');

async function processLogo() {
  const image = sharp('./public/assets/imd-logo.png');
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Create RGBA buffer
  const rgba = Buffer.alloc(width * height * 4);

  // Helper to check if a pixel is neutral background (white, off-white, light gray checkerboard)
  function isBackgroundCandidate(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const brightness = (r + g + b) / 3;

    // Checkerboard squares are either ~255 or ~225 with very low saturation diff < 15
    if (brightness > 200 && diff < 20) return true;
    if (brightness > 240 && diff < 30) return true;
    if (brightness > 190 && diff < 12) return true;
    return false;
  }

  // Visited array for BFS flood fill
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  // Add all boundary pixels to queue if they are background candidates
  for (let x = 0; x < width; x++) {
    // Top border
    let idx = x;
    let r = data[idx * 3], g = data[idx * 3 + 1], b = data[idx * 3 + 2];
    if (isBackgroundCandidate(r, g, b)) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
    // Bottom border
    idx = (height - 1) * width + x;
    r = data[idx * 3]; g = data[idx * 3 + 1]; b = data[idx * 3 + 2];
    if (isBackgroundCandidate(r, g, b)) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  }

  for (let y = 0; y < height; y++) {
    // Left border
    let idx = y * width;
    let r = data[idx * 3], g = data[idx * 3 + 1], b = data[idx * 3 + 2];
    if (!visited[idx] && isBackgroundCandidate(r, g, b)) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
    // Right border
    idx = y * width + (width - 1);
    r = data[idx * 3]; g = data[idx * 3 + 1]; b = data[idx * 3 + 2];
    if (!visited[idx] && isBackgroundCandidate(r, g, b)) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  }

  // BFS
  const dx = [1, -1, 0, 0, 1, 1, -1, -1];
  const dy = [0, 0, 1, -1, 1, -1, 1, -1];

  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    for (let i = 0; i < 8; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nidx = ny * width + nx;
        if (!visited[nidx]) {
          const r = data[nidx * 3];
          const g = data[nidx * 3 + 1];
          const b = data[nidx * 3 + 2];

          if (isBackgroundCandidate(r, g, b)) {
            visited[nidx] = 1;
            queue[tail++] = nidx;
          }
        }
      }
    }
  }

  console.log(`Flood fill identified ${tail} background pixels out of ${width * height} (${((tail / (width * height)) * 100).toFixed(1)}%)`);

  // Now construct RGBA buffer with soft alpha antialiasing at edges
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const r = data[idx * 3];
      const g = data[idx * 3 + 1];
      const b = data[idx * 3 + 2];
      const rgbaIdx = idx * 4;

      if (visited[idx]) {
        // Transparent
        rgba[rgbaIdx] = 0;
        rgba[rgbaIdx + 1] = 0;
        rgba[rgbaIdx + 2] = 0;
        rgba[rgbaIdx + 3] = 0;
      } else {
        // Check if neighboring any visited pixel for feathering/antialiasing
        let isEdge = false;
        let bgNeighborCount = 0;
        for (let d = 0; d < 4; d++) {
          const nx = x + dx[d];
          const ny = y + dy[d];
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (visited[ny * width + nx]) {
              isEdge = true;
              bgNeighborCount++;
            }
          }
        }

        rgba[rgbaIdx] = r;
        rgba[rgbaIdx + 1] = g;
        rgba[rgbaIdx + 2] = b;

        if (isEdge) {
          const brightness = (r + g + b) / 3;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const diff = max - min;
          
          if (brightness > 210 && diff < 30) {
            // Semi-transparent transition on bright boundary fringes
            rgba[rgbaIdx + 3] = Math.max(20, 255 - Math.round((brightness - 180) * 3));
          } else {
            rgba[rgbaIdx + 3] = 255;
          }
        } else {
          rgba[rgbaIdx + 3] = 255;
        }
      }
    }
  }

  // Trim excess transparent borders if desired or keep proportions
  const finalImage = sharp(rgba, {
    raw: {
      width,
      height,
      channels: 4,
    }
  });

  // Save to public/assets/imd-logo.png
  await finalImage.png({ compressionLevel: 9, quality: 100 }).toFile('./public/assets/imd-logo.png');
  // Also copy to dist if dist exists
  if (fs.existsSync('./dist/assets')) {
    await finalImage.png({ compressionLevel: 9, quality: 100 }).toFile('./dist/assets/imd-logo.png');
  }
  console.log('Successfully saved transparent IMD logo PNG to ./public/assets/imd-logo.png');
}

processLogo().catch(console.error);
