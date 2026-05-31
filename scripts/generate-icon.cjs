/**
 * Generates a minimal app icon for Zoid Editor.
 * Creates a simple 256x256 PNG icon and an ICO file.
 */
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');

// Minimal valid 1x1 white PNG (used as fallback)
const MINI_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// A simple generated 16x16 black/white icon as base64 PNG
function createIconPng(size) {
  // Create a minimal but valid PNG using raw pixel data
  // This is a valid 16x16 PNG with a simple "Z" letter design in black on white

  const width = size;
  const height = size;

  // Create RGBA pixel data: white background with black "Z" shape
  const pixels = Buffer.alloc(width * height * 4, 255); // all white

  // Draw a simple "Z" letter
  const drawPixel = (x, y) => {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const idx = (y * width + x) * 4;
      pixels[idx] = 0;     // R
      pixels[idx + 1] = 0; // G
      pixels[idx + 2] = 0; // B
      pixels[idx + 3] = 255; // A
    }
  };

  // Draw "Z" shape
  const t = Math.max(1, Math.floor(size / 16));
  // Top horizontal bar
  for (let x = Math.floor(size * 0.15); x < Math.floor(size * 0.85); x++) {
    for (let yy = Math.floor(size * 0.1); yy < Math.floor(size * 0.1) + t * 2; yy++) {
      drawPixel(x, yy);
    }
  }
  // Diagonal
  for (let i = 0; i < Math.floor(size * 0.7); i++) {
    for (let yy = -t; yy <= t; yy++) {
      drawPixel(Math.floor(size * 0.15) + i, Math.floor(size * 0.85) - i + yy);
    }
  }
  // Bottom horizontal bar
  for (let x = Math.floor(size * 0.15); x < Math.floor(size * 0.85); x++) {
    for (let yy = Math.floor(size * 0.85); yy < Math.floor(size * 0.85) + t * 2; yy++) {
      drawPixel(x, yy);
    }
  }

  // Simple PNG writer (minimal valid PNG)
  function createPNG(width, height, pixelData) {
    const zlib = require('zlib');

    // PNG signature
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;  // bit depth
    ihdrData[9] = 6;  // color type: RGBA
    ihdrData[10] = 0; // compression
    ihdrData[11] = 0; // filter
    ihdrData[12] = 0; // interlace
    const ihdr = createChunk('IHDR', ihdrData);

    // IDAT chunk - image data with filter bytes
    const rawData = Buffer.alloc(height * (1 + width * 4));
    for (let y = 0; y < height; y++) {
      rawData[y * (1 + width * 4)] = 0; // filter byte: None
      pixelData.slice(y * width * 4, (y + 1) * width * 4).copy(rawData, y * (1 + width * 4) + 1);
    }
    const compressed = zlib.deflateSync(rawData);
    const idat = createChunk('IDAT', compressed);

    // IEND chunk
    const iend = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdr, idat, iend]);
  }

  function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = crc32(crcData);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc, 0);
    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
  }

  // CRC32 implementation
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  return createPNG(width, height, pixels);
}

// Create icons directory
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

// Generate 256x256 icon for installer
const iconPath = path.join(BUILD_DIR, 'icon.png');
try {
  const png = createIconPng(256);
  fs.writeFileSync(iconPath, png);
  console.log(`✓ Generated icon: ${iconPath} (${png.length} bytes)`);
} catch (err) {
  // Fallback: write minimal PNG
  fs.writeFileSync(iconPath, Buffer.from(MINI_PNG_BASE64, 'base64'));
  console.log(`⚠ Generated fallback icon: ${iconPath}`);
}

// Create proper ICO file with embedded PNG
function createIco(pngData) {
  const numImages = 1;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);    // reserved
  header.writeUInt16LE(1, 2);    // type: ICO
  header.writeUInt16LE(numImages, 4);

  // Directory entry
  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0);         // width (0=256)
  entry.writeUInt8(0, 1);         // height (0=256)
  entry.writeUInt8(0, 2);         // colors
  entry.writeUInt8(0, 3);         // reserved
  entry.writeUInt16LE(1, 4);      // planes
  entry.writeUInt16LE(32, 6);     // bpp
  entry.writeUInt32LE(pngData.length, 8);  // size
  entry.writeUInt32LE(22, 12);    // offset (6 + 16)

  return Buffer.concat([header, entry, pngData]);
}

const icoPath = path.join(BUILD_DIR, 'icon.ico');
try {
  const png = createIconPng(256);
  const ico = createIco(png);
  fs.writeFileSync(icoPath, ico);
  console.log(`✓ Generated icon: ${icoPath} (${ico.length} bytes)`);
} catch (err) {
  console.log(`⚠ Could not create icon.ico: ${err.message}`);
}

console.log('✓ Icons generated successfully');
