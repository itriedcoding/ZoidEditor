const screenshot = require('screenshot-desktop');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const exePath = path.join(__dirname, '..', 'release', 'win-unpacked', 'Zoid Editor.exe');
const outPath = path.join(__dirname, '..', 'public', 'screenshot.png');

console.log('Launching Zoid Editor...');
const child = spawn(exePath, [], {
  detached: true,
  stdio: 'ignore',
  env: { ...process.env },
});

// Wait for app to start and render, then take screenshot
setTimeout(async () => {
  try {
    const img = await screenshot({ format: 'png' });
    fs.writeFileSync(outPath, img);
    console.log('Screenshot saved:', outPath, `(${img.length} bytes)`);
  } catch (err) {
    console.error('Screenshot failed:', err.message);
  }
  // Kill the app
  try { process.kill(-child.pid); } catch {}
  process.exit(0);
}, 6000);
