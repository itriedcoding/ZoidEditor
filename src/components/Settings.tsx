import { useState } from 'react';
import { useStore } from '../store';
import { IconCheck, IconX, IconAI, IconSettings as IconSettingsIcon, IconExplorer, IconTerminal } from './Icons';

function Settings() {
  const { settings, customModels, updateSettings, addCustomModel, removeCustomModel, toggleSettings, notify } = useStore();
  const [section, setSection] = useState<'keys' | 'editor' | 'ai' | 'about'>('keys');
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', provider: 'openai' as const, model: '', baseUrl: '' });

  const keys = [
    { key: 'openaiKey', label: 'OpenAI API Key', placeholder: 'sk-...' },
    { key: 'anthropicKey', label: 'Anthropic API Key', placeholder: 'sk-ant-...' },
    { key: 'googleKey', label: 'Google AI Key', placeholder: 'AIza...' },
    { key: 'groqKey', label: 'Groq API Key', placeholder: 'gsk_...' },
    { key: 'openrouterKey', label: 'OpenRouter API Key', placeholder: 'sk-or-...' },
  ];

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2><IconSettingsIcon size={18} /> Settings</h2>
        <button onClick={toggleSettings} className="settings-close"><IconX size={16} /></button>
      </div>

      <div className="settings-body">
        <div className="settings-nav">
          {(['keys', 'editor', 'ai', 'about'] as const).map(s => (
            <button key={s} className={`settings-nav-btn ${section === s ? 'active' : ''}`} onClick={() => setSection(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {section === 'keys' && (
            <div className="settings-section-content">
              <h3>API Keys</h3>
              <p className="settings-sub">Keys are stored locally and never sent to our servers.</p>
              {keys.map(({ key, label, placeholder }) => (
                <div className="setting-row key-row" key={key}>
                  <label>{label}</label>
                  <div className="key-input-wrap">
                    <input type="password" className="setting-input key-input"
                      placeholder={placeholder}
                      value={(settings as any)[key] || ''}
                      onChange={e => updateSettings({ [key]: e.target.value })} />
                    {(settings as any)[key] ? <IconCheck size={14} className="key-check" /> : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === 'editor' && (
            <div className="settings-section-content">
              <h3>Editor Preferences</h3>
              <div className="setting-row">
                <label>Font Size</label>
                <input type="number" className="setting-input narrow"
                  value={settings.fontSize} min={10} max={30}
                  onChange={e => updateSettings({ fontSize: Number(e.target.value) })} />
              </div>
              <div className="setting-row">
                <label>Tab Size</label>
                <input type="number" className="setting-input narrow"
                  value={settings.tabSize} min={1} max={8}
                  onChange={e => updateSettings({ tabSize: Number(e.target.value) })} />
              </div>
              <div className="setting-row">
                <label>Word Wrap</label>
                <select className="setting-input" value={settings.wordWrap}
                  onChange={e => updateSettings({ wordWrap: e.target.value as any })}>
                  <option value="off">Off</option>
                  <option value="on">On</option>
                  <option value="wordWrapColumn">Word Wrap Column</option>
                  <option value="bounded">Bounded</option>
                </select>
              </div>
              <div className="setting-row">
                <label>Minimap</label>
                <select className="setting-input" value={settings.minimap}
                  onChange={e => updateSettings({ minimap: e.target.value as any })}>
                  <option value="none">None</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="setting-row">
                <label>Line Numbers</label>
                <select className="setting-input" value={settings.lineNumbers}
                  onChange={e => updateSettings({ lineNumbers: e.target.value as any })}>
                  <option value="on">On</option>
                  <option value="off">Off</option>
                  <option value="relative">Relative</option>
                  <option value="interval">Interval</option>
                </select>
              </div>
              <div className="setting-row checkbox-row">
                <label>Auto Save</label>
                <input type="checkbox" checked={settings.autoSave}
                  onChange={e => updateSettings({ autoSave: e.target.checked })} />
              </div>
            </div>
          )}

          {section === 'ai' && (
            <div className="settings-section-content">
              <h3>AI Configuration</h3>
              <div className="setting-row">
                <label>Temperature ({settings.temperature.toFixed(1)})</label>
                <input type="range" min={0} max={2} step={0.1}
                  value={settings.temperature}
                  onChange={e => updateSettings({ temperature: Number(e.target.value) })} />
              </div>
              <div className="setting-row">
                <label>Max Tokens</label>
                <input type="number" className="setting-input"
                  value={settings.maxTokens} min={100} max={32000} step={100}
                  onChange={e => updateSettings({ maxTokens: Number(e.target.value) })} />
              </div>

              <div className="models-section">
                <div className="models-header">
                  <span>Custom Models</span>
                  <button className="add-model-btn" onClick={() => setShowAddModel(!showAddModel)}>+ Add</button>
                </div>
                {showAddModel && (
                  <div className="add-model-form">
                    <input placeholder="Model name" value={newModel.name} onChange={e => setNewModel({ ...newModel, name: e.target.value })} />
                    <select value={newModel.provider} onChange={e => setNewModel({ ...newModel, provider: e.target.value as any })}>
                      <option value="openai">OpenAI Compatible</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google AI</option>
                      <option value="ollama">Ollama</option>
                      <option value="lmstudio">LM Studio</option>
                      <option value="openrouter">OpenRouter</option>
                    </select>
                    <input placeholder="Model ID (e.g., gpt-4)" value={newModel.model} onChange={e => setNewModel({ ...newModel, model: e.target.value })} />
                    {(newModel.provider === 'ollama' || newModel.provider === 'lmstudio') && (
                      <input placeholder="Base URL (optional)" value={newModel.baseUrl} onChange={e => setNewModel({ ...newModel, baseUrl: e.target.value })} />
                    )}
                    <div className="add-model-actions">
                      <button onClick={() => setShowAddModel(false)}>Cancel</button>
                      <button onClick={() => {
                        if (newModel.name && newModel.model) {
                          addCustomModel({ id: `custom-${Date.now()}`, name: newModel.name, provider: newModel.provider, model: newModel.model, baseUrl: newModel.baseUrl || undefined });
                          setNewModel({ name: '', provider: 'openai', model: '', baseUrl: '' });
                          setShowAddModel(false);
                        }
                      }}>Save</button>
                    </div>
                  </div>
                )}
                <div className="custom-models-list">
                  {customModels.map(m => (
                    <div key={m.id} className="custom-model-item">
                      <div className="custom-model-info">
                        <span className="custom-model-name">{m.name}</span>
                        <span className="custom-model-provider">{m.provider}</span>
                      </div>
                      <button className="remove-model-btn" onClick={() => removeCustomModel(m.id)}>
                        <IconX size={12} />
                      </button>
                    </div>
                  ))}
                  {customModels.length === 0 && <div className="empty-models">No custom models configured.</div>}
                </div>
              </div>
            </div>
          )}

          {section === 'about' && (
            <div className="settings-section-content about-section">
              <div className="about-logo">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="2" y="2" width="60" height="60" rx="12" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M16 42l12-20 12 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 26l32 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h2>Zoid Editor v1.0.0</h2>
              <p>A lightweight, AI-powered code editor built with Electron, React, and Monaco.</p>
              <p className="about-tech">Electron + React + TypeScript + Vite + Monaco Editor + Zustand</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
