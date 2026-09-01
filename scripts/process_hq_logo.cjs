const sharp = require('sharp');
const fs = require('fs');

async function processHQLogo() {
  const inputPath = './src/assets/images/imd_emblem_hq_1788252245425.jpg';
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  console.log(`Processing image ${width}x${height}...`);

  const rgba = Buffer.alloc(width * height * 4);

  // Check if background pixel (black or near black)
  function isBg(r, g, b) {
    return (r < 30 && g < 30 && b < 30);
  }

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  // Add boundary pixels
  for (let x = 0; x < width; x++) {
    let idx = x;
    if (isBg(data[idx * 3], data[idx * 3 + 1], data[idx * 3 + 2])) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
    idx = (height - 1) * width + x;
    if (isBg(data[idx * 3], data[idx * 3 + 1], data[idx * 3 + 2])) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  }

  for (let y = 0; y < height; y++) {
    let idx = y * width;
    if (!visited[idx] && isBg(data[idx * 3], data[idx * 3 + 1], data[idx * 3 + 2])) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
    idx = y * width + (width - 1);
    if (!visited[idx] && isBg(data[idx * 3], data[idx * 3 + 1], data[idx * 3 + 2])) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  }

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

          if (isBg(r, g, b)) {
            visited[nidx] = 1;
            queue[tail++] = nidx;
          }
        }
      }
    }
  }

  console.log(`Flood fill identified ${tail} background pixels (${((tail / (width * height)) * 100).toFixed(1)}%)`);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const r = data[idx * 3];
      const g = data[idx * 3 + 1];
      const b = data[idx * 3 + 2];
      const rgbaIdx = idx * 4;

      if (visited[idx]) {
        rgba[rgbaIdx] = 0;
        rgba[rgbaIdx + 1] = 0;
        rgba[rgbaIdx + 2] = 0;
        rgba[rgbaIdx + 3] = 0;
      } else {
        rgba[rgbaIdx] = r;
        rgba[rgbaIdx + 1] = g;
        rgba[rgbaIdx + 2] = b;
        rgba[rgbaIdx + 3] = 255;
      }
    }
  }

  // Convert raw rgba buffer to PNG buffer first
  const intermediatePng = await sharp(rgba, {
    raw: {
      width,
      height,
      channels: 4,
    }
  }).png().toBuffer();

  const trimmedPng = await sharp(intermediatePng)
    .trim({ threshold: 0 })
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();

  const meta = await sharp(trimmedPng).metadata();
  console.log(`Trimmed size: ${meta.width}x${meta.height}`);

  fs.writeFileSync('./public/assets/imd-logo.png', trimmedPng);

  const webpBuffer = await sharp(trimmedPng)
    .webp({ quality: 100, lossless: true })
    .toBuffer();
  fs.writeFileSync('./public/assets/imd-logo.webp', webpBuffer);

  const base64Png = trimmedPng.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${meta.width} ${meta.height}" width="100%" height="100%">
  <image href="data:image/png;base64,${base64Png}" width="${meta.width}" height="${meta.height}" />
</svg>`;
  fs.writeFileSync('./public/assets/imd-logo.svg', svgContent);

  if (fs.existsSync('./dist/assets')) {
    fs.writeFileSync('./dist/assets/imd-logo.png', trimmedPng);
    fs.writeFileSync('./dist/assets/imd-logo.webp', webpBuffer);
    fs.writeFileSync('./dist/assets/imd-logo.svg', svgContent);
  }

  console.log('Successfully saved high-resolution transparent assets: imd-logo.svg, imd-logo.png, and imd-logo.webp');
}

processHQLogo().catch(console.error);
