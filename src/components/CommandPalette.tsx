import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  category: string;
  action: () => void;
}

function CommandPalette() {
  const { commandPalette, closeCommandPalette, toggleExplorer, toggleAIPanel, toggleTerminal, toggleSettings, toggleFindReplace } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'toggle-explorer', label: 'Toggle Explorer Sidebar', shortcut: 'Ctrl+B', category: 'View', action: toggleExplorer },
    { id: 'toggle-ai', label: 'Toggle AI Assistant Panel', shortcut: 'Ctrl+J', category: 'View', action: toggleAIPanel },
    { id: 'toggle-terminal', label: 'Toggle Terminal', shortcut: 'Ctrl+`', category: 'View', action: toggleTerminal },
    { id: 'toggle-settings', label: 'Open Settings', shortcut: 'Ctrl+,', category: 'Preferences', action: toggleSettings },
    { id: 'find', label: 'Find in File', shortcut: 'Ctrl+F', category: 'Edit', action: toggleFindReplace },
    { id: 'toggle-dark', label: 'Toggle Dark/Light Theme', category: 'Preferences', action: () => {
      const s = useStore.getState();
      const newTheme = s.settings.theme === 'black-white' ? 'white-black' : 'black-white';
      s.updateSettings({ theme: newTheme as any });
      closeCommandPalette();
    }},
    { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', category: 'File', action: () => {
      (window as any).electronAPI?.file.create?.('');
      closeCommandPalette();
    }},
    { id: 'save', label: 'Save File', shortcut: 'Ctrl+S', category: 'File', action: () => {
      closeCommandPalette();
    }},
    { id: 'close-all-tabs', label: 'Close All Tabs', category: 'File', action: () => {
      const s = useStore.getState();
      s.tabs.forEach(t => s.closeTab(t.id));
      closeCommandPalette();
    }},
    { id: 'clear-chat', label: 'Clear AI Chat History', category: 'AI', action: () => {
      useStore.getState().clearAIChat();
      closeCommandPalette();
    }},
  ];

  useEffect(() => {
    if (commandPalette) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPalette]);

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCommandPalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
    }
  }, [filtered, selectedIndex, closeCommandPalette]);

  if (!commandPalette) return null;

  const categories = [...new Set(filtered.map(c => c.category))];

  return (
    <div className="command-palette-overlay" onMouseDown={closeCommandPalette}>
      <div className="command-palette" onMouseDown={e => e.stopPropagation()}>
        <div className="cp-input-wrap">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="cp-search-icon">
            <path d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.65-3.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            ref={inputRef}
            className="cp-input"
            placeholder="Type a command..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="cp-results">
          {categories.map(cat => (
            <div key={cat}>
              <div className="cp-category">{cat}</div>
              {filtered.filter(c => c.category === cat).map((cmd, i) => {
                const realIdx = filtered.indexOf(cmd);
                return (
                  <div
                    key={cmd.id}
                    className={`cp-item ${realIdx === selectedIndex ? 'selected' : ''}`}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(realIdx)}
                  >
                    <span className="cp-item-label">{cmd.label}</span>
                    {cmd.shortcut && <span className="cp-item-shortcut">{cmd.shortcut}</span>}
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="cp-empty">No matching commands</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
