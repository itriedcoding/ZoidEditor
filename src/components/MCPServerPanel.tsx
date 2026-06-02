import { useState, useEffect } from 'react';
import { useStore, MCPServer } from '../store';
import { IconX, IconPlus, IconRefresh, IconCheck, IconPlug, IconTrash, IconMCP } from './Icons';

function MCPServerPanel() {
  const { mcpServers, addMCP, removeMCP, updateMCP, toggleMCP, setActiveView, notify } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [command, setCommand] = useState('npx');
  const [args, setArgs] = useState('');
  const [serverStatus, setServerStatus] = useState<Record<string, { running: boolean; tools: any[] }>>({});
  const [connecting, setConnecting] = useState<string | null>(null);

  const updateStatus = async () => {
    const api = (window as any).electronAPI;
    if (!api?.mcp?.status) return;
    try {
      const statuses = await api.mcp.status();
      const map: Record<string, { running: boolean; tools: any[] }> = {};
      (statuses || []).forEach((s: any) => { map[s.name] = { running: s.running, tools: s.tools || [] }; });
      setServerStatus(map);
    } catch {}
  };

  useEffect(() => {
    updateStatus();
    const iv = setInterval(updateStatus, 5000);
    const api = (window as any).electronAPI;
    const cleanup = api?.mcp?.onExited?.((name: string) => {
      setServerStatus(s => { const n = { ...s }; delete n[name]; return n; });
    });
    return () => { clearInterval(iv); cleanup?.(); };
  }, [mcpServers]);

  const handleStartServer = async (server: MCPServer) => {
    const api = (window as any).electronAPI;
    if (!api?.mcp?.start) return;
    setConnecting(server.id);
    try {
      const result = await api.mcp.start({ name: server.name, command: server.command, args: server.args });
      if (result.success) {
        notify(`MCP server "${server.name}" started with ${result.tools.length} tool(s)`, 'success');
        setServerStatus(s => ({ ...s, [server.name]: { running: true, tools: result.tools || [] } }));
        updateMCP(server.id, { enabled: true, tools: result.tools });
      } else {
        notify(`MCP start failed: ${result.error}`, 'error');
      }
    } catch (err: any) {
      notify(`MCP error: ${err.message}`, 'error');
    }
    setConnecting(null);
  };

  const handleStopServer = async (name: string, id: string) => {
    const api = (window as any).electronAPI;
    if (!api?.mcp?.stop) return;
    try {
      await api.mcp.stop(name);
      setServerStatus(s => { const n = { ...s }; delete n[name]; return n; });
      updateMCP(id, { enabled: false, tools: [] });
    } catch {}
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <IconPlug size={16} />
          <span>MCP Servers</span>
        </div>
        <div className="ai-header-actions">
          <button className="ai-action-btn" onClick={updateStatus} title="Refresh"><IconRefresh size={14} /></button>
          <button className="ai-action-btn" onClick={() => setActiveView('editor')} title="Close"><IconX size={14} /></button>
        </div>
      </div>

      <div className="settings-section-content" style={{ padding: '8px', overflow: 'auto', flex: 1 }}>
        <div className="models-header">
          <span>Configured Servers</span>
          <button className="add-model-btn" onClick={() => setShowAdd(!showAdd)}>+ Add</button>
        </div>

        {showAdd && (
          <div className="add-model-form">
            <input placeholder="Server name (e.g., filesystem)" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="Command (e.g., npx)" value={command} onChange={e => setCommand(e.target.value)} />
            <input placeholder="Args (e.g., -y @modelcontextprotocol/server-filesystem C:\\)" value={args} onChange={e => setArgs(e.target.value)} />
            <div className="add-model-actions">
              <button className="add-model-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="add-model-confirm" onClick={() => {
                if (name && command) {
                  addMCP({ id: `mcp-${Date.now()}`, name, command, args, enabled: false, tools: [] });
                  setName(''); setCommand('npx'); setArgs(''); setShowAdd(false);
                }
              }}>Add Server</button>
            </div>
          </div>
        )}

        <div className="mcp-server-list" style={{ marginTop: 8 }}>
          {mcpServers.length === 0 && (
            <div className="empty-models">No MCP servers configured. Add one to connect AI to external tools.</div>
          )}
          {mcpServers.map(s => {
            const status = serverStatus[s.name];
            const running = status?.running || false;
            const tools = status?.tools || s.tools || [];
            return (
              <div key={s.id} className="custom-model-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="custom-model-info">
                    <span className="custom-model-name">{s.name}</span>
                    <span className="custom-model-provider" style={{ color: running ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      {running ? 'Connected' : 'Disconnected'} · {command} {args}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {running ? (
                      <button className="model-test-btn" onClick={() => handleStopServer(s.name, s.id)} title="Stop">
                        <IconX size={11} />
                      </button>
                    ) : (
                      <button className="model-test-btn" onClick={() => handleStartServer(s)}
                        disabled={connecting === s.id} title="Start">
                        {connecting === s.id ? '...' : <IconPlug size={11} />}
                      </button>
                    )}
                    <button className="model-remove-btn" onClick={() => {
                      if (running) handleStopServer(s.name, s.id);
                      removeMCP(s.id);
                    }}>
                      <IconTrash size={11} />
                    </button>
                  </div>
                </div>
                {tools.length > 0 && (
                  <div style={{ padding: '4px 8px', fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', borderRadius: 4 }}>
                    {tools.map((t: any, i: number) => (
                      <span key={i} style={{ marginRight: 8, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <IconMCP size={10} /> {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MCPServerPanel;