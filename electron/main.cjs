const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

let mainWindow;
let isQuitting = false;
const platform = process.platform;

// Platform-specific app user model ID (Windows only)
if (platform === 'win32') {
  app.setAppUserModelId('com.zoid.editor');
}

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  const isWin = platform === 'win32';
  const isMac = platform === 'darwin';
  const isLinux = platform === 'linux';

  const windowOpts = {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 500,
    backgroundColor: '#000000',
    show: false,
    icon: path.join(__dirname, '..', 'build', isWin ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  };

  if (isWin) {
    // Windows: frameless with custom title bar overlay (Windows 11 snap layouts)
    windowOpts.frame = false;
    windowOpts.titleBarStyle = 'hidden';
    windowOpts.titleBarOverlay = {
      color: '#000000',
      symbolColor: '#ffffff',
      height: 40,
    };
  } else if (isMac) {
    // macOS: use hiddenInset for native traffic lights + custom titlebar
    windowOpts.frame = false;
    windowOpts.titleBarStyle = 'hiddenInset';
    windowOpts.trafficLightPosition = { x: 12, y: 12 };
  } else {
    // Linux: frameless with our own titlebar
    windowOpts.frame = false;
    windowOpts.titleBarStyle = 'hidden';
  }

  mainWindow = new BrowserWindow(windowOpts);

  // Load the app
  const isDev = process.env.VITE_DEV_SERVER_URL || process.argv.includes('--dev');
  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
    if (!process.argv.includes('--no-devtools')) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Restore maximized state
    try {
      const statePath = path.join(app.getPath('userData'), 'window-state.json');
      if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
        if (state.isMaximized) mainWindow.maximize();
      }
    } catch {}
  });



  // Save window state
  const saveWindowState = () => {
    try {
      if (mainWindow.isMinimized()) return;
      const bounds = mainWindow.getBounds();
      const state = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized: mainWindow.isMaximized(),
      };
      fs.writeFileSync(
        path.join(app.getPath('userData'), 'window-state.json'),
        JSON.stringify(state)
      );
    } catch {}
  };

  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);
  mainWindow.on('maximize', saveWindowState);
  mainWindow.on('unmaximize', saveWindowState);

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

// Cross-platform native app menu
function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // macOS app menu
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'Cmd+,',
          click: () => mainWindow?.webContents.send('menu:settings'),
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),

    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new-file'),
        },
        {
          label: 'Open File...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:open-file'),
        },
        {
          label: 'Open Folder...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => mainWindow?.webContents.send('menu:open-folder'),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('menu:save-as'),
        },
        { type: 'separator' },
        ...(isMac ? [{ role: 'close' }] : [{ role: 'quit', label: 'Exit' }]),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Explorer',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow?.webContents.send('menu:toggle-explorer'),
        },
        {
          label: 'Toggle AI Panel',
          accelerator: 'CmdOrCtrl+J',
          click: () => mainWindow?.webContents.send('menu:toggle-ai'),
        },
        {
          label: 'Toggle Terminal',
          accelerator: 'CmdOrCtrl+`',
          click: () => mainWindow?.webContents.send('menu:toggle-terminal'),
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => mainWindow?.webContents.send('menu:settings'),
        },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'reload' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Zoid Editor',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Zoid Editor',
              message: 'Zoid Editor v1.0.0',
              detail: 'Advanced Code Editor for Vibe Coders\n\nBuilt with Electron, React, Monaco Editor\n\nAI-powered coding with BYOK, free models, local models, and MCP server support.',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  // On macOS, keep app running in dock even when all windows are closed
});

app.on('before-quit', () => {
  isQuitting = true;
});

// === IPC Handlers ===

// File operations
ipcMain.handle('file:read', async (_, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath);
    return { content, ext, fileName: path.basename(filePath) };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('file:write', async (_, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('file:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'All Files', extensions: ['*'] }],
  });
  if (result.canceled) return { files: [] };
  const files = result.filePaths.map(fp => ({
    path: fp,
    fileName: path.basename(fp),
    ext: path.extname(fp),
    content: fs.readFileSync(fp, 'utf-8'),
  }));
  return { files };
});

