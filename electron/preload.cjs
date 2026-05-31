const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  file: {
    read: (filePath) => ipcRenderer.invoke('file:read', filePath),
    write: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
    open: () => ipcRenderer.invoke('file:open'),
    openFolder: () => ipcRenderer.invoke('file:openFolder'),
    saveAs: (content) => ipcRenderer.invoke('file:saveAs', content),
    readDir: (dirPath) => ipcRenderer.invoke('file:readDir', dirPath),
    readTree: (dirPath) => ipcRenderer.invoke('file:readTree', dirPath),
    delete: (filePath) => ipcRenderer.invoke('file:delete', filePath),
    create: (filePath) => ipcRenderer.invoke('file:create', filePath),
    mkdir: (dirPath) => ipcRenderer.invoke('file:mkdir', dirPath),
  },
  dialog: {
    save: (options) => ipcRenderer.invoke('dialog:save', options),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPath: (name) => ipcRenderer.invoke('app:getPath', name),
    getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
    capturePage: () => ipcRenderer.invoke('app:capturePage'),
  },
  // ========== REAL TERMINAL ==========
  terminal: {
    start: () => ipcRenderer.invoke('terminal:start'),
    write: (data) => ipcRenderer.invoke('terminal:stdin', data),
    resize: (cols, rows) => ipcRenderer.invoke('terminal:resize', cols, rows),
    kill: () => ipcRenderer.invoke('terminal:kill'),
    onData: (callback) => {
      const handler = (_, data) => callback(data);
      ipcRenderer.on('terminal:data', handler);
      return () => ipcRenderer.removeListener('terminal:data', handler);
    },
    onExit: (callback) => {
      const handler = () => callback();
      ipcRenderer.on('terminal:exit', handler);
      return () => ipcRenderer.removeListener('terminal:exit', handler);
    },
    onShell: (callback) => {
      const handler = (_, name) => callback(name);
      ipcRenderer.on('terminal:shell', handler);
      return () => ipcRenderer.removeListener('terminal:shell', handler);
    },
  },
  // ========== GITHUB AUTH (via main process) ==========
  github: {
    requestDeviceCode: () => ipcRenderer.invoke('github:requestDeviceCode'),
    pollForToken: (deviceCode, interval, expiresIn) => ipcRenderer.invoke('github:pollForToken', deviceCode, interval, expiresIn),
    getUser: (token) => ipcRenderer.invoke('github:getUser', token),
  },
  // ========== OPEN VSX (via main process) ==========
  vsx: {
    search: (query, size, offset) => ipcRenderer.invoke('vsx:search', query, size, offset),
    detail: (publisher, name) => ipcRenderer.invoke('vsx:detail', publisher, name),
    download: (publisher, name, version) => ipcRenderer.invoke('vsx:download', publisher, name, version),
  },
  // ========== LOCAL MODEL DETECTION (via main process) ==========
  detect: {
    ollama: () => ipcRenderer.invoke('detect:ollama'),
    lmstudio: () => ipcRenderer.invoke('detect:lmstudio'),
  },
  // ========== GIT ==========
  git: {
    init: (dir) => ipcRenderer.invoke('git:init', dir),
    open: (dir) => ipcRenderer.invoke('git:open', dir),
    status: () => ipcRenderer.invoke('git:status'),
    branches: () => ipcRenderer.invoke('git:branches'),
    log: (maxCount) => ipcRenderer.invoke('git:log', maxCount),
    add: (filePath) => ipcRenderer.invoke('git:add', filePath),
    unstage: (filePath) => ipcRenderer.invoke('git:unstage', filePath),
    commit: (message) => ipcRenderer.invoke('git:commit', message),
    checkout: (branch) => ipcRenderer.invoke('git:checkout', branch),
    branch: (name) => ipcRenderer.invoke('git:branch', name),
    diff: (filePath) => ipcRenderer.invoke('git:diff', filePath),
    addRemote: (name, url) => ipcRenderer.invoke('git:addRemote', name, url),
    pull: (remote, branch) => ipcRenderer.invoke('git:pull', remote, branch),
    push: (remote, branch) => ipcRenderer.invoke('git:push', remote, branch),
    close: () => ipcRenderer.invoke('git:close'),
  },
  // ========== EXTENSIONS ==========
  extensions: {
    install: (name, dataArray) => ipcRenderer.invoke('extensions:install', name, dataArray),
    list: () => ipcRenderer.invoke('extensions:list'),
    uninstall: (name) => ipcRenderer.invoke('extensions:uninstall', name),
  },
  // ========== MCP SERVER ==========
  mcp: {
    start: (config) => ipcRenderer.invoke('mcp:start', config),
    stop: (name) => ipcRenderer.invoke('mcp:stop', name),
    listTools: (name) => ipcRenderer.invoke('mcp:listTools', name),
    callTool: (name, toolName, args) => ipcRenderer.invoke('mcp:callTool', name, toolName, args),
    status: () => ipcRenderer.invoke('mcp:status'),
    onExited: (callback) => {
      const handler = (_, name) => callback(name);
      ipcRenderer.on('mcp:exited', handler);
      return () => ipcRenderer.removeListener('mcp:exited', handler);
    },
  },
  // Listen for menu actions from main process
  onMenuAction: (callback) => {
    const handler = (_, action) => callback(action);
    ipcRenderer.on('menu:new-file', () => callback('new-file'));
    ipcRenderer.on('menu:open-file', () => callback('open-file'));
    ipcRenderer.on('menu:open-folder', () => callback('open-folder'));
    ipcRenderer.on('menu:save', () => callback('save'));
    ipcRenderer.on('menu:save-as', () => callback('save-as'));
    ipcRenderer.on('menu:toggle-explorer', () => callback('toggle-explorer'));
    ipcRenderer.on('menu:toggle-ai', () => callback('toggle-ai'));
    ipcRenderer.on('menu:toggle-terminal', () => callback('toggle-terminal'));
    ipcRenderer.on('menu:settings', () => callback('settings'));
    // Return cleanup
    return () => {
      ipcRenderer.removeAllListeners('menu:new-file');
      ipcRenderer.removeAllListeners('menu:open-file');
      ipcRenderer.removeAllListeners('menu:open-folder');
      ipcRenderer.removeAllListeners('menu:save');
      ipcRenderer.removeAllListeners('menu:save-as');
      ipcRenderer.removeAllListeners('menu:toggle-explorer');
      ipcRenderer.removeAllListeners('menu:toggle-ai');
      ipcRenderer.removeAllListeners('menu:toggle-terminal');
      ipcRenderer.removeAllListeners('menu:settings');
    };
  },
});
