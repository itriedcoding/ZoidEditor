import { AIModel } from '../store';

interface AIRequest {
  model: AIModel;
  messages: { role: string; content: string }[];
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function sendMessage(req: AIRequest, onStream?: (chunk: string) => void): Promise<string> {
  const { model, apiKey, temperature = 0.7, maxTokens = 4096 } = req;
  const provider = model.provider;
  const key = apiKey || '';
  const baseUrl = model.baseUrl || '';

  const wrappedMessages = [
    { role: 'system', content: 'You are an expert programming assistant. Help the user write, debug, and understand code. Provide concise, working code solutions. Format code blocks with proper language tags.' },
    ...req.messages,
  ];

  let url = '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const body: any = { stream: true };

  switch (provider) {
    case 'openai':
      url = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${key}`;
      body.model = model.model;
      body.messages = wrappedMessages.map(m => ({ role: m.role, content: m.content }));
      body.temperature = temperature;
      body.max_tokens = maxTokens;
      break;

    case 'anthropic':
      url = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = key;
      headers['anthropic-version'] = '2023-06-01';
      body.model = model.model;
      body.max_tokens = maxTokens;
      const systemMsg = wrappedMessages.filter(m => m.role === 'system').pop()?.content || '';
      const userMessages = wrappedMessages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));
      body.messages = userMessages;
      if (systemMsg) body.system = systemMsg;
      break;

    case 'google':
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model.model}:streamGenerateContent?alt=sse&key=${key}`;
      body.contents = wrappedMessages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      body.generationConfig = { temperature, maxOutputTokens: maxTokens };
      break;

    case 'ollama':
      url = `${baseUrl || 'http://localhost:11434'}/api/chat`;
      body.model = model.model;
      body.messages = wrappedMessages.map(m => ({ role: m.role, content: m.content }));
      body.options = { temperature, num_predict: maxTokens };
      break;

    case 'lmstudio':
      url = `${baseUrl || 'http://localhost:1234'}/v1/chat/completions`;
      body.model = model.model;
      body.messages = wrappedMessages.map(m => ({ role: m.role, content: m.content }));
      body.temperature = temperature;
      body.max_tokens = maxTokens;
      break;

    case 'openrouter':
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers['Authorization'] = `Bearer ${key}`;
      headers['HTTP-Referer'] = 'https://zoid-editor.app';
      headers['X-Title'] = 'Zoid Editor';
      body.model = model.model;
      body.messages = wrappedMessages.map(m => ({ role: m.role, content: m.content }));
      body.temperature = temperature;
      body.max_tokens = maxTokens;
      break;

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => 'Unknown error');
    throw new Error(`${provider} error (${response.status}): ${err.slice(0, 500)}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body from stream');

  const decoder = new TextDecoder();
  let result = '';
  let buffer = '';

  const parseJSON = (data: string) => {
    try { return JSON.parse(data); } catch { return null; }
  };

  const isEventStream = provider !== 'ollama';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    if (provider === 'ollama') {
      const lines = buffer.split('\n').filter(l => l.trim());
      buffer = '';
      for (const line of lines) {
        const parsed = parseJSON(line);
        if (!parsed) continue;
        const content = parsed.message?.content || '';
        result += content;
        if (onStream) onStream(content);
        if (parsed.done) break;
      }
      continue;
    }

    const lines = buffer.split('\n').filter(l => l.startsWith('data: '));
    buffer = '';
    for (const line of lines) {
      const data = line.slice(6).trim();
      if (!data || data === '[DONE]') continue;
      const parsed = parseJSON(data);
      if (!parsed) continue;

      let content = '';
      if (provider === 'anthropic') {
        if (parsed.type === 'content_block_delta') content = parsed.delta?.text || '';
      } else if (provider === 'google') {
        content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        content = parsed.choices?.[0]?.delta?.content || '';
      }
      result += content;
      if (onStream) onStream(content);
    }
  }

  return result;
}

export function getApiKey(model: AIModel, settings: any): string {
  switch (model.provider) {
    case 'openai': return settings.openaiKey;
    case 'anthropic': return settings.anthropicKey;
    case 'google': return settings.googleKey;
    case 'openrouter': return settings.openrouterKey;
    case 'ollama': return settings.ollamaUrl;
    case 'lmstudio': return settings.lmstudioUrl;
    default: return '';
  }
}

export function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'typescript', mts: 'typescript', cts: 'typescript',
    py: 'python', pyw: 'python', rb: 'ruby', rs: 'rust', go: 'go',
    java: 'java', class: 'java', c: 'c', cpp: 'cpp', cc: 'cpp', cxx: 'cpp',
    h: 'c', hpp: 'cpp', hxx: 'cpp', cs: 'csharp', fs: 'fsharp',
    html: 'html', htm: 'html', css: 'css', scss: 'scss', sass: 'sass', less: 'less',
    json: 'json', jsonc: 'json', xml: 'xml', xsd: 'xml', xsl: 'xml',
    yaml: 'yaml', yml: 'yaml',
    md: 'markdown', mdx: 'markdown',
    sql: 'sql', mysql: 'sql', pgsql: 'sql',
    sh: 'shell', bash: 'shell', zsh: 'shell', fish: 'shell',
    php: 'php', swift: 'swift', kt: 'kotlin', kts: 'kotlin', dart: 'dart',
    pl: 'perl', pm: 'perl', lua: 'lua', r: 'r', scala: 'scala',
    vue: 'vue', svelte: 'svelte', astro: 'astro',
    toml: 'toml', ini: 'ini', cfg: 'ini', conf: 'ini',
    dockerfile: 'dockerfile', Dockerfile: 'dockerfile',
    makefile: 'makefile', Makefile: 'makefile',
    gradle: 'groovy', groovy: 'groovy',
    erl: 'erlang', hrl: 'erlang', ex: 'elixir', exs: 'elixir',
    clj: 'clojure', cljs: 'clojure', cljc: 'clojure',
    hs: 'haskell', lhs: 'haskell',
    tex: 'latex', bib: 'bibtex',
    diff: 'diff', patch: 'diff',
    graphql: 'graphql', gql: 'graphql',
    solidity: 'solidity', sol: 'solidity',
    terraform: 'terraform', tf: 'terraform',
  };
  return map[ext] || 'plaintext';
}