ipcMain.handle('file:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (result.canceled) return { folder: null };
  return { folder: result.filePaths[0] };
});

ipcMain.handle('file:saveAs', async (_, content) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'JavaScript', extensions: ['js', 'jsx', 'mjs'] },
      { name: 'TypeScript', extensions: ['ts', 'tsx'] },
      { name: 'Python', extensions: ['py'] },
      { name: 'HTML', extensions: ['html', 'htm'] },
      { name: 'CSS', extensions: ['css', 'scss', 'less'] },
      { name: 'JSON', extensions: ['json'] },
      { name: 'Markdown', extensions: ['md'] },
    ],
  });
  if (result.canceled) return { error: 'cancelled' };
  fs.writeFileSync(result.filePath, content, 'utf-8');
  return { path: result.filePath, fileName: path.basename(result.filePath) };
});

ipcMain.handle('file:readDir', async (_, dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const items = entries.map(e => ({
      name: e.name,
      path: path.join(dirPath, e.name),
      isDirectory: e.isDirectory(),
      ext: e.isFile() ? path.extname(e.name) : '',
    }));
    return { items };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('file:delete', async (_, filePath) => {
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) fs.rmSync(filePath, { recursive: true, force: true });
    else fs.unlinkSync(filePath);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('file:create', async (_, filePath) => {
  try {
    fs.writeFileSync(filePath, '', 'utf-8');
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('file:mkdir', async (_, dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

// Recursive file tree builder
function buildFileTree(dirPath, depth = 0) {
  if (depth > 10) return [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const items = [];
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      if (e.name === 'node_modules') continue;
      const fullPath = path.join(dirPath, e.name);
      const ext = e.isFile() ? path.extname(e.name) : '';
      const node = { name: e.name, path: fullPath, isDirectory: e.isDirectory(), ext };
      if (e.isDirectory()) node.children = buildFileTree(fullPath, depth + 1);
      items.push(node);
    }
    items.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return items;
  } catch { return []; }
}

ipcMain.handle('file:readTree', async (_, dirPath) => {
  return buildFileTree(dirPath);
});

// Dialog
ipcMain.handle('dialog:save', async (_, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// Window controls for frameless mode
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.handle('window:close', () => mainWindow?.close());
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() || false);

// System info
ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('app:getPath', (_, name) => app.getPath(name));
ipcMain.handle('app:getPlatform', () => process.platform);
ipcMain.handle('app:capturePage', async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return null;
  const image = await mainWindow.webContents.capturePage();
  return image.toPNG().toJSON().data;
});

// ========== HTTP HELPER (avoids CORS from file://) ==========
function httpFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const mod = isHttps ? https : http;
    const method = options.method || 'GET';
    const headers = options.headers || {};
    const body = options.body || null;

    const req = mod.request(url, {
      method,
      headers: { ...headers, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, ok: false, data, error: 'Parse error' }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

// ========== GITHUB AUTH (via main process to avoid CORS) ==========
ipcMain.handle('github:requestDeviceCode', async () => {
  const res = await httpFetch('https://github.com/login/device/code', {
    method: 'POST',
    body: JSON.stringify({
      client_id: 'Ov23li4uuzt8vrecmH5k',
      scope: 'repo,user,read:org',
    }),
  });
  if (!res.ok) throw new Error(`Device code request failed: ${res.status}`);
  return res.data;
});

ipcMain.handle('github:pollForToken', async (_, deviceCode, interval, expiresIn) => {
  const startTime = Date.now();
  const timeoutMs = expiresIn * 1000;
  let curInterval = interval;

  while (Date.now() - startTime < timeoutMs) {
    await new Promise(r => setTimeout(r, curInterval * 1000));
    const res = await httpFetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: 'Ov23li4uuzt8vrecmH5k',
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });
    if (!res.ok) continue;
    const data = res.data;
    if (data.access_token) return data.access_token;
    if (data.error === 'authorization_pending') continue;
    if (data.error === 'slow_down') { curInterval += 5; continue; }
    throw new Error(data.error_description || data.error || 'Authorization failed');
  }
  throw new Error('Authorization timed out');
});

ipcMain.handle('github:getUser', async (_, token) => {
  const res = await httpFetch('https://api.github.com/user', {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
  return res.data;
});

// ========== OPEN VSX (extensions API, via main process) ==========
ipcMain.handle('vsx:search', async (_, query, size = 20, offset = 0) => {
  const url = `https://open-vsx.org/api/-/search?query=${encodeURIComponent(query)}&size=${size}&offset=${offset}&sortBy=relevance`;
  const res = await httpFetch(url);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.data;
});

ipcMain.handle('vsx:detail', async (_, publisher, name) => {
  const url = `https://open-vsx.org/api/${encodeURIComponent(publisher)}/${encodeURIComponent(name)}`;
  const res = await httpFetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.data;
});

ipcMain.handle('vsx:download', async (_, publisher, name, version) => {
  const url = `https://open-vsx.org/api/${encodeURIComponent(publisher)}/${encodeURIComponent(name)}/${version}/file/vsix`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`Download failed: ${res.statusCode}`)); return; }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toJSON().data));
    }).on('error', reject).on('timeout', function () { this.destroy(); reject(new Error('Download timeout')); });
  });
});

