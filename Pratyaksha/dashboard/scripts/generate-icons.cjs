const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');

// Icon sizes needed for PWA
const SIZES = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512];

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  // Read the SVG file
  const svgBuffer = fs.readFileSync(SVG_PATH);

  for (const size of SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  Created: icon-${size}x${size}.png`);
  }

  // Generate splash screens for iOS
  const splashSizes = [
    { width: 640, height: 1136, name: 'splash-640x1136.png' },
    { width: 750, height: 1334, name: 'splash-750x1334.png' },
    { width: 1242, height: 2208, name: 'splash-1242x2208.png' },
    { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
  ];

  console.log('\nGenerating splash screens...\n');

  for (const splash of splashSizes) {
    const outputPath = path.join(ICONS_DIR, splash.name);

    // Create a splash screen with the icon centered on a gradient background
    const iconSize = Math.min(splash.width, splash.height) * 0.3;
    const iconBuffer = await sharp(svgBuffer)
      .resize(Math.round(iconSize), Math.round(iconSize))
      .png()
      .toBuffer();

    // Create the background
    const background = await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: { r: 15, g: 15, b: 35, alpha: 1 } // #0f0f23
      }
    })
      .composite([
        {
          input: iconBuffer,
          gravity: 'center'
        }
      ])
      .png()
      .toFile(outputPath);

    console.log(`  Created: ${splash.name}`);
  }

  console.log('\nDone! All icons generated successfully.');
}

generateIcons().catch(console.error);
