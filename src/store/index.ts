import { create } from 'zustand';

export interface Tab {
  id: string;
  fileName: string;
  path: string;
  content: string;
  isDirty: boolean;
  language: string;
  encoding?: string;
  eol?: number;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'lmstudio' | 'openrouter' | 'groq';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  isFree?: boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  command: string;
  args: string;
  enabled: boolean;
  tools?: any[];
}

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description: string;
}

export interface Settings {
  openaiKey: string;
  anthropicKey: string;
  googleKey: string;
  openrouterKey: string;
  groqKey: string;
  ollamaUrl: string;
  lmstudioUrl: string;
  fontSize: number;
  tabSize: number;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  minimap: 'none' | 'small' | 'medium' | 'large';
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';
  autoSave: boolean;
  theme: 'black-white' | 'white-black';
  aiModel: string;
  temperature: number;
  maxTokens: number;
}

const defaultSettings: Settings = {
  openaiKey: '', anthropicKey: '', googleKey: '', openrouterKey: '', groqKey: '',
  ollamaUrl: 'http://localhost:11434', lmstudioUrl: 'http://localhost:1234',
  fontSize: 14, tabSize: 2, wordWrap: 'on', minimap: 'small', lineNumbers: 'on',
  autoSave: false, theme: 'black-white', aiModel: 'openrouter-deepseek',
  temperature: 0.7, maxTokens: 4096,
};

export type ActiveView = 'editor' | 'extensions' | 'search' | 'source-control' | 'mcp' | 'snippets' | 'ai' | 'terminal' | 'settings';

export interface ViewState {
  explorer: boolean;
  terminal: boolean;
  findReplace: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}

export interface ContextMenuItem {
  label: string;
  onClick?: () => void;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
}

export interface FindReplaceState {
  visible: boolean;
  findText: string;
  replaceText: string;
  caseSensitive: boolean;
  useRegex: boolean;
}

interface AppState {
  tabs: Tab[];
  activeTabId: string | null;
  openFolder: string | null;
  fileTree: any[];
  view: ViewState;
  aiChat: AIChatMessage[];
  aiLoading: boolean;
  aiModels: AIModel[];
  settings: Settings;
  customModels: AIModel[];
  notifications: Notification[];
  contextMenu: ContextMenuState;
  findReplace: FindReplaceState;
  cursorPosition: { lineNumber: number; column: number };
  commandPalette: boolean;
  activeView: ActiveView;
  githubUser: any | null;
  githubToken: string;
  detectedLocalModels: AIModel[];
  installedExtensions: string[];
  findController: any | null;
  gitState: {
    isRepo: boolean;
    status: any;
    branches: string[];
    currentBranch: string;
    log: any[];
  };
  mcpServers: MCPServer[];
  snippets: Snippet[];

