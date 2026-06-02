import { useState } from 'react';
import { useStore } from '../store';
import { IconX, IconPlus, IconTrash, IconCopy, IconSnippet } from './Icons';
import { detectLanguage } from '../services/ai';

function SnippetsPanel() {
  const { snippets, addSnippet, removeSnippet, setActiveView, tabs, activeTabId, applySuggestion, notify } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');

  const activeTab = tabs.find(t => t.id === activeTabId);

  const handleInsert = (code: string) => {
    applySuggestion(code);
    notify('Snippet inserted into editor', 'success');
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <IconSnippet size={16} />
          <span>Snippets</span>
        </div>
        <div className="ai-header-actions">
          <button className="ai-action-btn" onClick={() => setActiveView('editor')} title="Close"><IconX size={14} /></button>
        </div>
      </div>

      <div className="settings-section-content" style={{ padding: '8px', overflow: 'auto', flex: 1 }}>
        <div className="models-header">
          <span>Saved Snippets</span>
          <button className="add-model-btn" onClick={() => setShowAdd(!showAdd)}>+ Add</button>
        </div>

        {showAdd && (
          <div className="add-model-form">
            <input placeholder="Snippet title" value={title} onChange={e => setTitle(e.target.value)} />
            <input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
            <select value={language} onChange={e => setLanguage(e.target.value)}>
              {['javascript', 'typescript', 'python', 'html', 'css', 'json', 'sql', 'rust', 'go', 'java', 'cpp', 'csharp', 'bash', 'yaml'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <textarea placeholder="Paste your snippet code here..." value={code} onChange={e => setCode(e.target.value)}
              rows={6} style={{ fontFamily: 'var(--mono-font)', fontSize: 12, resize: 'vertical' }} />
            <div className="add-model-actions">
              <button className="add-model-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="add-model-confirm" onClick={() => {
                if (title && code) {
                  addSnippet({ id: `snippet-${Date.now()}`, title, code, language, description });
                  setTitle(''); setCode(''); setDescription(''); setLanguage('javascript'); setShowAdd(false);
                }
              }}>Save Snippet</button>
            </div>
          </div>
        )}

        <div className="snippets-list" style={{ marginTop: 8 }}>
          {snippets.length === 0 && (
            <div className="empty-models">No saved snippets. Add code snippets for quick reuse.</div>
          )}
          {snippets.map(s => (
            <div key={s.id} className="custom-model-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="custom-model-info">
                  <span className="custom-model-name">{s.title}</span>
                  <span className="custom-model-provider">{s.language}{s.description ? ` · ${s.description}` : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button className="model-test-btn" onClick={() => handleInsert(s.code)} title="Insert into editor">
                    <IconCopy size={11} />
                  </button>
                  <button className="model-remove-btn" onClick={() => removeSnippet(s.id)}>
                    <IconTrash size={11} />
                  </button>
                </div>
              </div>
              <pre style={{ margin: 0, padding: '4px 8px', fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', borderRadius: 4, maxHeight: 100, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}><code>{s.code.slice(0, 300)}{s.code.length > 300 ? '...' : ''}</code></pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SnippetsPanel;