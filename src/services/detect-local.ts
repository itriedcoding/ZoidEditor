export interface DetectedModel {
  id: string;
  name: string;
  provider: 'ollama' | 'lmstudio';
  model: string;
}

function api() { return (window as any).electronAPI; }

export async function detectOllama(): Promise<DetectedModel[]> {
  const a = api();
  if (a?.detect?.ollama) return a.detect.ollama();
  return [];
}

export async function detectLMStudio(): Promise<DetectedModel[]> {
  const a = api();
  if (a?.detect?.lmstudio) return a.detect.lmstudio();
  return [];
}

export async function detectAllLocalModels(): Promise<{ ollama: DetectedModel[]; lmstudio: DetectedModel[] }> {
  const [ollama, lmstudio] = await Promise.all([
    detectOllama(),
    detectLMStudio(),
  ]);
  return { ollama, lmstudio };
}