// ========== LOCAL MODEL DETECTION (via main process) ==========
ipcMain.handle('detect:ollama', async () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:11434/api/tags', { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { const j = JSON.parse(data); resolve((j.models || []).map(m => ({ id: 'ollama-auto-' + m.name.replace(/[^a-zA-Z0-9]/g, '-'), name: 'Ollama - ' + m.name, provider: 'ollama', model: m.name }))); }
        catch { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.on('timeout', () => { req.destroy(); resolve([]); });
  });
});

ipcMain.handle('detect:lmstudio', async () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:1234/v1/models', { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { const j = JSON.parse(data); resolve((j.data || []).map(m => ({ id: 'lmstudio-auto-' + m.id.replace(/[^a-zA-Z0-9]/g, '-'), name: 'LM Studio - ' + m.id, provider: 'lmstudio', model: m.id }))); }
        catch { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.on('timeout', () => { req.destroy(); resolve([]); });
  });
});

// ========== EXTENSION INSTALLATION ==========
ipcMain.handle('extensions:install', async (_, name, dataArray) => {
  const extDir = path.join(app.getPath('userData'), 'extensions');
  if (!fs.existsSync(extDir)) fs.mkdirSync(extDir, { recursive: true });
  const filePath = path.join(extDir, `${name}.vsix`);
  fs.writeFileSync(filePath, Buffer.from(dataArray));
  return { success: true, path: filePath };
});

ipcMain.handle('extensions:list', async () => {
  const extDir = path.join(app.getPath('userData'), 'extensions');
  if (!fs.existsSync(extDir)) return [];
  return fs.readdirSync(extDir).filter(i => i.endsWith('.vsix'));
});

ipcMain.handle('extensions:uninstall', async (_, name) => {
  const extDir = path.join(app.getPath('userData'), 'extensions');
  const vsixPath = path.join(extDir, `${name}.vsix`);
  try { if (fs.existsSync(vsixPath)) fs.unlinkSync(vsixPath); } catch {}
  return { success: true };
});

// ========== REAL GIT INTEGRATION (simple-git) ==========
const simpleGit = require('simple-git');

let gitRepoDir = null;

function getGit(dir) {
  const d = dir || gitRepoDir;
  if (!d) return null;
  return simpleGit(d);
}

ipcMain.handle('git:init', async (_, dir) => {
  try {
    const git = simpleGit(dir);
    await git.init();
    gitRepoDir = dir;
    const status = await git.status();
    const branches = await git.branch();
    return { success: true, status, branches: branches.all };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:open', async (_, dir) => {
  try {
    const git = simpleGit(dir);
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      gitRepoDir = null;
      return { isRepo: false };
    }
    gitRepoDir = dir;
    const status = await git.status();
    const branches = await git.branch();
    const log = await git.log({ maxCount: 20 });
    return {
      isRepo: true,
      status: status,
      branches: branches.all,
      currentBranch: branches.current,
      log: log.all.map(c => ({ hash: c.hash, date: c.date, message: c.message, author_name: c.author_name, author_email: c.author_email })),
    };
  } catch (err) {
    return { error: err.message, isRepo: false };
  }
});