  addTab: (tab: Omit<Tab, 'id' | 'isDirty'>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  setFileTree: (tree: any[]) => void;
  setActiveView: (view: ActiveView) => void;
  toggleExplorer: () => void;
  toggleTerminal: () => void;
  toggleFindReplace: () => void;
  toggleCommandPalette: () => void;
  closeCommandPalette: () => void;
  setAILoading: (loading: boolean) => void;
  addAIMessage: (msg: AIChatMessage) => void;
  clearAIChat: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  addCustomModel: (model: AIModel) => void;
  removeCustomModel: (id: string) => void;
  applySuggestion: (code: string) => void;
  notify: (message: string, type?: 'info' | 'error' | 'success') => void;
  showContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  closeContextMenu: () => void;
  updateFindReplace: (fs: Partial<FindReplaceState>) => void;
  removeNotification: (id: string) => void;
  setCursorPosition: (pos: { lineNumber: number; column: number }) => void;
  setGitHubUser: (user: any | null) => void;
  setGitHubToken: (token: string) => void;
  signOutGitHub: () => void;
  setDetectedLocalModels: (models: AIModel[]) => void;
  setInstalledExtensions: (exts: string[]) => void;
  addInstalledExtension: (name: string) => void;
  removeInstalledExtension: (name: string) => void;
  setFindController: (ctrl: any | null) => void;
  setGitState: (state: Partial<AppState['gitState']>) => void;
  setOpenFolder: (folder: string | null) => void;
  addMCP: (server: MCPServer) => void;
  removeMCP: (id: string) => void;
  updateMCP: (id: string, partial: Partial<MCPServer>) => void;
  toggleMCP: (id: string) => void;
  addSnippet: (snippet: Snippet) => void;
  removeSnippet: (id: string) => void;
}

const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem('zoid-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch { return defaultSettings; }
};

const loadChat = (): AIChatMessage[] => {
  try {
    const saved = localStorage.getItem('zoid-chat');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const loadCustomModels = (): AIModel[] => {
  try {
    const saved = localStorage.getItem('zoid-custom-models');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const loadMCPServers = (): MCPServer[] => {
  try {
    const saved = localStorage.getItem('zoid-mcp-servers');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const loadSnippets = (): Snippet[] => {
  try {
    const saved = localStorage.getItem('zoid-snippets');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const freeModels: AIModel[] = [
  { id: 'openrouter-deepseek', name: 'DeepSeek V3', provider: 'openrouter', model: 'deepseek/deepseek-chat', isFree: true },
  { id: 'openrouter-llama', name: 'Llama 3.3 70B', provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct', isFree: true },
  { id: 'openrouter-mixtral', name: 'Mixtral 8x7B', provider: 'openrouter', model: 'mistralai/mixtral-8x7b-instruct', isFree: true },
  { id: 'openrouter-qwen', name: 'Qwen 2.5 72B', provider: 'openrouter', model: 'qwen/qwen-2.5-72b-instruct', isFree: true },
  { id: 'openrouter-gemma', name: 'Gemma 2 9B', provider: 'openrouter', model: 'google/gemma-2-9b-it', isFree: true },
  { id: 'openrouter-deepseek-r1', name: 'DeepSeek R1', provider: 'openrouter', model: 'deepseek/deepseek-r1', isFree: true },
  { id: 'openrouter-gemma3', name: 'Gemma 3 27B', provider: 'openrouter', model: 'google/gemma-3-27b-it', isFree: true },
  { id: 'openrouter-command-r', name: 'Command R+', provider: 'openrouter', model: 'cohere/command-r-plus-v02', isFree: true },
];

const apiKeyModels: AIModel[] = [
  // OpenAI
  { id: 'byok-gpt4o', name: 'GPT-4o', provider: 'openai', model: 'gpt-4o' },
  { id: 'byok-gpt4o-mini', name: 'GPT-4o Mini', provider: 'openai', model: 'gpt-4o-mini' },
  { id: 'byok-gpt4-turbo', name: 'GPT-4 Turbo', provider: 'openai', model: 'gpt-4-turbo' },
  { id: 'byok-gpt41', name: 'GPT-4.1', provider: 'openai', model: 'gpt-4.1' },
  { id: 'byok-gpt41-mini', name: 'GPT-4.1 Mini', provider: 'openai', model: 'gpt-4.1-mini' },
  { id: 'byok-gpt41-nano', name: 'GPT-4.1 Nano', provider: 'openai', model: 'gpt-4.1-nano' },
  { id: 'byok-o1', name: 'o1', provider: 'openai', model: 'o1' },
  { id: 'byok-o3-mini', name: 'o3-mini', provider: 'openai', model: 'o3-mini' },
  { id: 'byok-o4-mini', name: 'o4-mini', provider: 'openai', model: 'o4-mini' },
  { id: 'byok-o4', name: 'o4', provider: 'openai', model: 'o4' },
  // Anthropic
  { id: 'byok-claude-opus', name: 'Claude Opus', provider: 'anthropic', model: 'claude-opus-20240229' },
  { id: 'byok-claude-sonnet', name: 'Claude Sonnet 4', provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
  { id: 'byok-claude-opus4', name: 'Claude Opus 4', provider: 'anthropic', model: 'claude-opus-4-20250514' },
  { id: 'byok-claude-haiku', name: 'Claude Haiku', provider: 'anthropic', model: 'claude-3-5-haiku-20241022' },
  // Google
  { id: 'byok-gemini-pro', name: 'Gemini 1.5 Pro', provider: 'google', model: 'gemini-1.5-pro' },
  { id: 'byok-gemini-ultra', name: 'Gemini 2.0 Pro', provider: 'google', model: 'gemini-2.0-pro-exp' },
  { id: 'byok-gemini-25-pro', name: 'Gemini 2.5 Pro', provider: 'google', model: 'gemini-2.5-pro-preview-03-25' },
  { id: 'byok-gemini-25-flash', name: 'Gemini 2.5 Flash', provider: 'google', model: 'gemini-2.5-flash-preview' },
  { id: 'byok-gemini-20-flash', name: 'Gemini 2.0 Flash', provider: 'google', model: 'gemini-2.0-flash' },
  // Groq
  { id: 'byok-groq-llama', name: 'Groq Llama 3.3 70B', provider: 'groq', model: 'llama-3.3-70b-versatile' },
  { id: 'byok-groq-mixtral', name: 'Groq Mixtral 8x7B', provider: 'groq', model: 'mixtral-8x7b-32768' },
  { id: 'byok-groq-gemma2', name: 'Groq Gemma 2 9B', provider: 'groq', model: 'gemma2-9b-it' },
  { id: 'byok-groq-deepseek', name: 'Groq DeepSeek R1', provider: 'groq', model: 'deepseek-r1-distill-llama-70b' },
  { id: 'byok-groq-llama4', name: 'Groq Llama 4', provider: 'groq', model: 'meta-llama/llama-4-scout-17b-16e-instruct' },
  // OpenRouter BYOK
  { id: 'byok-or-llama4', name: 'Llama 4 Maverick', provider: 'openrouter', model: 'meta-llama/llama-4-maverick-17b-128e-instruct' },
  { id: 'byok-or-qwen-coder', name: 'Qwen 2.5 Coder 32B', provider: 'openrouter', model: 'qwen/qwen-2.5-coder-32b-instruct' },
  { id: 'byok-or-mistral-large', name: 'Mistral Large', provider: 'openrouter', model: 'mistralai/mistral-large-2411' },
  { id: 'byok-or-codestral', name: 'Codestral', provider: 'openrouter', model: 'mistralai/codestral-2505' },
  { id: 'byok-or-wizardlm', name: 'WizardLM 2 8x22B', provider: 'openrouter', model: 'microsoft/wizardlm-2-8x22b' },
];

const localModels: AIModel[] = [
  { id: 'ollama-llama3', name: 'Ollama - Llama 3', provider: 'ollama', model: 'llama3' },
  { id: 'ollama-codellama', name: 'Ollama - CodeLlama', provider: 'ollama', model: 'codellama' },
  { id: 'ollama-deepseek-coder', name: 'Ollama - DeepSeek Coder', provider: 'ollama', model: 'deepseek-coder' },
  { id: 'ollama-qwen25-coder', name: 'Ollama - Qwen 2.5 Coder', provider: 'ollama', model: 'qwen2.5-coder' },
  { id: 'ollama-mistral', name: 'Ollama - Mistral', provider: 'ollama', model: 'mistral' },
  { id: 'lmstudio-default', name: 'LM Studio - Default', provider: 'lmstudio', model: 'local-model' },
];

export const useStore = create<AppState>((set, get) => ({
  tabs: [], activeTabId: null, openFolder: null, fileTree: [],
  view: { explorer: true, terminal: false, findReplace: false },
  activeView: 'editor',
  aiChat: loadChat(), aiLoading: false,
  aiModels: [...freeModels, ...apiKeyModels, ...localModels],
  settings: loadSettings(),
  customModels: loadCustomModels(),
  notifications: [],
  contextMenu: { visible: false, x: 0, y: 0, items: [] },
  findReplace: { visible: false, findText: '', replaceText: '', caseSensitive: false, useRegex: false },
  cursorPosition: { lineNumber: 1, column: 1 },
  commandPalette: false,
  githubUser: null,
  githubToken: '',
  detectedLocalModels: [],
  installedExtensions: [],
  findController: null,
  gitState: { isRepo: false, status: null, branches: [], currentBranch: '', log: [] },
  mcpServers: loadMCPServers(),
  snippets: loadSnippets(),

  applySuggestion: (code) => {
    const s = get();
    const t = s.tabs.find(t => t.id === s.activeTabId);
    if (t) {
      const newContent = t.content + '\n' + code;
      set(state => ({ tabs: state.tabs.map(tab => tab.id === s.activeTabId ? { ...tab, content: newContent, isDirty: true } : tab) }));
    }
  },

  notify: (message, type = 'info') => {
    const id = Date.now().toString();
    set(s => ({ notifications: [...s.notifications, { id, message, type }] }));
    setTimeout(() => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })), 4000);
  },

  showContextMenu: (x, y, items) => set({ contextMenu: { visible: true, x, y, items } }),
  closeContextMenu: () => set({ contextMenu: { visible: false, x: 0, y: 0, items: [] } }),

  updateFindReplace: (fs) => set(s => ({ findReplace: { ...s.findReplace, ...fs } })),
  toggleFindReplace: () => set(s => ({ view: { ...s.view, findReplace: !s.view.findReplace }, findReplace: { ...s.findReplace, visible: !s.findReplace.visible } })),
  toggleCommandPalette: () => set(s => ({ commandPalette: !s.commandPalette })),
  closeCommandPalette: () => set({ commandPalette: false }),

  addTab: (tab) => {
    const id = `${tab.path || 'new'}-${Date.now()}`;
    const fullTab: Tab = { ...tab, id, isDirty: false };
    set(state => ({ tabs: [...state.tabs, fullTab], activeTabId: id }));
  },

  closeTab: (id) => {
    const s = get();
    const idx = s.tabs.findIndex(t => t.id === id);
    const nt = s.tabs.filter(t => t.id !== id);
    let na = s.activeTabId;
    if (s.activeTabId === id) na = nt.length === 0 ? null : (idx > 0 ? nt[idx - 1].id : nt[0]?.id || null);
    set({ tabs: nt, activeTabId: na });
  },

  setActiveTab: (id) => set({ activeTabId: id }),
  updateFileContent: (id, content) => set(s => ({ tabs: s.tabs.map(t => t.id === id ? { ...t, content, isDirty: true } : t) })),
  setFileTree: (t) => set({ fileTree: t }),
  setActiveView: (view) => set({ activeView: view }),
  toggleExplorer: () => set(s => ({ view: { ...s.view, explorer: !s.view.explorer } })),
  toggleTerminal: () => set(s => ({ view: { ...s.view, terminal: !s.view.terminal } })),
  setAILoading: (l) => set({ aiLoading: l }),

  addAIMessage: (msg) => {
    set(s => {
      const nc = [...s.aiChat, msg];
      try { localStorage.setItem('zoid-chat', JSON.stringify(nc)); } catch {}
      return { aiChat: nc };
    });
  },

  clearAIChat: () => {
    try { localStorage.setItem('zoid-chat', JSON.stringify([])); } catch {}
    set({ aiChat: [] });
  },

  updateSettings: (partial) => {
    set(state => {
      const ns = { ...state.settings, ...partial };
      try { localStorage.setItem('zoid-settings', JSON.stringify(ns)); } catch {}
      return { settings: ns };
    });
  },

  addCustomModel: (m) => {
    set(s => {
      const nm = [...s.customModels, m];
      try { localStorage.setItem('zoid-custom-models', JSON.stringify(nm)); } catch {}
      return { customModels: nm, aiModels: [...s.aiModels, m] };
    });
  },

  removeCustomModel: (id) => {
    set(s => {
      const nm = s.customModels.filter(m => m.id !== id);
      try { localStorage.setItem('zoid-custom-models', JSON.stringify(nm)); } catch {}
      return { customModels: nm, aiModels: s.aiModels.filter(m => m.id !== id) };
    });
  },

  removeNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setGitHubUser: (user) => { try { localStorage.setItem('zoid-github-user', JSON.stringify(user)); } catch {} set({ githubUser: user }); },
  setGitHubToken: (token) => { try { localStorage.setItem('zoid-github-token', token); } catch {} set({ githubToken: token }); },
  signOutGitHub: () => { try { localStorage.removeItem('zoid-github-user'); localStorage.removeItem('zoid-github-token'); } catch {} set({ githubUser: null, githubToken: '' }); },
  setDetectedLocalModels: (models) => set(s => ({ detectedLocalModels: models, aiModels: [...s.aiModels.filter(m => !m.id.startsWith('ollama-auto-') && !m.id.startsWith('lmstudio-auto-')), ...models] })),
  setInstalledExtensions: (exts) => set({ installedExtensions: exts }),
  addInstalledExtension: (name) => set(s => ({ installedExtensions: [...s.installedExtensions.filter(e => e !== name), name] })),
  removeInstalledExtension: (name) => set(s => ({ installedExtensions: s.installedExtensions.filter(e => e !== name) })),
  setFindController: (ctrl) => set({ findController: ctrl }),
  setGitState: (state) => set(s => ({ gitState: { ...s.gitState, ...state } })),
  setOpenFolder: (folder) => set({ openFolder: folder }),

  addMCP: (server) => {
    set(s => {
      const nm = [...s.mcpServers, server];
      try { localStorage.setItem('zoid-mcp-servers', JSON.stringify(nm)); } catch {}
      return { mcpServers: nm };
    });
  },

  removeMCP: (id) => {
    set(s => {
      const nm = s.mcpServers.filter(m => m.id !== id);
      try { localStorage.setItem('zoid-mcp-servers', JSON.stringify(nm)); } catch {}
      return { mcpServers: nm };
    });
  },

  updateMCP: (id, partial) => {
    set(s => {
      const nm = s.mcpServers.map(m => m.id === id ? { ...m, ...partial } : m);
      try { localStorage.setItem('zoid-mcp-servers', JSON.stringify(nm)); } catch {}
      return { mcpServers: nm };
    });
  },

  toggleMCP: (id) => {
    set(s => {
      const nm = s.mcpServers.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m);
      try { localStorage.setItem('zoid-mcp-servers', JSON.stringify(nm)); } catch {}
      return { mcpServers: nm };
    });
  },

  addSnippet: (snippet) => {
    set(s => {
      const ns = [...s.snippets, snippet];
      try { localStorage.setItem('zoid-snippets', JSON.stringify(ns)); } catch {}
      return { snippets: ns };
    });
  },

  removeSnippet: (id) => {
    set(s => {
      const ns = s.snippets.filter(sn => sn.id !== id);
      try { localStorage.setItem('zoid-snippets', JSON.stringify(ns)); } catch {}
      return { snippets: ns };
    });
  },


}));
