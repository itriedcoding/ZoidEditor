/**
 * Creates a distributable ZIP package from the built app.
 * Since electron-builder's winCodeSign has symlink issues on Windows,
 * this provides an alternative packaging method.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_DIR = path.join(__dirname, '..', 'release', 'win-unpacked');
const OUT_DIR = path.join(__dirname, '..', 'release');

function createZip() {
  if (!fs.existsSync(APP_DIR)) {
    console.error('App directory not found. Run "npm run electron:pack" first.');
    console.error(`Expected: ${APP_DIR}`);
    process.exit(1);
  }

  const zipName = 'Zoid-Editor-Portable.zip';
  const zipPath = path.join(OUT_DIR, zipName);

  console.log(`Creating portable package: ${zipPath}`);

  // Use PowerShell's Compress-Archive
  try {
    execSync(
      `powershell -Command "Compress-Archive -Path '${APP_DIR}\\*' -DestinationPath '${zipPath}' -Force"`,
      { stdio: 'pipe', timeout: 120000 }
    );
    const size = fs.statSync(zipPath).size;
    console.log(`✓ Created ${zipName} (${(size / 1024 / 1024).toFixed(1)} MB)`);
    console.log('');
    console.log('To install:');
    console.log('  1. Extract the ZIP file');
    console.log('  2. Run "Zoid Editor.exe"');
  } catch (err) {
    console.error('Failed to create ZIP:', err.message);
    process.exit(1);
  }
}

createZip();
