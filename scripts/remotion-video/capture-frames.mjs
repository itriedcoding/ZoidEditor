import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import screenshot from 'screenshot-desktop';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const EXE = path.join(ROOT, 'release', 'win-unpacked', 'Zoid Editor.exe');
const FRAMES_DIR = path.join(__dirname, 'public', 'frames');

const W = 1400;
const H = 900;

function pad(n) { return String(n).padStart(3, '0'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function runPs(script) {
  const psDir = path.join(ROOT, 'temp-ps');
  if (!fs.existsSync(psDir)) fs.mkdirSync(psDir, { recursive: true });
  const fp = path.join(psDir, 'cmd.ps1');
  fs.writeFileSync(fp, script, 'utf-8');
  try { execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${fp}"`, { timeout: 15000 }); } catch {}
}

function activate() {
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

function createDemoFiles() {
  const dir = path.join(ROOT, 'demo-project');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'app.js'), `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
const seq = [];
for (let i = 0; i < 15; i++) seq.push(fibonacci(i));
console.log('Fib:', seq.join(', '));
`, 'utf-8');
}

function clearWindowState() {
  try {
    const p = path.join(process.env.APPDATA, 'Zoid Editor', 'window-state.json');
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch {}
}

async function captureFrame(name, cursorX, cursorY) {
  const img = await screenshot({ format: 'png' });
  let pipeline = sharp(img).extract({ left: 260, top: 90, width: 1400, height: 900 }).resize(W, H);
  if (cursorX != null && cursorY != null) {
    const cursorSvg = Buffer.from(`<svg width="20" height="24" viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg">
      <polygon points="2,2 2,20 6,16 9,21 11,20 8,15 17,15" fill="white" stroke="rgba(0,0,0,0.5)" stroke-width="1"/>
    </svg>`);
    const c = await sharp(cursorSvg).resize(16, 20).png().toBuffer();
    pipeline = pipeline.composite([{ input: c, top: Math.max(0, Math.min(H-20, cursorY-2)), left: Math.max(0, Math.min(W-16, cursorX-2)) }]);
  }
  const buf = await pipeline.png().toBuffer();
  fs.writeFileSync(path.join(FRAMES_DIR, name), buf);
  console.log('  Captured:', name);
}

export async function captureAllFrames() {
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  try { fs.rmSync(path.join(ROOT, 'temp-ps'), { recursive: true }); } catch {}
  createDemoFiles();
  clearWindowState();

  console.log('Launching editor...');
  const child = spawn(EXE, [], { detached: true, stdio: 'ignore' });
  await sleep(12000);
  activate();
  await sleep(500);

  // Scene 1: Welcome / empty editor with sidebar
  console.log('Scene 1: Welcome editor');
  await captureFrame('editor-welcome.png', 80, 200);
  await sleep(200);

  // Scene 2: Open terminal
  console.log('Scene 2: Terminal');
  sendKeys('``');
  await sleep(1500);
  await captureFrame('editor-terminal.png', W/2, H-100);
  // Close terminal
  sendKeys('``');
  await sleep(500);

  // Scene 3: Open AI panel
  console.log('Scene 3: AI panel');
  sendKeys('^j');
  await sleep(1500);
  await captureFrame('editor-ai.png', W-80, 300);
  sendKeys('^j');
  await sleep(500);

  // Scene 4: Open Command Palette and show extensions
  console.log('Scene 4: Extensions view');
  sendKeys('^+p');
  await sleep(1000);
  sendKeys('{ESC}');
  await sleep(300);
  sendKeys('^+e');  // Try to open extensions
  await sleep(1500);
  await captureFrame('editor-extensions.png', 160, 250);
  sendKeys('^b');
  await sleep(500);

  // Scene 5: Open Git panel
  console.log('Scene 5: Git');
  sendKeys('^+g');
  await sleep(1500);
  await captureFrame('editor-git.png', 160, 300);
  sendKeys('^b');
  await sleep(500);

  // Scene 6: Final - toggle sidebar back for clean view
  console.log('Scene 6: Glass UI');
  sendKeys('^b');
  await sleep(1000);
  await captureFrame('editor-glass.png', W/2, H/2);

  // Kill editor
  try { process.kill(-child.pid); } catch {}
  try { process.kill(child.pid); } catch {}
  await sleep(1000);
  try { fs.rmSync(path.join(ROOT, 'temp-ps'), { recursive: true }); } catch {}
  try { fs.rmSync(path.join(ROOT, 'demo-project'), { recursive: true }); } catch {}
  console.log('All frames captured.');
}
