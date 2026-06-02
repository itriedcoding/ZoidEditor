import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore, Tab } from './store';
import TitleBar from './components/TitleBar';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import Editor from './components/Editor';
import AIPanel from './components/AIPanel';
import MCPServerPanel from './components/MCPServerPanel';
import SnippetsPanel from './components/SnippetsPanel';
import Settings from './components/Settings';
import TerminalPanel from './components/Terminal';
import StatusBar from './components/StatusBar';
import FindReplace from './components/FindReplace';
import ContextMenu from './components/ContextMenu';
import CommandPalette from './components/CommandPalette';
import Notifications from './components/Notifications';
import { detectAllLocalModels } from './services/detect-local';
import SourceControl from './components/SourceControl';
import ExtensionsView from './components/ExtensionsView';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const appRef = useRef<HTMLDivElement>(null);
  const handlersRef = useRef<any>({});

  const {
    view, tabs, activeTabId, settings, addTab, setActiveTab, closeTab,
    setFileTree, activeView, setActiveView, toggleTerminal,
    toggleExplorer, toggleFindReplace, toggleCommandPalette, closeCommandPalette,
    showContextMenu, updateSettings, openFolder, setOpenFolder,
  } = useStore();

  const handleOpenFile = useCallback(async (filePath: string) => {
    try {
      const api = (window as any).electronAPI;
      if (!api) return;
      const result = await api.file.read(filePath);
      if (result?.error) { console.error(result.error); return; }
      const content = result.content;
      const ext = filePath.split('.').pop()?.toLowerCase() || '';
      const name = filePath.split('\\').pop()?.split('/').pop() || 'untitled';
      const langMap: Record<string, string> = {
        js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
        py: 'python', html: 'html', css: 'css', scss: 'scss', json: 'json',
        md: 'markdown', xml: 'xml', yaml: 'yaml', yml: 'yaml', sql: 'sql',
        rs: 'rust', go: 'go', java: 'java', cpp: 'cpp', c: 'c', h: 'c',
        cs: 'csharp', rb: 'ruby', php: 'php', swift: 'swift', kt: 'kotlin',
        sh: 'shell', bat: 'bat', ps1: 'powershell', dockerfile: 'dockerfile',
        vue: 'html', svelte: 'html', astro: 'html',
      };
      const language = langMap[ext] || ext;
      const exists = tabs.find(t => t.path === filePath);
      if (exists) { setActiveTab(exists.id); }
      else { addTab({ path: filePath, fileName: name, content, language }); }
    } catch (err: any) {
      console.error('Open file error:', err);
    }
  }, [tabs, addTab, setActiveTab]);

  const handleNewFile = useCallback(async () => {
    const api = (window as any).electronAPI;
    try {
      const filePath = await api?.file?.saveAs?.('');
      if (filePath) {
        const name = filePath.split('\\').pop()?.split('/').pop() || 'untitled';
        const ext = filePath.split('.').pop()?.toLowerCase() || '';
        addTab({ path: filePath, fileName: name, content: '', language: ext });
      } else {
        addTab({ path: '', fileName: 'untitled', content: '', language: '' });
      }
    } catch {
      addTab({ path: '', fileName: 'untitled', content: '', language: '' });
    }
  }, [addTab]);

  const handleSave = useCallback(async () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    const api = (window as any).electronAPI;
    try {
      if (tab.path) {
        await api.file.write(tab.path, tab.content);
        closeTab(tab.id);
        addTab({ path: tab.path, fileName: tab.fileName, content: tab.content, language: tab.language });
      } else {
        const path = await api.file.saveAs(tab.content);
        if (path) {
          closeTab(tab.id);
          const name = path.split('\\').pop()?.split('/').pop() || tab.fileName;
          const ext = path.split('.').pop()?.toLowerCase() || '';
          addTab({ path, fileName: name, content: tab.content, language: ext });
        }
      }
    } catch (err) { console.error('Save error:', err); }
  }, [tabs, activeTabId, closeTab, addTab]);

  const handleSaveAs = useCallback(async () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    const api = (window as any).electronAPI;
    try {
      const path = await api.file.saveAs(tab.content);
      if (path) {
        closeTab(tab.id);
        const name = path.split('\\').pop()?.split('/').pop() || tab.fileName;
        const ext = path.split('.').pop()?.toLowerCase() || '';
        addTab({ path, fileName: name, content: tab.content, language: ext });
      }
    } catch (err) { console.error('SaveAs error:', err); }
  }, [tabs, activeTabId, closeTab, addTab]);

  const handleOpenFolder = useCallback(async () => {
    const api = (window as any).electronAPI;
    try {
      const result = await api?.file?.openFolder?.();
      if (result?.folder) {
        setOpenFolder(result.folder);
        if (api.file.readTree) {
          const tree = await api.file.readTree(result.folder);
          setFileTree(tree || []);
        }
      }
    } catch (err) { console.error('Open folder error:', err); }
  }, [setFileTree]);

  // Store handlers in ref for menu action callbacks
  handlersRef.current = {
    handleNewFile, handleOpenFile, handleOpenFolder, handleSave, handleSaveAs,
    toggleExplorer, toggleTerminal, setActiveView,
  };

  useEffect(() => {
    const init = async () => {
      try {
        const api = (window as any).electronAPI;
        const cleanup = api?.onMenuAction?.((action: string) => {
          const h = handlersRef.current;
          switch (action) {
            case 'new-file': h.handleNewFile?.(); break;
            case 'open-file': api.file.open().then((r: any) => r?.files?.forEach?.((f: any) => h.handleOpenFile?.(f.path))); break;
            case 'open-folder': h.handleOpenFolder?.(); break;
            case 'save': h.handleSave?.(); break;
            case 'save-as': h.handleSaveAs?.(); break;
            case 'toggle-explorer': h.toggleExplorer?.(); break;
            case 'toggle-ai': h.setActiveView?.('ai'); break;
            case 'toggle-terminal': h.toggleTerminal?.(); break;
            case 'settings': h.setActiveView?.('settings'); break;
          }
        });

        detectAllLocalModels().then(({ ollama, lmstudio }) => {
          const detected = [...ollama, ...lmstudio];
          if (detected.length > 0) {
            useStore.getState().setDetectedLocalModels(detected);
            if (ollama.length > 0) useStore.getState().notify(`Detected ${ollama.length} Ollama model(s)`, 'info');
            if (lmstudio.length > 0) useStore.getState().notify(`Detected ${lmstudio.length} LM Studio model(s)`, 'info');
          }
        });

        if (api?.extensions?.list) {
          api.extensions.list().then((exts: string[]) => {
            useStore.getState().setInstalledExtensions(exts.map((e: string) => e.replace(/\.vsix$/, '')));
          });
        }

        try {
          const savedToken = localStorage.getItem('zoid-github-token');
          const savedUser = localStorage.getItem('zoid-github-user');
          if (savedToken && savedUser) {
            useStore.getState().setGitHubToken(savedToken);
            useStore.getState().setGitHubUser(JSON.parse(savedUser));
          }
        } catch {}

        const savedDark = localStorage.getItem('zoid-dark-mode');
        if (savedDark !== null) setDarkMode(savedDark === 'true');
      } catch (e) {
        console.error('Init error:', e);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'white-black');
    localStorage.setItem('zoid-dark-mode', String(darkMode));
  }, [darkMode]);

  const handleOpenFilesFromDialog = useCallback(async () => {
    const api = (window as any).electronAPI;
    if (!api) return;
    const result = await api.file.open();
    if (result?.files) {
      result.files.forEach((f: any) => handleOpenFile(f.path));
    }
  }, [handleOpenFile]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const items: any[] = [];
    if (target.closest('.tab')) {
      const tabEl = target.closest('.tab');
      const idx = Array.from(tabEl?.parentElement?.children || []).indexOf(tabEl as HTMLElement);
      const tab = tabs[idx];
      items.push(
        { label: 'Close', onClick: () => tab && closeTab(tab.id), shortcut: 'Ctrl+W' },
        { label: 'Close Others', onClick: () => { tabs.forEach(t => { if (t.id !== tab?.id) closeTab(t.id); }); } },
        { separator: true },
        { label: 'Copy Path', onClick: () => { if (tab?.path) navigator.clipboard.writeText(tab.path); } },
      );
    } else {
      items.push(
        { label: 'New File', onClick: handleNewFile, shortcut: 'Ctrl+N' },
        { label: 'Open File...', onClick: handleOpenFilesFromDialog, shortcut: 'Ctrl+O' },
        { separator: true },
        { label: 'Command Palette', onClick: toggleCommandPalette, shortcut: 'Ctrl+Shift+P' },
      );
    }
    showContextMenu(e.clientX, e.clientY, items);
  }, [tabs, closeTab, handleNewFile, showContextMenu, toggleCommandPalette, handleOpenFilesFromDialog]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
      e.preventDefault(); toggleCommandPalette(); return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); handleNewFile(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); toggleFindReplace(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); toggleExplorer(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'j') { e.preventDefault(); setActiveView(activeView === 'ai' ? 'editor' : 'ai'); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); setActiveView(activeView === 'terminal' ? 'editor' : 'terminal'); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'w') { e.preventDefault(); if (activeTabId) closeTab(activeTabId); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); handleOpenFilesFromDialog(); return; }
    // Ctrl+Tab / Ctrl+Shift+Tab
    if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
      e.preventDefault();
      const idx = tabs.findIndex(t => t.id === activeTabId);
      if (idx >= 0 && tabs.length > 1) {
        const next = e.shiftKey
          ? (idx - 1 + tabs.length) % tabs.length
          : (idx + 1) % tabs.length;
        setActiveTab(tabs[next].id);
      }
    }
    if (e.key === 'Escape' && view.findReplace) { e.preventDefault(); toggleFindReplace(); return; }
    if (e.key === 'Escape') { closeCommandPalette(); return; }
  }, [handleSave, handleNewFile, toggleFindReplace, toggleExplorer, setActiveView, activeView, toggleTerminal, toggleCommandPalette, closeCommandPalette, view.findReplace, activeTabId, tabs, closeTab, setActiveTab, handleOpenFilesFromDialog]);

  useEffect(() => {
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const path = (files[0] as any).path;
        if (path) handleOpenFile(path);
      }
    };
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, [handleOpenFile]);

  useEffect(() => {
    if (settings.theme !== (darkMode ? 'black-white' : 'white-black')) {
      setDarkMode(settings.theme === 'black-white');
    }
  }, [settings.theme]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <span>Zoid Editor</span>
      </div>
    );
  }

  const renderFullPageView = () => {
    switch (activeView) {
      case 'extensions':
        return <div className="main-area full-page-view"><ExtensionsView /></div>;
      case 'source-control':
        return <div className="main-area full-page-view"><SourceControl /></div>;
      case 'mcp':
        return <div className="main-area full-page-view"><MCPServerPanel /></div>;
      case 'snippets':
        return <div className="main-area full-page-view"><SnippetsPanel /></div>;
      case 'ai':
        return <div className="main-area full-page-view"><AIPanel /></div>;
      case 'terminal':
        return <div className="main-area full-page-view"><TerminalPanel /></div>;
      case 'settings':
        return <div className="main-area full-page-view"><Settings /></div>;
      default:
        return null;
    }
  };

  const renderEditorView = () => (
    <>
      <div className={`sidebar-wrap ${view.explorer ? 'visible' : 'hidden'}`}>
        <Sidebar openFolder={openFolder} onOpenFolder={handleOpenFolder}
          onOpenFile={handleOpenFile} onFileDrop={handleOpenFile}
          onRefreshFolder={async () => {
            if (openFolder && (window as any).electronAPI?.file?.readTree) {
              const tree = await (window as any).electronAPI.file.readTree(openFolder);
              setFileTree(tree || []);
            }
          }} />
      </div>
      <div className="main-area">
        {view.findReplace && <FindReplace />}
        <TabBar />
        <div className={`editor-area ${tabs.length === 0 ? 'empty' : ''}`}>
          {tabs.length > 0 ? (
            tabs.map(tab => (
              <div key={tab.id} className={`editor-wrapper ${tab.id === activeTabId ? 'active' : 'hidden'}`}>
                <Editor tab={tab} />
              </div>
            ))
          ) : (
            <div className="welcome-screen">
              <div className="welcome-logo">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect x="4" y="4" width="72" height="72" rx="16" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 52l16-24 16 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 36l40 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h1>Zoid Editor</h1>
              <p className="welcome-sub">Open a file or folder to get started</p>
              <div className="welcome-actions">
                <button onClick={handleOpenFolder}>Open Folder</button>
                <button onClick={handleNewFile}>New File</button>
                <button onClick={handleOpenFilesFromDialog}>Open File</button>
                <button onClick={() => { useStore.getState().updateSettings({ theme: darkMode ? 'white-black' as any : 'black-white' as any }); }}>Toggle Theme</button>
              </div>
              <div className="welcome-shortcuts">
                <div><kbd>Ctrl+Shift+P</kbd> Command Palette</div>
                <div><kbd>Ctrl+N</kbd> New File</div>
                <div><kbd>Ctrl+O</kbd> Open File</div>
                <div><kbd>Ctrl+S</kbd> Save</div>
                <div><kbd>Ctrl+W</kbd> Close Tab</div>
                <div><kbd>Ctrl+Tab</kbd> Next Tab</div>
                <div><kbd>Ctrl+F</kbd> Find</div>
                <div><kbd>Ctrl+J</kbd> AI Assistant</div>
                <div><kbd>Ctrl+B</kbd> Explorer</div>
                <div><kbd>Ctrl+`</kbd> Terminal</div>
              </div>
            </div>
          )}
        </div>
        <div className={`terminal-wrap ${view.terminal ? 'visible' : 'hidden'}`}>
          <TerminalPanel />
        </div>
      </div>
    </>
  );

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`} ref={appRef} onContextMenu={handleContextMenu} onKeyDown={handleKeyDown} tabIndex={0}>
      <TitleBar />
      <div className="app-body">
        <ActivityBar />
        {activeView === 'editor' ? renderEditorView() : renderFullPageView()}
      </div>
      <StatusBar />
      <CommandPalette />
      <Notifications />
      <ContextMenu />
    </div>
  );
}

export default App;
