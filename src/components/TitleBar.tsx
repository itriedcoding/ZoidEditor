import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { IconExplorer, IconAI, IconTerminal, IconSettings, IconMinimize, IconMaximize, IconRestore, IconClose } from './Icons';

function TitleBar() {
  const { tabs, activeTabId, toggleExplorer, setActiveView, activeView } = useStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [platform, setPlatform] = useState('win32');
  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    (window as any).electronAPI?.window.isMaximized().then(setIsMaximized);
    (window as any).electronAPI?.app.getPlatform().then(setPlatform);
  }, []);

  const handleMaximize = async () => {
    await (window as any).electronAPI?.window.maximize();
    const max = await (window as any).electronAPI?.window.isMaximized();
    setIsMaximized(max);
  };

  return (
    <div className={`titlebar ${isMaximized ? 'maximized' : ''}`}>
      <div className="titlebar-drag">
        <div className="titlebar-start">
          <div className="app-logo">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="1" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 13l4-6 4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 8l10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <button className="tb-btn" onClick={() => toggleExplorer()} title="Toggle Explorer (Ctrl+B)">
            <IconExplorer size={16} />
          </button>
        </div>

        <div className="titlebar-center">
          {activeTab ? (
            <div className="titlebar-tab-info">
              <span className="tb-file-name">{activeTab.fileName}</span>
              {activeTab.isDirty && <span className="tb-dirty">●</span>}
              <span className="tb-path">{activeTab.path}</span>
            </div>
          ) : (
            <span className="tb-title">Zoid Editor</span>
          )}
        </div>

        <div className="titlebar-end">
          <div className="tb-actions">
            <button className={`tb-btn ${activeView === 'settings' ? 'active' : ''}`} onClick={() => setActiveView('settings')} title="Settings (Ctrl+,)">
              <IconSettings size={15} />
            </button>
            <button className="tb-btn" onClick={() => setActiveView('ai')} title="AI Assistant (Ctrl+J)">
              <IconAI size={15} />
            </button>
            <button className="tb-btn" onClick={() => setActiveView('terminal')} title="Terminal (Ctrl+`)">
              <IconTerminal size={15} />
            </button>
          </div>
        </div>
      </div>

      {platform !== 'win32' && (
        <div className="titlebar-window-controls">
          <button className="win-btn minimize" onClick={() => (window as any).electronAPI?.window.minimize()}>
            <IconMinimize size={12} />
          </button>
          <button className="win-btn maximize" onClick={handleMaximize}>
            {isMaximized ? <IconRestore size={12} /> : <IconMaximize size={12} />}
          </button>
          <button className="win-btn close" onClick={() => (window as any).electronAPI?.window.close()}>
            <IconClose size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

export default TitleBar;
