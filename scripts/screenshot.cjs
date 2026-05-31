const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const screenshot = require('screenshot-desktop');
const sharp = require('sharp');

const exePath = path.join(__dirname, '..', 'release', 'win-unpacked', 'Zoid Editor.exe');
const outPng = path.join(__dirname, '..', 'public', 'screenshot.png');
const outWebPng = path.join(__dirname, '..', 'website', 'screenshot.png');

async function getWindowBounds() {
  // Use PowerShell to get Zoid Editor window position
  const psCmd = `
    Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      using System.Diagnostics;
      public class Win32 {
        [DllImport("user32.dll")]
        public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
        [DllImport("user32.dll")]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
        public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
      }
"@
    $procs = Get-Process -Name "Zoid Editor" -ErrorAction SilentlyContinue
    if (-not $procs) { "NOT_FOUND"; return }
    $mainPtr = $procs[0].MainWindowHandle
    if ($mainPtr -eq 0) { "NO_HANDLE"; return }
    $rect = New-Object Win32+RECT
    [Win32]::GetWindowRect($mainPtr, [ref]$rect)
    "$($rect.Left),$($rect.Top),$($rect.Right),$($rect.Bottom)"`;
  try {
    const result = execSync(`powershell -NoProfile -Command "${psCmd.replace(/"/g, '\\"')}"`, { timeout: 10000 }).toString().trim();
    const parts = result.split(',').map(Number);
    if (parts.length === 4 && !isNaN(parts[0])) {
      return { x: parts[0], y: parts[1], width: parts[2] - parts[0], height: parts[3] - parts[1] };
    }
  } catch {}
  // Fallback: assume centered on 1920x1080
  return { x: 260, y: 90, width: 1400, height: 900 };
}

async function capture() {
  console.log('Launching Zoid Editor...');
  const child = spawn(exePath, [], {
    detached: true,
    stdio: 'ignore',
  });

  // Wait for window to appear and render
  await new Promise(r => setTimeout(r, 7000));

  // Get window bounds
  const bounds = await getWindowBounds();
  console.log('Window bounds:', bounds);

  // Capture full screen
  console.log('Capturing screenshot...');
  const imgBuffer = await screenshot({ format: 'png' });

  // Crop to editor window
  const cropped = await sharp(imgBuffer)
    .extract({
      left: Math.round(bounds.x),
      top: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
    })
    .png()
    .toBuffer();

  fs.writeFileSync(outPng, cropped);
  fs.writeFileSync(outWebPng, cropped);
  console.log('Screenshot saved: public/ and website/', `(${cropped.length} bytes)`);

  // Kill the app
  try { process.kill(-child.pid); } catch {}
  try { process.kill(child.pid); } catch {}
  setTimeout(() => process.exit(0), 500);
}

capture().catch(err => {
  console.error('Screenshot failed:', err);
  process.exit(1);
});