ipcMain.handle('git:status', async () => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    const status = await git.status();
    return {
      status: {
        not_added: status.not_added || [],
        conflicted: status.conflicted || [],
        created: status.created || [],
        deleted: status.deleted || [],
        modified: status.modified || [],
        renamed: status.renamed || [],
        staged: status.staged || [],
        files: status.files || [],
        ahead: status.ahead || 0,
        behind: status.behind || 0,
        current: status.current || '',
        tracking: status.tracking || '',
      },
    };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:branches', async () => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    const b = await git.branch();
    return { branches: b.all, current: b.current };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:log', async (_, maxCount = 20) => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    const log = await git.log({ maxCount });
    return { log: log.all.map(c => ({ hash: c.hash, date: c.date, message: c.message, author_name: c.author_name, author_email: c.author_email })) };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:add', async (_, filePath) => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    await git.add(filePath);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:unstage', async (_, filePath) => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    await git.reset([filePath]);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:commit', async (_, message) => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    const result = await git.commit(message);
    return { success: true, commit: result };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:checkout', async (_, branch) => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    await git.checkout(branch);
    const status = await git.status();
    const b = await git.branch();
    return { success: true, status, branches: b.all, current: b.current };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:branch', async (_, name) => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    await git.branch([name]);
    await git.checkout(name);
    const b = await git.branch();
    return { success: true, branches: b.all, current: b.current };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:diff', async (_, filePath) => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    const diff = await git.diff([filePath || '--cached']);
    return { diff };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:addRemote', async (_, name, url) => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    await git.addRemote(name, url);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:pull', async (_, remote = 'origin', branch = 'main') => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    const result = await git.pull(remote, branch);
    const status = await git.status();
    return { success: true, result, status };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:push', async (_, remote = 'origin', branch = 'main') => {
  const git = getGit();
  if (!git) return { error: 'No git repository open' };
  try {
    const result = await git.push(remote, branch);
    return { success: true, result };
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('git:close', async () => {
  gitRepoDir = null;
  return { success: true };
});

// ========== REAL TERMINAL ==========
let shellProcess = null;
let shellBuffer = '';

function startShell(win) {
  return new Promise((resolve, reject) => {
    const shell = process.platform === 'win32'
      ? (process.env.COMSPEC || 'cmd.exe')
      : (process.env.SHELL || '/bin/bash');
    const args = process.platform === 'win32' ? [] : [];

    try {
      const { spawn } = require('child_process');
      shellProcess = spawn(shell, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, TERM: 'xterm-256color' },
      });

      shellProcess.stdout.on('data', (data) => {
        if (win && !win.isDestroyed()) {
          win.webContents.send('terminal:data', data.toString('base64'));
        }
      });

      shellProcess.stderr.on('data', (data) => {
        if (win && !win.isDestroyed()) {
          win.webContents.send('terminal:data', data.toString('base64'));
        }
      });

      shellProcess.on('exit', () => {
        shellProcess = null;
        if (win && !win.isDestroyed()) {
          win.webContents.send('terminal:exit');
        }
      });

      shellProcess.on('error', (err) => {
        shellProcess = null;
        reject(err);
      });

      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

ipcMain.handle('terminal:start', async () => {
  if (shellProcess) {
    shellProcess.kill();
    shellProcess = null;
  }
  await startShell(mainWindow);
  return true;
});

ipcMain.handle('terminal:stdin', (_, data) => {
  if (shellProcess && shellProcess.stdin.writable) {
    shellProcess.stdin.write(data);
  }
});

ipcMain.handle('terminal:resize', (_, cols, rows) => {
  if (shellProcess && shellProcess.stdout) {
    try { shellProcess.stdout.setCols?.(cols); } catch {}
    try { shellProcess.stderr.setCols?.(cols); } catch {}
  }
});

ipcMain.handle('terminal:kill', () => {
  if (shellProcess) {
    shellProcess.kill();
    shellProcess = null;
  }
});

// ========== MCP SERVER (Model Context Protocol) ==========
const { spawn } = require('child_process');
const mcpProcesses = {};

function mcpSendMessage(proc, msg) {
  const data = JSON.stringify(msg);
  const header = `Content-Length: ${Buffer.byteLength(data, 'utf-8')}\r\n\r\n`;
  proc.stdin.write(header + data);
}

function mcpSetupProcess(name, proc, pendingRef, msgIdRef) {
  let buffer = '';
  const pending = {};
  const msgId = { current: msgIdRef || 0 };
  pendingRef.value = pending;
  msgIdRef.value = msgId;

  proc.stdout.on('data', (data) => {
    buffer += data.toString();
    while (buffer.length > 0) {
      const match = buffer.match(/Content-Length: (\d+)\r\n\r\n/);
      if (!match) break;
      const len = parseInt(match[1], 10);
      const headerEnd = match.index + match[0].length;
      if (buffer.length < headerEnd + len) break;
      const body = buffer.slice(headerEnd, headerEnd + len);
      buffer = buffer.slice(headerEnd + len);
      try {
        const parsed = JSON.parse(body);
        if (parsed.id !== undefined && pending[parsed.id]) {
          pending[parsed.id].resolve(parsed);
          delete pending[parsed.id];
        }
      } catch {}
    }
  });

  proc.on('exit', () => {
    delete mcpProcesses[name];
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('mcp:exited', name);
    }
  });

  proc.on('error', (err) => {
    delete mcpProcesses[name];
  });
}

ipcMain.handle('mcp:start', async (_, config) => {
  const { name, command, args } = config;
  if (!name || !command) return { error: 'Name and command required' };
  if (mcpProcesses[name]) return { error: 'Server already running' };

  const argsArray = args ? args.split(' ').filter(a => a.trim()) : [];
  const proc = spawn(command, argsArray, {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  const pendingRef = { value: {} };
  const msgIdRef = { value: 0 };
  mcpSetupProcess(name, proc, pendingRef, msgIdRef);
  mcpProcesses[name] = { proc, tools: [], pending: pendingRef.value, msgId: msgIdRef.value };

  const mcpCall = (method, params, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      const id = ++msgIdRef.value;
      const timer = setTimeout(() => reject(new Error(`${method} timeout`)), timeout);
      pendingRef.value[id] = {
        resolve: (res) => { clearTimeout(timer); resolve(res); },
        reject: (err) => { clearTimeout(timer); reject(err); },
      };
      mcpSendMessage(proc, { jsonrpc: '2.0', id, method, params: params || {} });
    });
  };

  try {
    await mcpCall('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'zoid-editor', version: '1.0.0' } });
    mcpSendMessage(proc, { jsonrpc: '2.0', method: 'notifications/initialized' });
    const toolsResult = await mcpCall('tools/list', {}, 15000);
    const tools = toolsResult.result?.tools || [];
    mcpProcesses[name].tools = tools;
    return { success: true, tools };
  } catch (err) {
    proc.kill();
    delete mcpProcesses[name];
    return { error: err.message };
  }
});

ipcMain.handle('mcp:stop', async (_, name) => {
  if (mcpProcesses[name]) {
    mcpProcesses[name].proc.kill();
    delete mcpProcesses[name];
  }
  return { success: true };
});

ipcMain.handle('mcp:listTools', async (_, name) => {
  if (!mcpProcesses[name]) return { error: 'Server not running', tools: [] };
  return { tools: mcpProcesses[name].tools };
});

ipcMain.handle('mcp:callTool', async (_, name, toolName, args) => {
  if (!mcpProcesses[name]) return { error: 'Server not running' };
  const server = mcpProcesses[name];
  const id = ++server.msgId;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ error: 'Tool call timeout' }), 30000);
    server.pending[id] = {
      resolve: (res) => { clearTimeout(timer); resolve({ result: res.result }); },
      reject: () => { clearTimeout(timer); resolve({ error: 'Tool call failed' }); },
    };
    mcpSendMessage(server.proc, { jsonrpc: '2.0', id, method: 'tools/call', params: { name: toolName, arguments: args || {} } });
  });
});

ipcMain.handle('mcp:status', async () => {
  return Object.entries(mcpProcesses).map(([name, server]) => ({
    name, running: true, tools: server.tools,
  }));
});
