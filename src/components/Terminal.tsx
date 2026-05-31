import { useEffect, useState } from 'react';

interface TerminalInfo {
  terminal: string;
  terminalName: string;
  shell: string;
  shellName: string;
}

function TerminalPanel() {
  const [info, setInfo] = useState<TerminalInfo | null>(null);
  const [status, setStatus] = useState<'idle' | 'opening'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = (window as any).electronAPI;
    if (!api?.terminal) return;
    api.terminal.detect().then(setInfo).catch(() => {});
  }, []);

  const handleOpen = async () => {
    const api = (window as any).electronAPI;
    if (!api?.terminal) return;
    setStatus('opening');
    setError(null);
    try {
      const result = await api.terminal.open();
      if (!result.success) {
        setError(result.error || 'Failed to open terminal');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to open terminal');
    }
    setStatus('idle');
  };

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <div className="terminal-header-left">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 10l4-3-4-3M7 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Terminal</span>
        </div>
      </div>
      <div className="terminal-native-body">
        {info ? (
          <>
            <div className="terminal-native-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <path d="M7 8l3 3-3 3M13 14h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="terminal-native-detail">
              <span className="terminal-native-label">Terminal</span>
              <span className="terminal-native-value">{info.terminalName}</span>
            </div>
            <div className="terminal-native-detail">
              <span className="terminal-native-label">Shell</span>
              <span className="terminal-native-value">{info.shellName}</span>
            </div>
            <button
              className="terminal-native-btn"
              onClick={handleOpen}
              disabled={status === 'opening'}
            >
              {status === 'opening' ? 'Opening...' : 'Open Terminal'}
            </button>
            {error && <p className="terminal-native-error">{error}</p>}
            <p className="terminal-native-hint">Opens your system terminal as a separate window. Press Ctrl+` to toggle this panel.</p>
          </>
        ) : (
          <p className="terminal-native-hint" style={{ marginTop: 24 }}>Detecting terminal...</p>
        )}
      </div>
    </div>
  );
}

export default TerminalPanel;
