export interface VSXExtension {
  name: string;
  namespace: string;
  version: string;
  displayName: string;
  description: string;
  publisher: string;
  downloads: number;
  rating: number;
  timestamp: string;
  repository?: string;
  license?: string;
  icon?: string;
  categories?: string[];
  tags?: string[];
  installed?: boolean;
  localPath?: string;
}

export interface VSXSearchResult {
  extensions: VSXExtension[];
  totalSize: number;
}

function api() { return (window as any).electronAPI; }

export async function searchExtensions(query: string, size = 20, offset = 0): Promise<VSXSearchResult> {
  const a = api();
  if (!a?.vsx?.search) throw new Error('electronAPI not available');
  const data = await a.vsx.search(query, size, offset);
  return {
    extensions: (data.extensions || []).map(mapExtension),
    totalSize: data.totalSize || 0,
  };
}

export async function getExtensionDetail(publisher: string, name: string): Promise<VSXExtension> {
  const a = api();
  if (!a?.vsx?.detail) throw new Error('electronAPI not available');
  return mapExtension(await a.vsx.detail(publisher, name));
}

export async function downloadExtension(publisher: string, name: string, version: string): Promise<number[]> {
  const a = api();
  if (!a?.vsx?.download) throw new Error('electronAPI not available');
  return a.vsx.download(publisher, name, version);
}

export async function installExtension(publisher: string, name: string, version: string): Promise<void> {
  const a = api();
  const dataArray = await downloadExtension(publisher, name, version);
  const pkgName = `${publisher}.${name}`;
  if (a?.extensions?.install) {
    await a.extensions.install(pkgName, dataArray);
  }
}

function mapExtension(raw: any): VSXExtension {
  return {
    name: raw.name,
    namespace: raw.namespace,
    version: raw.version,
    displayName: raw.displayName || raw.name,
    description: raw.description || '',
    publisher: raw.namespace,
    downloads: raw.downloadCount || 0,
    rating: raw.averageRating || 0,
    timestamp: raw.timestamp || '',
    repository: raw.repository || (raw.links?.repository?.href),
    license: raw.license,
    icon: raw.files?.icon || raw.icon,
    categories: raw.categories || [],
    tags: raw.tags || [],
  };
}
