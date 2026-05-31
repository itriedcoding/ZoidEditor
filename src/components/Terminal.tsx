import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

function TerminalPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);
  const shellRef = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current || xtermRef.current) return;

    const api = (window as any).electronAPI;
    if (!api?.terminal) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 13,
      fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      theme: {
        background: '#0c0c0c', foreground: '#f0f0f0', cursor: '#ffffff',
        selectionBackground: '#333333',
        black: '#000000', red: '#e06c75', green: '#98c379', yellow: '#e5c07b',
        blue: '#61afef', magenta: '#c678dd', cyan: '#56b6c2', white: '#abb2bf',
        brightBlack: '#5c6370', brightRed: '#e06c75', brightGreen: '#98c379',
        brightYellow: '#e5c07b', brightBlue: '#61afef', brightMagenta: '#c678dd',
        brightCyan: '#56b6c2', brightWhite: '#ffffff',
      },
      allowTransparency: false,
      cols: 80, rows: 24,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    fitRef.current = fitAddon;

    term.open(containerRef.current);
    // Force focus onto the terminal's textarea
    setTimeout(() => term.focus(), 50);

    const fitTerminal = () => {
      try { fitAddon.fit(); } catch {}
    };
    requestAnimationFrame(fitTerminal);

    term.writeln('Zoid Editor Terminal');
    term.writeln('Starting shell...\r\n');

    // Register output listener BEFORE starting shell
    const removeData = api.terminal.onData((data: string) => {
      try {
        const binary = atob(data);
        const arr = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
        term.write(arr);
      } catch (e) {
        // fallback for plain text output
        term.write(data);
      }
    });

    const removeExit = api.terminal.onExit(() => {
      term.write('\r\n\x1b[31mProcess terminated. Click "New Terminal" to restart.\x1b[0m');
      shellRef.current = false;
    });

    cleanupRef.current.push(removeData, removeExit);

    // Handle input from user keystrokes -> send raw UTF-8 string to shell
    term.onData((data) => {
      if (shellRef.current) {
        api.terminal.write(data);
      }
    });

    // Start shell
    api.terminal.start().then(() => {
      shellRef.current = true;
      // Re-focus after shell starts
      setTimeout(() => term.focus(), 100);
    }).catch((err: any) => {
      term.writeln(`\r\n\x1b[31mFailed to start shell: ${err.message}\x1b[0m`);
    });

    // Fit on resize
    const onResize = () => fitTerminal();
    window.addEventListener('resize', onResize);
    cleanupRef.current.push(() => window.removeEventListener('resize', onResize));

    // Fit on container resize
    const ro = new ResizeObserver(() => fitTerminal());
    if (containerRef.current) ro.observe(containerRef.current);
    cleanupRef.current.push(() => ro.disconnect());

    xtermRef.current = term;

    return () => {
      term.dispose();
      xtermRef.current = null;
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
    };
  }, []);

  return (
    <div className="terminal-panel" onClick={() => xtermRef.current?.focus()}>
      <div className="terminal-header">
        <div className="terminal-header-left">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 10l4-3-4-3M7 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Terminal</span>
        </div>
        <div className="terminal-header-center">
          <span className="terminal-shell-name">powershell</span>
        </div>
        <div className="terminal-header-right">
          <button className="term-btn" title="New Terminal" onClick={() => {
            const t = xtermRef.current;
            if (t) {
              t.clear();
              shellRef.current = false;
              const a = (window as any).electronAPI;
              if (a?.terminal) {
                a.terminal.kill().then(() =>
                  a.terminal.start().then(() => {
                    shellRef.current = true;
                    t.focus();
                  })
                );
              }
            }
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
          <button className="term-btn" title="Kill Terminal" onClick={() => {
            shellRef.current = false;
            (window as any).electronAPI?.terminal?.kill();
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
      <div ref={containerRef} className="terminal-xterm" />
    </div>
  );
}

export default TerminalPanel;
