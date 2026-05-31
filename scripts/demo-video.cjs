const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const screenshot = require('screenshot-desktop');
const sharp = require('sharp');

const ffmpegPath = require('ffmpeg-static');
const exePath = path.join(__dirname, '..', 'release', 'win-unpacked', 'Zoid Editor.exe');
const framesDir = path.join(__dirname, '..', 'temp-frames');
const outMp4 = path.join(__dirname, '..', 'public', 'demo.mp4');
const outWebMp4 = path.join(__dirname, '..', 'website', 'demo.mp4');

const FPS = 24;
const W = 1400;
const H = 900;

const CURSOR_SVG = Buffer.from(`<svg width="20" height="24" viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg">
  <polygon points="2,2 2,20 6,16 9,21 11,20 8,15 17,15" fill="white" stroke="rgba(0,0,0,0.5)" stroke-width="1"/>
</svg>`);

let frameNum = 0;
let child = null;

function pad(n) { return String(n).padStart(5, '0'); }

async function captureFrame(cursorX, cursorY, clickX, clickY) {
  const img = await screenshot({ format: 'png' });
  let pipeline = sharp(img).extract({ left: 260, top: 90, width: 1400, height: 900 }).resize(W, H);
  if (cursorX != null && cursorY != null) {
    const c = await sharp(CURSOR_SVG).resize(16, 20).png().toBuffer();
    pipeline = pipeline.composite([{ input: c, top: Math.max(0, Math.min(H-20, cursorY-2)), left: Math.max(0, Math.min(W-16, cursorX-2)) }]);
  }
  if (clickX != null && clickY != null) {
    const ripple = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${clickX}" cy="${clickY}" r="12" fill="none" stroke="white" stroke-width="2.5" opacity="0.9"/></svg>`);
    pipeline = pipeline.composite([{ input: await sharp(ripple).png().toBuffer(), top: 0, left: 0 }]);
  }
  fs.writeFileSync(path.join(framesDir, `frame-${pad(frameNum++)}.png`), await pipeline.png().toBuffer());
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function runPs(scriptContent) {
  const psDir = path.join(__dirname, '..', 'temp-ps');
  if (!fs.existsSync(psDir)) fs.mkdirSync(psDir, { recursive: true });
  const filePath = path.join(psDir, 'cmd.ps1');
  fs.writeFileSync(filePath, scriptContent, 'utf-8');
  try { execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${filePath}"`, { timeout: 15000 }); } catch {}
}

function activateWindow() {
  runPs(`$wshell = New-Object -ComObject wscript.shell
$wshell.AppActivate("Zoid Editor")
Start-Sleep -Milliseconds 300`);
}

function sendKeys(keys) {
  runPs(`$wshell = New-Object -ComObject wscript.shell
$wshell.AppActivate("Zoid Editor")
Start-Sleep -Milliseconds 100
$wshell.SendKeys('${keys.replace(/'/g, "''")}')
Start-Sleep -Milliseconds 100`);
}

function createSampleFiles() {
  const demoDir = path.join(__dirname, '..', 'demo-project');
  if (!fs.existsSync(demoDir)) fs.mkdirSync(demoDir, { recursive: true });
  fs.writeFileSync(path.join(demoDir, 'app.js'), `// Zoid Editor Demo
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
const results = [];
for (let i = 0; i < 15; i++) {
  results.push(fibonacci(i));
}
console.log('Fibonacci sequence:', results.join(', '));
`, 'utf-8');
  fs.writeFileSync(path.join(demoDir, 'style.css'), `/* Zoid Editor Demo */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, sans-serif; background: #000; color: #fff; line-height: 1.6; }
`, 'utf-8');
  fs.writeFileSync(path.join(demoDir, 'index.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Demo</title><link rel="stylesheet" href="style.css"></head>
<body><div class="container"><h1>Hello from Zoid Editor</h1><p>Demo project.</p></div><script src="app.js"></script></body></html>`, 'utf-8');
}

function clearWindowState() {
  try {
    const p = path.join(process.env.APPDATA, 'Zoid Editor', 'window-state.json');
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch {}
}

async function captureLoop() {
  if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true });
  fs.mkdirSync(framesDir, { recursive: true });
  try { fs.rmSync(path.join(__dirname, '..', 'temp-ps'), { recursive: true }); } catch {}
  createSampleFiles();
  clearWindowState();

  console.log('Launching Zoid Editor...');
  child = spawn(exePath, [], { detached: true, stdio: 'ignore' });
  console.log('Waiting for editor to load...');
  await sleep(10000);
  activateWindow();
  await sleep(500);

  const cx = W/2, cy = H/2;

  // Each scene: [cursorX, cursorY, clickX, clickY, durationSec, actionFn]
  const scenes = [
    // 0 - Initial empty view
    [cx, cy, null, null, 0.8, null],
    // 1 - Toggle sidebar with Ctrl+B, move cursor to sidebar
    [30, 250, null, null, 0.3, () => { sendKeys('^b'); }],
    // 2 - Sidebar open, pause to see it
    [30, 250, 30, 250, 0.8, null],
    // 3 - Wait/look at sidebar
    [180, 280, null, null, 0.5, null],
    // 4 - Send Ctrl+Shift+O to open folder, then navigate
    [cx, cy, null, null, 0.3, () => { sendKeys('^+o'); }],
    // 5 - Wait (file dialog would open, but we handle failure gracefully)
    [cx, cy, null, null, 0.5, null],
    // 6 - Escape to close dialog
    [cx, cy, null, null, 0.3, () => { sendKeys('{ESC}'); }],
    // 7 - Toggle AI panel
    [W-100, 300, null, null, 0.3, () => { sendKeys('^j'); }],
    // 8 - AI panel open
    [W-100, 300, null, null, 1.5, null],
    // 9 - Close AI panel
    [cx, cy, null, null, 0.3, () => { sendKeys('^j'); }],
    // 10 - Open Terminal
    [W/2, H-80, null, null, 0.3, () => { sendKeys('``'); }],
    // 11 - Terminal visible
    [W/2, H-80, null, null, 1.5, null],
    // 12 - Close terminal
    [cx, cy, null, null, 0.3, () => { sendKeys('``'); }],
    // 13 - Open Command Palette
    [W/2, 200, null, null, 0.3, () => { sendKeys('^+p'); }],
    // 14 - Command palette visible
    [W/2, 250, null, null, 1.0, null],
    // 15 - Close palette, switch to extensions view (Ctrl+Shift+X would be nice, but we'll click)
    [cx, cy, null, null, 0.3, () => { sendKeys('{ESC}'); }],
    // 16 - Switch views with Ctrl+Tab
    [cx, cy, null, null, 0.3, () => { sendKeys('^+e'); }],
    // 17 - Wait
    [160, 250, null, null, 1.0, null],
    // 18 - Final - close sidebar
    [cx, cy, null, null, 0.3, () => { sendKeys('^b'); }],
    // 19 - Final view
    [cx, cy, null, null, 1.0, null],
  ];

  for (const [curX, curY, clkX, clkY, dur, action] of scenes) {
    if (action) { action(); }
    const total = Math.round(dur * FPS);
    for (let i = 0; i < total; i++) {
      const showClick = clkX != null && i < FPS * 0.2;
      await captureFrame(showClick ? clkX : curX, showClick ? clkY : curY, showClick ? clkX : null, showClick ? clkY : null);
      await sleep(1000 / FPS);
    }
  }

  console.log(`Captured ${frameNum} frames`);
  try { process.kill(-child.pid); } catch {}
  try { process.kill(child.pid); } catch {}
}

async function encodeVideo() {
  console.log('Encoding video...');
  return new Promise((resolve, reject) => {
    const args = [
      '-y', '-framerate', String(FPS),
      '-i', path.join(framesDir, 'frame-%05d.png'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-preset', 'medium', '-crf', '18',
      '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
      '-movflags', '+faststart',
      outMp4,
    ];
    const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', d => stderr += d);
    proc.on('close', code => {
      if (code === 0) {
        const size = fs.statSync(outMp4).size;
        console.log('Video created:', `${(size/1024/1024).toFixed(1)} MB`);
        fs.copyFileSync(outMp4, outWebMp4);
        resolve();
      } else {
        console.error('FFmpeg error:', stderr.slice(-300));
        reject(new Error(`Exit ${code}`));
      }
    });
    proc.on('error', reject);
  });
}

async function main() {
  try {
    await captureLoop();
    if (frameNum < 20) { console.error('Too few frames'); process.exit(1); }
    await encodeVideo();
    // Keep frames for verification, just clean up ps and demo
    try { fs.rmSync(path.join(__dirname, '..', 'temp-ps'), { recursive: true }); } catch {}
    try { fs.rmSync(path.join(__dirname, '..', 'demo-project'), { recursive: true }); } catch {}
    // Save a couple verification frames
    try {
      const first = path.join(framesDir, 'frame-00000.png');
      const mid = path.join(framesDir, `frame-${pad(Math.floor(frameNum/2))}.png`);
      if (fs.existsSync(first)) fs.copyFileSync(first, path.join(__dirname, '..', 'public', 'frame-first.png'));
      if (fs.existsSync(mid)) fs.copyFileSync(mid, path.join(__dirname, '..', 'public', 'frame-mid.png'));
      console.log('Debug frames saved to public/');
    } catch {}
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
    try { process.kill(-child?.pid); } catch {}
    process.exit(1);
  }
}

main();
