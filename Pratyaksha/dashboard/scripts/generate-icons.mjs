import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');

// Icon sizes needed for PWA
const ICON_SIZES = [16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512];

// Splash screen sizes for iOS
const SPLASH_SIZES = [
  { width: 640, height: 1136, name: 'splash-640x1136.png' },
  { width: 750, height: 1334, name: 'splash-750x1334.png' },
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
  { width: 1242, height: 2208, name: 'splash-1242x2208.png' },
];

async function generateIcons() {
  console.log('Reading SVG from:', SVG_PATH);
  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Generate square icons
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    console.log(`Generating ${size}x${size} icon...`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
  }

  // Generate splash screens (icon centered on brand background)
  for (const splash of SPLASH_SIZES) {
    const outputPath = path.join(ICONS_DIR, splash.name);
    console.log(`Generating ${splash.name}...`);

    // Calculate icon size (about 25% of the smaller dimension)
    const iconSize = Math.round(Math.min(splash.width, splash.height) * 0.25);

    // Create the icon at the right size
    const iconBuffer = await sharp(svgBuffer)
      .resize(iconSize, iconSize)
      .png()
      .toBuffer();

    // Create splash with dark background and centered icon
    await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: { r: 10, g: 15, b: 20, alpha: 1 } // #0a0f14
      }
    })
      .composite([{
        input: iconBuffer,
        left: Math.round((splash.width - iconSize) / 2),
        top: Math.round((splash.height - iconSize) / 2),
      }])
      .png()
      .toFile(outputPath);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
