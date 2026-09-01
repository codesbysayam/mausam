const sharp = require('sharp');
const fs = require('fs');

async function refineLogo() {
  const image = sharp('./public/assets/imd-logo.png');
  const trimmed = await image.trim({ threshold: 0 }).png({ compressionLevel: 9 }).toBuffer();
  
  fs.writeFileSync('./public/assets/imd-logo.png', trimmed);
  if (fs.existsSync('./dist/assets')) {
    fs.writeFileSync('./dist/assets/imd-logo.png', trimmed);
  }
  
  const meta = await sharp(trimmed).metadata();
  console.log('Trimmed metadata:', meta);
}

refineLogo().catch(console.error);
