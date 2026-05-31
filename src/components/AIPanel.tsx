import { useState, useRef, useEffect } from 'react';
import { useStore, AIChatMessage, AIModel } from '../store';
import { sendMessage, getApiKey } from '../services/ai';
import {
  IconAI, IconX, IconClear, IconSend, IconCopy, IconCheck, IconPlus,
  IconChevronDown, IconChevronRight, IconRefresh
} from './Icons';

function AIPanel() {
  const {
    aiChat, aiLoading, aiModels, settings, customModels,
    addAIMessage, clearAIChat, setAILoading,
    toggleAIPanel, addCustomModel, removeCustomModel, updateSettings, applySuggestion, notify,
  } = useStore();

  const [input, setInput] = useState('');
  const selectedModel = settings.aiModel;
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelProvider, setNewModelProvider] = useState<AIModel['provider']>('openai');
  const [newModelId, setNewModelId] = useState('');
  const [newModelUrl, setNewModelUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingModel, setTestingModel] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentModel = aiModels.find(m => m.id === selectedModel);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChat, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || aiLoading || !currentModel) return;

    const userMsg: AIChatMessage = {
      id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: Date.now(),
    };
    addAIMessage(userMsg);
    setInput('');
    setAILoading(true);
    setStreamingContent('');

    const apiKey = getApiKey(currentModel, settings);

    try {
      let fullResponse = '';
      await sendMessage({
        model: currentModel,
        messages: [...aiChat, userMsg].map(m => ({ role: m.role, content: m.content })),
        apiKey, temperature: settings.temperature, maxTokens: settings.maxTokens,
      }, (chunk) => { fullResponse += chunk; setStreamingContent(fullResponse); });

      addAIMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: fullResponse, timestamp: Date.now() });
      setStreamingContent('');
    } catch (err: any) {
      addAIMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: `Error: ${err.message}`, timestamp: Date.now() });
    } finally {
      setAILoading(false);
    }
  };

  const testModelConnection = async (modelId: string) => {
    setTestingModel(modelId);
    const model = aiModels.find(m => m.id === modelId);
    if (!model) { setTestingModel(null); return; }
    const key = getApiKey(model, settings);
    try {
      await sendMessage({
        model, messages: [{ role: 'user', content: 'Respond with: OK' }], apiKey: key,
        temperature: 0.1, maxTokens: 10,
      });
      notify(`Model ${model.name} connection successful`, 'success');
    } catch (err: any) {
      notify(`Model ${model.name} failed: ${err.message.slice(0, 100)}`, 'error');
    }
    setTestingModel(null);
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const groupedModels = {
    free: aiModels.filter(m => m.isFree),
    byok: aiModels.filter(m => !m.isFree && (m.provider === 'openai' || m.provider === 'anthropic' || m.provider === 'google')),
    local: aiModels.filter(m => m.provider === 'ollama' || m.provider === 'lmstudio'),
    custom: customModels,
  };
  const allGroups = Object.entries(groupedModels).filter(([, ms]) => ms.length > 0);

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <IconAI size={16} />
          <span>AI Assistant</span>
        </div>
        <div className="ai-header-actions">
          <button className="model-select-btn" onClick={() => setShowModelPicker(!showModelPicker)}>
            {currentModel?.name || 'Select Model'}
            <IconChevronDown size={10} />
          </button>
          <button className="ai-action-btn" onClick={clearAIChat} title="Clear chat">
            <IconClear size={14} />
          </button>
          <button className="ai-action-btn" onClick={() => toggleAIPanel()} title="Close panel">
            <IconX size={14} />
          </button>
        </div>
      </div>

      {showModelPicker && (
        <div className="model-picker">
          <div className="model-picker-header">
            <span>AI MODELS</span>
            <button className="model-add-btn" onClick={() => setShowAddModel(!showAddModel)}>
              <IconPlus size={12} /> Add Custom
            </button>
          </div>
          {showAddModel && (
            <div className="add-model-form">
              <input placeholder="Display name" value={newModelName} onChange={e => setNewModelName(e.target.value)} />
              <select value={newModelProvider} onChange={e => setNewModelProvider(e.target.value as any)}>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google AI</option>
                <option value="ollama">Ollama</option>
                <option value="lmstudio">LM Studio</option>
                <option value="openrouter">OpenRouter</option>
              </select>
              <input placeholder="Model ID (e.g., gpt-4)" value={newModelId} onChange={e => setNewModelId(e.target.value)} />
              {(newModelProvider === 'ollama' || newModelProvider === 'lmstudio') && (
                <input placeholder="Base URL" value={newModelUrl} onChange={e => setNewModelUrl(e.target.value)} />
              )}
              <div className="add-model-actions">
                <button className="add-model-cancel" onClick={() => setShowAddModel(false)}>Cancel</button>
                <button className="add-model-confirm" onClick={() => {
                  if (newModelName && newModelId) {
                    addCustomModel({ id: `custom-${Date.now()}`, name: newModelName, provider: newModelProvider, model: newModelId, baseUrl: newModelUrl || undefined });
                    setNewModelName(''); setNewModelId(''); setNewModelUrl(''); setShowAddModel(false);
                  }
                }}>Add Model</button>
              </div>
            </div>
          )}
          {allGroups.map(([group, models]) => (
            <div key={group} className="model-group">
              <div className="model-group-label">{groupLabel(group)}</div>
              {models.map(m => (
                <div key={m.id} className={`model-item ${m.id === selectedModel ? 'active' : ''}`}
                  onClick={() => { updateSettings({ aiModel: m.id }); setShowModelPicker(false); }}>
                  <div className="model-item-info">
                    <span className="model-name">{m.name}</span>
                    <span className="model-provider">{m.provider}</span>
                  </div>
                  <div className="model-item-actions">
                    <button className="model-test-btn" onClick={(e) => { e.stopPropagation(); testModelConnection(m.id); }}
                      title="Test connection">
                      {testingModel === m.id ? '...' : <IconRefresh size={11} />}
                    </button>
                    {group === 'custom' && (
                      <button className="model-remove-btn" onClick={(e) => { e.stopPropagation(); removeCustomModel(m.id); }}>
                        <IconX size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="ai-chat">
        {aiChat.length === 0 && !aiLoading && (
          <div className="ai-welcome">
            <div className="ai-welcome-icon"><IconAI size={32} /></div>
            <h3>Code Assistant</h3>
            <p>Ask me to write, debug, refactor, or explain code in any language.</p>
            <div className="ai-suggestions">
              {[
                'Write a function to fetch data from an API with error handling',
                'Review my code for potential issues',
                'Create a React component with TypeScript',
                'Help me debug a null reference error',
                'Write unit tests for this function',
              ].map((s, i) => (
                <button key={i} onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {aiChat.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 12.5c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              ) : (
                <IconAI size={14} />
              )}
            </div>
            <div className="message-content">
              <div className="message-header">
                {msg.role === 'user' ? 'You' : (currentModel?.name || 'Assistant')}
              </div>
              <div className="message-text">
                <FormattedContent content={msg.content} onCopy={(t) => handleCopy(t, `copy-${msg.id}`)} copiedId={copiedId} msgId={`copy-${msg.id}`} />
              </div>
            </div>
          </div>
        ))}
        {aiLoading && streamingContent && (
          <div className="chat-message assistant">
            <div className="message-avatar"><IconAI size={14} /></div>
            <div className="message-content">
              <div className="message-header">{currentModel?.name || 'Assistant'}</div>
              <div className="message-text">
                <FormattedContent content={streamingContent} />
                <span className="cursor-blink">|</span>
              </div>
            </div>
          </div>
        )}
        {aiLoading && !streamingContent && (
          <div className="chat-message assistant">
            <div className="message-avatar"><IconAI size={14} /></div>
            <div className="message-content">
              <div className="message-header">{currentModel?.name || 'Assistant'}</div>
              <div className="message-text">
                <div className="typing-indicator"><span /><span /><span /></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-input-area">
        <textarea ref={inputRef} className="ai-input" placeholder="Ask anything about your code..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          rows={3} disabled={aiLoading} />
        <button className="ai-send-btn" onClick={handleSend} disabled={!input.trim() || aiLoading || !currentModel}>
          <IconSend size={16} />
        </button>
      </div>
    </div>
  );
}

function FormattedContent({ content, onCopy, copiedId, msgId }: {
  content: string; onCopy?: (text: string) => void; copiedId?: string | null; msgId?: string;
}) {
  const applySuggestion = useStore(s => s.applySuggestion);
  const parts = content.split(/(```\w*\n[\s\S]*?```)/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/```(\w*)\n([\s\S]*?)```/);
        if (m) {
          const [, lang, code] = m;
          const codeId = `${msgId || ''}-code-${i}`;
          return (
            <div key={i} className="code-block">
              <div className="code-block-header">
                <span>{lang || 'code'}</span>
                <div className="code-block-actions">
                  <button onClick={() => { applySuggestion(code.trim()); notify('Code inserted into editor', 'success'); }}>
                    Insert
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(code.trim()); if (onCopy) onCopy(code.trim()); }}>
                    {copiedId === codeId ? <IconCheck size={11} /> : <IconCopy size={11} />}
                    {copiedId === codeId ? ' Copied' : ' Copy'}
                  </button>
                </div>
              </div>
              <pre><code>{code.trim()}</code></pre>
            </div>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function groupLabel(g: string): string {
  switch (g) {
    case 'free': return 'FREE MODELS';
    case 'byok': return 'BRING YOUR OWN KEY';
    case 'local': return 'LOCAL MODELS';
    case 'custom': return 'CUSTOM MODELS';
    default: return g.toUpperCase();
  }
}

export default AIPanel;
