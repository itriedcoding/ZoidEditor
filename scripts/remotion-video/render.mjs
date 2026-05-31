import path from 'path';
import fs from 'fs';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'public');
const WEBSITE_DIR = path.join(ROOT, 'website');
const ENTRY = path.join(__dirname, 'src', 'index.ts');
const COMPOSITION = 'ZoidDemo';
const OUT_MP4 = path.join(__dirname, 'out.mp4');

async function main() {
  // Step 1: Capture real editor frames
  console.log('\n=== Step 1: Capturing frames ===\n');
  const { captureAllFrames } = await import('./capture-frames.mjs');
  await captureAllFrames();

  // Verify frames exist
  const framesDir = path.join(__dirname, 'public', 'frames');
  const frames = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));
  if (frames.length < 6) {
    console.error('ERROR: Only captured', frames.length, 'frames, need at least 6');
    process.exit(1);
  }
  console.log('Frames captured:', frames.join(', '));

  // Step 2: Render Remotion video
  console.log('\n=== Step 2: Rendering Remotion video ===\n');
  await new Promise((resolve, reject) => {
    const proc = spawn('npx.cmd', [
      'remotion', 'render',
      ENTRY, COMPOSITION, OUT_MP4,
      '--concurrency', '2',
      '--log', 'verbose',
    ], {
      cwd: __dirname,
      stdio: ['ignore', 'inherit', 'inherit'],
      shell: true,
    });
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Remotion render exit code: ${code}`));
    });
    proc.on('error', reject);
  });

  // Verify output
  if (!fs.existsSync(OUT_MP4)) {
    console.error('ERROR: Output file not created');
    process.exit(1);
  }
  const size = fs.statSync(OUT_MP4).size;
  console.log(`Video rendered: ${(size / 1024 / 1024).toFixed(2)} MB`);

  // Step 3: Copy to output locations
  console.log('\n=== Step 3: Copying output ===\n');
  fs.copyFileSync(OUT_MP4, path.join(OUT_DIR, 'demo.mp4'));
  fs.copyFileSync(OUT_MP4, path.join(WEBSITE_DIR, 'demo.mp4'));
  console.log('Copied to public/demo.mp4 and website/demo.mp4');

  // Cleanup frames (keep for verification)
  try {
    fs.cpSync(framesDir, path.join(OUT_DIR, 'demo-frames'), { recursive: true });
    console.log('Frames saved to public/demo-frames/ for verification');
  } catch {}
  try { fs.rmSync(framesDir, { recursive: true }); } catch {}

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
